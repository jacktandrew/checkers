(function(){
  var checkers = window.checkers = window.checkers || {};

  checkers.move = {
    move: function(landing) {
      checkers.game.active.name = landing.name;
      landing.el.appendChild(checkers.game.active.manEl);
      landing.el.classList.remove('killzone');
    },
    checkMove: function(el) {
      var sqObj = this.getSq(el),
        forward = this.checkDirection(checkers.game.active.sqObj, sqObj),
        allMoves = this.getMoves(checkers.game.active.sqObj, 1),
        validMoves = allMoves.filter(function(move) {
          if (move) return u.compare(move.coords, sqObj.coords);
        });
      if (validMoves.length && !sqObj.man && forward) {
        el.appendChild(checkers.game.active.manEl);
        checkers.game.finish(sqObj);
      }
    },
    checkDirection: function(sq1, sq2) {
      var directions, dir;
      if (!sq1 || !sq1.man || !sq2) return false;
      directions = sq1.man.directions;
      dir = this.getDirection(sq1, sq2);
      if (directions.indexOf(dir) + 1) return true;
    },
    getMoves: function(sqObj, factor) {
      var moves = [[-1,1], [1,1], [1,-1], [-1,-1]],
        coords = sqObj.coords;
      if (!sqObj) return false;
      return moves.map(function(shifts) {
        var coord = shifts.map(function(shift, i) {
          return shift * factor + sqObj.coords[i];
        });
        return checkers.move.getSq(coord);
      });
    },
    checkColor: function(sq, color) {
      if (sq && sq.man && sq.man.color === color) return true;
    },
    getSq: function(input) {
      var name;
      if (input instanceof HTMLElement) name = input.dataset.name;
      if (input instanceof Array) name = input[0] + ':' + input[1];
      return checkers.game.board[name];
    },
    getDirection: function(sq1, sq2) {
      if (!sq1 || !sq2) return false;
      return Math.sign(sq2.coords[1] - sq1.coords[1]);
    }
  };
})();