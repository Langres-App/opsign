const fs = require('fs');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

/**
 * Adds an image to an existing PDF file.
 * @param {string} pdfPath - The path of the PDF file.
 * @param {string} imageData - The image data to be added to the PDF.
 * @returns {Promise} A promise that resolves when the image is added to the PDF.
 */
async function addImageToPDF(pdfPath, imageData) {
    return addImagesToPDF(pdfPath, [imageData]);
}

/**
 * Adds images to an existing PDF.
 * @param {string} pdfPath - The path to the existing PDF file.
 * @param {Array} imagesData - An array of image data to be placed in the PDF.
 * @returns {Promise<Buffer>} - The PDF file as a buffer.
 */
async function addImagesToPDF(pdfPath, imagesData = []) {

    // load existing PDF
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // get the pages of the PDF
    const pages = pdfDoc.getPages();

    // Place the images in the PDF depending on the data provided
    for (let i = 0; i < imagesData.length; i++) {
        await placeImage(pdfDoc, pages, imagesData[i]);
    }

    // send the PDF as a response
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // return the PDF as a buffer
    return Buffer.from(pdfBase64, 'base64');
}

/**
 * Places an image on a PDF document.
 * @param {PDFDocument} pdfDoc - The PDF document to place the image on.
 * @param {PDFPage[]} pages - An array of PDFPage objects representing the pages in the document.
 * @param {Object} imageData - The data needed to place the image.
 * @param {Buffer} imageData.imageBuffer - The image buffer.
 * @param {number} imageData.imagePage - The page number where the image should be placed.
 * @param {number} imageData.x - The x-coordinate of the image placement (in percentage).
 * @param {number} imageData.y - The y-coordinate of the image placement (in percentage).
 * @param {number} imageData.pWidth - The percentage width of the image. (e.g., 50 for 50% of the page width)
 * @returns {Promise<void>} - A promise that resolves when the image is placed on the PDF document.
 */
async function placeImage(pdfDoc, pages, imageData) {

    // get the data needed to place the image
    const { imageBuffer, imagePage, x, y, pWidth } = imageData;

    // get the last page's size
    const page = imagePage && Number(imagePage) && imagePage <= pages.length
        ? pages[imagePage + 1]
        : pages[pages.length - 1];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // calculate the new width and height of the image
    const width = pageWidth * pWidth / 100;
    const imgMetadata = await sharp(imageBuffer).metadata();
    const aspectRatio = imgMetadata.width / imgMetadata.height;
    const height = width / aspectRatio;

    // embed the image
    const image = await pdfDoc.embedPng(imageBuffer);

    // draw the image on the page (and scale it to the width and height calculated above)
    page.drawImage(image, {
        x: pageWidth * x / 100,
        y: pageHeight * y / 100,
        width: width,
        height: height,
    });
}

module.exports = { addImageToPDF, addImagesToPDF };