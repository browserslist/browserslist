var browserslist = require('../');

it('converts Electron to Chrome', () => {
    expect(browserslist('electron 1.1')).toEqual(['chrome 50']);
});

it('supports case insensitive Electron name', () => {
    expect(browserslist('Electron 1.1')).toEqual(['chrome 50']);
});

it('throws on unknown Electron version', () => {
    expect(() => {
        browserslist('electron 0.19');
    }).toThrowError(/Unknown version/);
});

it('converts Electron to Chrome in ranges', () => {
    expect(browserslist('electron 0.36-1.2'))
        .toEqual(['chrome 51', 'chrome 50', 'chrome 49', 'chrome 47']);
});

it('ignores case in Electron ranges', () => {
    expect(browserslist('Electron 0.37-1.0')).toEqual(['chrome 49']);
});

it('throws on unknown Electron range version', () => {
    expect(() => {
        browserslist('electron 0.1-1.2');
    }).toThrowError(/Unknown version/);
    expect(() => {
        browserslist('electron 0.37-999');
    }).toThrowError(/Unknown version/);
});

it('converts Electron versions to Chrome', () => {
    expect(browserslist('electron <= 0.21'))
        .toEqual(['chrome 40', 'chrome 39']);
});

it('ignores case in Electron versions', () => {
    expect(browserslist('Electron < 0.21')).toEqual(['chrome 39']);
});
