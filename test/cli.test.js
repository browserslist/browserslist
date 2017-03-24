const pkg = require('../package.json');
const CLI_PATH = '../cli';

let write;
const originalArgs = process.argv;
const originalStdOutWrite = process.stdout.write;

beforeEach(() => {
    let browsersListMock = jest.fn();
    process.stdout.write = write = jest.fn();
    jest.setMock('../', browsersListMock.mock);
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
