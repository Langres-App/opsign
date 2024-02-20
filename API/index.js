const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/',
    (req, res) => res.send('Welcome to the Document Management System API!'));

app.listen(PORT,
    () => console.log(`[BOOTUP]: Server is running at port: ${PORT}`));

// Import and use the DocumentController
app.use('/documents', require('./controllers/DocumentController.js'));
app.use('/auth', require('./controllers/AuthController.js'));