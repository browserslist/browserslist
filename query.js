function BrowserslistQuery (type, value) {
  this.QueryType = type
  this.queryString = value.trim()
}

module.exports = BrowserslistQuery
