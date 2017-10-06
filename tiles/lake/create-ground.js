const THREE = require('three');
const inside = require('point-in-polygon');

const { GROUND_RADIUS, TILE_HEIGHT } = require('../generic');
const { createHexagonGeometry } = require('../../utils/three');
const { GROUND_COLOR } = require('../river/params');

const {
  NUM_OCEAN_RINGS,
} = require('./params');

function createGround(boundaryVerts) {
  const yFunc = ({ z, x }) => {
    console.log(z, x, boundaryVerts);
    if(inside([z, x], boundaryVerts)) return 0;

    return TILE_HEIGHT;
  };
  const geo = createHexagonGeometry(10, GROUND_RADIUS, yFunc);
  const mat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, color: GROUND_COLOR });
  const ground = new THREE.Mesh(geo, mat);

  return ground;
}

module.exports = createGround;
