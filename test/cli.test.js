var pkg = require('../package.json');
var CLI_PATH = '../cli';

var write;
var browsersListMock;
var originalArgs = process.argv;
var originalStdOutWrite = process.stdout.write;

beforeEach(() => {
    browsersListMock = jest.fn(
        (...args) => `broweserlist called with ${JSON.stringify(args)}`
    );
    browsersListMock.coverage = jest.fn(
        (...args) => `broweserlist.coverage called with ${JSON.stringify(args)}`
    );
    process.stdout.write = write = jest.fn();
    jest.setMock('../', browsersListMock);
    browsersListMock.usage = {
        US: {
            'ie 9': 5,
            'ie 10': 10.1,
            'ie 11': 75
        }
    };
});

afterEach(() => {
    process.argv = originalArgs;
    process.stdout.write = originalStdOutWrite;
    jest.unmock('../');
    jest.resetModules();
});

it('should display version', () => ['--version', '-v'].forEach((val) => {
    process.argv = ['', '', val];
    require(CLI_PATH);
    expect(
        write.mock.calls.join('\n'),
        `should work with ${val} key`
    ).toContain(pkg.version);
}));

it('should display usage help', () => [
    [],
    ['', '', '--help'],
    ['', '', '-h']
].forEach((params) => {
    process.argv = params;
    require(CLI_PATH);
    expect(
        write.mock.calls.join('\n'),
        `should work with params: ${JSON.stringify(params)}`
    ).toContain('Usage:');
}));

it('should display coverage', () => [
    ['', '', '--coverage', 'xIE']
].forEach((params) => {
    process.argv = params;
    require(CLI_PATH);
    expect(browsersListMock.coverage.mock.calls)
        .toEqual([
            ['broweserlist called with ["xIE",null]', undefined]
        ]);
    expect(browsersListMock.mock.calls)
        .toEqual([
            ['xIE', undefined]
        ]);
    expect(
        write.mock.calls.join('\n'),
        `should work with params: ${JSON.stringify(params)}`
    ).toContain('These browsers account for');
}));
