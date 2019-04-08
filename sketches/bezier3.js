function() {
   this.label = 'bezier3';

   var T = 0.5;
   var N = -2;
   var P = [newVec3(-1 , .5, 0),
            newVec3(-.3,-.5, 0),
            newVec3( .3, .5, 0),
            newVec3( 1 ,-.5, 0)];
   var mode = 0;
   var isVerbose = 1;

   this.onCmdSwipe[0] = ['toggle lines', function() { isVerbose = ! isVerbose; }];
   this.onCmdClick = function() {
      mode = (mode + 1) % 4;
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
         var ax = P[0].x, bx = P[1].x, cx = P[2].x, dx = P[3].x;
         var ay = P[0].y, by = P[1].y, cy = P[2].y, dy = P[3].y;

         color('red');
         for (var t = 0 ; t <= 1 + eps/2 ; t += eps)
            C.push([ evalBezier(t, ax,bx,cx,dx),
	             evalBezier(t, ay,by,cy,dy) ]);
         mCurve(C);

	 if (! isVerbose)
	    return;

         color(defaultPenColor);
         textHeight(this.mScale(.1));
         mText('A', [ax,ay], 2, .5);
         mText('B', [bx,by], 2, .5);
         mText('C', [cx,cy], 2, .5);
         mText('D', [dx,dy], 2, .5);

         if (N == -1 || mode == 3) {
            var A = [mix(ax,bx,T), mix(ay,by,T)];
            var B = [mix(bx,cx,T), mix(by,cy,T)];
            var C = [mix(cx,dx,T), mix(cy,dy,T)];

            lineWidth(4);

            color(backgroundColor == 'black' ? 'cyan' : 'blue');
            mCurve([A, B, C]);
            mDot(A, .15);
            mDot(B, .15);
            mDot(C, .15);

            if (mode == 0)
               return;

            color(backgroundColor == 'black' ? 'yellow' : 'violet');
            var D = mix(A,B,T);
            var E = mix(B,C,T);
            mLine(D, E);
            mDot(D, .15);
            mDot(E, .15);

            if (mode == 1)
               return;

            color('red');
            mDot(mix(D, E, T), .15);
         }

         color(defaultPenColor);
         for (var n = 0 ; n < P.length ; n++)
            mDot([P[n].x,P[n].y], .15);
      });
   }
}
