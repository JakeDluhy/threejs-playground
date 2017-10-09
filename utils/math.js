function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomArrayElements(arr, num) {
  const choices = arr.map((_, i) => i);

  for(let i = 0; i < num; i++) {
    choices.splice(Math.floor(Math.random() * choices.length), 1);
  }

  return choices.map((c) => arr[c]);
}

function sumN(n) {
  return (n * (n + 1)) / 2;
}

function mag(p1, p2) {
  return Math.sqrt(
    Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)
  );
}

exports.randomBetween = randomBetween;
exports.randomArrayElements = randomArrayElements;
exports.sumN = sumN;
exports.mag = mag;
exports.sqrt3 = Math.sqrt(3);
