const { TILE_RADIUS } = require('../tiles/generic');
const { sqrt3 } = require('./math');

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

exports.axialToTHREE = axialToTHREE;
