var roller = function() {
	var cube, shader;
	var model = new Matrix4();

	var firstCube = [0,1,0];
	var CUBE_COUNT = 100;
	var cubes = [];

	var edgeDistance = Math.sqrt(2)-1;
	var roll = function(matrix, alpha) {
		var x = alpha;
		var y = Math.sin(3.1415*alpha) * edgeDistance;

		matrix.setIdentity();
		matrix.translate(x, y, 0);
		matrix.rotate(-90*alpha, 0, 0, 1);

		return matrix;
	};

	var initialize = function(gl) {
		gl.disable(gl.CULL_FACE);

		cube = geometry.cube(1);
		shader = new kdb.Program('v_transform', 'f_transform');
		shader.attribute('vertex');
		shader.uniform('uProjection');
		shader.uniform('uView');
		shader.uniform('uModel');

		cubes.push(firstCube);

		for (var i=1;i<CUBE_COUNT;i++) {
			var x = -2 * (10 + i); //Math.floor(2 + Math.random() * 10);
			var y =  1;
			var z =  2 * Math.floor((Math.random()-.5) * 20); //Math.floor(i - CUBE_COUNT/2);

			cubes.push([x,y,z]);
		}
	};

	var update = function(gl, time, dt) {
		var t = time - sync.totime(7.5);

		var step = sync.step(t, 0);
		var alpha = step*sync.unit(t, .5);		
		var dx = step * Math.floor(sync.tounit(t)*2);		
		

		var projection = camera.projection();
		var view = camera.view();

		shader.use();
		cube.bind(gl, shader.a.vertex);

		gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
		gl.uniformMatrix4fv(shader.u.uView, false, view.elements);		

		roll(model, alpha);
				
		var m = new Matrix4();

		for (var i=0;i<CUBE_COUNT;i++) {
			var p = cubes[i];
			if (i == 0) {
				firstCube = [p[0] + dx + alpha, p[1], p[2]];
			}
			m.setTranslate(p[0] + dx, p[1], p[2]);
			m.concat(model);
		
			gl.uniformMatrix4fv(shader.u.uModel, false, m.elements);		

			
			cube.draw(gl);
		}
	};

	return {
		initialize : initialize,
		update : update,
		first : function() { return firstCube; }
	};
}();