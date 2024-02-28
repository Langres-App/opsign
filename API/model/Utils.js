/**
 * Generates a random token of the specified length.
 * @param {number} length - The length of the token to generate.
 * @param {boolean} [caseSensitive=true] - Whether the token should be case sensitive.
 * @returns {string} The randomly generated token.
 */
function generateRandomToken(length, caseSensitive = true) {
    let result = '';
    const characters = caseSensitive
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    generateRandomToken
};