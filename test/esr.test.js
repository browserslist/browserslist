const browserslist = require('../');

it('selects Firefox ESR', () => {
    expect(browserslist('Firefox ESR')).toEqual(['firefox 45']);
});

it('uses case insensitive aliases', () => {
    const result = browserslist('Firefox ESR');
    expect(browserslist('firefox esr')).toEqual(result);
    expect(browserslist('ff esr')).toEqual(result);
    expect(browserslist('fx esr')).toEqual(result);
});
