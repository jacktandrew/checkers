(function(){
  var checkers = window.checkers = window.checkers || {};

  function Game(length) { this.init(length); }

  checkers.Game = Game;

  Game.prototype = {
    constructor: Game,
    counter: 1,
    players: [
      { color: 'red', direction: [1] },
      { color: 'black', direction: [-1] }
    ],
    init: function(length) {
      var red = new checkers.Men({ length: length, color: 'red' }),
        black = new checkers.Men({ length: length, color: 'black' });
      this.board = new checkers.Board({ length: length, men: [black, red] });
      this.board.length = length;
      this.boardEl = checkers.render.init(this.board, this);
      document.body.appendChild(this.boardEl);
      checkers.render.styleIt(length);
      this.active = u.clone(this.players[this.counter]);
    },
    handleEvent: function(event) {
      var el = event.target;
      if (el.classList.contains('square')) {
        if (el.classList.contains('killzone'))
          checkers.jump.checkKill(el);
        else if (this.active.man && !checkers.jump.jumps.length)
          checkers.move.checkMove(el);
      } else {
        this.toggle(el);
      }
    },
    toggle: function(man) {
      var hisTurn = man.classList.contains(this.active.color),
        isActive = man.classList.contains('active');

      if (!this.jumping && isActive) {
        man.classList.remove('active');
        this.active = u.clone(this.players[this.counter]);
      } else if (hisTurn && !this.active.man) {
        this.activate(man);
      }
    },
    activate: function(el) {
      var sqObj = checkers.move.getSq(el.parentElement);
      u.extend(this.active, sqObj, sqObj.man, {
        sqObj: sqObj,
        man: sqObj.man,
        manEl: el
      });

      el.classList.add('active');
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
      this.removeActiveState();
      checkers.jump.getJumps();
    },
    removeActiveState: function() {
      u.duplex(checkers.jump.jumps, function(step, i) {
        if (step.el)
          step.el.classList.remove('killzone');
      });
    },
    checkKing: function(sqObj) {
      var row = sqObj.coords[1],
        last = this.board.length - 1,
        otherDir = sqObj.man.directions * -1,
        manEl = sqObj.el.children[0];

      if (row === 0 || row === last) {
        sqObj.man.directions.push(otherDir);
        manEl.classList.add('king');
      }
    },
    checkForVictory: function(path) {
      var teams = [];

      u.each(this.board, function(sq) {
        var color, index;
        if (sq.man) {
          color = sq.man.color;
          index = teams.indexOf(color) + 1;
          if (!index) teams.push(color);
        }
      });

      if (teams.length === 1)
        alert("Congratulation "+teams[0]+" team, you've won!");
      else
        this.finish(path[0]);
    }
  };

})();
