const THREE = require('three');

const { randomBetween } = require('../utils/math');

const TILE_RADIUS = 15;
const GROUND_RADIUS = TILE_RADIUS * 0.98;
const TILE_HEIGHT = 0.5;

const sqrt3 = Math.sqrt(3);

// Define the edge shape that will be used for all shape geometries
const edgeShape = new THREE.Shape();
const edgeExtrudeOpts = { amount: TILE_HEIGHT, bevelEnabled: false };

edgeShape.moveTo(TILE_RADIUS, 0);
edgeShape.lineTo(TILE_RADIUS / 2, TILE_RADIUS * sqrt3/2);
edgeShape.lineTo(-TILE_RADIUS / 2, TILE_RADIUS * sqrt3/2);
edgeShape.lineTo(-TILE_RADIUS, 0);
edgeShape.lineTo(-TILE_RADIUS / 2, -TILE_RADIUS * sqrt3/2);
edgeShape.lineTo(TILE_RADIUS / 2, -TILE_RADIUS * sqrt3/2);

// Define the hole in the shape
const holePath = new THREE.Path();

holePath.moveTo(GROUND_RADIUS, 0);
holePath.lineTo(GROUND_RADIUS / 2, GROUND_RADIUS * sqrt3/2);
holePath.lineTo(-GROUND_RADIUS / 2, GROUND_RADIUS * sqrt3/2);
holePath.lineTo(-GROUND_RADIUS, 0);
holePath.lineTo(-GROUND_RADIUS / 2, -GROUND_RADIUS * sqrt3/2);
holePath.lineTo(GROUND_RADIUS / 2, -GROUND_RADIUS * sqrt3/2);

edgeShape.holes = [holePath];

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

/**
 * Creates a group for a generic tile
 * @return {THREE.Group} A tile group
 */
function createGenericTile() {
  return new THREE.Group().copy(group);
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
