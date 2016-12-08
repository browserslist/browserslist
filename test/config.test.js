const browserslist = require('../');

const path = require('path');

const css = path.join(__dirname, 'fixtures', 'dir', 'test.css');

it('parses queries', () => {
    expect(browserslist.parseConfig('ie 10\n> 1%')).toEqual(['ie 10', '> 1%']);
});

it('trims whitespaces', () => {
    expect(browserslist.parseConfig('ie 10 \n \n  > 1%\n'))
        .toEqual(['ie 10', '> 1%']);
});

it('removes comments', () => {
    const config = '# support list\nie 10#bad\n> 1%';
    expect(browserslist.parseConfig(config)).toEqual(['ie 10', '> 1%']);
});

it('returns false on no config', () => {
    expect(browserslist.readConfig(__dirname)).toEqual(false);
});

it('reads config', () => {
    expect(browserslist.readConfig(css)).toEqual(['ie 11', 'ie 10']);
});
