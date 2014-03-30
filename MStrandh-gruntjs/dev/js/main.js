var main = function() {
	var canvas = document.getElementById("WebGLCanvas");

	var gl = getWebGLContext(canvas);

	if(!gl) {
		console.log("Failed to get WebGL rendering context.");

		return;
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	gl.clear(gl.COLOR_BUFFER_BIT);
};