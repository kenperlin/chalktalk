function() {
   this.label = 'bezier2';

   function _bezier2(a,b,c, t) {
       return mix( mix( a, b, t), 
                   mix( b, c, t),  t);
   }

   var T = 0.5;
   var N = -2;
   var P = [newVec3(-1 , .5, 0),
            newVec3(-.3,-.5, 0),
            newVec3( .3, .5, 0)];
   var mode = 0;
   var isVerbose = 1;

   this.onCmdSwipe[0] = ['toggle lines', function() { isVerbose = ! isVerbose; }];
   this.onCmdClick = function() {
      mode = (mode + 1) % 3;
   }
   this.onPress = function(pt) {
      N = -1;
      var D = 1000;
      for (var n = 0 ; n < P.length ; n++) {
         var d = P[n].distanceTo(pt);
         if (d < .1) {
            N = n;
            D = d;
         }
      }
   }
   this.onDrag = function(pt) {
      if (N >= 0)
         P[N].copy(pt);
      else {
         var xLo = 1000, xHi = -1000;
         for (var n = 0 ; n < P.length ; n++) {
            xLo = min(xLo, P[n].x);
            xHi = max(xHi, P[n].x);
         }
         T = max(0, min(1, (pt.x - xLo) / (xHi - xLo)));
      }
   }
   this.onRelease = function(pt) {
      N = -2;
   }
   this.render = function() {
      if (isVerbose) {
         lineWidth(1);
         mLine(P[0], P[1]);
         mCurve(P.slice(1));
      }
      lineWidth(2);
      this.afterSketch(function() {
         var C = [];
         var eps = 0.01;
         var ax = P[0].x, bx = P[1].x, cx = P[2].x;
         var ay = P[0].y, by = P[1].y, cy = P[2].y;

         color('red');
         for (var t = 0 ; t <= 1 + eps/2 ; t += eps)
            C.push([ _bezier2(ax,bx,cx, t), _bezier2(ay,by,cy, t) ]);
         mCurve(C);

         if (! isVerbose)
	    return;

         color(defaultPenColor);
         textHeight(this.mScale(.1));
         mText('A', [ax,ay], 2, .5);
         mText('B', [bx,by], 2, .5);
         mText('C', [cx,cy], 2, .5);

         if (N == -1 || mode == 2) {
            var T = T;

            var A = [mix(ax,bx,T), mix(ay,by,T)];
            var B = [mix(bx,cx,T), mix(by,cy,T)];

            lineWidth(4);

            color(isBlackBackground() ? 'cyan' : 'blue');
            mCurve([A, B]);
            mDot(A, .15);
            mDot(B, .15);

            if (mode == 0)
               return;

            color(isBlackBackground() ? 'yellow' : 'red');
            mDot(mix(A,B,T), .15);
         }

         color(defaultPenColor);
         for (var i = 0 ; i < P.length ; i++)
            mDot([P[i].x,P[i].y], .15);
      });
   }
}

