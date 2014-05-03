var scroller = function() {
	var shader;
	var texts;

	var projection = new Matrix4();
	var view = new Matrix4();
	var model = new Matrix4();

	var initialize = function(gl) {
        texts = [
        	{
        		text: "WARNING! THINKING OUTSIDE BOX MAY CAUSE PERMANENT BRAIN DAMAGE. SIDE EFFECTS MAY INCLUDE, BUT IS NOT LIMITED TO: ANXIETY, CONFUSION, NERVOUSNESS AND INSOMNIA",
        		start: 0,
        		stop: sync.totime(8),
        		x: [1, -6],
        		y: [-.5, -.5],
        		scale: 0.01,
        		color: [1, 0, 0]
        	}, {
        		text: "KLOVMAN: CODE",
        		start: sync.totime(2),
        		stop:  sync.totime(3.75),
        		fadeTime: sync.totime(.25),
        		color: [1, 1, 1]
        	}, {
        		text: "WONDER: CODE + MUSIC",
        		start: sync.totime(4),
        		stop:  sync.totime(5.75),
        		fadeTime: sync.totime(.25),
        		color: [1, 1, 1]
        	}, {
        		text: "             LE CUBE",
        		start: sync.totime(6),
        		stop:  sync.totime(10),
        		fadeTime: sync.totime(.5),
        		color: [1, 1, 1]
        	} , {
        		text: "KING 2014",
        		start: sync.totime(12),
        		stop:  sync.totime(16),
        		fadeTime: sync.totime(.5),
        		color: [1, 1, 1]
        	}         	
        ];

        for (var i = 0; i < texts.length; i++) {
			texts[i].message = text.create(texts[i].text);
        }

		shader = new kdb.Program('v_solid', 'f_text');
		shader.attribute('vertex');
		shader.uniform('uProjection');
		shader.uniform('uView');
		shader.uniform('uModel');
		shader.uniform('uColor');
		gl.lineWidth(3);

		var bottom = -9/16;
		var top = 9/16;
		projection.setOrtho(-1, 1, bottom, top, 0.1, 100);

	};

	var nextdistortion = 0;
	var distortion = 0;

	var scroll = function(gl, time, index, globaltime) {
		var detail = texts[index];
		if (time < detail.start || detail.stop < time) {
			return;
		}
		var alpha = (time - detail.start) / (detail.stop - detail.start);
	
		var x = detail.x[0] + alpha * (detail.x[1] - detail.x[0]);
		var y = detail.y[0] + alpha * (detail.y[1] - detail.y[0]);
		var z = -1;	
	
		var scale = detail.scale || .02;
		model.setIdentity();
		model.translate(x, y, z);
		model.scale(scale, scale, scale);

		gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);
		gl.uniform3f(shader.u.uColor, detail.color[0], detail.color[1], detail.color[2]);

		var message = detail.message;	
		message.bind(gl, shader.a.vertex);

		if (index == 0) {
			var a = sync.interval(globaltime, 64, 4, 80, 4);
			message.drawPartially(gl, 1 - a*distortion);

			if (globaltime >= nextdistortion) {
				nextdistortion = globaltime + 0.1;
				distortion = Math.random();
			}

		} else {
			message.draw(gl);
		}
	};


	var fadein = function(gl, time, index) {
		var detail = texts[index];
		if (time < detail.start || detail.stop < time) {
			return;
		}
		var alpha = (time - detail.start) / (detail.stop - detail.start);
		var message = detail.message;	

		var scale = detail.scale || .02;
		var x =  -0.98; //(message.biggestXPos / 2)*scale;
		var y = 9/16 - .015;
		var z = -1;

		model.setIdentity();
		model.translate(x, y, z);
		model.scale(scale, scale, scale);

		gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);
		gl.uniform3f(shader.u.uColor, detail.color[0], detail.color[1], detail.color[2]);

		var fadeTime = detail.fadeTime || sync.totime(1);
		var fade = linear.in(time, detail.start, fadeTime)*linear.out(time, detail.stop-fadeTime, fadeTime);
		
		message.bind(gl, shader.a.vertex);
		message.drawPartially(gl, fade);
	};

	var update = function(gl, time, dt) {
		shader.use();
		gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
		gl.uniformMatrix4fv(shader.u.uView, false, view.elements);

		gl.lineWidth(1);
		var warning = time - sync.totime(8)
		scroll(gl, warning % sync.totime(8), 0, time) ;

		gl.lineWidth(2);
		fadein(gl, time, 1);
		fadein(gl, time, 2);

		fadein(gl, time, 3);
		fadein(gl, time, 4);
	};

	return {
		initialize : initialize,
		update : update
	};
}();
