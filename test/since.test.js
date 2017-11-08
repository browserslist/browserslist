var browserslist = require('../')

var originData = browserslist.data

describe('with real browser release date data', () => {
  beforeEach(() => {
    browserslist.data = {
      ie: {
        name: 'ie',
        versions: ['5.5', '6', '7', '8', '9', '10', '11'],
        releaseDate: {
          '6': 998870400, // Mon, 27 Aug 2001 00:00:00 +0000
          '7': 1161129600, // Wed, 18 Oct 2006 00:00:00 +0000
          '8': 1237420800, // Thu, 19 Mar 2009 00:00:00 +0000
          '9': 1300060800, // Mon, 14 Mar 2011 00:00:00 +0000
          '10': 1346716800, // Tue, 04 Sep 2012 00:00:00 +0000
          '11': 1381968000, // Thu, 17 Oct 2013 00:00:00 +0000
          '5.5': 962323200 // Fri, 30 Jun 2000 00:00:00 +0000
        }
      },
      safari: {
        name: 'safari',
        versions: [
          '3.1', '3.2', '4', '5', '5.1', '6', '6.1', '7', '7.1', '8', '9',
          '9.1', '10', '10.1', '11', 'TP'
        ],
        releaseDate: {
          '4': 1244419200, // Mon, 08 Jun 2009 00:00:00 +0000
          '5': 1275868800, // Mon, 07 Jun 2010 00:00:00 +0000
          '6': 1343174400, // Wed, 25 Jul 2012 00:00:00 +0000
          '7': 1382400000, // Tue, 22 Oct 2013 00:00:00 +0000
          '8': 1413417600, // Thu, 16 Oct 2014 00:00:00 +0000
          '9': 1443657600, // Thu, 01 Oct 2015 00:00:00 +0000
          '10': 1474329600, // Tue, 20 Sep 2016 00:00:00 +0000
          '11': 1505779200, // Tue, 19 Sep 2017 00:00:00 +0000
          '3.1': 1205798400, // Tue, 18 Mar 2008 00:00:00 +0000
          '3.2': 1226534400, // Thu, 13 Nov 2008 00:00:00 +0000
          '5.1': 1311120000, // Wed, 20 Jul 2011 00:00:00 +0000
          '6.1': 1382400000, // Tue, 22 Oct 2013 00:00:00 +0000
          '7.1': 1410998400, // Thu, 18 Sep 2014 00:00:00 +0000
          '9.1': 1458518400, // Mon, 21 Mar 2016 00:00:00 +0000
          '10.1': 1490572800, // Mon, 27 Mar 2017 00:00:00 +0000
          TP: null
        }
      }
    }
  })

  afterEach(() => {
    browserslist.data = originData
  })

  it('selects versions released since specified year', () => {
    expect(browserslist('since 2013'))
      .toEqual([
        'ie 11', 'safari 11', 'safari 10.1', 'safari 10', 'safari 9.1',
        'safari 9', 'safari 8', 'safari 7.1', 'safari 7', 'safari 6.1'
      ])
  })

  it('is case insensitive', () => {
    expect(browserslist('sInCe 2016'))
      .toEqual(['safari 11', 'safari 10.1', 'safari 10', 'safari 9.1'])
  })

  it('selects versions released since specific year and month', () => {
    expect(browserslist('since 2016-09'))
      .toEqual(['safari 11', 'safari 10.1', 'safari 10'])
  })

  it('selects versions released since specific year, month, and date', () => {
    expect(browserslist('since 2013-10-22'))
      .toEqual([
        'safari 11', 'safari 10.1', 'safari 10', 'safari 9.1',
        'safari 9', 'safari 8', 'safari 7.1', 'safari 7', 'safari 6.1'
      ])
  })
})

describe('with fake edge case browser release date data', () => {
  beforeEach(() => {
    browserslist.data = {
      ie: {
        name: 'ie',
        versions: ['1', '2', '3'],
        releaseDate: {
          '1': 0, // Thu, 01 Jan 1970 00:00:00 +0000
          '2': 1483228800, // Sun, 01 Jan 2017 00:00:00 +0000
          '3': 1485907200 // Wed, 01 Feb 2017 00:00:00 +0000
        }
      }
    }
  })

  afterEach(() => {
    browserslist.data = originData
  })

  it('selects versions released on year boundaries', () => {
    expect(browserslist('since 1970'))
      .toEqual([
        'ie 3', 'ie 2', 'ie 1'
      ])
  })

  it('selects versions released on year and month boundaries', () => {
    expect(browserslist('since 2017-01'))
      .toEqual([
        'ie 3', 'ie 2'
      ])
  })

  it('selects versions released on date boundaries', () => {
    expect(browserslist('since 2017-02-01'))
      .toEqual([
        'ie 3'
      ])
  })
})
