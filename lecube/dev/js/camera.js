var camera = function() {
	var cube, shader;

	var projection = new Matrix4();
	var view = new Matrix4();
	var model = new Matrix4();

	var eyeX = 0;
	var eyeY = 0;
	var eyeZ = -10;

	var centerX = 0;
	var centerY = 0;
	var centerZ = 0;



	var initialize = function(gl) {
		gl.disable(gl.CULL_FACE);

		cube = geometry.cube(1);
		shader = new kdb.Program('v_transform', 'f_transform');
		shader.attribute('vertex');
		shader.uniform('uProjection');
		shader.uniform('uView');
		shader.uniform('uModel');

		projection.setPerspective(90, 16/9, 0.1, 1000);
	};

	var update = function(gl, time, dt) {
		var alpha = sync.unit(time, 2);
		eyeZ = -1 * (8 + 3*Math.sin(6.2830*alpha));

		view.setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, 0, 1, 0);
		model.setRotate(time*100, 1, 1, 1);
		shader.use();

		gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
		gl.uniformMatrix4fv(shader.u.uView, false, view.elements);
		gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);

		cube.bind(gl, shader.a.vertex);
		cube.draw(gl);
	};

	return {
		initialize : initialize,
		update : update
	};
}();