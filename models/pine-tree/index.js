const THREE = require('three');
const loader = new THREE.BufferGeometryLoader();

const { sample } = require('../../utils/array');

const TRUNK_KEY = 'pine-tree/trunk';
const LEAVES_KEY = 'pine-tree/leaves';
const BASE_BOUNDING_RADIUS = 1.6;
const LEAF_COLORS = [0x176620];

THREE.Cache.add(TRUNK_KEY, JSON.stringify(require('./trunk.json')));
THREE.Cache.add(LEAVES_KEY, JSON.stringify(require('./leaves.json')));

const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8F4F1C });
const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x176620 });

const trunkPromise = new Promise((resolve, reject) => loader.load(TRUNK_KEY, resolve, null, reject));
const leavesPromise = new Promise((resolve, reject) => loader.load(LEAVES_KEY, resolve, null, reject));

function pineTree({ zxScale }) {
  const group = new THREE.Group();

  trunkPromise.then((geo) => {
    const mat = new THREE.MeshLambertMaterial().copy(trunkMaterial);
    group.add(new THREE.Mesh(geo, mat));
  });
  leavesPromise.then((geo) => {
    const mat = new THREE.MeshLambertMaterial().copy(leavesMaterial);
    group.add(new THREE.Mesh(geo, mat));
  });

  group.scale.z = zxScale;
  group.scale.x = zxScale;
  group.scale.y = 1 + Math.random();
  group.rotation.y = Math.random() * Math.PI / 2;
  group.boundingRadius = getTreeBoundingRadius(zxScale);

  return group;
}

function getTreeBoundingRadius(zxScale) {
  return zxScale * BASE_BOUNDING_RADIUS;
}

exports.getTreeBoundingRadius = getTreeBoundingRadius;
exports.pineTree = pineTree;
