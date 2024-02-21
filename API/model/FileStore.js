const multer = require('multer');
const path = require('path');
const fs = require('fs');


/**
 * Multer disk storage configuration for file uploads.
 * @type {Object}
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get the title from the request body
        const { title } = req.body;
        if (!title) {
            return cb(new Error('Title is missing in the request body'));
        }

        // Create a folder associated with the title if it doesn't exist
        const folderPath = path.join(__dirname, '../Docs', title);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true, mode: 0o777 });
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
 
/**
 * Middleware function for handling file uploads.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const upload = multer({ storage: storage });

/**
 * Stores a document in the file system.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the document is stored successfully.
 */
async function storeDocument(req, res, next) {
    try {
        const { title, date } = req.body; // Assuming 'title' and 'date' are the field names for the title and date
        const fileStream = req.file; // Assuming 'file' is the field name for the uploaded file
        
        // Validate the request body
        if (!title || !date) {
            console.error('Error storing file: Title or date is missing in the request body');
            return res.status(400).json({ error: 'Title or date is missing in the request body' });
        }

        // Validate the file stream
        if (!fileStream) {
            console.error('Error storing file: File stream is missing');
            return res.status(400).json({ error: 'File stream is missing' });
        }

        // Create the pathes for the folder and file
        const folderPath = path.join(__dirname, '../Docs', title);
        const ext = path.extname(fileStream.originalname);
        const filePath = path.join(folderPath, `[${date}] - ${title}${ext}`);

        // Create a folder associated with the title if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true, mode: 0o777 });
        } 

        // Store the file in the file system
        const writeStream = fs.createWriteStream(filePath);
        
        // Pipe the file stream to the write stream
        fs.createReadStream(fileStream.path).pipe(writeStream);

        // Handle the write stream events
        writeStream.on('finish', () => {
            req.filePath = filePath; // Store the file path in the request object
            next(); // Call the next middleware
        });

        // Handle the write stream error
        writeStream.on('error', (err) => {
            console.error('Error storing file:', err);
            res.status(500).json({ error: 'Failed to store file' });
        });
    } catch (error) {
        console.error('Error storing file:', error);
        res.status(500).json({ error: 'Failed to store file' });
    }
}

/**
 * Deletes the original file from the file stream.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the file is deleted.
 */
async function deleteOriginal(req, res, next) {
    try {
        const fileStream = req.file; // Assuming 'file' is the field name for the uploaded file
        
        // Validate the file stream
        if (!fileStream) {
            console.error('Error deleting file: File stream is missing');
            return res.status(400).json({ error: 'File stream is missing' });
        }

        // Delete the original file
        fs.unlinkSync(fileStream.path);

        // Call the next middleware
        next();
    } catch (error) {
        // Handle the error
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
}

module.exports = { upload, storeDocument, deleteOriginal };