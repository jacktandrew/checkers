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
    directions = sq1.man.direction;
    dir = sq2.coords[1] - sq1.coords[1];
    if (directions.indexOf(dir) + 1) return true;
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
    this.jumping = false;

    u.duplex(this.jumps, function(step, i) {
      step.el.classList.remove('killzone');
    });

    this.getJumps();
  },
  getJumps: function() {
    var team = u.filter(game.board, function(sq) {
        return game.checkColor(sq, game.active.color);
      }),
      paths = [], jumps, longest;

    u.each(team, function(start) {
      var c1s = game.getMoves(start, 1),
        c2s = game.getMoves(start, 2);

      u.twin(c1s, c2s, function(c1, c2) {
        if (c1 && c2) {
          paths.push([start, c1, c2]);
          team.push(c2);
        }
      });
    });

    jumps = paths.filter(this.filterJumps);
    longest = this.findLongests(jumps);
    this.highlightJumps(longest);
    this.jumps = longest;
  },
  filterJumps: function(path) {
    var enemyColor = game.players[1 - game.counter].color,
      isForward = game.checkDirection(path[0], path[1]),
      isEnemy = game.checkColor(path[1], enemyColor),
      isEmpty = path[2] && path[2].man === undefined;

    if (isEnemy && isEmpty && isForward) return true;
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
    return results;
  },
  checkColor: function(sq, color) {
    if (sq && sq.man && sq.man.color === color) return true;
  },
  getSq: function(input) {
    var name;
    if (input instanceof HTMLElement) name = input.dataset.name;
    if (input instanceof Array) name = input[0] + ':' + input[1];
    return this.board[name];
  },
  checkKing: function(sqObj) {
    var row = sqObj.coords[1],
      last = game.board.length - 1,
      otherDir;
    if (row === 0 || row === last) {
      otherDir = sqObj.man.direction * -1;
      this.active.man.direction.push(otherDir);
      this.active.manEl.classList.add('king');
    }
  }
};
var game = new Game(8);