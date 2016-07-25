function() {
   this.label = 'tracked';

   this.render = function() {
      var trackId = -1, r, ax=0, ay=0, az=0;

      switch (this.colorId) {
      case 2: case 8: trackId = 0; break;
      case 5:         trackId = 1; break;
      case 6: case 7: trackId = 2; break;
      }
      if (trackId >= 0) {
         var p = tracked[trackId];
         m.translate(p[0], p[1], -p[2]);
      }

      if (r = window.imuData) {
         if (r.alpha0 === undefined)
            r.alpha0 = r.alpha;
         m.rotateY((r.alpha0 - r.alpha) * Math.PI / 180            );
         m.rotateZ(          - r.beta   * Math.PI / 180            );
         m.rotateX(            r.gamma  * Math.PI / 180 + Math.PI/2);
	 ax = r.ax;
	 ay = r.ay;
	 az = r.az;
      }

      this.duringSketch(function() {
         mCurve([ [-1,.5], [-1,-.5], [1,-.5] ]);
         mCurve([ [-1,.5], [ 1, .5], [1,-.5] ]);
      });

      m.translate(.05 * ay * abs(ay), -.05 * ax * abs(ax), .05 * az * abs(az));
      m.scale(1,.5,.05);
      mCube();
      m.translate(-.77,0,.1);
      m.scale(.09,.18,1);
      mCube().color(r && r.compass ? 255 : 0,0,0);
   }
}
