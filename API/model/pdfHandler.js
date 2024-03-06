const fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

/**
 * Adds signatures to a PDF.
 * @param {string} pdfPath - The path to the PDF file.
 * @param {Array} signatures - An array of signature data.
 * @returns {Buffer} - The PDF file as a buffer.
 */
async function addSignaturesToPDF(pdfPath, signatures = []) {
    // load existing PDF
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // get the pages of the PDF
    const pages = pdfDoc.getPages();

    // Place the signatures in the PDF depending on the data provided
    for (let i = 0; i < signatures.length; i++) {
        await placeSignature(pdfDoc, pages, signatures[i]);
    }

    // send the PDF as a response
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

    // return the PDF as a buffer
    return Buffer.from(pdfBase64, 'base64');
}

async function placeSignature(pdfDoc, pages, signatureData) {
    const height = await placeText(pdfDoc, pages, signatureData);
    signatureData.y += height;
    await placeImage(pdfDoc, pages, signatureData);
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
 * @returns {Promise<void>} - A promise that resolves when the image is placed on the PDF document.
 */
async function placeImage(pdfDoc, pages, imageData) {

    // get the image data
    const { imageBuffer, imagePage, x, y } = imageData;

    // create a new image object from the buffer
    const image = await pdfDoc.embedPng(imageBuffer);

    // get the page where the image will be placed
    const page = imagePage && Number(imagePage) && imagePage <= pages.length
        ? pages[imagePage - 1]
        : pages[pages.length - 1];

    // get the size of the page
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // how much percent the signature must take at max
    const pWidth = 40;

    // calculate the position of the image
    const width = pageWidth * x / 100;

    // calculate the size of the image
    let imageRoom = pageWidth - width;

    // if the image is too big (out of screen), reduce it
    let imageWidth = x > 100 - pWidth ? imageRoom - 45 : pageWidth * (pWidth / 100);

    // calculate the height of the image (16/9 ratio)
    let imageHeight = (imageWidth / 16) * 9;

    // calculate the y position of the image
    const height = pageHeight - imageHeight - pageHeight * y / 100;

    // place the image on the page
    page.drawImage(image, {
        x: width,
        y: height,
        width: imageWidth,
        height: imageHeight,
    });

}

/**
 * Places text on a PDF document.
 * @param {PDFDocument} pdfDoc - The PDF document object.
 * @param {PDFPage[]} pages - An array of PDFPage objects representing the pages of the document.
 * @param {Object} textData - The data for the text to be placed.
 * @param {string} textData.text - The text to be placed.
 * @param {number} [textData.textPage] - The page number where the text should be placed. If not provided, the text will be placed on the last page.
 * @param {number} textData.x - The x-coordinate (in percentage) where the text should be placed on the page.
 * @param {number} textData.y - The y-coordinate (in percentage) where the text should be placed on the page.
 * @param {string} [textData.fontColor] - The color of the text in RGB format (e.g., "rgb(255, 0, 0)"). If not provided, the default color is black.
 * @returns {number} - The number of lines of text placed on the page.
 */
async function placeText(pdfDoc, pages, textData) {

    const { text, textPage, x, y, fontColor } = textData;

    const page = textPage && Number(textPage) && textPage <= pages.length
        ? pages[textPage + 1]
        : pages[pages.length - 1];

    const { width: pageWidth, height: pageHeight } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    await page.drawText(text, {
        x: pageWidth * x / 100,
        y: pageHeight - pageHeight * y / 100,
        size:  12,
        color: fontColor ? fontColor : rgb(0, 0, 0),
        font: font,
    });

    return text.split('\n').length * 2;

}

module.exports = { addSignaturesToPDF };