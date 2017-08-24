function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function sumN(n) {
  return (n * (n + 1)) / 2;
}

exports.randomBetween = randomBetween;
exports.sumN = sumN;
