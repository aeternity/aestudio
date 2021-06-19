// injects open graph meta data for aeternity

const insertLine = require('insert-line');
const fs = require('fs');
require('typescript-require');
const environment = require('./src/environments/environment.ae.ts')

const metaTags= `<meta property="og:title" content="AE Studio">
<meta property="og:site_name" content="AE Studio">
<meta property="og:url" content="${environment.environment.appUrl}">
<meta property="og:description" content="Contract editor that does the work for you, not the other way round.">
<meta property="og:type" content="product">
<meta property="og:image" content="${environment.environment.appUrl}/assets/preview.png">
`

insertLine('./dist/index.html').content(metaTags).at(5).then(function(err) {
    console.log("Added Meta Tags.")
  })



