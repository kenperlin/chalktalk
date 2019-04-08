function() {
   this.label = "sphere";

   var isSolid = true;
   var ns = 12;
   this.onCmdClick = [ 'toggle wireframe' , function(p) { isSolid = ! isSolid; } ];
   this.onSwipe[2] = [ 'more' , function(p) { ns += 4; } ];
   this.onSwipe[6] = [ 'less' , function(p) { ns = max(ns - 4, 4); } ];

   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-1,-1,2,2,20,-PI/2,  PI/2));
         mCurve(makeOval(-1,-1,2,2,20, PI/2,3*PI/2));
      });

      if (isSolid) {
         mSphere(2*ns, ns);
         this.useInputColors();
	 return;
      }

      function sph(u, v) {
         let theta = TAU * u;
         let phi = PI * (v - .5);
         return [ cos(theta) * cos(phi), sin(theta) * cos(phi), sin(phi) ];
      }

      function drawQuad(u0, v0, u1, v1) {
         let a = sph(u0, v0), b = sph(u1, v0),
	     c = sph(u1, v1), d = sph(u0, v1);
         mCurve([ a, b, c, d, c ]);
      }

      for (let nv = 0 ; nv < ns ; nv++)
      for (let nu = 0 ; nu <= 2 * ns ; nu++)
         drawQuad( nu   /(2 * ns),  nv   /ns,
	          (nu+1)/(2 * ns), (nv+1)/ns);
   }
}
