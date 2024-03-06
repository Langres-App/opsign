const { getSigningUserImage, getSigningUserData, getDocumentPath } = require('../data/queries/UsersQueries');
const assert = require('./Asserter');
const sharp = require('sharp');
const { addSignaturesToPDF } = require('./pdfHandler');

/**
 * Retrieves a signed document based on the provided user verification ID.
 * @param {number} uvId - The user verification ID.
 * @returns {Promise<{pdf: Buffer, docName: string}>} The signed document in PDF format.
 * @throws {Error} If the ID is not provided or is not a number, or if there is an error during the process.
 */
async function getSignedDocument(uvId) {
    // verify the id is a number
    assert(uvId, 'ID must be provided');
    uvId = Number(uvId);
    assert(Number(uvId), 'ID must be a number');

    // get the document path
    const documentPath = await getDocumentPath(uvId);
    const docName = documentPath.split('/').pop();

    // add the signature to the document
    const pdf = await addSignaturesToPDF(documentPath, [await getSignature(uvId)]);

    return { pdf, docName };
}

async function getSignature(id) {
    return {
        text: await getSignatureHeader(id),         // get the signature header as a string
        imageBuffer: await getSignatureImage(id),   // get the signature image as a buffer
        x: 50,                                      // set the x-coordinate (percent) of the signature placement
        y: 74.7,                                    // set the y-coordinate (percent) of the signature placement
    };

}

/**
 * Retrieves the signature header for a user.
 * @param {string} id - The ID of the user.
 * @returns {Promise<string>} The signature header as a string
 */
async function getSignatureHeader(id) {

    // get the user's data
    const { displayName, signed_date } = await getSigningUserData(id);

    // format the date
    const date = new Date(signed_date).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    // Set the text to be generated
    const text = `${displayName},\nFait le ${date}`;
    return text;


}

/**
 * Retrieves the signature image for a user based on the provided ID.
 * @param {number} id - The ID of the user.
 * @returns {Promise<Buffer>} - A promise that resolves to a Buffer containing the signature image.
 */
async function getSignatureImage(id) {
    // verify the id is a number
    assert(id, 'id must be provided');
    id = Number(id);
    assert(Number(id), 'id must be a number');

    // get the image from the user_version table (id is provided in the request params)
    const bin = await getSigningUserImage(id);

    // get the image metadata
    const metadata = await sharp(bin).metadata();

    // get a trimmed version of the signature image
    let imgBuff = await sharp(bin).png().trim().toBuffer();

    // create a 16/9 container which take the image and put it in the top left corner, the container must take in consideration that the image must fit so have a min-width of 100% and a min-height of 100% of the width
    imgBuff = await sharp({
        create: {
            width: metadata.width,
            height: Math.round(metadata.width / 16 * 9),
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
        .png()
        .composite([{ input: imgBuff, gravity: 'northwest' }])
        .toBuffer();

    return imgBuff;
}

module.exports = { getSignedDocument };