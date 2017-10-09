const plainsTile = require('./plains');
const mountainTile = require('./mountain');
const forestTile = require('./forest');
const riverTile = require('./river');
const lakeTile = require('./lake');

exports.typeMap = {
  plains:   plainsTile,
  mountain: mountainTile,
  forest:   forestTile,
  river:    ({ sideStart, sideEnd, isClockwise }) => riverTile(sideStart, sideEnd, isClockwise),
  lake:     ({ riverSide }) => lakeTile(riverSide),
};
