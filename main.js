
const baseStyle = {opacity: 0.3, fillOpacity: 0.3, weight: 2};
const currentStyle = Object.assign({}, baseStyle, {color: 'red', fillColor: 'red'});
const touchingStyle = Object.assign({}, baseStyle, {color: 'black', fillColor: 'lightgrey'});
const visitedStyle = Object.assign({}, baseStyle, {color: 'green', fillColor: 'green',  opacity: 1});
const nullStyle = Object.assign({}, baseStyle, {opacity: 0,  fillOpacity: 0});


// Map states by shortcode for easy lookup.
let statesByCode = States['features'].reduce((acc, s) => {
  acc[s.properties.shortcode] = s;
  return acc;
}, {});


let current = null;
let visited = [];
let map = null;
let layer = null;


function styleFn(feature) {
  let sc = feature.properties.shortcode;
  if (sc === current.properties.shortcode) {
    return currentStyle;
  } else if (visited.includes(sc)) {
    return visitedStyle;
  } else if (current.properties.touches.includes(sc)) {
    return touchingStyle;
  }
  return nullStyle;
}


function panToCurrent() {
  let features = current.properties.touches.map(sc => statesByCode[sc]);
  features.push(current);
  let touchesLayer =  L.geoJSON({type: 'FeatureCollection', features});
  map.fitBounds(touchesLayer.getBounds());
  layer.setStyle(styleFn); // Triggers redraw.
}


function endGame() {
  map.fitBounds(layer.getBounds());
}


function updateScore() {
  let el = document.querySelector('#score');
  el.textContent = `Score: ${visited.length} of ${States['features'].length}`;
}


function onClick(e) {
  let sc = e.layer.feature.properties.shortcode;

  // Was invalid state clicked?
  if (!(current.properties.touches.includes(sc) && !visited.includes(sc))) {
    return;
  }

  // Update state.
  current = statesByCode[sc];
  visited.push(sc);
  panToCurrent();

  // Update score
  updateScore();

  // Is game over? (every touching state has been visited)
  if (!current.properties.touches.filter(x => visited.indexOf(x) < 0).length) {
    endGame();
  }
}

function reset() {
  let startState = States['features'][Math.floor(Math.random() * States['features'].length)];
  current = statesByCode[startState.properties.shortcode];
  visited = [];
  visited.push(current.properties.shortcode);
  updateScore();

  if (map) {
    panToCurrent();
  }
}

window.onload = () => {
  document.querySelector('#reset').onclick = reset;
  reset();
  map =  L.map('map', {zoomControl: false, attributionControl: false}).setView([39, -98], 4);
  layer = L.geoJSON(States, {style: styleFn});
  layer.on('click', onClick);
  layer.addTo(map);
  panToCurrent();
};
