function holdMorph(hold, easefunc, rotHold, rotMorph) {	
	var a = 0;
	var fn = easefunc;
	var angle = 0;
	return {
		update : function(time, alpha, matView) {
			a = alpha;
			if (a <= hold) {
				var af = a / hold;
				angle = af * 6.2830 * rotHold;
			} else {
				var af = fn((a-hold)/(1-hold))
				angle = af * 6.2830 * rotMorph;
			}
			mat4.rotate(matView, matView, angle, [0, 1, 1]);
		},
		particle : function(p0, p1, matModel) {
			if (a <= hold) {
				mat4.translate(matModel, matModel, p0);	
			} else {
				var af = fn((a-hold)/(1-hold));
				var p = [0,0,0];				
				vec3.lerp(p, p0, p1, af);
				mat4.translate(matModel, matModel, [p[0], p[1], p[2]]);
			}
			
			mat4.rotate(matModel, matModel, -angle, [0, 1, 1]);								
		}			
	}
}

function bounce(factor, T, times) {
	var scale = 1.0;
	return {
		update : function(time, alpha, matView) {			
			var s = 1.0;
			for (var i=0;i<times.length;i++) {
				if (times[i] <= time && time <= times[i]+T) {
					s = 1 + factor * (time - times[i]) / T;
					break;
				}
			}
			mat4.scale(matView, matView, [s, s, s]);
		},
		particle : function(p0, p1, matModel) {
			mat4.translate(matModel, matModel, p0);	
		}
	}
}

function explode(factor, easefunc) {
	var a = 0;
	return {
		update : function(time, alpha, matView) {
			a = easefunc(alpha);
			var s = a * factor;
			mat4.scale(matView, matView, [s, s, s]);
		},
		particle : function(p0, p1, matModel) {
			var d = p0[0]*p0[0] + p0[1]*p0[1];
			var s = (1+a*d*0.1);
			var p = [p0[0]*s, p0[1]*s, p0[2]+a*70];
			
			p[0] += (Math.random()-.5)*a*10;
			p[1] += (Math.random()-.5)*a*10;
			p[2] += (Math.random()-.5)*a*10;
			mat4.translate(matModel, matModel, p);	
		}
	}	
};