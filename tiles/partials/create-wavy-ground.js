const THREE = require('three');

const { randomPair, GROUND_RADIUS, TILE_HEIGHT } = require('../generic');
const { randomBetween, mag } = require('../../utils/math');
const { createHexagonGeometry } = require('../../utils/three');

const NUM_GROUND_RINGS = 7;

function createWavyGround({ color, height, offset, number }) {
  const hillData = getHillData({ height, offset, number });

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
  const groundMat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color });
  const ground = new THREE.Mesh(groundGeo, groundMat);

  return ground;
}

module.exports = createWavyGround;

/**
 * Get random hill locations based on specified params so that they are a certain distance from
 * the edges and other hills
 * @return {Array<Object>} The array of hill data with keys height and coords
 */
function getHillData({ height, offset, number }) {
  const hillPts = [];

  while(hillPts.length < number) {
    const newCandidate = randomPair(offset);

    // Loop through each of the previous hill locations and make sure they aren't within the
    // offset
    let tooClose = false;
    for(let i = 0; i < hillPts.length; i++) {
      if(mag(newCandidate, hillPts[i]) < offset) {
        tooClose = true;
        break;
      }
    }

    if(!tooClose) hillPts.push({
      coords: newCandidate,
      height: height * randomBetween(0.8, 1.2),
    });
  }

  return hillPts;
}
