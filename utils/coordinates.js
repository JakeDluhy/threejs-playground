const { TILE_RADIUS } = require('../tiles/generic');
const { sqrt3 } = require('./math');

function getKey([q, r]) {
  return `(${q})-(${r})`;
}

/**
 * Convert axial coordinates to the THREE.js coordinate system
 * @param  {Array}  axial The axial coordinates in a two element array
 * @return {Array}        The THREE.js coordinates in a three element array
 */
function axialToTHREE([q, r]) {
  const x = TILE_RADIUS * 3/2 * q;
  const y = -TILE_RADIUS * sqrt3 * (r + q/2);
  // Remember, z is 'x' and x is 'y' in the 2D plane
  return [y, 0, x];
}

function axialDistance(start, end) {
  return (
    Math.abs(end[0] - start[0]) +
    Math.abs(end[0] + end[1] - start[0] - start[1]) +
    Math.abs(end[1] - start[1])
  ) / 2;
}

function getNeighbors([q, r]) {
  // Note these are in a very specific order. They start at the "0 side" and loop around clockwise
  // all the way to the "5 side"
  return [
    [q, r+1],
    [q-1, r+1],
    [q-1, r],
    [q, r-1],
    [q+1, r-1],
    [q+1, r],
  ];
}

function oppositeSide(sideIndex) {
  return sideIndex <= 2 ? sideIndex + 3 : sideIndex - 3;
}

exports.getKey = getKey;
exports.axialToTHREE = axialToTHREE;
exports.axialDistance = axialDistance;
exports.getNeighbors = getNeighbors;
exports.oppositeSide = oppositeSide;
