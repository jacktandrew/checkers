window.render = {
	init: function(board, self) {
		return this.render(board, self);
	},
  render: function(board, self) {
    var boardEl = document.createElement('section');
    boardEl.className = 'board';

    u.each(board, function(square, name) {
      var squareEl = document.createElement('div'),
        manEl = document.createElement('figure');

      square.el = squareEl;
      squareEl.className = 'square ' + square.color;
      squareEl.addEventListener('click', self, false);
      squareEl.dataset.name = name;

      if (square.man) {
        manEl.className = 'man ' + square.man.color;
        squareEl.appendChild(manEl);
      }
      boardEl.appendChild(squareEl);
    }.bind(this));

    return boardEl
  },
  // styleIt: function(length) {
  //   var boardEl = document.querySelector('.board'),
  //     square = boardEl.querySelector('.square'),
  //     style = getComputedStyle(square),
  //     width = parseInt(style.width),
  //     boardWidth = width * length + 1;
  //   boardEl.style.width = boardWidth + 'px';
  // },
};