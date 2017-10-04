const THREE = require('three');

const { createGenericTile } = require('../generic');
const createWavyGround = require('../partials/create-wavy-ground');

const {
  OCEAN_COLOR,
  WAVE_HEIGHT,
  WAVE_OFFSET,
  NUM_WAVES,
} = require('./params');

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
