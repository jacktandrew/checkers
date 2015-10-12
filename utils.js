window.u = window.utils = {
	extend: function() {
		var target = [].shift.call(arguments);
		u.each(arguments, function(obj) {
			u.each(obj, function(val, key) {
				target[key] = val;
			});
		});
		return target;
	},
	each: function(obj, func) {
		var keys = Object.keys(obj),
			i, key, val;
		for (i = 0; i < keys.length; i++) {
			key = keys[i];
			val = obj[key];
			func(val, key);
		}
	},
	combine: function(arr1, arr2) {
		var arr = arr1.map(function(item, i) {
			return [item, arr2[i]];
		});
	},
	compare: function(arr1, arr2) {
		var boole = true;
		u.twin(arr1, arr2, function(val1, val2) {
			if (val1 !== val2) boole = false;
		});
		return boole;
	},
	clone: function(obj) {
		if (obj instanceof Array)
			return u.extend([], obj);
		else
			return u.extend({}, obj);
	},
	filter: function(obj, func) {
		var winners = [];
		u.each(obj, function(val, key) {
			var boole = func(val, key);
			if (boole) winners.push(val);
		});
		if (u.nonEmpty(winners)) return winners;
	},
	map: function(obj, func) {
		var results = [];
		u.each(obj, function(val, key) {
			var result = func(val, key);
			if (result) results.push(result);
		});
		if (u.nonEmpty(results)) return results;
	},
	nonEmpty: function(obj) {
		var keys = Object.keys(obj);
		if (keys.length) return true;
	},
	twin: function(arr1, arr2, func) {
		u.each(arr1, function(val, i) {
			func(val, arr2[i]);
		});
	},
	duplex: function(parent, func) {
		u.each(parent, function(child, c) {
			u.each(child, function(grand, g) {
				func(grand, parseInt(g), c);
			});
		});
	}
}