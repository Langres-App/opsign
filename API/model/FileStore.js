const multer = require('multer');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const { getDocuments } = require('../data/queries/DocumentsQueries');


/**
 * Multer disk storage configuration for file uploads.
 * @type {Object}
 */
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Get the id & the title from the request body
        let id = req.params.id;
        let { title } = req.body;
        if (!title) {
            title = (await getDocuments(id)).name;
            assert(title, 'Property "title" is required in the request body');
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
 * Multer disk storage configuration for blob uploads.
 * @type {Object}
 */
const blobStorage = multer.memoryStorage();


/** 
 * Middleware function for handling file uploads.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function. 
 */
const upload = multer({ storage: storage });
const blobUpload = multer({ storage: blobStorage });

/**
 * Stores a document in the file system.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the document is stored successfully.
 */
async function storeDocument(req, res, next) {
    try {
        let { id } = req.params;
        let { title, date } = req.body; // Assuming 'title' and 'date' are the field names for the title and date
        const fileStream = req.file; // Assuming 'file' is the field name for the uploaded file

        // check that title or id is present
        if (!title && !id) {
            console.error('Error storing file: Id or Title is missing in the request body');
            return res.status(400).json({ error: 'Id or Title is missing in the request body' });
        }


        // Validate the request body
        if (!date) {
            console.error('Error storing file: date is missing in the request body');
            return res.status(400).json({ error: 'date is missing in the request body' });
        }

        // Validate the file stream
        if (!fileStream) {
            console.error('Error storing file: File stream is missing');
            return res.status(400).json({ error: 'File stream is missing' });
        }

        // Get the title from the database if it's not present in the request body
        if (!title) {
            //get the title from the database
            title = (await getDocuments(id)).name;
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
        // res.status(500).json({ error: 'Failed to delete file' });
    }
}


/**
 * Renames a folder and its files with a new name.
 * 
 * @param {string} folderPath - The path of the folder to be renamed.
 * @param {string} newName - The new name for the folder and its files.
 */
function changeFolderAndFilesNames(folderPath, newName) {
    // Get the directory name from the folderPath
    const directory = path.dirname(folderPath);
    // Form the full path to the new folder
    const newFolderPath = path.join(directory, newName);

    // Rename the folder
    fs.rename(folderPath, newFolderPath, (err) => {
        if (err) {
            console.error('Error renaming folder:', err);
            return;
        }

        // Read the new folder contents
        fs.readdir(newFolderPath, (err, files) => {
            if (err) {
                console.error('Error reading folder contents:', err);
                return;
            }

            // Iterate over files in the folder
            files.forEach((file) => {
                const oldFilePath = path.join(newFolderPath, file);

                // Extract date and name from the file name
                const regex = /^\[(\d{4}-\d{2}-\d{2})\] - (.+)\.pdf$/;
                const match = file.match(regex);
                if (!match) {
                    console.error('Invalid file name format:', file);
                    // Optionally, delete the file if the format is invalid
                    // fs.unlinkSync(oldFilePath);
                    return;
                }
                // Extract the date part from the file name
                const [, datePart,] = match;

                // Construct the new file name using the newName parameter and the extracted date
                const newFileName = `[${datePart}] - ${newName}.pdf`;
                const newFilePath = path.join(newFolderPath, newFileName);

                // Rename the file
                fs.rename(oldFilePath, newFilePath, (err) => {
                    if (err) {
                        console.error('Error renaming file:', err);
                    } else {
                        console.log(`File ${file} renamed to ${newFileName}`);
                    }
                });
            });
        });
    });
}


module.exports = { upload, blobUpload, storeDocument, deleteOriginal, changeFolderAndFilesNames };