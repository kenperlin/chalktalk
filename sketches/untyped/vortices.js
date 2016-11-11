
function() {
   this.label = 'vortices';
   this.is3D = true;
   var noiseObject = new Noise();
   var noise = function(x,y,z) { return noiseObject.noise([x/2,y/2,z/2]); }

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
         mLines([[-1,0],[0,1],[0,-1],[2,1]]);
      });
      this.afterSketch(function() {
         lineWidth(2);
         color(fadedColor(0.15, this.colorId));
         for (var i = 0 ; i < this.particles.length ; i++)
	    this.moveParticle(this.particles[i], this.curve[i]);
      });
   }

   this.moveParticle = function(p, curve) {
      var eps = 0.02;
      var ax = p[0], ay = p[1], az = p[2];
      var bx = p[0], by = p[1], bz = p[2] + 10;

      var a = noise(ax, ay, az);
      var b = noise(bx, by, bz);

      var w = cross(
         [ (noise(ax + eps, ay, az) - a),
           (noise(ax, ay + eps, az) - a),
           (noise(ax, ay, az + eps) - a) ],

         [ (noise(bx + eps, by, bz) - b),
           (noise(bx, by + eps, bz) - b),
           (noise(bx, by, bz + eps) - b) ]
      );
      m.normalize(w);

      for (var i = 0 ; i < 3 ; i++)
         p[i] += eps * w[i];

      curve.push([p[0], p[1], p[2]]);
      if (curve.length > 150)
         curve.shift();
      mCurve(curve);
   }
}


