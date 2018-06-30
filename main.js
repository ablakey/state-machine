
// Map feature styles.
const baseStyle = {opacity: 0.3, fillOpacity: 0.3, weight: 2}

const currentStyle = Object.assign({}, baseStyle, {color: 'red', fillColor: 'red'});
const touchingStyle = Object.assign({}, baseStyle, {color: 'black', fillColor: 'white'});
const visitedStyle = Object.assign({}, baseStyle, {color: 'blue', fillColor: 'blue',  opacity: 1});
const nullStyle = Object.assign({}, baseStyle, {opacity: 0,  fillOpacity: 0});


// Map states by shortcode for easy lookup.
let statesByCode = States['features'].reduce((acc, s) => {
  acc[s.properties.shortcode] = s;
  return acc;
}, {})


let current = statesByCode['ME'] // TODO randomize start.
let visited = new Set([current.properties.shortcode]);


let map = L.map('map').setView([39, -98], 4);
let layer = L.geoJSON(States, {style: styleFn})


function styleFn(feature) {
  let sc = feature.properties.shortcode
  if (sc === current.properties.shortcode) {
    return currentStyle;
  } else if (visited.has(sc)) {
    return visitedStyle;
  } else if (current.properties.touches.includes(sc)) {
    console.log(sc);
    return touchingStyle;
  }
  return nullStyle;
}


function onClick(e) {
  console.log(e);
  let sc = e.layer.feature.properties.shortcode
  // if clicked feature touches current state,
  if (current.properties.touches.includes(sc) && !visited.has(sc)) {
    current = statesByCode[sc]
    visited.add(sc);
    layer.setStyle(styleFn); // Triggers redraw.
  }
}


function reset() {
  current = statesByCode['NY'];
  visited.clear()
  visited.add(current.properties.shortcode);
  layer.setStyle(styleFn); // Triggers redraw.
}

window.onload = () => {
  layer.on('click', onClick)
  layer.addTo(map);
}

/*
TODO:
- style the html to look okay.
- add link back to blog.
- watch for screen resize and re-zoom to max extent
- disable zoom pan controls.
- show list of states by name (generate programmatically iterating through States)
- when state is visited, set it to green.
- get rid of the red/white/blue (political)
- detect lose state.
*/
