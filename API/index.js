const bodyParser = require('body-parser');
const express = require('express');

const app = express();

// Enable CORS
const cors = require('cors');
const { autoDeleteArchivedUsers } = require('./model/Managers/UserManager.js');
app.use(cors());

// Set the port
const PORT = process.env.PORT;

// Use the express body parser to parse the request body
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Use the body parser to parse the request body
app.use(bodyParser.raw({ type: 'application/octet-stream' }));

// Import and use the routes
app.get('/', (req, res) => res.send('Welcome to the Document Management System API!'));
app.use('/documents', require('./controllers/DocumentController.js'));
app.use('/auth', require('./controllers/AuthController.js'));
app.use('/users', require('./controllers/UserController.js'));

// Start the server
app.listen(PORT, () => console.log(`[${new Date().toLocaleString()}] - Server is running at port: ${PORT}`));


/////////////////////////////////////////////////////////
//////////////////// GDPR compliance ////////////////////
/////////////////////////////////////////////////////////

const duration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Execute the function immediately when the page loads
autoDeleteArchivedUsers();

// Set up the interval to execute the function every week
setInterval(autoDeleteArchivedUsers, duration);