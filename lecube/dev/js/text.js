var text = function() {
	var rand = new Alea(20);
	var coords = 'GIOMJL0AMOIG0IGMO0COMGI0OMGILJ0CBN0OMGIUS0AMGIO0GHN0GHTS0AMIKO0BN0MGHNHIO0MGIO0GIOMG0SGIOM0UIGMO0MGI0IGJLOM0BNO0GMOI0GJNLI0GMNHNOI0GOKMI0GMOIUS0GIMO0GIOMG0IO0GILJMO0GILJLOM0GJLIO0IGJLOM0IGMOLJ0IHKLFDMO0CBQR0ABQP0IEGJR0GEILP0'.split(0);


	var decode = function(text) {
		var biggestXPos = 0;
		var vertices = [];
		var caret = 0;

		var push = function(px, py) {
			var scale = 1;
			var xPos = scale * (px+caret);
			vertices.push(xPos);
			vertices.push(scale * -py);
			vertices.push(0);
			if (xPos > biggestXPos) {
				biggestXPos = xPos;
			}
		}

		var addLine = function(a, b) {
			push(a%3, Math.floor(a/3));
			push(b%3, Math.floor(b/3));
		}

		for (var i=0;i<text.length;i++) {
			var index = text.charCodeAt(i)-65;
			if (text[i] == '0') index = 26;
			if (text[i] == '1') index = 27;
			if (text[i] == '2') index = 28;
			if (text[i] == '3') index = 29;
			if (text[i] == '4') index = 30;
			if (text[i] == '5') index = 31;
			if (text[i] == '6') index = 32;

			if (text[i] == '@') index = 33;
			if (text[i] == '[') index = 34;
			if (text[i] == ']') index = 35;
			if (text[i] == '<') index = 36;
			if (text[i] == '>') index = 37;


			var P = coords[index];
			if (P) {
				for (var j=1;j<P.length;j++) {
					addLine(P.charCodeAt(j-1)-65,P.charCodeAt(j)-65);
				}
				if (text[i]==='I'||text[i]==='J') addLine(3,4);
				if (text[i]==='F'||text[i]==='T') addLine(3,5);
			}
			if (text[i]==='-') addLine(9, 11);
			if (text[i]===':') {
				addLine(4, 7);
				addLine(10, 13);
			}
			if (text[i]==='=') {
				addLine(6, 8);
				addLine(9, 11);
			}
			if (text[i]==='+') {
				addLine(7, 13);
				addLine(9, 11);
			}			
			if (text[i]===',') {
				addLine(13, 16);
			}			
			if (text[i]==='.') {
				addLine(12, 13);
				addLine(13, 16);
				addLine(15, 16);
				addLine(12, 15);
			}
			caret += 3;			
		}		

		// reorder lines
		var swap = function(a, b) {
			var t = vertices[a];
			vertices[a] = vertices[b];
			vertices[b] = t;
		};
		var lines = vertices.length / (3*2);
		for (var i=0;i<vertices.length;i+=6) {
			var other = Math.floor(rand()*lines)*6;
			for (var j=0;j<6;j++) {
				swap(i+j, other+j);
			}
		}

		return [vertices, biggestXPos];
	};

	var create = function(text) {
		var retArr = decode(text);
		var vertices = retArr[0];
		var biggestXPos = retArr[1];
		var buffer = kdb.staticBuffer(3, vertices);

		return {
			bind : function(gl, attribute) {
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);	
				gl.enableVertexAttribArray(attribute);		
				gl.vertexAttribPointer(attribute, buffer.stride, gl.FLOAT, false, 0, 0);			
			},
			draw : function(gl) {
				gl.drawArrays(gl.LINES, 0, buffer.elements);
			},
			drawPartially : function(gl, alpha) {
				var elem = Math.floor(clamp(alpha, 0, 1)*buffer.elements);
				gl.drawArrays(gl.LINES, 0, elem);
			},			
			biggestXPos : biggestXPos
		};		
	};

	var shader;
	var textDisplayObjList, curTxtIndex, hasNew16BeatHappened;

	var initialize = function(gl) {
		var wordList = [
				"GEOMETRY",
	            "SOLID",
	            "OBJECT",
	            "CONFORMITY",
	            "SQUARE",
				"SINGULAR",
	            "6 FACES",           
	            "CUBE",
	            "VERTEX",
	            "REGULAR",
	            "HEXAHEDRON",
	            "PLATONIC",
	            "CUBOID",
	            "STRAIGHT",
	            "PRISM",
	            "TRIGONAL",
	            "SYMMETRY",	            
	            "ORDER",	            
	            "PERPENDICULAR",
	            "OCTAHEDRON",
	            "CUBICAL",
	            "LINE",
	            "FACETS",
	            "EQUILATERAL"];
        textDisplayObjList = [];
        for (var i = 0; i < wordList.length; i++) {
			textDisplayObjList.push(create(wordList[i]));
        }
		curTxtIndex = 0;
		curBeatIndex = -1;
		hasNew16BeatHappened = false;

		shader = new kdb.Program('v_solid', 'f_text');
		shader.attribute('vertex');
		shader.uniform('uProjection');
		shader.uniform('uView');
		shader.uniform('uModel');
		shader.uniform('uColor');		
	};

	var model = new Matrix4();

	var update = function(gl, time, dt) {
		gl.lineWidth(3);
		var projection = camera.projection();
		var view = camera.view();

		shader.use();
		gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
		gl.uniformMatrix4fv(shader.u.uView, false, view.elements);


		// Make the colors cycle when the plasma shows
		var a = sync.interval(time, 64, 2, 80, 4);
		var t = .3 * sync.tounit(time * 20);
		var red   = .4*(1-a) + a*(Math.sin(t + 0) * .5 + .5);
		var green = .4*(1-a) + a*(Math.sin(t + 2) * .5 + .5);
		var blue  = .4*(1-a) + a*(Math.sin(t + 4) * .5 + .5);
		gl.uniform3f(shader.u.uColor, red, green, blue);


		var count = textDisplayObjList.length;
		for (var i=0;i<count;i++) {
			var alpha = i / count;

			var scale = 3;

			var x = 0;
			var y = 60;
			var z = 0;

			model.setIdentity();		

			if (i > count/2) {
				x = 800 * (4 * (alpha - .5) - 1);
				z = 250;				
			} else {
				x = 800 * (4 * (alpha) - 1);
				z = -250;
			}

			model.translate(x, y, z);
			model.scale(scale, scale, scale);			
			if (i > count/2) {
				model.rotate(180, 0, 1, 0);
			}

			gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);

			var text = textDisplayObjList[i];
			text.bind(gl, shader.a.vertex);
			text.draw(gl);
		}		
	};

	return {
		create : create, 
		initialize : initialize,
		update : update
	};
}();
