var load = function() {
	setTimeout(function() {
		var w = Math.max(window.innerWidth, document.body.clientWidth);
		var h = Math.max(window.innerHeight, document.body.clientHeight);
		if (w < h*16/9) { 
			h = Math.floor(w * 9 / 16); 
		} else { 
			w = Math.floor(h * 16 / 9); 
		}

		// divide the size by two to save some power during development
		// the CSS style on #WebGLCanvas will scale it up by two to compensate
		//w /= 2;
		//h /= 2;
		
		var gl = kdb.initialize("WebGLCanvas", w, h);
		if (gl === null) {
			alert("Could not initialize WebGL");
		} else {				
			sync.init(85.0/60.0); // set the sync unit to 85 BPM

			initialize(gl, w, h, 
				function() {
					// Start the main loop
					document.getElementById("WebAudio").play();
					kdb.loop(main);
				});
		}
	}, 100);
};


var quad, background;

var initialize = function(gl, w, h, onInitialized) {
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	// TODO: initialize effects here
	camera.initialize(gl);
	roller.initialize(gl);


	quad = geometry.quad(1);
 
	background = new kdb.Program('v_background', 'f_background');
	background.attribute('vertex');

	onInitialized();
};



var main = function(gl, time, dt) {	
	// cycle the background color over 2 beats
	var u = sync.unit(time, 2);
	var c = (Math.sin(u*3.1415) + 1.0) * 0.1;
	gl.clearColor(c, c, c, 1);	

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	// DEBUG background effect
	//background.use();
	//quad.bind(gl, background.a.vertex);
	//quad.draw(gl);
	//gl.clear(gl.DEPTH_BUFFER_BIT);

	// TODO: run the effects here

	camera.update(gl, time, dt);
	roller.update(gl, time, dt);
};