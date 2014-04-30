var landscape = function() {
	var W = 20;
	var H = 40;

	var buffer, shader;

	var initialize = function(gl) {
		var vertices=[];
		
		var push = function(x, y) {
			vertices.push(y);
			vertices.push(0);
			vertices.push(x);
		};

		var scale = 2;
		for (var y=0;y<H;y++) {
			for (var x=0;x<W;x++) {
				var px = scale * (x - Math.floor(W/2));
				var py = scale * (y - Math.floor(H/2));
				var py1 = py + scale;

				push(px, py);
				push(px, py1);
				if ((y&1) == 0 &&  x + 1 == W || (y&1) == 1 && x == 0) {
					push(px, py1);
				}
			}
		}
		buffer = kdb.staticBuffer(3, vertices);

		shader = new kdb.Program('v_solid', 'f_plasma');
		shader.attribute('vertex');
		shader.uniform('uProjection');
		shader.uniform('uView');
		shader.uniform('uModel');
		shader.uniform('uTime');
		shader.uniform('uMix');
	};


	var update = function(gl, time, dt) {
		var projection = camera.projection();
		var view = camera.view();
		var model = new Matrix4();

		shader.use();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);			
		gl.enableVertexAttribArray(shader.a.vertex);
		gl.vertexAttribPointer(shader.a.vertex, buffer.stride, gl.FLOAT, false, 0, 0);			

		gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
		gl.uniformMatrix4fv(shader.u.uView, false, view.elements);		
		gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);

		gl.uniform1f(shader.u.uTime, time);
		gl.uniform2f(shader.u.uMix, .5, .5);
		gl.uniform3f(shader.u.uColor, 1, 0, 1);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.elements);
	};

	return {
		initialize : initialize,
		update : update
	};
}();