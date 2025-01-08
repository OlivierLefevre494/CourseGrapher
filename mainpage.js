cytoscape.use(cytoscapeDagre);
cytoscape.use(cytoscapeElk);


var cy = cytoscape({
  container: document.getElementById('cy'),

  style: [
    {
      selector: 'node',
      style: {
          'shape': 'hexagon',
          'background-color': 'grey',
          'color': 'black',
          'label': 'data(id)',
          'width': 100,
          'height': 100,
          'font-size': 12,
          'text-valign': 'center',
          'text-halign': 'center',
          'text-opacity': 0.5,
          'background-opacity': 0.5,
          // add outline to nodes white
          'border-color': 'white',
          'border-width': 2,
          'border-opacity': 1,
          'border-style': 'solid'
      },
      },{
        selector: 'node.unmet-prereq',
        style: {
            'background-color': '#E74C3C', // red
        },
    },
      {
        selector: 'node.active',
        style: {
            'color': 'white',
            'background-color': '#2ECC40', // green
            'text-opacity': 1,
            'background-opacity': 1,
        },
    },
      {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            // make bigger triangle
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

// Helper function to check prerequisites
function checkPrereqs(node) {
  const prereqs = node.data('prereqs');
  return prereqs.every((prereq) => cy.getElementById(prereq).hasClass('active'));
}

function animateUnmetPrereqs(unmetPrereqs) {
  unmetPrereqs.forEach((prereqId) => {
      const node = cy.getElementById(prereqId);

      // Add temporary red color class
      node.addClass('unmet-prereq');

      // Perform shaking animation
      for (let i = 0; i < 3; i++) {
        node.animate(
          { position: { x: node.position('x') - 10 } }, // move left
          {
              duration: 100,
              complete: () => {
                  node.animate(
                      { position: { x: node.position('x') + 20 } }, // move right
                      {
                          duration: 100,
                          complete: () => {
                              node.animate(
                                  { position: { x: node.position('x') - 10 } }, // return to center
                                  {
                                      duration: 100,
                                      complete: () => {
                                          if (i === 2) {
                                            node.removeClass('unmet-prereq');
                                          }
                                      },
                                  }
                              );
                          },
                      }
                  );
              },
          }
      );
      }
      
  });
}

cy.on('dblclick', 'node', (event) => {
  const node = event.target;
  const description = node.data('description');
  const prereqs = node.data('prereqs');
  const prereqText = prereqs.length ? prereqs.join(', ') : 'None';

  // Show popup
  alert(`Class: ${node.data('label')}\nDescription: ${description}\nPrerequisites: ${prereqText}`);
});

// Event listener: Single click to activate node
cy.on('click', 'node', (event) => {
  const node = event.target;
  const description = node.data('description');
  const prereqs = node.data('prereqs');
  const prereqText = prereqs.length ? prereqs.join(', ') : 'None';
  if (checkPrereqs(node)) {
    // If all prereqs are satisfied, activate the node
    node.addClass('active');
} else {
    alert(`Class: ${node.data('label')}\nDescription: ${description}\nYou need to complete: ${node.data('prereqs').filter((prereq) => !cy.getElementById(prereq).hasClass('active')).join(', ')}`);
    // Highlight unmet prerequisites
    const unmetPrereqs = node.data('prereqs').filter(
        (prereq) => !cy.getElementById(prereq).hasClass('active')
    );

    // Animate unmet prerequisites
    animateUnmetPrereqs(unmetPrereqs);
    
}
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
    // remove all elements from the graph
    cy.elements().remove();
    // make cy 100% width and height and z-index 1000
    document.getElementById('cy').style.width = '100%';
    document.getElementById('cy').style.height = '100%';
    document.getElementById('cy').style.zIndex = 1000;
    document.getElementById('cy').style.position = 'absolute';

    // Display graph
    // Loop through nodes and add them to the graph
    for (const node of data.result.classes) {
      cy.add({
        group: 'nodes',
        data: { id: node.title, label: node.title, description: node.description, weight: node.weight, prereqs: node.prereqs },
      });
    }
    
    // Loop through edges and add them to the graph
    for (const edge of data.result.edges) {
      // if source node doesn't exist in the graph, add it
      if (cy.getElementById(edge.source).length===0) {
        cy.add({
          group: 'nodes',
          data: { id: edge.source, label: edge.source, description: "to be added", weight: 0, prereqs: [] },
        });
      }
      cy.add({
        group: 'edges',
        data: { id: `${edge.source}to${edge.target}`, source: edge.source, target: edge.target },
      });
    }

    cy.elements().forEach(element => {
      if (element.isNode() && element.data('weight') === 0) {
          element.data('rank', 0); // Force root nodes (no prerequisites) to be at the bottom
      }
  });

  cy.layout({
    name: 'elk',
    elk: {
        'algorithm': 'layered',
        'elk.direction': 'UP', // Classes flow upwards (bottom to top)
        'elk.layered.spacing.nodeNodeBetweenLayers': 30,
        'elk.layered.spacing.nodeNode': 20,
        ranker: 'network-simplex'
    },
    animate: false
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

  
