function Men(options) {
  return this.init(options);
}

Men.prototype = {
  constructor: Men,
  init: function(options) {
    options.size = this.getSize(options.length);
    return this.buildMen(options);
  },
  buildMen: function(options) {
    var men = [], i;
    for (i = 0; i < options.size; i++) {
      men[i] = {
        color: options.color,
        king: false
      }
    }
    return men;
  },
  getSize: function(length) {
    var depth = length / 2 - 1;
    return length * depth / 2;
  }
}

