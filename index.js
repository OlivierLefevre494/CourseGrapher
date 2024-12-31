const http = require('http')
const { readFile, readFileSync } = require('fs');
const express = require('express');
const app = express();

// Serve static files from the current directory (or a public folder)
app.use(express.static(__dirname)); // Makes all files in the directory accessible


app.get('/', (request, response) => {
  readFile('./mainpage.html', 'utf8', (err, html) => {

    if (err) {

      response.status(500).send('sorry out of order')

    }

    response.send(html);

  })

});


app.listen(process.env.PORT || 3000, () => console.log('App available on port 3000'))