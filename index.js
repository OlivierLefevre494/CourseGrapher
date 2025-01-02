const http = require('http')
const { readFile, readFileSync } = require('fs');
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
let dagre = require('cytoscape-dagre');

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
      ///
      /// NEEDS WORK, IMPLEMENT CHECKING FOR OR AND ADD LOGIC EG PREREQS : CS 111 OR CS 112
      /// IMPLEMENT CHECKING FOR RESTRICTIONS EG NOT AVAILABLE TO PEOPLE WHO HAVE TAKEN CS 111
      /// IMPLEMENT CHECKING AVAILABLE SEMESTERS EG OFFERED IN FALL 2024
      ///
      await page.goto(links[i]);
      // for each page all the prereqs are stored in links <a> tags inside the ul with class 'catalog_notes',
      const prereqs = await page.$$eval('p', paragraphs => paragraphs.map(p => p.innerHTML));
      // keep those that contain 'Prerequisite' and remove the rest
      for (let j = 0; j < prereqs.length; j++) {
        if (!prereqs[j].includes('Prerequisite')) {
          prereqs.splice(j, 1);
          j--;
        }
      }
      // for each prereqtext get all substrings that are between a '>' and a '<' and store them in the prereqs array there will be multiple prereqs for each string
      for (let j = 0; j < prereqs.length; j++) {
        let prereq = prereqs[j];
        let newprereqs = [];
        while (prereq.includes('<')) {
          let start = prereq.indexOf('>');
          let end = prereq.indexOf('<');
          // make sure the > is before the < and then add the substring between them to the newprereqs array
          if (start < end && prereq[end+1]!="a") {
            newprereqs.push(prereq.substring(start+1, end));
          }
          // remove the substring from the prereq string
          prereq = prereq.substring(end+1);
        }
        prereqs[j] = newprereqs;
      }
      
      // for each prereqarray in prereqs for each prereq in the prereqarray add an edge to the result object
      for (let j = 0; j < prereqs.length; j++) {
        for (let k = 0; k < prereqs[j].length; k++) {
          result.edges.push({source: prereqs[j][k], target: title[i]});
        }
      }

    }

    await browser.close();
    res.json({ result }); // Send data back to the client
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred while scraping');
  }
});


app.listen(process.env.PORT || 3000, () => console.log('App available on port 3000'))