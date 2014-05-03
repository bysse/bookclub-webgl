var scroller = function() {
	var shader;
	var texts;

	var projection = new Matrix4();
	var view = new Matrix4();
	var model = new Matrix4();

	var initialize = function(gl) {
		var string = [
				"WARNING - THINKING ABOUT OR INSIDE THE BOX MAY PERMANENTLY DAMAGE YOUR PSYCHE",
	            
	            "SUPERVISING AB-TEST MANAGER - KLOVMAN",
	            "THANKS TO OUR PRODUCERS",
	            "PANDA DESIGN, ZWORP, TAZADUM"
		];
     

        texts = [
        	{
        		text: "WARNING - THINKING ABOUT OR INSIDE THE BOX MAY PERMANENTLY DAMAGE YOUR PSYCHE",
        		start: 93,
        		stop: 103,
        		x: [1, -7],
        		y: [-.42, -.42],
        		color: [1, 1, 1]
        	},
        	{
        		text: "CREDITS -- KLOVMAN - WONDER",
        		start: 102,
        		stop: 122,
        		x: [1, -12],
        		y: [.55, .55],
        		color: [1, 1, 1]
        	},
        	{
        		text: "GREETINGS",
        		start: 2,
        		fadeTime: 1,
        		stop: 10,
        		color: [1, 0, 0]
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

	var scroll = function(gl, time, index) {
		var detail = texts[index];
		if (time < detail.start || detail.stop < time) {
			return;
		}
		var alpha = (time - detail.start) / (detail.stop - detail.start);
	
		var x = detail.x[0] + alpha * (detail.x[1] - detail.x[0]);
		var y = detail.y[0] + alpha * (detail.y[1] - detail.y[0]);
		var z = -1;	
	
		var scale = .02;
		model.setIdentity();
		model.translate(x, y, z);
		model.scale(scale, scale, scale);

		gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);
		gl.uniform3f(shader.u.uColor, detail.color[0], detail.color[1], detail.color[2]);

		var message = detail.message;	
		message.bind(gl, shader.a.vertex);
		message.draw(gl);
	};


	var fadein = function(gl, time, index) {
		var detail = texts[index];
		if (time < detail.start || detail.stop < time) {
			return;
		}
		var alpha = (time - detail.start) / (detail.stop - detail.start);
		var message = detail.message;	

		var scale = .05;
		var x =  -(message.biggestXPos / 2)*scale;
		var y = 0;
		var z = -1;

		model.setIdentity();
		model.translate(x, y, z);
		model.scale(scale, scale, scale);

		gl.uniformMatrix4fv(shader.u.uModel, false, model.elements);
		gl.uniform3f(shader.u.uColor, detail.color[0], detail.color[1], detail.color[2]);

		var fade = linear.in(time, detail.start, detail.fadeTime)*linear.out(time, detail.stop-detail.fadeTime, detail.fadeTime);
		
		message.bind(gl, shader.a.vertex);
		message.drawPartially(gl, fade);
	};

	var update = function(gl, time, dt) {
		shader.use();
		gl.uniformMatrix4fv(shader.u.uProjection, false, projection.elements);
		gl.uniformMatrix4fv(shader.u.uView, false, view.elements);


		scroll(gl, time, 0);
		scroll(gl, time, 1);

		fadein(gl, time, 2);
	};

	return {
		initialize : initialize,
		update : update
	};
}();
