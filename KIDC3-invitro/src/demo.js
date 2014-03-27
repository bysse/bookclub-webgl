var demo = function() {
	var background = null;
	
	var initialize = function(gl, w, h, callback) {
		gl.enable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);
		
		
		backgroundEffect.initialize(gl, w, h);
		logoEffect.initialize(gl, w, h, function() {
			callback();
			kdb.loop(frame);						
		});
	};
		
	var frame = function(gl, time, dt) {
		gl.disable(gl.BLEND);
		
		// set the background to green so we see if anything fails
		gl.clearColor(0.0, 1.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		backgroundEffect.update(gl, time, dt);
		
		// clear the depth buffer before we start to draw again
		gl.clear(gl.DEPTH_BUFFER_BIT);
		
		logoEffect.update(gl, time, dt);		
	};
		
	return { initialize : initialize }
}();

var backgroundEffect = function() {
	var background = null;
	var quad = null;
	
	var initialize = function(gl, w, h) {
		background = new kdb.Program('v_background', 'f_background');
		background.attribute('vertex');
		quad = kdb.staticBuffer(3, [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]);
	};
	
	var update = function(gl, time, dt) {
		background.use();
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.enableVertexAttribArray(background.a.vertex);
		gl.vertexAttribPointer(background.a.vertex, quad.stride, gl.FLOAT, false, 0, 0);			
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, quad.elements);
	};
	
	return { initialize: initialize, update: update };
}();

var ease = {
	finout : function (t) {
		var c = 1;
		var d = 1;
		t /= d/2;
		if (t < 1) return c/2*t*t*t;
		t -= 2;
		return c/2*(t*t*t + 2);
	},
	fin : function (t) {
		var c = 1;
		var d = 1;
		return c*(t/=d)*t*t*t;
	},
	fout : function (t) {
		var c = 1;
		var d = 1;
		return -c * ((t=t/d-1)*t*t*t - 1);
	},
	flinear : function (t) {
		return t;
	}
};

var scan = function(image, limit) {
	var w = image.width;
	var h = image.height;
	var data = image.data;
	
	var positions = [];
	var colors = [];
	var random = 0;
	
	while (true) {
		var i = 0;
		if (limit > 0 && positions.length > limit) {
			break;
		}
		for (var y=0;y<h;y++) {
			for (var x=0;x<w;x++) {
				if (limit > 0 && positions.length > limit) {
					break;
				}
				if (data[i+3] > 0) {
					var r = data[i+0]/255.0;
					var g = data[i+1]/255.0;
					var b = data[i+2]/255.0;
					var a = data[i+3]/255.0;
					
					var z = random * ((Math.random()-.5) * 2);					
					positions.push([x-w/2, h/2-y, z]);
					colors.push({
						color: [r,g,b,a]
					});					
				}
				i+=4;
			}
		}
		random = 1;
		if (limit == 0) {
			break;
		}
	}

	return {
		position: positions,
		colors: colors
	}
};

/**
 * The logo / particle effect.
 */
var logoEffect = function() {
	var matProjection = mat4.create();
	var matView = mat4.create();
	var matModel = mat4.create();
	
	var ratio = 16/9;
	var quad = null;
	
	var eye = [0,0,70];
	var center = [0,0,0];
	var up = [0,1,0];
	
	var particles = 0;
	var king;
	var states = [];
	
	var addState = function(duration, scene, data) {
		var last = 0;
		if (states.length > 0) {
			var state = states[states.length-1];
			last = state.end;
		}
		states.push({
		             start: last,
		             end: last + duration,
		             data: data,
		             scene: scene 
		});		
	};
		
	var initialize = function(gl, w, h, callback) {
		ratio = w / h;

		kdb.loadImage(tinylogo, function(w, h, image) {
			console.log(image);
			king = scan(image, 0);			
			particles = king.position.length;
			
			var demoCompo = scan(kdb.loadText("DEMO COMPETITION #3"), particles);
			var text1 = scan(kdb.loadText("6 COMPOS!"), particles);
			var text2 = scan(kdb.loadText("100\" SCREEN!"), particles);
			var text3 = scan(kdb.loadText("AWESOME SOUND!"), particles);
			var text4 = scan(kdb.loadText("KEWL PRIZES!"), particles);
			var text5 = scan(kdb.loadText("BEER?"), particles);
			var text6 = scan(kdb.loadText("INFINITE BEER!!!"), particles);								
			var text7 = scan(kdb.loadText("MAY 6th, 2014"), particles);
			var text8 = scan(kdb.loadText("STOCKHOLM"), particles);
			
			var text9 = scan(kdb.loadText("code: klovman"), particles);
			var text10 = scan(kdb.loadText("music: mille"), particles);
			
			var random = [];
			var square = [];
			var sphere = [];
			var sphere2 = [];
			var box = [];
			
			var sw = 88;
			var sh = 50;
			var k=0;
			for (var j=0;j<king.position.length;j++) {				
				var x = Math.floor(j / sh) - sw/2;
				var y = (j % sh) - sh/2;				
				square.push([x, y, 60]);
			}
			
			for (var j=0;j<square.length;j++) {
				var k=parseInt(Math.random()*(square.length-1));
				var t = square[j];
				square[j] = square[k];
				square[k] = t;
				
			}		
			
			var stripes = 50;
			var voxelsPerStripe = Math.ceil(particles / stripes);
			var index = 0;
			var radius = 70;
			
			var sign = function(x) { if (x >= 0) { return 1; } else { return -1; }}
			
			for (var s=0;s<stripes;s++) {				
				var n = Math.ceil( (1.25-Math.abs(s/stripes-.5)) * voxelsPerStripe);
				var phi = 3.1415 * ((s+2)/(stripes+2));
				
				for (var x=0;x<n;x++) {
					if (index++ >= particles) {
						break;
					}

					var theta = 6.2830 * x / n;
					var xp = Math.cos(theta) * Math.sin(phi) * radius;
					var yp = Math.cos(phi) * radius;
					var zp = Math.sin(theta) * Math.sin(phi) * radius;
					sphere.push([xp, yp, zp]);
					
					theta = 6.2830 * (n-x) / n;
					xp = Math.cos(theta) * Math.sin(phi) * radius / 2;
					yp = Math.cos(phi) * radius / 2;
					zp = Math.sin(theta) * Math.sin(phi) * radius / 2; 
					sphere2.push([xp, yp, zp]);
					
					var r = 140;
					random.push([(Math.random()-.5)*r,(Math.random()-.5)*r,(Math.random()-.5)*r]);
					
					r = radius * (Math.floor(Math.random()*2)*.5 + 1) / 3;
					xp = r*sign(Math.random()-.5);
					yp = r*sign(Math.random()-.5);
					zp = r*sign(Math.random()-.5);
					
					switch (Math.floor(Math.random()*3)) {
					case 0:
						xp = (Math.random()-.5) * r * 2;
						break;
					case 1:
						yp = (Math.random()-.5) * r * 2;
						break;
					case 2:
						zp = (Math.random()-.5) * r * 2;
						break;
					}
					
					box.push([xp, yp, zp]);
				}
			}
					
			addState(5.0, fx.holdMorphRot_1, square);
			addState(2.0, fx.bounce, king.position);
			addState(2.0, fx.rotMorph_1, king.position);
			addState(3.0, fx.stopMorphRot_1, demoCompo.position);
			
			addState(3.0, fx.rotMorph_4, sphere);
			addState(1.0, fx.rotMorph_4, king.position);
			addState(4.0, fx.rotMorph_4, box);
			addState(1.2, fx.rotMorph_4, king.position);
			// 21.2
			
			var i = 1.7;
			addState(i, fx.rotMorph, text1.position);
			addState(i, fx.rotMorph, text2.position);
			addState(i, fx.rotMorph, text3.position);
			addState(i, fx.rotMorph, text4.position);
			addState(i, fx.rotMorph, text5.position);
			addState(i, fx.rotMorph, text6.position);
			addState(i, fx.rotMorph, text7.position);
			addState(i, fx.rotMorph, text8.position);
			// 34.8
			
			addState(5.0, fx.rotMorph_5, sphere);
			addState(2.2, fx.rotMorph_5, box);
			// 42 sec
			addState(2.0, fx.rotMorph_4, king.position);
			addState(2.0, fx.rotMorph_5, sphere2);
			addState(2.0, fx.rotMorph_5, box);
			addState(2.0, fx.rotMorph_6, text9.position);
			addState(2.0, fx.rotMorph_5, sphere);
			addState(2.0, fx.rotMorph_6, text10.position);
			addState(2.0, fx.rotMorph_5, king.position);
			addState(4.0, fx.explosion, king.position);
			
			
			callback();
		});
		
		particle = new kdb.Program('v_particle', 'f_particle');
		particle.attribute('vertex');
		particle.uniform('projection');
		particle.uniform('view');
		particle.uniform('model');
		particle.uniform('color');		
		
		quad = kdb.staticBuffer(3, [-.5, -.5, 0, .5, -.5, 0, -.5, .5, 0, .5, .5, 0]);
		
		// setup the projection matrix
		mat4.perspective(matProjection, 2, ratio, 0.1, 1000.0);		
	};
	
	var update = function(gl, time, dt) {
		var current = -1;
		for (var i=0;i<states.length;i++) {
			if (states[i].start <= time && time < states[i].end) {
				current = i;
				break;
			}
		}
		
		if (current < 0) {
			console.log("The End");
			kdb.togglePause();
			return;
		}
							
		var nextState = current + 1;
		if (nextState >= states.length) {
			nextState = current;
		}
		var state = states[current];
		var next = states[nextState];		
		var alpha = Math.max(0, Math.min(1, (time - state.start) / (state.end - state.start)));
		
		// update the viewing matrix
		mat4.lookAt(matView, eye, center, up);		
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);		
		
		state.scene.update(time - state.start, alpha, matView);
		
		particle.use();
		gl.uniformMatrix4fv(particle.u.projection, false, matProjection);
		gl.uniformMatrix4fv(particle.u.view, false, matView);
		gl.uniformMatrix4fv(particle.u.model, false, matModel);
		
		// set the vertex attribute of the shader to the vertex buffer of the quad
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.enableVertexAttribArray(particle.a.vertex);
		gl.vertexAttribPointer(particle.a.vertex, quad.stride, gl.FLOAT, false, 0, 0);
				
//		var angle = alpha * 6.2830 * state.rotate;
//		mat4.rotate(matView, matView, angle, [0, 1, 1]);
//		gl.uniformMatrix4fv(particle.u.view, false, matView);
			
		var data0 = state.data;
		var data1 = next.data;
		var pos = [0,0,0];
		
		for (var i=0;i<particles;i++) {		
			var color = king.colors[i].color;
			
			// Set the model matrix
			mat4.identity(matModel);
			state.scene.particle(data0[i], data1[i], matModel);

			gl.uniformMatrix4fv(particle.u.model, false, matModel);
			gl.uniform4fv(particle.u.color, color);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, quad.elements);
		}
	};
	
	return { initialize: initialize, update: update };	
}();


var simplex = new SimplexNoise();

var fx = {
		holdMorphRot_1 : holdMorph(0.72, ease.fout, 0, 1),
		bounce : bounce(0.50, 0.15, [.35, .75, 1.15, 1.30, 1.55]),
		rotMorph_1 : holdMorph(0.00, ease.flinear, 0, 1),
		stopMorphRot_1 : holdMorph(0.5, ease.fin, 0, 1),
		rotate : holdMorph(1.00, ease.flinear, 1, 0),
		rotMorph_2 : holdMorph(0.75, ease.finout, 1, 1),
		rotMorph_3 : holdMorph(0.5, ease.flinear, 0, 1),
		rotMorph_4 : holdMorph(0.5, ease.flinear, 1, 1),
		rotMorph_5 : holdMorph(0.0, ease.flinear, 1, 1),
		rotMorph_6 : holdMorph(0.75, ease.flinear, 1, 1),
		rotMorph : holdMorph(0.75, ease.finout, 0, 1),
		explosion : explode(30, ease.flinear)
};
