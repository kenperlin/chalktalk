function() {
   this.label = 'fish';
   this.swim = false;
   this.swipe[0] = ['SWIM!', function() { this.swim = true; }];
   this.angle = 0;

   this.render = function() {
      var c = 0;
      this.afterSketch(function() {
         if (this.swim) {
            if (this.swimTime === undefined)
               this.swimTime = time;
            var t = time - this.swimTime;
            c = cos(2 * TAU * t) * .1;
	    if (typeof this.inValue[0] != 'function')
               m.translate(2*t,0,0);
            else {
	       var p0 = this.inValue[0]( t/4         % 1);
	       var p1 = this.inValue[0]((t/4 + .001) % 1);
               m.translate(2 * p0[0], 2 * p0[1], 2 * p0[2]);

               var angle = atan2(p0[0] - p1[0], p1[1] - p0[1]);
	       while (angle - this.angle >  PI) angle -= TAU;
	       while (angle - this.angle < -PI) angle += TAU;

               this.angle = mix(this.angle, angle, .1);
               m.rotateZ(PI/2 + this.angle);
            }
            m.translate(1,0,0);
            m.rotateZ(-c/2);
            m.translate(-1,0,0);
         }
      });
      mSpline([[-1,.3+c],[-.45,-c/2],[ .5 ,-.4 ],[ 1,-.15],
               [ 1,.15 ],[ .5 ,.4  ],[-.45,-c/2],[-1,c-.3]]);
      mSpline([[-1,.3+c],[-.95,c],[-1,-.3+c]]);
      this.afterSketch(function() {
         mSpline([[1,-.15],[.8,-.15],[.6,-.1]]);
         mDrawOval([.45,.1],[.65,.3]);
	 if (! this.isOnScreen())
	    this.fade();
      });
   }
}
