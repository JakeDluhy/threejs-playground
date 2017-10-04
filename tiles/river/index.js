const { createGenericTile } = require('../generic');
const createRiver = require('./create-river');
const createGround = require('./create-ground');

function createRiverTile(sideStart, sideEnd, isClockwise) {
  const group = createGenericTile();

  const riverMesh = createRiver(sideStart, sideEnd, isClockwise);
  group.add(riverMesh);
  group.add(createGround(riverMesh.geometry.vertices));

  group.rotation.y = -sideStart * Math.PI/3;

  return group;
}

module.exports = createRiverTile;
