console.log('Hello World!');
cytoscape({
    container: document.getElementById('cy'),
  
    elements: [
        { data: { id: 'a' } },
        { data: { id: 'b' } },
        { data: { id: 'c' } },
        { data: { id: 'd' } },
        {
          data: {
            id: 'ab',
            source: 'a',
            target: 'b'
          }
        },
        {
            data: {
              id: 'cb',
              source: 'c',
              target: 'b'
            }
          },
          {
            data: {
              id: 'db',
              source: 'd',
              target: 'b'
            }
          },
          {
            data: {
              id: 'cd',
              source: 'c',
              target: 'd'
            }
          },],

    style: [
        {
            selector: 'node',
            style: {
                shape: 'hexagon',
                'background-color': 'red',
                'curve-style': 'taxi',
                'target-arrow-shape': 'triangle'
            }
        }] 
  
  });