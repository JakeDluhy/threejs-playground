const THREE = require('three');

module.exports = {
  // River params
  HALF_WIDTH:     2,
  NUM_PTS_LENGTH: 50,
  NUM_PTS_WIDTH:  5,
  RIVER_COLOR:    new THREE.Color(60/255, 120/255, 200/255),
  RIVER_HEIGHT:   0.25,

  // Ground params
  NUM_GROUND_RINGS:  8,
  GROUND_COLOR:      new THREE.Color(60/255, 115/255, 42/255),
  NUM_HILLS:         4,
  HILL_EDGE_OFFSET:  3,
  HILL_RIVER_OFFSET: 3,
  HILL_HEIGHT:       2,
};
