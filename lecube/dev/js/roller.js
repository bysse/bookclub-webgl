var roller = function() {
	var cube, shader;
	var model = new Matrix4();

	var firstCube = [-100,1,0];
	var CUBE_COUNT = 60;
	var cubes = [];
	var lecube = [];

	var pattern = 	"#...###...###.#.#.###.###" +
					"#...#.....#...#.#.#.#.#.." +
					"#...##....#...#.#.###.##." +
					"#...#.....#...#.#.#.#.#.." +
					"###.###...###.###.###.###";

	var edgeDistance = Math.sqrt(2)-1;
	var roll = function(matrix, alpha) {
		var x = -2*alpha; 
		var y = Math.sin(3.1415*alpha) * edgeDistance;

		matrix.setIdentity();
		matrix.translate(-x, y, 0);
		matrix.rotate(-90*alpha, 0, 0, 1);

		return matrix;
	};

	var initialize = function(gl) {
		gl.disable(gl.CULL_FACE);

		cube = geometry.cube(1);
		shader = new kdb.Program('v_solid', 'f_solid');
		shader.attribute('vertex');
		shader.uniform('uProjection');
		shader.uniform('uView');
		shader.uniform('uModel');
		shader.uniform('uColor');

		var random = new Alea(3);

		var offset = [-250, 1, 0];
		for (var i=pattern.length-1;i>=0;i--) {
			if (pattern.charAt(i) == '.') {
				continue;
			}

			var px = (i % 25);
			var py = parseInt(i / 25);

			var x = offset[0] + 2 * px;
			var y = offset[1];
			var z = offset[2] + 2 * py;

			lecube.push([x, y, z]);
		}

		var dx = {}
		for (var i=0;i<CUBE_COUNT;i++) {
			var z = lecube[i][2];
			if (dx[z] === undefined) {
				dx[z] = 0;
			}
			dx[z] += Math.floor(random()*4 + 1);


			var x = lecube[i][0] - 2*dx[z];
			var y = lecube[i][1];		

			lecube[i][0] += 180;	

			cubes.push([x,y,z]);

			if (i == 0) {
				firstCube = cubes[0];
			}
		}
	};

	var update = function(gl, time, dt) {
		var t = time - sync.totime(7.5);

		var step = sync.step(t, 0);

		var T = t*2.*60./85.;
		var alpha = step*(T % 1);

		var dx = step * Math.floor(sync.tounit(2*t)) * 2;	
		var dxfract = 2*alpha; 

		var c = sync.interval(time, 4, 4, 62, 2) * .5;
		var color = [c,0,0];


		var projection = camera.projection();
		var view = camera.view();

		shader.use();
		cube.bind(gl, shader.a.vertex);

		gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
		gl.uniformMatrix4fv(shader.u.uView, false, view.elements);		
		gl.uniform3f(shader.u.uColor, color[0], color[1], color[2]);

		roll(model, clamp(alpha*1.2, 0, 1));
				
		var m = new Matrix4();

		for (var i=0;i<CUBE_COUNT;i++) {
			var p = cubes[i];

			if (lecube[i][0] <= p[0] + dx) {
				p = lecube[i];
				m.setTranslate(p[0], p[1], p[2]);

				if (i == 30) {
					firstCube = [p[0], p[1], p[2]];
				}					
			} else {
				m.setTranslate(p[0] + dx, p[1], p[2]);
				m.concat(model);			

				if (i == 30) {
					firstCube = [p[0] + dx + dxfract, p[1], p[2]];
				}	
			}

		
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