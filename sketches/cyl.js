cyl = function() {
   let rotation = 0;
   let N = 8;

   this.is3D = true;

   this.onMove = p => {
      rotation = -p.x;
      N = Math.floor(4 + Math.max(0, 23.5 * (p.y + .5)) / .7);
   }

   this.render = () => {
      this.duringSketch(() => {
	 mDrawOval([-.5,-.5],[.5,.5]);
	 mDrawOval([-.3,-.3],[.3,.3]);
      });
      this.afterSketch(() => {
         mTextHeight(1/25);
         mText("N = " + N, [-1, 0, 0]);

         m.rotateY(-rotation);
         m.scale(.4);

         for (var n = 0 ; n < N ; n++) {
	    var c0 = Math.cos(2 * Math.PI *  n      / N);
	    var s0 = Math.sin(2 * Math.PI *  n      / N);
	    var c1 = Math.cos(2 * Math.PI * (n + 1) / N);
	    var s1 = Math.sin(2 * Math.PI * (n + 1) / N);

            lineWidth(0.3);
	    mLine([ 0, 0,-1], [c0,s0,-1]);

            lineWidth(0.6);
	    mLine([c0,s0,-1], [c0,s0, 1]);

            lineWidth(1.0);
	    mLine([c0,s0,-1], [c1,s1,-1]);
	    mLine([ 0, 0, 1], [c0,s0, 1]);
	    mLine([c0,s0, 1], [c1,s1, 1]);
	    mLine([c0,s0,-1], [c1,s1,-1]);
	    mLine([c0,s0, 1], [c1,s1, 1]);
	 }
	});
   }
}
