const AuthManager = require('./AuthManager');

describe('AuthManager', () => {

  AuthManager.userExist = jest.fn().mockReturnValue(true);

  describe('check', () => {
    it('should return false if token is missing', async () => {
      const result = await AuthManager.check();
      expect(result).toBe(false);
    });

    it('should return false if token is "null"', async () => {
      const result = await AuthManager.check('null');
      expect(result).toBe(false);
    });

    it('should return false if token does not include "Bearer "', async () => {
      const result = await AuthManager.check('invalidToken');
      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('should throw an error if username is missing', async () => {
      const data = { password: 'password' };
      await expect(AuthManager.login(data)).rejects.toThrow('[AuthManager.login] The username is required');
    });

    it('should throw an error if password is missing', async () => {
      const data = { username: 'username' };
      await expect(AuthManager.login(data)).rejects.toThrow('[AuthManager.login] The password is required');
    });

  });

});