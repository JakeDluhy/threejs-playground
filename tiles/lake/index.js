const { createGenericTile } = require('../generic');
const createLake = require('./create-lake');
const createGround = require('./create-ground');

function createLakeTile(riverSide) {
  const group = createGenericTile();

  const { mesh, boundaryPolygon } = createLake(riverSide);
  group.add(mesh);
  group.add(createGround(boundaryPolygon));

  group.rotation.y = -riverSide * Math.PI/3;

  return group;
}

module.exports = createLakeTile;
