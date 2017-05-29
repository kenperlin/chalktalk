function() {
   this.label = 'bezier3';

   function _bezier3(a,b,c,d, t) {
       return mix( mix( mix( a, b, t), 
                        mix( b, c, t),  t), 
                   mix( mix( b, c, t), 
                        mix( c, d, t),  t),  t);
   }

   this.P = [newVec3(-1 , .5, 0),
             newVec3(-.3,-.5, 0),
             newVec3( .3, .5, 0),
             newVec3( 1 ,-.5, 0)];

   this.mode = 0;
   this.isVerbose = 1;
   this.onCmdSwipe[0] = ['toggle lines', function() { this.isVerbose = ! this.isVerbose; }];
   this.onCmdClick = function() {
      this.mode = (this.mode + 1) % 4;
   }
   this.onPress = function(pt) {
      this.N = -1;
      var D = 1000;
      for (var n = 0 ; n < this.P.length ; n++) {
         var d = this.P[n].distanceTo(pt);
         if (d < .1) {
            this.N = n;
            D = d;
         }
      }
   }
   this.onDrag = function(pt) {
      if (this.N >= 0)
         this.P[this.N].copy(pt);
      else {
         var xLo = 1000, xHi = -1000;
         for (var n = 0 ; n < this.P.length ; n++) {
            xLo = min(xLo, this.P[n].x);
            xHi = max(xHi, this.P[n].x);
         }
         this.T = max(0, min(1, (pt.x - xLo) / (xHi - xLo)));
      }
   }
   this.onRelease = function(pt) {
      this.N = -2;
   }
   this.render = function() {
      if (this.isVerbose) {
         lineWidth(1);
         mLine(this.P[0], this.P[1]);
         mCurve(this.P.slice(1));
      }
      lineWidth(2);
      this.afterSketch(function() {
         var C = [];
         var eps = 0.01;
         var ax = this.P[0].x, bx = this.P[1].x, cx = this.P[2].x, dx = this.P[3].x;
         var ay = this.P[0].y, by = this.P[1].y, cy = this.P[2].y, dy = this.P[3].y;

         color('red');
         for (var t = 0 ; t <= 1 + eps/2 ; t += eps)
            C.push([ _bezier3(ax,bx,cx,dx, t), _bezier3(ay,by,cy,dy, t) ]);
         mCurve(C);

	 if (! this.isVerbose)
	    return;

         color(defaultPenColor);
         textHeight(this.mScale(.1));
         mText('A', [ax,ay], 2, .5);
         mText('B', [bx,by], 2, .5);
         mText('C', [cx,cy], 2, .5);
         mText('D', [dx,dy], 2, .5);

         if (this.N == -1 || this.mode == 3) {
            var T = this.T;

            var A = [mix(ax,bx,T), mix(ay,by,T)];
            var B = [mix(bx,cx,T), mix(by,cy,T)];
            var C = [mix(cx,dx,T), mix(cy,dy,T)];

            lineWidth(4);

            color(backgroundColor == 'black' ? 'cyan' : 'blue');
            mCurve([A, B, C]);
            mDot(A, .15);
            mDot(B, .15);
            mDot(C, .15);

            if (this.mode == 0)
               return;

            color(backgroundColor == 'black' ? 'yellow' : 'violet');
            var D = mix(A,B,T);
            var E = mix(B,C,T);
            mLine(D, E);
            mDot(D, .15);
            mDot(E, .15);

            if (this.mode == 1)
               return;

            color('red');
            mDot(mix(D, E, T), .15);
         }

         color(defaultPenColor);
         for (var n = 0 ; n < this.P.length ; n++)
            mDot([this.P[n].x,this.P[n].y], .15);
      });
   }
   this.T = 0.5;
   this.N = -2;
}
