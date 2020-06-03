const insertLine = require('insert-line');
const fs = require('fs');
import { environment } from './environments/environment';

const metaTags= `<meta property="og:title" content="AE Studio">
<meta property="og:site_name" content="Nikita Fuchs">
<meta property="og:url" content="${environment.appUrl}">
<meta property="og:description" content="Contract editor that does the work for you, not the other way round.">
<meta property="og:type" content="product">
<meta property="og:image" content="${environment.appUrl}">
`

insertLine('./dist/fire-editor/index.html').content(metaTags).at(5).then(function(err) {
    console.log("Added Meta Tags.")
  })



