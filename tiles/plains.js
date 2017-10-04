const THREE = require('three');

const { createGenericTile, randomPair, GROUND_RADIUS, TILE_HEIGHT } = require('./generic');
const { randomBetween, mag } = require('../utils/math');
const { createHexagonGeometry } = require('../utils/three');

const NUM_GROUND_RINGS = 7;
const GROUND_COLOR =     new THREE.Color(60/255, 115/255, 42/255);
const NUM_HILLS =        6;
const HILL_OFFSET =      2;
const HILL_HEIGHT =      1.5;

function createPlainsTile() {
  const group = createGenericTile();

  group.add(createGround());

  return group;
}

module.exports = createPlainsTile;

function createGround() {
  const hillData = getHillData();

  let centerHeight;
  const yFunc = ({ i, j, z, x }) => {
    if(i === 1) return centerHeight;

    // Get closest hill data
    let minHill = { dist: 100000, height: 0 };
    hillData.forEach(({ coords, height }) => {
      const dist = mag(coords, [z, x]);
      if(dist < minHill.dist) minHill = { dist, height };
    });

    // Get the height, based on how far from the hill the point is. Make sure it is always above 0
    const heightFromHill = Math.max(((5 - minHill.dist) / 5) * minHill.height, 0);

    // Make the height
    const ptHeight = heightFromHill + randomBetween(0, 0.25);

    // If the center point, set the centerHeight
    if(i === 0) centerHeight = ptHeight

    // Make sure the edge doesn't peek over the tile edges
    if(i === NUM_GROUND_RINGS) return Math.min(ptHeight, TILE_HEIGHT);

    return ptHeight;
  }

  // Use createHexagonGeometry to create the ground
  const groundGeo = createHexagonGeometry(NUM_GROUND_RINGS, GROUND_RADIUS, yFunc);
  const groundMat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color: GROUND_COLOR });
  const ground = new THREE.Mesh(groundGeo, groundMat);

  return ground;
}

/**
 * Get random hill locations based on specified params so that they are a certain distance from
 * the edges and other hills
 * @return {Array<Object>} The array of hill data with keys height and coords
 */
function getHillData() {
  const hillPts = [];

  while(hillPts.length < NUM_HILLS) {
    const newCandidate = randomPair(HILL_OFFSET);

    // Loop through each of the previous hill locations and make sure they aren't within the
    // HILL_OFFSET
    let tooClose = false;
    for(let i = 0; i < hillPts.length; i++) {
      if(mag(newCandidate, hillPts[i]) < HILL_OFFSET) {
        tooClose = true;
        break;
      }
    }

    if(!tooClose) hillPts.push({
      coords: newCandidate,
      height: HILL_HEIGHT * randomBetween(0.8, 1.2),
    });
  }

  return hillPts;
}
