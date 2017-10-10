function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomArrayElements(arr, num) {
  const choices = arr.map((_, i) => i);

  for(let i = 0; i < num; i++) {
    choices.splice(Math.floor(Math.random() * choices.length), 1);
  }

  return choices.map((c) => arr[c]);
}

exports.sample = sample;
exports.randomArrayElements = randomArrayElements;
