const assert = require("./Asserter");

test('assert function throws an error when condition is false', () => {
    expect(() => {
        assert(false, 'Condition is false');
    }).toThrow('Condition is false');
});

test('assert function does not throw an error when condition is true', () => {
    expect(() => {
        assert(true, 'Condition is false');
    }).not.toThrow();
});