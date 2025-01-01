const http = require('http')
const { readFile, readFileSync } = require('fs');
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

// Serve static files from the current directory (or a public folder)
app.use(express.json()); // Parse JSON from the request body
app.use(express.static(__dirname)); // Makes all files in the directory accessible
app.use('/images', express.static('images'));



app.get('/', (request, response) => {
  readFile('./mainpage.html', 'utf8', (err, html) => {

    if (err) {

      response.status(500).send('sorry out of order')

    }

    response.send(html);

  })

});

// Route to scrape data
app.post('/scrape', async (req, res) => {
  /// RETURNS A DICTIONARY OF CLASSES AND EDGES
  /// EACH CLASS HAS A TITLE AND DESCRIPTION
  /// EACH EDGE HAS A SOURCE AND TARGET
  try {
    const { url } = req.body; // URL to scrape (sent from client)
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    result = {classes: [], edges: []};

    //get all spans with class 'course_number' and return the text content
    const title = await page.$$eval('.course_number', spans => spans.map(span => span.textContent));
    //get all links inside spans with class 'course_title' and return the href
    const links = await page.$$eval('.course_title a', links => links.map(a => a.href));
    //get all descriptions of the class
    const descriptions = await page.$$eval('.course_title a', links => links.map(a => a.title));

    // combine all titles with descriptions and add them to the result object
    for (let i = 0; i < title.length; i++) {
      result.classes.push({title: title[i], description: descriptions[i]});
    }

    // loop that takes each link and scrapes that pages for the edges
    for (let i = 0; i < links.length; i++) {
      await page.goto(links[i]);
      // for each page all the prereqs are stored in links <a> tags inside the ul with class 'catalog_notes'
      const prereqs = await page.$$eval('catalog-notes ul li p a', links => links.map(a => a.textContent));
      const banana = await page.$$eval('p a', links => links.map(a => a.textContent));
      console.log(prereqs);
      console.log(banana);
      // for each prereq add a new edge to the result object with source title corresponding to the current number of link we are on ex if on link 3 and class 3 is 'CS 111' then the source is 'CS 111'
      //for (let j = 0; j < prereqs.length; j++) {
        //result.edges.push({source: title[i], target: prereqs[j]});
      //}
    }

    await browser.close();
    res.json({ result }); // Send data back to the client
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred while scraping');
  }
});


app.listen(process.env.PORT || 3000, () => console.log('App available on port 3000'))