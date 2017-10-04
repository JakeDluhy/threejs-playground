const THREE = require('three');

const { createGenericTile, randomPair, GROUND_RADIUS } = require('./generic');
const { randomBetween, sumN } = require('../utils/math');
const { createHexagonGeometry } = require('../utils/three');

const { pineTree, getTreeBoundingRadius } = require('../models/pine-tree');
const { rock, getRockBoundingRadius } = require('../models/rock');

const GROUND_RINGS = 12;
const CENTER_RADIUS = 2;
const centerData = { z: 0, x: 0, radius: CENTER_RADIUS };

function createForestTile() {
  const group = createGenericTile();

  group.add(createGround());
  const trees = addTrees(group);
  const rocks = addRocks(group, trees);

  return group;
}

module.exports = createForestTile;

function createGround() {
  const yFunc = ({ i, j }) => i === GROUND_RINGS ? 0 : Math.random() * 0.4;
  const faceFunc = (face) => {
    const rand = Math.random();
    let rgbVals;

    if(rand < 0.9) {
      rgbVals = [
        85/255,
        139/255 + randomBetween(-0.05, 0.05),
        47/255,
      ];
    } else {
      rgbVals = [
        78/255 + randomBetween(-0.03, 0.03),
        72/255 + randomBetween(-0.03, 0.03),
        46/255 + randomBetween(-0.03, 0.03),
      ];
    }

    face.color.setRGB(...rgbVals);
  };

  const groundGeo = createHexagonGeometry(GROUND_RINGS, GROUND_RADIUS, yFunc, faceFunc);
  const groundMat = new THREE.MeshLambertMaterial({ shading: THREE.FlatShading, vertexColors: THREE.FaceColors });
  const ground = new THREE.Mesh(groundGeo, groundMat);

  ground.position.y = 0.01;
  return ground;
}

function addTrees(group) {
  const trees = [];
  let i = 1.5;

  while(i > 0.5) {
    const radius = getTreeBoundingRadius(i);
    const [z, x] = randomPair(radius);
    const treeData = { z, x, radius };
    let isIntersecting = false;

    for(let j = 0; j < trees.length; j++) {
      if(radiiIntersect(trees[j], treeData) || radiiIntersect(centerData, treeData)) {
        isIntersecting = true;
        break;
      }
    }

    if(!isIntersecting) {
      const pt = pineTree({ zxScale: i });

      pt.position.z = z;
      pt.position.x = x;

      trees.push(treeData);
      group.add(pt);
    }

    i -= (i < 1 ? 0.0025 : 0.01);
  }

  return trees;
}

function addRocks(group, trees) {
  const rocks = [];

  for(let j = 2; j > 0.5; j-=0.1) {
    const radius = getRockBoundingRadius(j)
    const [z, x] = randomPair(radius);
    const rockData = { z, x, radius };
    let isIntersecting = false;

    for(let k = 0; k < trees.length; k++) {
      if(radiiIntersect(centerData, rockData) || rockTreeIntersect(trees[k], rockData)) {
        isIntersecting = true;
        break;
      }
    }

    for(let k = 0; k < rocks.length; k++) {
      if(radiiIntersect(centerData, rockData) || radiiIntersect(rocks[k], rockData)) {
        isIntersecting = true;
        break;
      }
    }

    if(!isIntersecting) {
      const r = rock({ zxScale: j });

      r.position.z = z;
      r.position.x = x;

      rocks.push(rockData);
      group.add(r);
    }
  }

  return rocks;
}

function radiiIntersect(t1, t2) {
  return Math.sqrt(Math.pow(t2.z - t1.z, 2) + Math.pow(t2.x - t1.x, 2)) < t2.radius + t1.radius;
}

function rockTreeIntersect(t, r) {
  return Math.sqrt(Math.pow(t.z - r.z, 2) + Math.pow(t.x - r.x, 2)) < (t.radius * 0.2) + r.radius;
}
