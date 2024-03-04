const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.get('/', 
    (req, res) => res.send('Welcome to the Document Management System API!'));

app.listen(PORT,
    () => console.log(`[${new Date().toLocaleTimeString()}]: Server is running at port: ${PORT}`));


app.use(bodyParser.raw({ type: 'application/octet-stream' }));

// Import and use the routes
app.use('/documents', require('./controllers/DocumentController.js'));
app.use('/auth', require('./controllers/AuthController.js'));
app.use('/users', require('./controllers/UserController.js'));