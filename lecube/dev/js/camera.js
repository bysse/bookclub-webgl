var camera = function() {
	var projection = new Matrix4();
	var view = new Matrix4();
	var model = new Matrix4();

	var eyeX = 10;
	var eyeY = 10;
	var eyeZ = 15;

	var centerX = 0;
	var centerY = 0;
	var centerZ = 0;

	var initialize = function(gl) {
		gl.disable(gl.CULL_FACE);
		projection.setPerspective(90, 16/9, 0.1, 1000);
	};

	var overTheTop = function(t, offsetX) {
		eyeX = offsetX + 5*t;
		eyeY = 5;
		eyeZ = 5;
		centerX = eyeX - 2;
		centerY = eyeY - 1;
		centerZ = eyeZ;						
	};

	var closeRight = function(t, offsetX) {
		eyeX = offsetX + 10*t;
		eyeY = 5;
		eyeZ = -10;
		centerX = eyeX + 2;
		centerY = eyeY;
		centerZ = eyeZ + 10;		
	};

	var closeLeft = function(t, offsetX) {
		eyeX = offsetX + 5*t;
		eyeY = 5;
		eyeZ = 15;
		centerX = eyeX - 2;
		centerY = eyeY;
		centerZ = eyeZ - 10 - t;
	};

	var update = function(gl, time, dt) {
		var unit = sync.tounit(time);
		if (unit < 2) { 
			// far away
			eyeX = -300 + 10*time;
			eyeY = 20;
			eyeZ = -50;
			centerX = -250;
			centerY = eyeY;
			centerZ = eyeZ + 150;
		} else if (unit < 4) {
			// midle range
			var t = time - sync.totime(2);
			eyeX = -300 + 10*t;
			eyeY = 10;
			eyeZ = -20;
			centerX = eyeX + 2;
			centerY = eyeY;
			centerZ = eyeZ + 10;
		} else if (unit < 6) {
			closeRight(time - sync.totime(4), -300);
		} else if (unit < 12) {
			overTheTop(time - sync.totime(8), -220);
		} else if (unit < 16) {
			closeLeft(time - sync.totime(12), -280);
		} else if (unit < 20) {
			// in front
			var t = time - sync.totime(18);
			eyeX = -160 + 2*t;
			eyeY = 1;
			eyeZ = 5;
			centerX = eyeX - 4;
			centerY = eyeY + .5;
			centerZ = eyeZ;
		} else if (unit < 24) {
			closeRight(time - sync.totime(20), -260);
		} else if (unit < 28) {
			closeLeft(time - sync.totime(24), -240);
		} else if (unit < 32) {
			// over the top again...
			var t = time - sync.totime(28);
			eyeX = -120 + 2*t;
			eyeY = 15;
			eyeZ = 5;
			centerX = eyeX - 2;
			centerY = eyeY - 2;
			centerZ = eyeZ;
		} else if (unit < 60) {
			var t = time - sync.totime(32);
			centerX = -100;
			centerY = 0;
			centerZ = 5;

			var radius = 10 + 10*sync.fadein(t, 0, 8) ;
			var angle = t*.1 + 3;
			eyeX = centerX + Math.sin(angle)*radius;
			eyeY = 8 + 16*sync.fadein(t, 0, 16);
			eyeZ = centerZ + Math.cos(angle)*radius;	
		} else {			
			centerX = 0;
			centerY = 0;
			centerZ = 0;

			var unit = sync.tounit(time);
			var radius = 2 + 10*sync.fadein(time, 0, 8) ;

			eyeX = centerX + Math.sin(unit*.25)*radius;
			eyeY = 4 + 8*sync.fadein(time, 0, 8);
			eyeZ = centerZ + Math.cos(unit*.25)*radius;
		}

		view.setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, 0, 1, 0);
	};

	return {
		initialize : initialize,
		update : update,
		projection : function() { return projection; },
		view : function() { return view; }
	};
}();