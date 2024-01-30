const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT;

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/',
    (req, res) => res.send('Dockerizing Node Application'))

app.listen(PORT,
    () => console.log(`[BOOTUP]: Server is running at port: ${PORT}`));
