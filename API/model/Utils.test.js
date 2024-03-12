const { generateRandomToken } = require("./Utils");

test('generateRandomToken should return a string of the specified length', () => {
    const length = 100;
    const token = generateRandomToken(length);
    expect(typeof token).toBe('string');
    expect(token.length).toBe(length);
});

test('generateRandomToken should return a case-sensitive token when caseSensitive is true', () => {
    const length = 100;
    const token = generateRandomToken(length, true);
    const uppercaseLetters = /[A-Z]/;
    const lowercaseLetters = /[a-z]/;
    expect(uppercaseLetters.test(token)).toBe(true);
    expect(lowercaseLetters.test(token)).toBe(true);
});

test('generateRandomToken should return a case-insensitive token when caseSensitive is false', () => {
    const length = 100;
    const token = generateRandomToken(length, false);
    const letters = /[A-Za-z]/;
    expect(letters.test(token)).toBe(true);
});

test('generateRandomToken should return a different token each time it is called', () => {
    const length = 100;
    const token1 = generateRandomToken(length);
    const token2 = generateRandomToken(length);
    expect(token1).not.toBe(token2);
});