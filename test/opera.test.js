var browserslist = require('../');

it('selects opera mini', () => {
    expect(browserslist('op_mini all')).toEqual(['op_mini all']);
});

it('selects opera mini case insensitive', () => {
    expect(browserslist('OperaMini All')).toEqual(['op_mini all']);
});
