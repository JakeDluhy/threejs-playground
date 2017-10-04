const THREE = require('three');

const { createGenericTile, GROUND_RADIUS } = require('./generic');
const { randomBetween, sumN } = require('../utils/math');
const { createHexagonGeometry } = require('../utils/three');

const MOUNTAIN_RINGS = 7;
const BASE_MOUTAIN_HEIGHT = 15;
const SNOW_THRESHOLD = BASE_MOUTAIN_HEIGHT * 0.5;

function createMountainTile() {
  const group = createGenericTile();

  group.add(createGround());

  return group;
}

module.exports = createMountainTile;

function createGround() {
  const yFunc = ({ i }) => {
    if(i === MOUNTAIN_RINGS) return 0;
    return ((MOUNTAIN_RINGS - i) / MOUNTAIN_RINGS) * BASE_MOUTAIN_HEIGHT + randomBetween(-2, 2);
  };
  const faceFunc = (face, verts) => {
    if(verts[0].y > SNOW_THRESHOLD && verts[1].y > SNOW_THRESHOLD && verts[2].y > SNOW_THRESHOLD) {
      face.color.setRGB(1, 1, 1);
    } else {
      face.color.setRGB(
        125/255,
        66/255,
        46/255
      );
    }
  };

  const groundGeo = createHexagonGeometry(MOUNTAIN_RINGS, GROUND_RADIUS, yFunc, faceFunc);

  // Make sure it's even
  const midRing = Math.floor(MOUNTAIN_RINGS / 2) + (Math.floor(MOUNTAIN_RINGS / 2) % 2);
  const platformHeight = yFunc({ i: midRing });

  const centerIdx = (sumN(midRing - 1) * 6) + (4 * midRing) + (midRing / 2) + 1;
  const downIdx1 = (sumN(midRing - 2) * 6) + (4 * (midRing - 1)) + Math.floor((midRing - 1) / 2) + 1;
  const upIdx1 = (sumN(midRing) * 6) + (4 * (midRing + 1)) + Math.floor((midRing + 1) / 2) + 1;

  [-1, 0, 1].forEach((val) => { groundGeo.vertices[centerIdx + val].y = platformHeight; });
  [0, 1].forEach((val) => {
    groundGeo.vertices[downIdx1 + val].y = platformHeight;
    groundGeo.vertices[upIdx1 + val].y = platformHeight;
  });

  const groundMat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, vertexColors: THREE.FaceColors });
  const ground = new THREE.Mesh(groundGeo, groundMat);

  ground.position.y = 0.01;
  return ground;
}
