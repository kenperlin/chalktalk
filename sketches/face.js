function() {
   this.label = 'face';
   this.is3D = true;
   this.mode = 0;
   this.onRelease = function() { this.mode++; }
   this.render = function() {
      function p(x,y,s) {
         var z = sqrt(1 - x * x - y * y);
         if (s !== undefined) {
            x *= s;
            y *= s;
            z *= s;
         }
         return [x, y, z];
      }
      m.scale(.8,1,.8);
      this.duringSketch(function() {
         mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
      });

      function _noise(t) { return max(-1, min(1, 3 * noise(.8 * t))); }

      var a = -1, d = 0, e = -1, h = 0, i = 0, o = 0, s = -1, x = 0, y = 0, z = 0;
      this.afterSketch(function() {

         if (this.mode == 0)
	    this.startTime = undefined;

         if (this.mode > 1) {
            if (this.startTime === undefined)
	       this.startTime = time;

	    var t = time - this.startTime;
            a = _noise(t * 3 + 10);
            d = _noise(t     + 20);
            e = _noise(t     + 30);
            h = _noise(t     + 40);
            i = _noise(t     + 50);
            o = _noise(t     + 60);
            s = _noise(t     + 70);
            x = _noise(t     + 80);
            y = _noise(t     + 90);
            z = _noise(t     + 100);
         }
      });
      var A = .1  * gain(.5 + .5 * a, .7);
      var D = .07 * d;
      var E = .07 * (.5 + .5 * e);
      var H = .05 * h;
      var I = .05 * i;
      var O = .1  * o;
      var S = .06 * gain(bias(.5 + .5 * s, .1), .9);
      var X = .2 * x;
      var Y = .5 * y;
      var Z = .1 * z;

      this.extendBounds([[-1.1,-.8],[1.1,.6]]);

      m.translate(0,-3,0);
      m.rotateX(X);
      m.rotateY(Y);
      m.rotateZ(Z);
      m.translate(0, 3,0);

      lineWidth(2);

      mSpline([p(-.57, .22, .9), p(-.4, .22-E+I, .95), p(-.23, .22, .9)]);
      mSpline([p( .23, .22, .9), p( .4, .22-E+I, .95), p( .57, .22, .9)]);

      lineWidth(1);

      mSpline([p(-.2+O  ,-.5+H          ),
               p(-.1+O/2,-.5-H*.35-A*.75),
               p( .1-O/2,-.5-H*.35-A*.75),
               p( .2-O  ,-.5+H          )]);

      this.afterSketch(function() {

         lineWidth(2);

         mSpline([p(-.55, .4), p(-.4, .4+(E+I)*.4-D), p(-.25, .4-D*1.5)]);
         mSpline([p( .55, .4), p( .4, .4+(E+I)*.4-D), p( .25, .4-D*1.5)]);

         mSpline([p(-.57, .22, .9), p(-.4, .22+E+I, .95), p(-.23, .22, .9)]);
         mSpline([p( .23, .22, .9), p( .4, .22+E+I, .95), p( .57, .22, .9)]);

         lineWidth(1);

         mSpline([p(-.1,-.2), p(0,-.2,1.05), p(.1,-.2)]);

         mSpline([p(-.2+O    ,-.5+H              ),
                  p(-.1+O/2-S,-.5-H*.35+A*.75 + S),
                  p( .1-O/2+S,-.5-H*.35+A*.75 + S),
                  p( .2-O    ,-.5+H              )]);

         this.setOutPortValue([a,d,e,h,i,o,s,x,y,z]);
      });
   }
}
