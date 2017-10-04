const THREE = require('three');

const { GROUND_RADIUS } = require('../generic');
const { randomBetween, sqrt3 } = require('../../utils/math');

const {
  HALF_WIDTH,
  NUM_PTS_LENGTH,
  NUM_PTS_WIDTH,
  RIVER_COLOR,
  RIVER_HEIGHT,
} = require('./params');

const riverMap = {
  1: riverOverOne,
  2: riverOverTwo,
  3: riverOverThree,
  4: riverOverFour,
  5: riverOverFive,
};

function createRiver(sideStart, sideEnd, isClockwise) {
  // This usage of adding/subtracting and taking the module is a clever
  // way to get the number of sides over that the river must go
  const numOver = Math.abs(isClockwise ?
    ((sideEnd - sideStart) + 6) % 6 :
    ((sideEnd - sideStart) - 6) % 6);

  const mod = isClockwise ? -1 : 1;

  const geo = new THREE.Geometry();
  const { verts, faces } = riverMap[numOver](mod);
  geo.vertices = verts;
  geo.faces = faces;
  geo.computeFaceNormals();

  const mat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color: RIVER_COLOR });

  return new THREE.Mesh(geo, mat);
}

module.exports = createRiver;

/**
 * Get the points for a river from the source of a CatmullRomCurve3. All curves must start at the -x, z = 0
 * side
 * @param  {THREE.CatmullRomCurve3} curve  The THREE.js Catmull rom curve that describes the shape of the river
 * @param  {Object}                 endTan The ending tangent, as an object with keys z and x
 * @return {Object}                        An object containing both the vertices and faces of the river
 */
function getPoints(curve, endTan) {
  // Call the THREE.js function to get the points for the curve
  const points = curve.getPoints(NUM_PTS_LENGTH);

  const verts = [];
  const faces = [];

  // Iterate through each point, and expand it into a river by spreading it out based on
  // it's tangent
  points.forEach((pt, idx) => {
    // If the point index is in the first 10% then it is straight, given the known starting location of the
    // river points. If the index is in the last 10%, use the passed in endTan. Otherwise call the THREE.js
    // function to get the tangent at the location in the curve
    const tan = (idx < (NUM_PTS_LENGTH * 0.1)) ?
      { z: 0, x: 1 } :
      (idx > (NUM_PTS_LENGTH * 0.9)) ?
        endTan :
        curve.getTangent(idx / NUM_PTS_LENGTH);

    // Iterate over the number of points in the width of the river
    for(let j = 0; j < NUM_PTS_WIDTH; j++) {
      // How far from the center point is the current point?
      const mod = -0.5 + j / (NUM_PTS_WIDTH - 1);

      // If the point lies on the outside it is the river height, otherwise give it some variation
      const yVal = (j % NUM_PTS_WIDTH === 0 || (j+1) % NUM_PTS_WIDTH === 0) ?
        RIVER_HEIGHT :
        RIVER_HEIGHT + randomBetween(-0.05, 0.1);

      // Push the vertex in each row using the normal vector
      verts.push(
        new THREE.Vector3(
          pt.x + (mod * -tan.z) * HALF_WIDTH,
          pt.y + yVal,
          pt.z + (mod * tan.x) * HALF_WIDTH
        )
      );

      // Don't add faces for the last row or column
      if(idx === NUM_PTS_LENGTH || j === (NUM_PTS_WIDTH - 1)) continue;

      // Add faces
      const start = idx * NUM_PTS_WIDTH;
      faces.push(
        new THREE.Face3(
          start+j,
          start+j+(1),
          start+j+(NUM_PTS_WIDTH+0)
        ),
        new THREE.Face3(
          start+j+(NUM_PTS_WIDTH+0),
          start+j+(1),
          start+j+(NUM_PTS_WIDTH+1)
        )
      );
    }
  });

  return { verts, faces };
}

function riverOverFive(mod) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/2, 0, mod *  (0)                                                  ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/3, 0, mod *  (0                       + randomBetween(-1, 1))     ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/4, 0, mod *  ((GROUND_RADIUS * 0.15)  + randomBetween(-2, 0))     ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/8, 0, mod *  ((GROUND_RADIUS * 0.20)  + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( 0,                        0, mod *  ((GROUND_RADIUS * 0.25)  + randomBetween(0, 2))     ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/8, 0, mod *  ((GROUND_RADIUS * 0.20)  + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/8, 0, mod * -((GROUND_RADIUS * 0.20)  + randomBetween(-1, 1))     ),
    new THREE.Vector3( 0,                        0, mod * -((GROUND_RADIUS * 0.25)  + randomBetween(0, 2))     ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/8, 0, mod * -((GROUND_RADIUS * 0.35)  + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/6, 0, mod * -((GROUND_RADIUS * 0.50)  + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/4, 0, mod * -((GROUND_RADIUS * 0.75)) ),
  ]);

  return getPoints(curve, { z: mod * -sqrt3/2, x: -1/2 });
}

function riverOverFour(mod) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -GROUND_RADIUS *                           sqrt3/2, 0, mod *  (0)                                                  ),
    new THREE.Vector3( -GROUND_RADIUS *                           sqrt3/3, 0, mod *  (0                       + randomBetween(-1, 1))     ),
    new THREE.Vector3( -GROUND_RADIUS *                           sqrt3/4, 0, mod *  ((GROUND_RADIUS * 0.15)  + randomBetween(-1, 1))     ),
    new THREE.Vector3( -GROUND_RADIUS *                           sqrt3/8, 0, mod *  ((GROUND_RADIUS * 0.20)  + randomBetween(-0.5, 2)) ),
    new THREE.Vector3( 0,                                                  0, mod *  ((GROUND_RADIUS * 0.25)  + randomBetween(-1, 2))     ),
    new THREE.Vector3( GROUND_RADIUS *                            sqrt3/8, 0, mod *  ((GROUND_RADIUS * 0.20)  + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( GROUND_RADIUS * randomBetween(0.8, 1.2) *  sqrt3/6, 0, mod * -((GROUND_RADIUS * 0.20)  + randomBetween(-1, 1))     ),
    new THREE.Vector3( GROUND_RADIUS * randomBetween(0.8, 1.2) *  sqrt3/5, 0, mod * -((GROUND_RADIUS * 0.40)  + randomBetween(-2, 0))     ),
    new THREE.Vector3( GROUND_RADIUS *                            sqrt3/4, 0, mod * -((GROUND_RADIUS * 0.75))                             ),
  ]);

  return getPoints(curve, { z: mod * -sqrt3/2, x: 1/2 });
}

function riverOverThree(mod) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/2, 0, mod * (0)                                                 ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/3, 0, mod * (0                      + randomBetween(-1, 1))     ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/4, 0, mod * ((GROUND_RADIUS * 0.15) + randomBetween(-2, 0))     ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/8, 0, mod * ((GROUND_RADIUS * 0.20) + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( 0,                        0, mod * ((GROUND_RADIUS * 0.25) + randomBetween(-2, 2))     ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/8, 0, mod * ((GROUND_RADIUS * 0.20) + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/4, 0, mod * ((GROUND_RADIUS * 0.15) + randomBetween(-1, 1))     ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/3, 0, mod * (0                      + randomBetween(-2, 0))     ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/2, 0, mod * (0)                                                 ),
  ]);

  return getPoints(curve, { z: 0, x: 1 });
}

function riverOverTwo(mod) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/2,    0, mod * (0)                                                 ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/2.5,  0, mod * (0                      + randomBetween(-0.5, 0.5)) ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/3,    0, mod * (0                      + randomBetween(-1, 1))     ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/4,    0, mod * ((GROUND_RADIUS * 0.15) + randomBetween(-2, 0))     ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/8,    0, mod * ((GROUND_RADIUS * 0.20) + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( 0,                           0, mod * ((GROUND_RADIUS * 0.25) + randomBetween(-1, 2))     ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/12,   0, mod * ((GROUND_RADIUS * 0.40) + randomBetween(-1.5, 1.5)) ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/8,    0, mod * ((GROUND_RADIUS * 0.60) + randomBetween(-2, 0))     ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/6,    0, mod * ((GROUND_RADIUS * 0.65) + randomBetween(0, 0.5))    ),
    new THREE.Vector3( GROUND_RADIUS *  sqrt3/4,    0, mod * ((GROUND_RADIUS * 0.75))                            ),
  ]);

  return getPoints(curve, { z: mod * sqrt3/2, x: 1/2 });
}

function riverOverOne(mod) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/2,                          0, mod * (0)                      ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/2.5 + randomBetween(0, 2),  0, mod * (0)                      ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/3   + randomBetween(-2, 2), 0, mod * ((GROUND_RADIUS * 0.30)) ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/4.5 + randomBetween(0, 2),  0, mod * ((GROUND_RADIUS * 0.50)) ),
    new THREE.Vector3( -GROUND_RADIUS * sqrt3/4,                          0, mod * ((GROUND_RADIUS * 0.75)) ),
  ]);

  return getPoints(curve, { z: mod * sqrt3/2, x: -1/2 });
}
