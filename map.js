const _ = require('lodash');

const { randomArrayElements } = require('./utils/array');
const { getKey, axialDistance, getNeighbors, oppositeSide } = require('./utils/coordinates');

const SIDES = _.range(0, 6);
const TILE_GENERATORS = {
  river: generateRiver,
  mountain: generateMountain,
  lake: generateLake,
  forest: generateForest,
  plains: generatePlains,
};
const TILE_GENERATORS_ARRAY = _.values(TILE_GENERATORS);

function generateMap(size) {
  const map = {
    theme: 'natural',
    tiles: {},
  };

  return addTileAt([0, 0], map, size);
}

function addTileAt(coords, origMap, size) {
  if(axialDistance(coords, [0, 0]) > size) return origMap;

  const key = getKey(coords);
  if(origMap.tiles[key]) return origMap;

  const map = _.cloneDeep(origMap);

  const neighbors = getNeighbors(coords);
  const options = {
    exclude: [],
  };

  neighbors.forEach((neighborCoords, idx) => {
    const neighborKey = getKey(neighborCoords);
    const neighborTile = map.tiles[neighborKey];
    const oppIndex = oppositeSide(idx);

    if(neighborTile) {
      const { type, params } = neighborTile;

      if(type === 'lake' && params.riverSide === oppIndex) {
        options.type = 'river';
        if(!_.isNumber(options.sideStart)) {
          options.sideStart = idx;
        } else if(!_.isNumber(options.sideEnd)) {
          options.sideEnd = idx;
        } else {
          console.error('Too many river openings!');
        }
      } else if(type === 'river' && (params.sideStart === oppIndex || params.sideEnd === oppIndex)) {
        if(options.type === undefined && Math.random() < 0.1) {
          options.type = 'lake';
          options.riverSide = idx;
          options.sideStart = idx;
        } else {
          options.type = 'river';
          if(!_.isNumber(options.sideStart)) {
            options.sideStart = idx;
          } else if(!_.isNumber(options.sideEnd)) {
            options.sideEnd = idx;
          } else {
            console.error('Too many river openings!');
          }
        }
      } else {
        options.exclude.push(idx);
      }
    }
  });

  map.tiles[key] = tileGenerator(coords, map, options);

  return neighbors.reduce((combinedMap, nextCoords) => {
    return addTileAt(nextCoords, combinedMap, size);
  }, map);
}

module.exports = generateMap(5);

function tileGenerator(coords, map, options) {
  if(options.type) return TILE_GENERATORS[options.type](coords, options);

  if(options.exclude.length === 6) return TILE_GENERATORS.plains(coords, options);

  const rand = Math.random();
  // We're not making lakes except as endcaps
  // if(rand < 0) return TILE_GENERATORS.lake(coords, options);
  if(rand < 0.05) return TILE_GENERATORS.river(coords, options);
  if(rand < 0.3) return TILE_GENERATORS.mountain(coords, options);
  if(rand < 0.6) return TILE_GENERATORS.forest(coords, options);
  return TILE_GENERATORS.plains(coords, options);
}

function generateLake(coords, options = {}) {
  const params = {
    riverSide: _.isNumber(options.riverSide) ? options.riverSide : randomSide(options.exclude),
  };

  return {
    type:        'lake',
    coordinates: coords,
    params,
  }
}

function generateRiver(coords, options = {}) {
  const sideStart = _.isNumber(options.sideStart) ?
    options.sideStart :
    randomSide([...options.exclude, options.sideEnd]);
  const sideEnd = _.isNumber(options.sideEnd) ?
    options.sideEnd :
    randomSide([...options.exclude, sideStart]);

  if(sideEnd === undefined || sideEnd === sideStart) return generateLake(coords, { riverSide: sideStart });

  const params = {
    sideStart,
    sideEnd,
    isClockwise: (Math.random() > 0.5),
  };

  return {
    type:        'river',
    coordinates: coords,
    params,
  };
}

function generatePlains(coords) {
  return {
    type:        'plains',
    coordinates: coords,
  };
}

function generateMountain(coords) {
  return {
    type:        'mountain',
    coordinates: coords,
  };
}

function generateForest(coords) {
  return {
    type:        'forest',
    coordinates: coords,
  };
}

function randomSide(without) {
  return _.sample(
    without ? _.without(SIDES, ...without.filter(_.isNumber)) : SIDES
  );
}

// module.exports = {
//   theme: 'natural', //OneOf('natural', 'charred', 'alien', 'iceland'),
//   tiles: {
//     '(0)-(0)': {
//       type: 'lake',
//       coordinates: [0, 0],
//       params: {
//         riverSide: 1,
//       },
//     },
//     '(0)-(-1)': {
//       type: 'forest',
//       coordinates: [0, -1],
//     },
//     '(0)-(1)': {
//       type: 'mountain',
//       coordinates: [0, 1],
//     },
//     '(1)-(0)': {
//       type: 'mountain',
//       coordinates: [1, 0],
//     },
//     '(1)-(-1)': {
//       type: 'mountain',
//       coordinates: [1, -1],
//     },
//     '(1)-(-2)': {
//       type: 'forest',
//       coordinates: [1, -2],
//     },
//     '(-1)-(0)': {
//       type: 'plains',
//       coordinates: [-1, 0],
//     },
//     '(-1)-(-1)': {
//       type: 'forest',
//       coordinates: [-1, -1],
//     },
//     '(-2)-(0)': {
//       type: 'plains',
//       coordinates: [-2, 0],
//     },
//     '(-1)-(1)': {
//       type: 'river',
//       coordinates: [-1, 1],
//       params: {
//         sideStart: 4,
//         sideEnd:   0,
//         isClockwise: false,
//       },
//     },
//     '(-1)-(2)': {
//       type: 'river',
//       coordinates: [-1, 2],
//       params: {
//         sideStart: 3,
//         sideEnd:   2,
//         isClockwise: true,
//       },
//     },
//     '(-2)-(1)': {
//       type: 'plains',
//       coordinates: [-2, 1],
//     },
//     '(-2)-(2)': {
//       type: 'river',
//       coordinates: [-2, 2],
//       params: {
//         sideStart: 5,
//         sideEnd:   1,
//         isClockwise: true,
//       }
//     },
//   },
// };
