const THREE = require('three');
const inside = require('point-in-polygon');

const { GROUND_RADIUS, TILE_HEIGHT } = require('../generic');
const { createHexagonGeometry } = require('../../utils/three');
const { GROUND_COLOR, RIVER_HEIGHT } = require('../river/params');
const { randomBetween, mag, sqrt3 } = require('../../utils/math');
const { randomArrayElements } = require('../../utils/array');

const {
  NUM_GROUND_RINGS,
  HILL_HEIGHT,
} = require('./params');

const POSSIBLE_HILL_LOCATIONS = [
  [-GROUND_RADIUS * 0.4, -GROUND_RADIUS * sqrt3/2 * 0.8],
  [-GROUND_RADIUS * 0.8, 0],
  [-GROUND_RADIUS * 0.4, GROUND_RADIUS * sqrt3/2 * 0.9],
  [GROUND_RADIUS * 0.4, GROUND_RADIUS * sqrt3/2 * 0.9],
  [GROUND_RADIUS * 0.8, 0],
  [GROUND_RADIUS * 0.6, -GROUND_RADIUS * sqrt3/2 * 0.4],
];

// These are the indices that correspond to where ground should be flat so that a
// piece can be placed. THIS IS DEPENDENT ON NUM_GROUND_RINGS. j indices on the 
// lower right diagonal are:
// 6, 17, 34, 57, 86, 121, 162, 209, 262, 321
const FLAT_GROUND_PIECE_LOCATION = [
  121,
  161, 162, 163,
  208, 209, 210,
];

function createGround(boundaryPolygon) {
  const hillLocs = randomArrayElements(
    POSSIBLE_HILL_LOCATIONS, Math.floor(randomBetween(2, 5))
  ).map(([x, y]) => [x * randomBetween(0.95, 1.05), y * randomBetween(0.95, 1.05)]);

  const yFunc = ({ i, j, z, x }) => {
    if(FLAT_GROUND_PIECE_LOCATION.includes(j)) return RIVER_HEIGHT + 0.25;

    const pt = [z, x];
    if(inside(pt, boundaryPolygon)) return 0;

    // Get the distance from the closest hill
    const minHillDist = Math.min(...hillLocs.map((h) => mag(h, pt)));
    // Get the height, based on how far from the hill the point is. Make sure it is always above 0
    const heightFromHill = Math.max(((4 - minHillDist) / 4) * HILL_HEIGHT, 0);

    const height = RIVER_HEIGHT + heightFromHill + randomBetween(0, 0.25);

    // Make sure the edge doesn't peek over the tile edges
    if(i === NUM_GROUND_RINGS) return Math.min(height, TILE_HEIGHT);

    return height;
  };
  const geo = createHexagonGeometry(NUM_GROUND_RINGS, GROUND_RADIUS, yFunc);
  const mat = new THREE.MeshLambertMaterial({ flatShading: THREE.FlatShading, color: GROUND_COLOR });
  const ground = new THREE.Mesh(geo, mat);

  return ground;
}

module.exports = createGround;
