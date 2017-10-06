const { createGenericTile } = require('../generic');
const createLake = require('./create-lake');
const createGround = require('./create-ground');

function createLakeTile(riverSide) {
  const group = createGenericTile();

  const lakeMesh = createLake(riverSide);
  group.add(lakeMesh);
  // group.add(createGround(lakeMesh.geometry.vertices));

  // group.rotation.y = -sideStart * Math.PI/3;

  return group;
}

module.exports = createLakeTile;
