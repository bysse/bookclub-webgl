var sync = function() {
	var unit = 120 / 60;

	var tounit = function(time) { return time / unit; };

	var init = function(u) {
		unit = u;
	};

	var fadein = function(time, start, duration) {
		var u = tounit(time);
		if (u <= start) {
			return 0;
		}
		if (u >= start + duration) {
			return 1;
		}
		return (u - start) / duration;
	};

	var fadeout = function(time, start, duration) {
		return 1 - fadein(time, start, duration);
	};

	var interval = function(time, start, dur0, stop, dur1) {
		return fadein(time, start, dur0)*fadeout(time, stop, dur1);
	};

	return {
		init : init,
		fadein : fadein,
		fadeout : fadeout,
		interval : interval
	};
}();