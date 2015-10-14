var checkers = window.checkers = window.checkers || {};

checkers.game = new checkers.Game(8);

function getMoves(sqObj, factor) {
  var moves = [[-1,1], [1,1], [1,-1], [-1,-1]];
  return getMovesForReal(sqObj, moves, factor);
}

function getMovesForReal(sqObj, moves, factor) {
  var coords = moves.map(function(shifts) {
    return [
      shift * factor + sqObj.coords[0],
      shift * factor + sqObj.coords[1]
    ]
  });
  return getSquares(coords);
}

function getSquares(coords) {
  var squares = coords.map(function(coord) {
    checkers.move.getSq(coord);
  });
  return squares;
}