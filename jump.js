(function(){
  var checkers = window.checkers = window.checkers || {};

  checkers.jump = {
    jumps: [],
    getJumps: function() {
      var team = u.filter(checkers.game.board, function(sq) {
          return checkers.move.checkColor(sq, checkers.game.active.color);
        }),
        longest;

      this.jumps = [];
      u.each(team, function(man) { checkers.jump.getJumpSquares([man]); });
      longest = this.findLongests(this.jumps);
      this.highlightJumps(longest);
      this.jumps = longest;
    },

    findLongests: function(jumps) {
      var longest;

      jumps.sort(function(a, b) {
        return b.length - a.length;
      })

      longest = jumps.filter(function(path) {
        if (path.length === jumps[0].length) return true;
      });

      return longest;
    },

    highlightJumps: function(path) {
      u.duplex(path, function(step, i) {
        if (i && i % 2 === 0) step.el.classList.add('killzone');
      });
    },

    filterJumps: function(path) {
      var last = path[path.length - 1],
        penult = path[path.length - 2],
        enemyColor = checkers.game.players[1 - checkers.game.counter].color,
        isEnemy = checkers.move.checkColor(penult, enemyColor),
        isEmpty = last && last.man === undefined,
        isInValidDir = this.checkDirection(path[0], last);

      if (isEnemy && isEmpty && isInValidDir) return true;
    },

    checkDirection: function(first, last) {
      var moveDir = checkers.move.getDirection(first, last),
        validDirections = first.man.directions,
        isValid = validDirections.indexOf(moveDir) + 1;
      if (isValid) return true;
    },

    checkForDups: function(path) {
      var names = path.map(function(step) {
          if (step) return step.name;
        }),
        dups = names.filter(function(name) {
          var index = names.indexOf(name),
            last = names.lastIndexOf(name);
          if (index !== last && name !== undefined) return true;
        });

        if (!dups.length) return true;
    },

    getJumpSquares: function(path) {
      var sq0 = path[path.length - 1],
        sq1s = checkers.move.getMoves(sq0, 1),
        sq2s = checkers.move.getMoves(sq0, 2);

      u.twin(sq1s, sq2s, function(sq1, sq2) {
        var self = checkers.jump,
          possible = path.concat([sq1, sq2]),
          valid = self.filterJumps(possible),
          unique = self.checkForDups(possible);

        if (valid && unique) {
          self.getJumpSquares(possible);
          self.jumps.push(possible);
        }
      });
    },

    checkKill: function(el) {
      this.jumps.forEach(function(path) {
        var isMatch = checkers.jump.checkMatch(el, path);
        if (isMatch) checkers.jump.execute(path);
      });
    },

    checkMatch: function(el, path) {
      var start = checkers.game.active.name,
        end = el.dataset.name;

      if (start === path[0].name && end === path[2].name)
        return true;
    },

    execute: function(path) {
      checkers.jump.kill(path[1]);
      checkers.move.move(path[2]);
      path.shift();
      path.shift();
      if (path.length === 1)
        checkers.game.checkForVictory(path);
    },

    kill: function(deadSq) {
      var deadman = deadSq.el.children[0];
      deadSq.el.removeChild(deadman);
      deadSq.man = undefined;
      checkers.game.jumping = true;
    },
  };

})();