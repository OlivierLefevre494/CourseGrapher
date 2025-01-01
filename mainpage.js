
let timeboxsem = document.getElementById('timeboxsem');
let timeboxyear = document.getElementById('timeboxyear');
let Larrow = document.getElementById('Larrow');
let Rarrow = document.getElementById('Rarrow');

Rarrow.addEventListener('click', function() {
    updateTimeForward(time);
    timeboxsem.innerHTML = time.semester;
    timeboxyear.innerHTML = time.year;
});

Larrow.addEventListener('click', function() {
    updateTimeBackward(time);
    timeboxsem.innerHTML = time.semester;
    timeboxyear.innerHTML = time.year;
});

document.getElementById('scrapeButton').addEventListener('click', async () => {
  const url = document.getElementById('url').value;
  if (!url) {
    alert('Please enter a URL!');
    return;
  }

  try {
    const response = await fetch('/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }), // Send the URL to the server
    });

    if (!response.ok) {
      throw new Error('Failed to scrape the website');
    }

    const data = await response.json();
    console.log(data)
  } catch (err) {
    console.error(err);
    document.getElementById('result').textContent = 'An error occurred while scraping.';
  }
});


const time = {semester: 'Fall', year: 2024};

function displayTime(time) {
    return `${time.semester} ${time.year}`;
}

function updateTimeForward(time) {
    if (time.semester === 'Fall') {
        time.semester = 'Winter';
    } else if (time.semester === 'Winter') {
        time.semester = 'Summer'; 
    } else {
        time.semester = 'Fall';
        time.year++;
    }
}

function updateTimeBackward(time) {
  if (time.semester === 'Winter') {
      time.semester = 'Fall';
  } else if (time.semester === 'Summer') {
      time.semester = 'Winter'; 
  } else {
      time.semester = 'Summer';
      time.year--;
  }
}


var cy = cytoscape({
    container: document.getElementById('cy'),

    style: [
        {
            selector: 'node',
            style: {
                shape: 'hexagon',
                'background-color': 'red'
            }
        },
        {
          selector: 'edge',
          style: {
              'curve-style': 'round-taxi',
              'target-arrow-shape': 'triangle'
          }
      }] 
  
  });



  
  cy.add({
    group: 'nodes',
    data: { id:'M242', label: 'MATH242', description: 'Analysis 1 is whatever poopy haha' },
});
  
cy.add({
  group: 'nodes',
  data: { id:'M133', label: 'MATH133', description: 'Linear Algebra' },
});

cy.add({
  group: 'edges',
  data: { id:'M133toM242', source: 'M133', target: 'M242' }
});

