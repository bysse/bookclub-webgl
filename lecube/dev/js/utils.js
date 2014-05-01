var smoothstep = function(min, max, value) {
	var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
	return x*x*(3 - 2*x);
};

var fract = function(x) {
	return x - Math.floor(x);
};

var clamp = function(x, low, high) {
	return Math.min(high, Math.max(low, x));
};