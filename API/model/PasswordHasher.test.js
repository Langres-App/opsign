const { hashPassword, comparePassword } = require("./PasswordHasher");

test('hashPassword function should return a hashed password', async () => {
    const password = 'password123';
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe('string');
});

test('comparePassword function should return true for matching password and hash', async () => {
    const password = 'password123';
    const hashedPassword = await hashPassword(password);
    const isMatch = await comparePassword(password, hashedPassword);
    expect(isMatch).toBe(true);
});

test('comparePassword function should return false for non-matching password and hash', async () => {
    const password = 'password123';
    const wrongPassword = 'wrongpassword';
    const hashedPassword = await hashPassword(password);
    const isMatch = await comparePassword(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
});