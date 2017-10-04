const THREE = require('three');

const { createGenericTile } = require('./generic');
const createWavyGround = require('./partials/create-wavy-ground');

const OCEAN_COLOR = new THREE.Color(40/255, 90/255, 170/255);
const WAVE_HEIGHT = 1;
const WAVE_OFFSET = 4
const NUM_WAVES =   6;

function createPlainsTile() {
  const group = createGenericTile();

  group.add(createWavyGround({
    color:  OCEAN_COLOR,
    height: WAVE_HEIGHT,
    offset: WAVE_OFFSET,
    number: NUM_WAVES,
  }));

  return group;
}

module.exports = createPlainsTile;
