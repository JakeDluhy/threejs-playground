const THREE = require('three');
const inside = require('point-in-polygon');

const { randomPair, GROUND_RADIUS, TILE_HEIGHT } = require('../generic');
const { randomBetween, mag } = require('../../utils/math');
const { createHexagonGeometry } = require('../../utils/three');

const {
  // River params
  NUM_PTS_WIDTH,
  RIVER_HEIGHT,
  // Ground params
  NUM_GROUND_RINGS,
  GROUND_COLOR,
  NUM_HILLS,
  HILL_EDGE_OFFSET,
  HILL_RIVER_OFFSET,
  HILL_HEIGHT,
} = require('./params');

function createGround(riverVerts) {
  // Get the bounding vertices for the river
  const boundaryVerts = getBoundaryVerts(riverVerts);

  // Get the locations of the hills
  const hillLocs = getHillLocs(boundaryVerts);

  const yFunc = ({ i, j, z, x }) => {
    // If the center point or one right out return flat ground
    if(i === 0 || i === 1) return RIVER_HEIGHT + 0.25;

    // If the point is within the river boundary, return 0
    const pt = [z, x];
    if(inside(pt, boundaryVerts)) return 0;

    // Get the distance from the closest hill
    const minHillDist = Math.min(...hillLocs.map((h) => mag(h, pt)));
    // Get the height, based on how far from the hill the point is. Make sure it is always above 0
    const heightFromHill = Math.max(((5 - minHillDist) / 5) * HILL_HEIGHT, 0);

    // Make sure the edge doesn't peek over the tile edges
    if(i === NUM_GROUND_RINGS) return Math.min(RIVER_HEIGHT + heightFromHill, TILE_HEIGHT);

    // Add the height of the river to the height based on the distance from the hill, plus a little variation
    return RIVER_HEIGHT + heightFromHill + randomBetween(0, 0.25);
  };

  // Use createHexagonGeometry to create the ground
  const groundGeo = createHexagonGeometry(NUM_GROUND_RINGS, GROUND_RADIUS, yFunc);
  const groundMat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color: GROUND_COLOR });
  const ground = new THREE.Mesh(groundGeo, groundMat);

  return ground;
}

module.exports = createGround;

/**
 * Get the boundary vertices from the river vertices. River vertices on the left get transformed
 * into boundary vertices on the right
 * 6-7-8    6-5-4
 * 3-4-5 -> 7   3
 * 0-1-2    0-1-2
 * @param  {Array<Vertex3>} riverVerts The array of river vertices
 * @return {Array<Array>}              The array of boundary vertices for the river in the form [z, x]
 */
function getBoundaryVerts(riverVerts) {
  // Define the boundar verts array
  const boundaryVerts = [];

  // Push the baseline vertices, extending them below the starting point to incorporate edges
  // Note this relies on the fact that all rivers begin at the bottom edge
  // Starting at the bottom left, moving right
  boundaryVerts.push(
    ...riverVerts.slice(0, NUM_PTS_WIDTH).map((v) => [v.z, v.x - 1])
  );

  // Push the vertices up the right side of the river
  for(let i = NUM_PTS_WIDTH - 1; i < riverVerts.length; i += NUM_PTS_WIDTH) {
    boundaryVerts.push([riverVerts[i].z, riverVerts[i].x]);
  }

  // Get the tangent at the end of the river
  const lastVert = riverVerts[riverVerts.length - 1];
  const previousLastVert = riverVerts[riverVerts.length - NUM_PTS_WIDTH - 1];
  const tanEnd = lastVert.clone().sub(previousLastVert).normalize();

  // Push the ending vertices, extending them past the ending point so as to
  // incorporate the edges in the boundary
  // Starting right, moving left
  for(let i = riverVerts.length - 1; i >= riverVerts.length - NUM_PTS_WIDTH; i--) {
    boundaryVerts.push([riverVerts[i].z + tanEnd.z, riverVerts[i].x + tanEnd.x]);
  }

  // Push the vertices down the left side, starting at the end and moving back to the beginning
  for(let i = riverVerts.length - NUM_PTS_WIDTH; i >= 0; i-= NUM_PTS_WIDTH) {
    boundaryVerts.push([riverVerts[i].z, riverVerts[i].x]);
  }

  return boundaryVerts;
}

/**
 * Get random hill locations based on specified params so that they are a certain distance from the river
 * and the edges
 * @param  {Array<Array>} boundaryVerts An array of boundary vertices in the form [z, x]
 * @return {Array<Array>}               The array of hill points in form [z, x]
 */
function getHillLocs(boundaryVerts) {
  const hillPts = [];

  // We have a target number of hills to hit
  while(hillPts.length < NUM_HILLS) {
    // Generate a new potential hill point using randomPair
    const newCandidate = randomPair(HILL_EDGE_OFFSET);

    // Loop through each of the boundary vertices and check whether the hill location is
    // too close to the river
    let tooClose = false;
    for(let i = 0; i < boundaryVerts.length; i++) {
      if(mag(newCandidate, boundaryVerts[i]) < HILL_RIVER_OFFSET) {
        tooClose = true;
        break;
      }
    }

    if(!tooClose) hillPts.push(newCandidate);
  }

  return hillPts;
}
