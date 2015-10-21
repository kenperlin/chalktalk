
function() {
   this.label = 'vortices';
   this.is3D = true;
   var noiseObject = new Noise();
   var noise = function(p) { return noiseObject.noise(p); }

   this.particles = [];
   this.curve = [];
   for (var i = 0 ; i < 100 ; i++) {
      this.particles.push([2 * random() - 1,
                           2 * random() - 1,
                           2 * random() - 1]);
      this.curve[i] = [];
   }

   this.render = function() {
      this.duringSketch(function() {
	 mCurve(makeOval(-1,-1,2,2,20,0, -TAU));
      });
      this.afterSketch(function() {
         for (var i = 0 ; i < this.particles.length ; i++) {
	    //mDot(this.particles[i], 0.02);
	    this.moveParticle(this.particles[i], this.curve[i]);
         }
      });
   }

   this.moveParticle = function(p, curve) {
      var eps = 0.01;
      var ax = p[0], ay = p[1], az = p[2];
      var bx = p[0], by = p[1], bz = p[2] + 100;

      var a = noise([ax, ay, az]);
      var b = noise([bx, by, bz]);

      var w = cross(
         [ (noise([ax + eps, ay, az]) - a),
           (noise([ax, ay + eps, az]) - a),
           (noise([ax, ay, az + eps]) - a) ],

         [ (noise([bx + eps, by, bz]) - b),
           (noise([bx, by + eps, bz]) - b),
           (noise([bx, by, bz + eps]) - b) ]
      );
      m.normalize(w);

      for (var i = 0 ; i < 3 ; i++)
         p[i] += eps * w[i];

      curve.push([p[0], p[1], p[2]]);
      if (curve.length > 150)
         curve.shift();

      lineWidth(0.5);

      color('rgb(255,128,0)');
      mCurve(curve.slice(0, 91));

      color('rgb(255,192,128)');
      mCurve(curve.slice(90, 141));

      lineWidth(1);
      color('rgb(255,255,255)');
      mCurve(curve.slice(140, 150));
   }
}


