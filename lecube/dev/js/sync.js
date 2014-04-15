var sync = function() {
	var units = 120 / 60;

	var tounit = function(time) { return time / units; };

	var init = function(u) {
		units = u;
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

	var unit = function(time, x) {
		return tounit(time) % (x*units);
	};

	return {
		init : init,
		fadein : fadein,
		fadeout : fadeout,
		interval : interval,
		unit : unit
	};
}();