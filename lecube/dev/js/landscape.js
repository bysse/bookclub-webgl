var landscape = function() {
	var W = 160;
	var H = 400;

	var buffer, shader;

	var initialize = function(gl) {
		var vertices=[];

    	var simplex = new SimplexNoise(new Alea(2));

		var fbm = function(x, y) {
			var value = 0;

			value += Math.abs(1.00 * simplex.noise2D(0.01*x, 0.01*y));
			value += 0.50 * simplex.noise2D(0.02*x, 0.02*y);
			value += 0.25 * simplex.noise2D(0.04*x, 0.04*y);
			value += 0.12 * simplex.noise2D(0.08*x, 0.08*y);

			return value * 5;
		};
		
		var push = function(x, y) {
			var xlimit = Math.max(0, x*x/4000);
			var ylimit = Math.max(0, y*y/80000 - .5);
			var scale = xlimit + ylimit;


			vertices.push(y);
			vertices.push(fbm(x, y)*scale);
			vertices.push(x);
		};

		var scale = 2;
		for (var y=0;y<H;y++) {
			var reverse = (y & 1);
			for (var x=0;x<W;x++) {
				var ax = reverse ? W-x-1 : x;
				var ay = y;

				var px = scale * (ax - Math.floor(W/2));
				var py = scale * (ay - Math.floor(H/2));
				var py1 = py + scale;


				if (y > 0 && (y&1) == 0 && x == 0) {
					push(px, py);
				}

				push(px, py);
				push(px, py1);
				
				if ((y&1) == 1 && x + 1 == W) {
					push(px, py);
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

		var plasma = sync.fadein(time, 32, 2);
		var desaturate = sync.fadein(time, 64, 2);

		shader.use();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);			
		gl.enableVertexAttribArray(shader.a.vertex);
		gl.vertexAttribPointer(shader.a.vertex, buffer.stride, gl.FLOAT, false, 0, 0);			

		gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
		gl.uniformMatrix4fv(shader.u.uView, false, view.elements);		
		gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);

		gl.uniform1f(shader.u.uTime, time);
		gl.uniform2f(shader.u.uMix, plasma, desaturate);
		gl.uniform3f(shader.u.uColor, 1, 0, 1);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.elements);
	};

	return {
		initialize : initialize,
		update : update
	};
}();