const insertLine = require('insert-line');
const fs = require('fs');

const metaTags= `<meta property="og:title" content="Sophia Fire Editor">
<meta property="og:site_name" content="Nikita Fuchs">
<meta property="og:url" content="http://fireeditor.nikitafuchs.de">
<meta property="og:description" content="Contract editor that does the work for you, not the other way round.">
<meta property="og:type" content="product">
<meta property="og:image" content="http://fireeditor.nikitafuchs.de/assets/preview.png">
`

insertLine('./dist/fire-editor/index.html').content(metaTags).at(5).then(function(err) {
    console.log("Added Meta Tags.")
  })



