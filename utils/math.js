function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function sumN(n) {
  return (n * (n + 1)) / 2;
}

function mag(p1, p2) {
  return Math.sqrt(
    Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
  );
}

function approximateEqual(a, b) {
  return Math.abs(a - b) < 1e-3;
}

exports.randomBetween = randomBetween;
exports.sumN = sumN;
exports.mag = mag;
exports.approximateEqual = approximateEqual;
exports.sqrt3 = Math.sqrt(3);
