(function(){
  var checkers = window.checkers = window.checkers || {};

  function Board(options) { return this.init(options); }

  checkers.Board = Board;

  Board.prototype = {
    constructor: Board,
    init: function(options) {
      var board = this.buildBoard(options.length);
      this.length = options.length;
      this.placeMen(board, options.men);
      return board;
    },
    placeMen: function(board, men) {
      var half = this.length / 2,
        neutralZone = [half - 1, half];
      u.each(board, function(square, key) {
        var row = square.coords[1];
        inNeutralZone = neutralZone.indexOf(row) + 1;
        if (square.color === 'black' && !inNeutralZone) {
          if (row < half) square.man = this.directMan(men, 1);
          if (row > half) square.man = this.directMan(men, 0);
        }
      }.bind(this));
    },
    directMan: function(men, n) {
      var man = men[n].shift();
      if (!n) n = -1;
      man.directions = [n];
      return man;
    },
    buildBoard: function(length) {
      var board = {}, name;
      for (column = 0; column < length; column++) {
        for (row = 0; row < length; row++) {
          name = column + ':' + row;
          board[name] = {
            color: this.getColor(column, row),
            coords: [column, row],
            name: name
          }
        }
        row = 0;
      }
      return board;
    },
    getColor: function(column, row) {
      var color = 'black',
        columnIsOdd = column % 2,
        rowIsOdd = row % 2;
      if (columnIsOdd && rowIsOdd || !columnIsOdd && !rowIsOdd)
        color = 'white';
      return color;
    }
  };

})();