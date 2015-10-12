function Game(length) {
  this.init(length);
}

Game.prototype = {
  constructor: Game,
  counter: 0,
  players: [
    { color: 'red', direction: 1 },
    { color: 'black', direction: -1 }
  ],
  jumps: [],
  init: function(length) {
    var red = new Men({ length: length, color: 'red' }),
      black = new Men({ length: length, color: 'black' });
    this.board = new Board({ length: length, men: [black, red] });
    this.board.length = length;
    this.boardEl = window.render.init(this.board, this);
    document.body.appendChild(this.boardEl);
    this.active = u.clone(this.players[this.counter]);
  },
  handleEvent: function(event) {
    var el = event.target;
    if (el.classList.contains('square')) {
      if (el.classList.contains('killzone'))
        game.checkKill(el);
      else if (this.active.man && !this.jumps.length)
        game.check(el);
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
  },
  kill: function(deadSq) {
    var deadman = deadSq.el.children[0];
    deadSq.el.removeChild(deadman);
    deadSq.el.classList.remove('killzone');
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
  check: function(el) {
    var sqObj = this.getSq(el),
      forward = this.checkForward(this.active.sqObj, sqObj),
      validMoves = this.moves.filter(function(move) {
        if (move) return u.compare(move.coords, sqObj.coords);
      });
    if (validMoves.length && !sqObj.man && forward) {
      el.appendChild(this.active.manEl);
      this.finish(sqObj);
    }
  },
  checkForward: function(sq1, sq2) {
    if (!sq1 || !sq2) return false;
    var diff = sq2.coords[1] - sq1.coords[1];
    if (diff === this.active.direction) return true;
  },
  finish: function(sqObj) {
    this.counter = 1 - this.counter;
    this.checkKing(sqObj);
    //  Deactivate man
    this.active.manEl.classList.remove('active');
    //  Add man to target square
    u.extend(sqObj, { man: this.active.man });
    //  Remove man from vacated square
    this.active.sqObj.man = undefined;
    //  Switch the active team
    this.active = u.clone(this.players[this.counter]);
    //  Remove all the killzone indicators
    u.duplex(game.jumps, function(sq) {
      sq.el.classList.remove('killzone');
    });
    this.jumping = false;
    this.getJumps();
  },
  getJumps: function(direction) {
    var myTeam = u.filter(game.board, function(sq) {
      return game.checkColor(sq, game.active.color);
    });
    this.jumps = [];
    u.each(myTeam, function(sq) { game.checkAllJumps([sq]) });
    this.jumps = this.findLongests();
    u.duplex(this.jumps, function(step, i) {
      if (i && i % 2 === 0) step.el.classList.add('killzone');
    });
  },
  checkAllJumps: function(path) {
    var last = path[path.length - 1],
      neighbors = game.getMoves(last, 1),
      landings = game.getMoves(last, 2);

    u.twin(neighbors, landings, function(neighbor, landing) {
      var result = game.checkOneJump(neighbor, landing, path);
      if (result && result.length > 1) game.jumps.push(result);
    });
  },
  checkOneJump: function(neighbor, landing, path) {
    var enemyColor = game.players[1 - game.counter].color,
      isForward = game.checkForward(neighbor, landing),
      isEnemy = game.checkColor(neighbor, enemyColor),
      isEmpty = landing && landing.man === undefined;

    if (isEnemy && isEmpty && isForward) {
      path.push(neighbor, landing);
      game.checkAllJumps(path);
    } else {
      return path;
    }
  },
  findLongests: function() {
    var longests = [[]];
    game.jumps.forEach(function(path) {
      if (path.length === longests[0].length)
        longests.push(path);
      if (path.length > longests[0].length)
        longests = [path];
    });
    if (longests[0].length === 0) return [];
    else return longests;
  },
  getMoves: function(sqObj, factor) {
    var moves = [[-1,1], [1,1], [1,-1], [-1,-1]],
      results = moves.map(function(shifts) {
        var coord = shifts.map(function(shift, i) {
          return shift * factor + sqObj.coords[i];
        });
        return game.getSq(coord);
      });
    return results;
  },
  checkColor: function(sq, color) {
    if (sq && sq.man && sq.man.color === color) return true;
  },
  getSq: function(input) {
    var name;
    if (input instanceof HTMLElement) name = input.dataset.name;
    if (input instanceof Array) name = input[0] + ':' + input[1]
    return this.board[name];
  },
  checkKing: function(sqObj) {
    var row = sqObj.coords[1],
      last = game.board.length - 1;
    console.log(sqObj.coords[1]);
    if (row === 0 || row === last) {
      this.active.man.king = true;
      this.active.manEl.classList.add('king');
    }
  }
};
var game = new Game(8);