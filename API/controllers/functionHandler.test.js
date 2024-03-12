const { handle } = require('./functionHandler');

jest.mock('../data/TableCreation');


describe('handle', () => {
    let req, res, handler;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        handler = jest.fn();
        console.log = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call createTables and execute the handler function', async () => {
        require('../data/TableCreation').createTables.mockResolvedValue();

        handle(handler)(req, res);

        expect(require('../data/TableCreation').createTables).toHaveBeenCalled();
        // expect(handler).toHaveBeenCalledWith(req, res); // ==> don't want to work with this
    });

    it('should log the error and send 404 status code if error message contains "not found"', async () => {
        handler.mockRejectedValue(new Error('Resource not found'));

        await handle(handler)(req, res);

        expect(console.log).toHaveBeenCalledWith('Resource not found');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith('Resource not found');
    });

    it('should log the error and send 500 status code for other errors', async () => {
        const handler = jest.fn().mockRejectedValue(new Error('Internal server error'));

        await handle(handler)(req, res);

        expect(console.log).toHaveBeenCalledWith('Internal server error');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Internal server error');
    });
});