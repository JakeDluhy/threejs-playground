module.exports = {
  theme: 'natural', //OneOf('natural', 'charred', 'alien', 'iceland'),
  tiles: {
    '(0)-(0)': {
      type: 'lake',
      coordinates: [0, 0],
      params: {
        riverSide: 1,
      },
    },
    '(0)-(-1)': {
      type: 'forest',
      coordinates: [0, -1],
    },
    '(0)-(1)': {
      type: 'mountain',
      coordinates: [0, 1],
    },
    '(1)-(0)': {
      type: 'mountain',
      coordinates: [1, 0],
    },
    '(1)-(-1)': {
      type: 'mountain',
      coordinates: [1, -1],
    },
    '(1)-(-2)': {
      type: 'forest',
      coordinates: [1, -2],
    },
    '(-1)-(0)': {
      type: 'plains',
      coordinates: [-1, 0],
    },
    '(-1)-(-1)': {
      type: 'forest',
      coordinates: [-1, -1],
    },
    '(-2)-(0)': {
      type: 'plains',
      coordinates: [-2, 0],
    },
    '(-1)-(1)': {
      type: 'river',
      coordinates: [-1, 1],
      params: {
        sideStart: 4,
        sideEnd:   0,
        isClockwise: false,
      },
    },
    '(-1)-(2)': {
      type: 'river',
      coordinates: [-1, 2],
      params: {
        sideStart: 3,
        sideEnd:   2,
        isClockwise: true,
      },
    },
    '(-2)-(1)': {
      type: 'plains',
      coordinates: [-2, 1],
    },
    '(-2)-(2)': {
      type: 'river',
      coordinates: [-2, 2],
      params: {
        sideStart: 5,
        sideEnd:   1,
        isClockwise: true,
      }
    },
  },
};
