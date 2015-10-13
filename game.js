function Game(length) {
  this.init(length);
}

Game.prototype = {
  constructor: Game,
  counter: 0,
  players: [
    { color: 'red', direction: [1] },
    { color: 'black', direction: [-1] }
  ],
  jumps: [],
  init: function(length) {
    var red = new Men({ length: length, color: 'red' }),
      black = new Men({ length: length, color: 'black' });
    this.board = new Board({ length: length, men: [black, red] });
    this.board.length = length;
    this.boardEl = window.render.init(this.board, this);
    document.body.appendChild(this.boardEl);
    window.render.styleIt(length);
    this.active = u.clone(this.players[this.counter]);
  },
  handleEvent: function(event) {
    var el = event.target;
    if (el.classList.contains('square')) {
      if (el.classList.contains('killzone'))
        game.checkKill(el);
      else if (this.active.man && !this.jumps.length)
        game.checkMove(el);
    } else {
      game.toggle(el);
    }
  },
  checkKill: function(el) {
    var start = this.active.name,
      end = el.dataset.name;

    this.jumps.forEach(function(path) {
      if (start === path[0].name && end === path[2].name) {
        //  Remove starting point
        game.kill(path[1]);
        game.move(path[2]);
        path.shift();
        path.shift();
        if (path.length === 1) game.finish(path[0]);
      }
    });
  },
  move: function(landing) {
    game.active.name = landing.name;
    landing.el.appendChild(this.active.manEl);
    landing.el.classList.remove('killzone');
  },
  kill: function(deadSq) {
    var deadman = deadSq.el.children[0];
    deadSq.el.removeChild(deadman);
    deadSq.man = undefined;
    game.jumping = true;
  },
  toggle: function(man) {
    var hisTurn = man.classList.contains(this.active.color),
      isActive = man.classList.contains('active');
    if (!game.jumping && isActive) {
      man.classList.remove('active');
      this.active = u.clone(this.players[this.counter]);
    } else if (hisTurn && !this.active.man) {
      this.activate(man);
    }
  },
  activate: function(el) {
    var sqObj = this.getSq(el.parentElement);
    u.extend(this.active, sqObj, sqObj.man, {
      sqObj: sqObj,
      man: sqObj.man,
      manEl: el
    });
    this.moves = game.getMoves(sqObj, 1);
    el.classList.add('active');
  },
  checkMove: function(el) {
    var sqObj = this.getSq(el),
      forward = this.checkDirection(this.active.sqObj, sqObj),
      validMoves = this.moves.filter(function(move) {
        if (move) return u.compare(move.coords, sqObj.coords);
      });
    if (validMoves.length && !sqObj.man && forward) {
      el.appendChild(this.active.manEl);
      this.finish(sqObj);
    }
  },
  checkDirection: function(sq1, sq2) {
    var directions, dir;
    if (!sq1 || !sq1.man || !sq2) return false;
    directions = sq1.man.directions;
    dir = this.getDirection(sq1, sq2);
    if (directions.indexOf(dir) + 1) return true;
  },
  finish: function(sqObj) {
    this.counter = 1 - this.counter;
    //  Deactivate man
    this.active.manEl.classList.remove('active');
    //  Add man to target square
    u.extend(sqObj, { man: this.active.man });
    //  Remove man from vacated square
    this.active.sqObj.man = undefined;
    //  Make the man a king if he reached the end
    this.checkKing(sqObj);
    //  Switch the active team
    this.active = u.clone(this.players[this.counter]);
    this.jumping = false;

    u.duplex(this.jumps, function(step, i) {
      if (step.el)
        step.el.classList.remove('killzone');
    });

    this.getJumps();
  },
  getJumps: function() {
    var team = u.filter(game.board, function(sq) {
        return game.checkColor(sq, game.active.color);
      }),
      jumps, longest;
    this.jumps = [];
    u.each(team, this.getJumpSquares);
    jumps = this.jumps.filter(this.filterJumps);
    longest = this.findLongests(jumps);
    this.highlightJumps(longest);
    this.jumps = longest;
    console.log(this.jumps);
  },
  findLongests: function(jumps) {
    var longests = [[]];

    jumps.forEach(function(path) {
      if (path.length > longests[0].length)
        longests = [path];
      else if (path.length === longests[0].length)
        longests.push(path);
    });

    if (longests[0].length === 0)
      return [];
    else
      return longests;
  },
  highlightJumps: function(path) {
    u.duplex(path, function(step, i) {
      if (i && i % 2 === 0) step.el.classList.add('killzone');
    });
  },
  getMoves: function(sqObj, factor) {
    var moves = [[-1,1], [1,1], [1,-1], [-1,-1]],
      results = moves.map(function(shifts) {
        var coord = shifts.map(function(shift, i) {
          if (sqObj.coords) return shift * factor + sqObj.coords[i];
        });
        return game.getSq(coord);
      });
    if (results.length) return results;
  },
  checkColor: function(sq, color) {
    if (sq && sq.man && sq.man.color === color) return true;
  },
  getSq: function(input) {
    var name;
    if (input instanceof HTMLElement) name = input.dataset.name;
    if (input instanceof Array) name = input[0] + ':' + input[1];
    return this.board[name];
  }
};

Game.prototype.checkKing = function(sqObj) {
  var row = sqObj.coords[1],
    last = game.board.length - 1,
    otherDir = sqObj.man.directions * -1,
    manEl = sqObj.el.children[0];

  if (row === 0 || row === last) {
    sqObj.man.directions.push(otherDir);
    manEl.classList.add('king');
  }
};

Game.prototype.filterJumps = function(path) {
  var last = path[path.length - 1],
    penult = path[path.length - 2],
    enemyColor = game.players[1 - game.counter].color,
    moveDir = game.getDirection(penult, last),
    validDirections = path[0].man.directions,
    isEnemy = game.checkColor(penult, enemyColor),
    isEmpty = last && last.man === undefined,
    isInValidDir = validDirections.indexOf(moveDir) + 1;

  if (isEnemy && isEmpty && isInValidDir) return true;
};

Game.prototype.checkForDups = function(path) {
  var names = path.map(function(step) {
      if (step) return step.name;
    }),
    dups = names.filter(function(name) {
      var index = names.indexOf(name),
        last = names.lastIndexOf(name);
      if (index !== last && name != undefined) return true;
    });

    if (!dups.length) return true;
};

Game.prototype.getDirection = function(sq1, sq2) {
  if (!sq1 || !sq2) return false;
  return sq2.coords[1] - sq1.coords[1];
};

Game.prototype.getJumpSquares = function(path) {
  var sq0, sq1s, sq2s;
  if (path instanceof Array === false) path = [path];
  sq0 = path[path.length - 1];
  sq1s = game.getMoves(sq0, 1);
  sq2s = game.getMoves(sq0, 2);
  u.twin(sq1s, sq2s, function(sq1, sq2) {
    var possible = path.concat([sq1, sq2]),
      valid = game.filterJumps(possible),
      unique = game.checkForDups(possible);

    if (valid && unique) {
      game.getJumpSquares(possible);
      game.paths.push(possible);
    }
  });
}
var game = new Game(8);