const THREE = require('three');

const { createGenericTile } = require('./generic');
const createWavyGround = require('./partials/create-wavy-ground');

const GROUND_COLOR = new THREE.Color(60/255, 115/255, 42/255);
const HILL_HEIGHT =  1.5;
const HILL_OFFSET =  2;
const NUM_HILLS =    6;

function createPlainsTile() {
  const group = createGenericTile();

  group.add(createWavyGround({
    color:  GROUND_COLOR,
    height: HILL_HEIGHT,
    offset: HILL_OFFSET,
    number: NUM_HILLS,
  }));

  return group;
}

module.exports = createPlainsTile;
