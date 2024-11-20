const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import the cors package
const multer = require('multer'); // Import multer for file uploads
const session = require('express-session'); // Import express-session
const bodyParser = require('body-parser'); // Import body-parser for parsing form data
const bcrypt = require('bcrypt');
const fsp = require('fs').promises; // Import fs from promises
import config from '../src/config';

const app = express();
// CORS configuration
const corsOptions = {
    origin: `${config.frontendBaseUrl}`, // Replace with your frontend URL
    credentials: true, // Allow credentials
};
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Middleware to parse application/json
app.use(express.json());
app.use(bodyParser.json());

// Set up session middleware
app.use(session({
    secret: '00_ugfioadsh(887twefj0', // Change this to a random secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Helps prevent XSS attacks
        secure: false, // Set to true if using HTTPS
        sameSite: 'None'
    } 
}));
// Define the path to your metadata file
const metadataFilePath = path.join(__dirname, 'filesMetadata.json');

// Function to load files metadata from JSON file
const loadFilesMetadata = () => {
    const filePath = path.join(__dirname, './filesMetadata.json'); // Adjust the path as needed
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    return [];
};

// Route to update the label
app.post('/api/update-label', (req, res) => {
    const { filename, newLabel } = req.body;
    

    //console.log(filename, newLabel);
    // Read the existing metadata
    fs.readFile(metadataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading metadata file' });
        }

        let metadata;
        try {
            metadata = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ error: 'Error parsing metadata JSON' });
        }

        // Find the file entry to update
        const fileEntry = metadata.find(file => file.filename === filename);
        if (fileEntry) {
            // Update the label
            fileEntry.label = newLabel;

            // Write the updated metadata back to the file
            fs.writeFile(metadataFilePath, JSON.stringify(metadata, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    return res.status(500).json({ error: 'Error writing updated metadata file' });
                }
                res.json({ message: 'Label updated successfully' });
            });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    });
});

app.post('/api/delete-file', (req, res) => {
    const { filename } = req.body; // Get the filename from the request body

    if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
    }

    fs.readFile(metadataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading metadata file' });
        }

        let metadata;
        try {
            metadata = JSON.parse(data); // Parse the JSON data
        } catch (parseError) {
            return res.status(500).json({ error: 'Error parsing metadata JSON' });
        }

        // Find the file entry to update
        const fileEntry = metadata.find(file => file.filename === filename);
        if (fileEntry) {
            // Set render to false
            fileEntry.render = "false";

            // Write the updated metadata back to the file
            fs.writeFile(metadataFilePath, JSON.stringify(metadata, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    return res.status(500).json({ error: 'Error writing updated metadata file' });
                }
                res.json({ message: 'File marked as not renderable' }); // Send success response
            });
        } else {
            res.status(404).json({ error: 'File not found' }); // Handle case where file is not found
        }
    });
});

app.post('/api/restore-file', (req, res) => {
    const { filename } = req.body;

    if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
    }

    fs.readFile(metadataFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading metadata file' });
        }

        let metadata;
        try {
            metadata = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ error: 'Error parsing metadata JSON' });
        }

        const fileEntry = metadata.find(file => file.filename === filename);
        if (fileEntry) {
            fileEntry.render = "true"; // Restore the file by setting render to true

            fs.writeFile(metadataFilePath, JSON.stringify(metadata, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    return res.status(500).json({ error: 'Error writing updated metadata file' });
                }
                res.json({ message: 'File restored successfully' });
            });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    });
});

// Load files metadata when the server starts
let filesMetadata = loadFilesMetadata();

// Function to save files metadata to JSON file
const saveFilesMetadata = (filesMetadata) => {
    const filePath = path.join(__dirname, './filesMetadata.json'); // Adjust the path as needed
    fs.writeFileSync(filePath, JSON.stringify(filesMetadata, null, 2)); // Save with pretty print
};



// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/data')); // Save files to the 'data' directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); // Get the file extension
        const baseName = path.basename(file.originalname, ext); // Get the base name (without extension)
        let newFileName = file.originalname; // Start with the original filename

        let counter = 1;
        // Check if the file already exists and rename if necessary
        while (fs.existsSync(path.join(__dirname, '../public/data', newFileName))) {
            newFileName = `${baseName}(${counter})${ext}`; // Append a counter to the filename
            counter++;
        }

        cb(null, newFileName); // Save the file with the new name
    }
});

const upload = multer({ storage });

// Function to load user data from users.json
async function loadUserData() {
    const filePath = path.join(__dirname, 'users.json');
    const data = await fsp.readFile(filePath, 'utf8'); // Correctly read the file
    return JSON.parse(data); // Parse the JSON data
}

// Function for password hashing 
async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword);
}


// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('USER INPUT: ',username, '[HIDDEN]');
    try {
        const users = await loadUserData(); // Load user data from the file
        const user = users.find(u => u.username === username); // Simulating a user lookup
        if (user) {
            // Compare the provided password with the hashed password
            const match = await bcrypt.compare(password, user.password);
            console.log(match, user)
            if (match) {
                // Store user info in session
                req.session.user = { username }; 

                console.log('Session after login:', req.session); // Log session content
                
                return res.json({ message: 'Login successful' });
            }
        }
        
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('Error loading user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to check if user is logged in
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        return res.json({ isLoggedIn: true, username: req.session.user.username });
    }
    res.json({ isLoggedIn: false });
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/'); // Redirect to home page after logout
    });
});

// Middleware to protect upload route
const isAuthenticated = (req, res, next) => {
    console.log('Session in isAuthenticated middleware:', req.session); 
    if (req.session.cookie.user) {
        return next(); // User is authenticated, proceed to the next middleware
    }
    // User is not authenticated, respond with a 401 Unauthorized status
    return res.status(401).json({ error: 'Unauthorized: Please log in.' });
};

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Extract the label from the request body
    const label = req.body.label; // Assuming label is sent as form data
    const k = req.body.k; // Assuming k is sent as form data
    const n = req.body.n; // Assuming n is sent as form data

    // Create a metadata object for the uploaded file
    const fileMetadata = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size, // Size in bytes
        uploadDate: new Date(),
        render: true,
    };
    if (label && label !== "undefined") {
        fileMetadata.label = label; // Add k if it exists and is valid
    }
    // Only add k and n to the metadata if they are defined and not "undefined" or empty
    if (k && k !== "undefined") {
        fileMetadata.k = k; // Add k if it exists and is valid
    }
    if (n && n !== "undefined") {
        fileMetadata.n = n; // Add n if it exists and is valid
    }
    

    // Load existing metadata, add the new metadata, and save it
    let filesMetadata = loadFilesMetadata();

    // Push the new fileMetadata
    filesMetadata.push(fileMetadata);
    saveFilesMetadata(filesMetadata);

    res.json({ message: 'File uploaded successfully', file: req.file, label: fileMetadata.label });
});

// Endpoint to list files in the data folder without sorting
app.get('/api/files', (req, res) => {
    const filesMetadata = loadFilesMetadata();
    
    // Check if filesMetadata is empty
    if (filesMetadata.length === 0) {
        return res.status(404).json({ error: 'No files found.' }); // Return a 404 if no files are present
    }

    // Map over the files to return filenames and other details
    const fileDetails = filesMetadata.map(file => ({
        filename: file.filename,
        uploadDate: file.uploadDate, // Format the date
        label: file.label,
        k: file.k,
        n: file.n,
        render: file.render
    }));

    return res.json(fileDetails); // Return the file details as a JSON array
});

// Test server debug
app.post('/api/debug', (req, res) => {
    const { variableName, value } = req.body;
    console.log(`${variableName}: ${value}`); // Log the variable name and its value
    res.sendStatus(200); // Respond with a success status
});


// Serve login page
app.get('/login', (req, res) => {
    res.send(`
        <form action="/login" method="post">
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
    `);
});

// Serve home page
app.get('/', (req, res) => {
    if (req.session.cookie.user) {
        res.send(`
            <h1>Welcome, ${req.session.cookie.user}</h1>
            <form action="/api/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="file" accept=".csv" required />
                <button type="submit">Upload CSV</button>
            </form>
            <form action="/logout" method="post">
                <button type="submit">Logout</button>
            </form>
        `);
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});