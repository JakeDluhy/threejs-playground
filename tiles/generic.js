const THREE = require('three');

const { randomBetween } = require('../utils/math');

const TILE_RADIUS = 15;
const TILE_HEIGHT = 1;

const sqrt3 = Math.sqrt(3);

function createGenericTile() {
  const group = new THREE.Group();

  // Create the base and add it to the group
  const baseGeo = new THREE.CylinderBufferGeometry(TILE_RADIUS, TILE_RADIUS, TILE_HEIGHT, 6);
  const baseMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
  const base = new THREE.Mesh(baseGeo, baseMat);
  group.add(base);

  base.position.y = -(TILE_HEIGHT / 2);

  return group;
}

function randomPair(offset = 0) {
  const z = randomBetween(-1, 1) * (TILE_RADIUS - offset);
  const x = Math.abs(z) < TILE_RADIUS / 2 ?
    randomBetween(-1, 1) * ((TILE_RADIUS * sqrt3/2) - offset) :
    randomBetween(-1, 1) * (((TILE_RADIUS - Math.abs(z)) * sqrt3/2) - offset);

  return [z, x];
}

exports.TILE_RADIUS = TILE_RADIUS;
exports.createGenericTile = createGenericTile;
exports.randomPair = randomPair;
