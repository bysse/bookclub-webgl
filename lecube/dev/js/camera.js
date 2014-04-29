var camera = function() {
	var projection = new Matrix4();
	var view = new Matrix4();
	var model = new Matrix4();

	var eyeX = 10;
	var eyeY = 10;
	var eyeZ = 15;

	var centerX = 0;
	var centerY = 0;
	var centerZ = 0;

	var initialize = function(gl) {
		gl.disable(gl.CULL_FACE);
		projection.setPerspective(90, 16/9, 0.1, 1000);
	};

	var update = function(gl, time, dt) {
		var f = roller.first();
		centerX = f[0];
		centerY = f[1];
		centerZ = f[2];

		var unit = sync.tounit(time);
		var radius = 2 + 10*sync.fadein(time, 0, 8);

		eyeX = centerX + Math.sin(unit*.25)*radius;
		eyeY = 4 + 8*sync.fadein(time, 0, 8);
		eyeZ = centerZ + Math.cos(unit*.25)*radius;


		view.setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, 0, 1, 0);
	};

	return {
		initialize : initialize,
		update : update,
		projection : function() { return projection; },
		view : function() { return view; }
	};
}();