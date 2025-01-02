cytoscape.use(cytoscapeDagre);


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
    },
    {
      selector: 'node[label]',
      style: {
        'label': 'data(label)',
        'text-halign': 'center',
        'text-valign': 'center'
      }
    }
  ] 

});


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

    let data = await response.json();
    console.log(data);
    
    // Display graph
    // Loop through nodes and add them to the graph
    for (const node of data.result.classes) {
      cy.add({
        group: 'nodes',
        data: { id: node.title, label: node.title, description: node.description },
      });
    }
    // Loop through edges and add them to the graph
    for (const edge of data.result.edges) {
      // if source node doesn't exist in the graph, add it
      if (cy.getElementById(edge.source).length===0) {
        cy.add({
          group: 'nodes',
          data: { id: edge.source, label: edge.source },
        });
      }
      cy.add({
        group: 'edges',
        data: { id: `${edge.source}to${edge.target}`, source: edge.source, target: edge.target },
      });
    }
    // Layout the graph using defaults options name of layout is dagre
    cy.layout({
      name: 'dagre',
      rankDir: 'LR', // Left-to-right layout
      rankSep: 150,  // Increase vertical spacing
      nodeSep: 100   // Increase horizontal spacing
  }).run();

  } catch (err) {
    console.error(err);
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

  
