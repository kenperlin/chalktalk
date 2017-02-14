
function() {
   this.label = "eye";
   this.is3D = true;

   window.showVR = false;
   window.hiRes = false;
   window.b_p = undefined;
   window.b_p_time = undefined;

   this.onSwipe[0] = [ 'VR'    , function() { showVR = ! showVR; b_p = undefined; } ];
   this.onSwipe[2] = [ 'hi res', function() { hiRes  = ! hiRes ; b_p = undefined; } ];
   this.render = function(elapsed) {

      this.gIV = function(j) { return max(0, min(1, this.getInValue(j, 0.5))); }

      var open = this.gIV(0) + .3;
      var lift = this.gIV(1) - .5;
      var x    = this.gIV(2) - .5;
      var y    = this.gIV(3) - .5;

      var yUpper =  (open + lift) / 2;
      var yLower = -(open - lift) / 2;
      var upper = makeSpline([ [-1,0,-.19], [-.3, yUpper, .01], [.3, yUpper, .01], [1,0,-.19] ]);
      var lower = makeSpline([ [-1,0,-.19], [-.3, yLower, .01], [.3, yLower, .01], [1,0,-.19] ]);

      var ul = .25;
      for ( ; ul > -.25 ; ul -= 0.01)
         if (curveIntersectLine(upper, [x,y-2], [x-.5*cos(ul*TAU), y+.5*sin(ul*TAU)]).length == 0)
            break;

      var ur = .25;
      for ( ; ur > -.25 ; ur -= 0.01)
         if (curveIntersectLine(upper, [x,y-2], [x+.5*cos(ur*TAU), y+.5*sin(ur*TAU)]).length == 0)
            break;

      var ll = .25;
      for ( ; ll > -.25 ; ll -= 0.01)
         if (curveIntersectLine(lower, [x,y+2], [x-.5*cos(ll*TAU), y-.5*sin(ll*TAU)]).length == 0)
            break;

      var lr = .25;
      for ( ; lr > -.25 ; lr -= 0.01)
         if (curveIntersectLine(lower, [x,y+2], [x+.5*cos(lr*TAU), y-.5*sin(lr*TAU)]).length == 0)
            break;

      mCurve(upper);
      mCurve(lower);
      mCurve(makeOval(x-.5,y-.5,1,1, 32, (.5-ul)*TAU, (.5+ll)*TAU));
      mCurve(makeOval(x-.5,y-.5,1,1, 32,     ur *TAU,    -lr *TAU));

      if (showVR) {
         var n = hiRes ? 17 : 5;
         if (b_p === undefined || floor(4*time) > floor(4*b_p_time)) {
            b_p_time = time;
            b_p = [];
            for (var i = 0 ; i < n * n ; i++) {
               var x = 2 * (     (i % n) + 0.5) / n - 1;
               var y = 2 * (floor(i / n) + 0.5) / n - 1;
               var rr = 1 - x * x - y * y;
               if (rr > 0) {
                  x *= 1 + .4 * abs(x * y);
                  y *= 1 + .4 * abs(x * y);
                  b_p.push( [ min(1, irandom(3)), [0.45 * x, .4 * y, .16 * sqrt(rr)] ] );
               }
            }
         }
         textHeight(this.mScale(0.45 / n));
         for (var i = 0 ; i < b_p.length ; i++) {
            var bp = b_p[i];
            color(bp[0] == '0' ? 'rgb(255,92,64)' : 'rgb(128,220,255)');
            mText(bp[0], bp[1], .5, .5);
         }
      }

      this.extendBounds([[-1, -.8], [1, .8]]);
   }
}

