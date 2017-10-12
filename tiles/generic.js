const THREE = require('three');

const { randomBetween, sqrt3 } = require('../utils/math');
const { hexOuterPoints } = require('../utils/coordinates');

const { TILE_RADIUS, GROUND_RADIUS, TILE_HEIGHT } = require('../params');

// Define the edge shape that will be used for all shape geometries
const edgeShape = new THREE.Shape();
const edgeExtrudeOpts = { amount: TILE_HEIGHT, bevelEnabled: false };

const outerPoints = hexOuterPoints(TILE_RADIUS);
const innerPoints = hexOuterPoints(GROUND_RADIUS);

edgeShape.moveTo(...outerPoints[0]);
edgeShape.lineTo(...outerPoints[1]);
edgeShape.lineTo(...outerPoints[2]);
edgeShape.lineTo(...outerPoints[3]);
edgeShape.lineTo(...outerPoints[4]);
edgeShape.lineTo(...outerPoints[5]);

// Define the hole in the shape
const holePath = new THREE.Path();

holePath.moveTo(...innerPoints[0]);
holePath.lineTo(...innerPoints[1]);
holePath.lineTo(...innerPoints[2]);
holePath.lineTo(...innerPoints[3]);
holePath.lineTo(...innerPoints[4]);
holePath.lineTo(...innerPoints[5]);

edgeShape.holes = [holePath];

/**
 * Creates a group for a generic tile
 * @return {THREE.Group} A tile group
 */
function createGenericTile() {
  // Create the generic group
  const group = new THREE.Group();

  // Create the base and add it to the group
  const baseGeo = new THREE.ExtrudeBufferGeometry(edgeShape, edgeExtrudeOpts);
  const baseMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });

  const base = new THREE.Mesh(baseGeo, baseMat);
  group.add(base);

  base.rotation.z = Math.PI / 6;
  base.rotation.x = Math.PI / 2;
  base.position.y = TILE_HEIGHT;

  return group;
}

function randomPair(offset = 0) {
  const z = randomBetween(-1, 1) * (GROUND_RADIUS - offset);
  const x = Math.abs(z) < GROUND_RADIUS / 2 ?
    randomBetween(-1, 1) * ((GROUND_RADIUS * sqrt3/2) - offset) :
    randomBetween(-1, 1) * (((GROUND_RADIUS - Math.abs(z)) * sqrt3/2) - offset);

  return [z, x];
}

exports.TILE_RADIUS = TILE_RADIUS;
exports.TILE_HEIGHT = TILE_HEIGHT;
exports.GROUND_RADIUS = GROUND_RADIUS;
exports.createGenericTile = createGenericTile;
exports.randomPair = randomPair;
