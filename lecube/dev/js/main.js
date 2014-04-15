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
		w /= 2;
		h /= 2;
		
		var gl = kdb.initialize("WebGLCanvas", w/2, h/2);
		if (gl === null) {
			alert("Could not initialize WebGL");
		} else {				
			initialize(gl, w, h, 
				function() {
					// Start the main loop
					kdb.loop(main);
				});
		}
	}, 100);
};


var initialize = function(gl, w, h, onInitialized) {

	// TODO: initialize effects here

	onInitialized();
};



var main = function(gl, time, dt) {
	// TODO: run the effects here
};