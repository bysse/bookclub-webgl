var text = function() {
	var coords = 'GIOMJL0AMOIG0IGMO0COMGI0OMGILJ0CBN0OMGIUS0AMGIO0GHN0GHTS0AMIKO0BN0MGHNHIO0MGIO0GIOMG0SGIOM0UIGMO0MGI0IGJLOM0BNO0GMOI0GJNLI0GMNHNOI0GOKMI0GMOIUS0GIMO'.split(0);

	var decode = function(text) {
		var vertices = [];
		var caret = 0;

		var push = function(px, py) {
			var scale = 1;
			vertices.push(scale * (px+caret));
			vertices.push(scale * -py);
			vertices.push(0);			
		}

		var addLine = function(a, b) {
			push(a%3, Math.floor(a/3));
			push(b%3, Math.floor(b/3));
		}

		for (var i=0;i<text.length;i++) {
			var P = coords[text.charCodeAt(i)-65];
			if (P) {
				for (var j=1;j<P.length;j++) {
					addLine(P.charCodeAt(j-1)-65,P.charCodeAt(j)-65);
				}
				if (text[i]==='I'||text[i]==='J') addLine(3,4);
				if (text[i]==='F'||text[i]==='T') addLine(3,5);
			}
			caret += 3;			
		}		

		return vertices;
	};

	var create = function(text) {
		var vertices = decode(text);		
		var buffer = kdb.staticBuffer(3, vertices);

		return {
			bind : function(gl, attribute) {
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);	
				gl.enableVertexAttribArray(attribute);		
				gl.vertexAttribPointer(attribute, buffer.stride, gl.FLOAT, false, 0, 0);			
			},
			draw : function(gl) {
				gl.drawArrays(gl.LINES, 0, buffer.elements);
			}
		};		
	};

	var shader;
	var test, cube;

	var initialize = function(gl) {
		test = create("LE CUBE");

		shader = new kdb.Program('v_solid', 'f_text');
		shader.attribute('vertex');
		shader.uniform('uProjection');
		shader.uniform('uView');
		shader.uniform('uModel');
		shader.uniform('uColor');
		gl.lineWidth(3);

		cube = geometry.cube(1);
	};

	var model = new Matrix4();	
	var update = function(gl, time, dt) {
		var unit = sync.tounit(time);
		if (unit < 16 || unit > 20) {
			return;
		}
		var index = sync.get16partIndex(time);
		if (index == 2 ||
				index == 3 ||
				index == 7 ||
				index == 8 ||
				index == 10 ||
				index == 11 ||
				index == 13 ||
				index == 14) {


			var projection = camera.projection();
			var view = camera.view();

			model.setTranslate(-225.0, 32.0, 17.0);
			model.rotate(90, 0, 1, 0);

			shader.use();
			gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
			gl.uniformMatrix4fv(shader.u.uView, false, view.elements);
			gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);
			gl.uniform3f(shader.u.uColor, 0, 0.9, 0);

			test.bind(gl, shader.a.vertex);
			test.draw(gl);
		}
	};

	return {
		initialize : initialize,
		update : update
	};
}();
