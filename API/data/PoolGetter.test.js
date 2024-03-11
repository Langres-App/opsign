const getPool = require("./PoolGetter");

test('getPool function returns a valid MySQL connection pool', () => {
    const pool = getPool();
    expect(pool).toBeDefined();
    expect(typeof pool.getConnection).toBe('function');
});

test('getPool function returns a connection pool with correct database configuration', () => {
    const pool = getPool();
    const config = pool.config.connectionConfig;
    expect(config.host).toBe(process.env.DB_HOST);
    expect(config.user).toBe(process.env.DB_USER);
    expect(config.password).toBe(process.env.DB_PASSWORD);
    expect(config.database).toBe(process.env.DB_DATABASE);
});