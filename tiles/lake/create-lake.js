const THREE = require('three');
const _ = require('lodash');

const { GROUND_RADIUS, TILE_HEIGHT } = require('../generic');
const { RIVER_COLOR, RIVER_HEIGHT, NUM_PTS_WIDTH, HALF_WIDTH } = require('../river/params');
const { randomBetween, sqrt3, mag } = require('../../utils/math');

const {
  RIVER_LAKE_TRANSITION_FRACTION,
  NUM_RIVER_SEGMENTS,
  LAYER_STEP_FACTOR,
} = require('./params');

function createLake(riverSide) {
  const waterGroup = new THREE.Group();

  const riverMesh = createRiverMesh();
  waterGroup.add(riverMesh);

  const riverTransitionVerts = riverMesh.geometry.vertices.slice(-NUM_PTS_WIDTH);
  const boundaryPts = getBoundary(riverTransitionVerts);

  waterGroup.add(createLakeMesh(riverTransitionVerts, boundaryPts));

  return waterGroup;
}

module.exports = createLake;

function createRiverMesh() {
  const startX = -GROUND_RADIUS * sqrt3/2;
  const endX = startX * RIVER_LAKE_TRANSITION_FRACTION;

  const geo = new THREE.Geometry();

  for(let i = 0; i < NUM_RIVER_SEGMENTS; i++) {
    const xVal = startX + i * ((endX - startX) / NUM_RIVER_SEGMENTS);

    for(let j = 0; j < NUM_PTS_WIDTH; j++) {
      // TODO: Reuse from river?
      const mod = -0.5 + j / (NUM_PTS_WIDTH - 1);

      const yVal = (j === 0 || j === (NUM_PTS_WIDTH - 1)) ?
        RIVER_HEIGHT :
        RIVER_HEIGHT + randomBetween(-0.05, 0.1);

      geo.vertices.push(
        new THREE.Vector3(xVal, yVal, mod * HALF_WIDTH)
      );

      // Don't add faces for the last row or column
      if(i === (NUM_RIVER_SEGMENTS - 1) || (j === (NUM_PTS_WIDTH - 1))) continue;

      // Add faces
      const start = i * NUM_PTS_WIDTH;
      geo.faces.push(
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
  }

  geo.computeFaceNormals();
  const mat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color: RIVER_COLOR });

  return new THREE.Mesh(geo, mat);
}

function getBoundary(riverTransitionVerts) {
  const shape = new THREE.Shape();

  const riverTransitionCoords = riverTransitionVerts.map((v) => [v.z, v.x]);
  const riverStartPt = riverTransitionCoords[0];
  const riverEndPt = riverTransitionCoords[riverTransitionCoords.length - 1];

  let x = riverEndPt[0];
  let y = riverEndPt[1];
  let tan1 = new THREE.Vector3(0, 1, 0);
  let tan2 = new THREE.Vector3(1, 1, 0).normalize();

  shape.moveTo(x, y);

  shape.bezierCurveTo(
    x, y + 2,
    x + 1, y + 1,
    x += 3, y += 3
  );

  shape.bezierCurveTo(
    x + 1, y + 1,
    x + 4, y + 2,
    x += 5, y += 5
  );

  shape.bezierCurveTo(
    x + 1, y + 3,
    x - 3, y + 6,
    x -= 5, y += 4
  );

  shape.bezierCurveTo(
    x - 2, y - 2,
    x - 1, y + 2,
    x, y += 5
  );

  shape.bezierCurveTo(
    x + 1, y + 3,
    x - 3, y + 1,
    x -= 5, y += 2
  );

  shape.bezierCurveTo(
    x - 2, y + 1,
    x - 6, y - 4,
    x -= 6, y -= 6
  );

  shape.bezierCurveTo(
    x, y - 2,
    x - 2, y - 4,
    x -= 3, y -= 5
  );

  shape.bezierCurveTo(
    x - 2, y - 2,
    x + 1, y - 6,
    x += 2, y -= 8
  );

  shape.bezierCurveTo(
    x + 1, y - 2,
    riverStartPt[0], riverStartPt[1] + 2,
    riverStartPt[0], riverStartPt[1]
  );

  return shape.getPoints();
}

/**
 * Create the lake portion of the scene
 * @param  {Array<Vector3>} riverTransitionVerts The array of Vector3's that detail the ending of the river
 * @return {Mesh}                                The Mesh of the lake portion of the scene
 */
function createLakeMesh(riverTransitionVerts, outerPoints) {
  // Get the base vertices from the path points, and concat the river verts to the end
  // (but not including the two endpoints, which are already part of the path)
  const baseVerts = outerPoints
  .map((v2) => new THREE.Vector3(v2.y, RIVER_HEIGHT, v2.x))
  .concat(riverTransitionVerts.slice(1, -1));

  // Take the last seven vertices and move them to the front
  let verts = [...baseVerts.slice(-7), ..._.dropRight(baseVerts, 7)];
  let faces = [];

  // Because the transition from the river to the lake is confined and would require special
  // logic, two points are added and used to create the mouth of the river
  verts.push(
    new THREE.Vector3(
      riverTransitionVerts[0].x + LAYER_STEP_FACTOR,
      RIVER_HEIGHT + randomBetween(-0.1, 0.2),
      -HALF_WIDTH / 4
    ),
    new THREE.Vector3(
      riverTransitionVerts[0].x + LAYER_STEP_FACTOR,
      RIVER_HEIGHT + randomBetween(-0.1, 0.2),
      HALF_WIDTH / 4
    )
  );

  // Cache the two indices of the river entry point vertices
  const entryLeft = verts.length - 2;
  const entryRight = verts.length - 1;

  // Iterate through the first 10 points and create triangles connecting to the two
  // entry points. Points on the left connect to entryLeft. Points on the right connect
  // to entryRight
  for(let i = 0; i < 10; i++) {
    const targetPt = verts[i].z < 0 ? entryLeft : entryRight;

    faces.push(new THREE.Face3(i, i + 1, targetPt));
    // If the on the center line, push a triangle that connects the two entry points
    // with the center line
    if(verts[i].z === 0) faces.push(new THREE.Face3(i, entryRight, entryLeft));
  }

  // Outer indices start with the two entry points, and then wrap around counter clockwise
  // starting from the first point that did not go to an entry point. It end with the zero index as the
  // last point
  const outerIndices = [entryLeft, entryRight]
  .concat(_.range(10, verts.length - 2))
  .concat([0]);

  // Start by adding a layer from the outer indices. After that keep using the inner indices
  // from the previous layer to keep adding more and more
  let innerIndices = addVertsLayer(outerIndices, verts, faces);
  while(innerIndices.length > 10) {
    innerIndices = addVertsLayer(innerIndices, verts, faces);
  }

  // Once there are less than 10 innerIndices, find the center point of the remaining indices
  const center = innerIndices
  .map((i) => verts[i])
  .reduce((a, b) => a.add(b), new THREE.Vector3())
  .divideScalar(innerIndices.length);

  // Cache the length of the vertices, and push the center point onto the array
  const vertLength = verts.length;
  verts.push(center);

  // For every inner index, connect it to its neighbor and the center point
  for(let i = 0; i < innerIndices.length; i++) {
    const nextI = (i + 1) % innerIndices.length;
    faces.push(new THREE.Face3(innerIndices[i], innerIndices[nextI], vertLength));
  }

  // Create the geometry
  const geo = new THREE.Geometry();
  geo.vertices = verts;
  geo.faces = faces;
  geo.computeFaceNormals();

  // Create the material and mesh
  const mat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color: RIVER_COLOR });
  return new THREE.Mesh(geo, mat);
}

function getNormal(vertices, [prevIdx, nextIdx]) {
  return new THREE.Vector3(
    vertices[nextIdx].z - vertices[prevIdx].z,
    0,
    vertices[prevIdx].x - vertices[nextIdx].x
  ).normalize();
}

/**
 * Add a layer of vertices to the lake, projecting inward from the outer indices
 * using the normal vector. Will mutate the verts and faces arrays with new data
 * @param {Array<Number>}  outerIndices Array of indices corresponding to the outer vertices to layer onto
 * @param {Array<Vector3>} verts        The array of vertices, NOTE THIS WILL BE MUTATED BY THE FUNCTION
 * @param {Array<Face3>}   faces        The THREE.js array of faces, THIS WILL BE MUTATED BY THE FUNCTION
 */
function addVertsLayer(outerIndices, verts, faces) {
  let innerIndices = [];

  outerIndices.forEach((idx, z) => {
    // Get the previous and next points, wrapping the index around in a "circular" array fashion
    const prevPtIdxIdx = (z - 1 + outerIndices.length) % outerIndices.length;
    const nextPtIdxIdx = (z + 1) % outerIndices.length;

    const prevPtIdx = outerIndices[prevPtIdxIdx];
    const nextPtIdx = outerIndices[nextPtIdxIdx];

    // Get the point, and the normal vector as calculated by the next and previous points, pointing inwards
    const pt = verts[idx];
    const norm = getNormal(verts, [prevPtIdx, nextPtIdx]);

    const newPt = new THREE.Vector3(
      pt.x + norm.x * LAYER_STEP_FACTOR,
      RIVER_HEIGHT + randomBetween(-0.1, 0.2),
      pt.z + norm.z * LAYER_STEP_FACTOR
    );

    // Iterate backwards through the vertices already pushed. If the vert is within a certain closeness
    // threshold, note that the vertice is too close and store the index
    let isTooClose = false;
    let closePtIdx;

    for(let j = verts.length - 1; j >= 0; j--) {
      // Using mag, instead of the THREE.js distanceTo, becase we want 2D distance (ignoring y)
      if(mag([newPt.z, newPt.x], [verts[j].z, verts[j].x]) < LAYER_STEP_FACTOR * 0.8) {
        isTooClose = true;
        closePtIdx = j;
        break;
      }
    }

    // The algorithm follows a pattern of pushing faces for vertices behind the current target
    if(isTooClose) {
      // Just push the face for the previous outer index, the current outer index, and the closest point
      faces.push(
        new THREE.Face3(
          prevPtIdx,
          idx,
          closePtIdx
        )
      );

      // Add the closest point to the innerIndices array
      innerIndices.push(closePtIdx);
    } else {
      verts.push(newPt);

      // If there are no inner indices, do nothing
      if(innerIndices.length > 0) {
        // Otherwise push a face for the new vert, connecting with the previous innerIndex
        faces.push(
          new THREE.Face3(
            prevPtIdx,
            idx,
            innerIndices[innerIndices.length - 1]
          ),
          new THREE.Face3(
            idx,
            verts.length - 1,
            innerIndices[innerIndices.length - 1]
          )
        );
      }

      // Add the pushed point to the innerIndices array
      innerIndices.push(verts.length - 1);
    }
  });

  // Once you hit the end, push the two faces that look _forward_ (as opposed to backward)
  // in order to connect the ring
  faces.push(
    new THREE.Face3(
      innerIndices[0],
      innerIndices[innerIndices.length - 1],
      outerIndices[0]
    ),
    new THREE.Face3(
      outerIndices[0],
      innerIndices[innerIndices.length - 1],
      outerIndices[outerIndices.length - 1]
    )
  );

  // Make sure the array of innerIndices is unique
  innerIndices = _.uniq(innerIndices);

  // Iterate through the inner indices. We're looking for angles less than 90 degrees. If we find one
  // we want to fill it in and keep searching. The point is to reduce the likelihood that a normal vector
  // will be close to another side. This mutates the innerIndices array, as it splices out values that it
  // creates joining triangles for
  for(let i = 0; i < innerIndices.length; i++) {
    const prevVertIdxIdx = (i - 1 + innerIndices.length) % innerIndices.length;
    const nextVertIdxIdx = (i + 1) % innerIndices.length;

    const idx = innerIndices[i];
    const prevVertIdx = innerIndices[prevVertIdxIdx];
    const nextVertIdx = innerIndices[nextVertIdxIdx];

    // Subtract out centerVert, so that we can get the angle of the two vectors
    // around the center vert
    const centerVert = verts[idx];
    const prevVert = new THREE.Vector3().copy(verts[prevVertIdx]).sub(centerVert);
    const nextVert = new THREE.Vector3().copy(verts[nextVertIdx]).sub(centerVert);

    const angle = Math.abs(prevVert.angleTo(nextVert)) * 180/Math.PI;

    if(angle < 90 || angle > 270) {
      faces.push(new THREE.Face3(prevVertIdx, idx, nextVertIdx));

      // Splice out the value from the array (which means that our i now targets the _next_) index.
      // And because i++ is going to hit, we need to subtract two from the value, and make sure it never
      // gets below -1 (because i++ will bring that up to 0)
      innerIndices.splice(i, 1);
      i = Math.max(i - 2, -1);
    }
  }

  return innerIndices;
}
