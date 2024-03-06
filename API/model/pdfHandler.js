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

    const pWidth = 40;
    const width = pageWidth * x / 100;
    let imageRoom = pageWidth - width;
    let imageWidth = x > 100 - pWidth ? imageRoom - 45 : pageWidth * (pWidth / 100);

    // calculate the width and height of the image depending on the x & y provided and the page size
    

    // calculate the width of the image knowing that the x is the percent pos of the image on the page and it must not exceed the page width
    
    let imageHeight = (imageWidth / 16) * 9;

    const height = pageHeight - imageHeight - pageHeight * y / 100;

    // place the image on the page
    page.drawImage(image, {
        x: width,
        y: height,
        width: imageWidth,
        height: imageHeight,
    });

}

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