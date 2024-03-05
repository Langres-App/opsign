const fs = require('fs');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');


/**
 * Adds an image to a PDF document.
 * @param {string} pdfPath - The path to the existing PDF file.
 * @param {Buffer} imgBuffer - The image buffer to be added to the PDF.
 * @param {number} startPercentX - The starting X position of the image as a percentage of the page width.
 * @param {number} startPercentY - The starting Y position of the image as a percentage of the page height.
 * @param {number} widthPercent - The width of the image as a percentage of the page width.
 * @returns {Promise<Buffer>} - A promise that resolves with the PDF document as a buffer.
 */
async function addImageToPDF(pdfPath, imgBuffer, startPercentX, startPercentY, widthPercent) {
    // load existing PDF
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Add a new page to the PDF
    const pages = pdfDoc.getPages();

    // get the last page's size
    const page = pages[pages.length - 1];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // calculate the new width and height of the image
    const width = pageWidth * widthPercent / 100;
    const imgMetadata = await sharp(imgBuffer).metadata();
    const aspectRatio = imgMetadata.width / imgMetadata.height;
    const height = width / aspectRatio;

    // embed the image
    const image = await pdfDoc.embedPng(imgBuffer);

    // draw the image on the page (and scale it to the width and height calculated above)
    page.drawImage(image, {
        x: pageWidth * startPercentX / 100,
        y: pageHeight * startPercentY / 100,
        width: width,
        height: height,
    });

    // send the PDF as a response
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // return the PDF as a buffer
    return Buffer.from(pdfBase64, 'base64');

}

module.exports = { addImageToPDF };