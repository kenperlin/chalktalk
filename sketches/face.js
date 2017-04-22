function() {
   this.label = 'face';
   this.is3D = true;
   this.mode = 0;
   this.isNeutral = false;
   this.isAnimated = false;
   this.state = [0,0,0,0,0,0,0,0,0,0,0,0];
   this.onCmdClick = function() { this.isAnimated = ! this.isAnimated; }
   this.onClick = ['open eyes', function() { this.isNeutral = ! this.isNeutral; }]
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

      var a = -1, d = 0, e = -1, h = 0, i = 0, o = 0,
          s = -1, u = 0, v =  0, x = 0, y = 0, z = 0;
      this.afterSketch(function() {

         if (! this.isAnimated && ! this.isNeutral)
            this.startTime = undefined;

         if (this.isInValueAt(0)) {
            a = def(this.inValues[ 0], a);
            d = def(this.inValues[ 1], d);
            e = def(this.inValues[ 2], e);
            h = def(this.inValues[ 3], h);
            i = def(this.inValues[ 4], i);
            o = def(this.inValues[ 5], o);
            s = def(this.inValues[ 6], s);
            u = def(this.inValues[ 7], u);
            v = def(this.inValues[ 8], v);
            x = def(this.inValues[ 9], x);
            y = def(this.inValues[10], y);
            z = def(this.inValues[11], z);
         }
         else if (this.isNeutral) {
            if (this.startTime === undefined)
               this.startTime = time;

            var t = time - this.startTime;
            var _t = min(1, t / 0.5);
            e = mix(e, .2, _t);
            s = mix(s,  0, _t);
	 }
         else if (this.isAnimated) {
            if (this.startTime === undefined)
               this.startTime = time;

            var t = time - this.startTime;
            a = _noise(t * 3  +  10.1);
            d = _noise(t      +  20.2);
            e = _noise(t      +  30.3);
            h = _noise(t      +  40.4);
            i = _noise(t      +  50.5);
            o = _noise(t      +  60.6);
            s = _noise(t      +  70.7);
            u = _noise(t / 2  +  80.8);
            v = _noise(t / 2  +  90.8);
            x = _noise(t      + 100.9);
            y = _noise(t      + 110.0);
            z = _noise(t      + 120.1);
         }
      });
      var A = max(0, (.5 + .5*a) * .15 - .05);       // Ah
      var D = .07 * d;                               // Dominant
      var E = .1  * (.5 + .5 * e);                   // Eyes open
      var H = .07 * h;                               // Happy
      var I = .05 * i;                               // Interest
      var O = .1  * o;                               // Ooh
      var S = .06 * gain(bias(.5 + .5 * s, .1), .9); // Sneer
      var U = .2  * sgain(u, .99);                   // Up gaze
      var V = .4  * sgain(v, .99);                   // Veer gaze
      var X = .3  * x;                               // X rotate
      var Y = .5  * y;                               // Y rotate
      var Z = .1  * z;                               // Z rotate

      this.extendBounds([[-1.1,-.8],[1.1,.6]]);

      m.translate(0,-2,0);
      m.rotateX(X);
      m.rotateY(Y);
      m.rotateZ(Z);
      m.translate(0, 2,0);

      if (this.glyphTransition == 1)
         this.afterSketch(function() {
            for (var sign = -1 ; sign <= 1 ; sign += 2) {
               m.save();
               m.translate(sign * .35,.22,.6);
               m.rotateY(V);
               m.rotateX(U-2*I);
               color('rgb(116,116,116)');
               mDot([0,0,-.11],.4);
               color('black');
               mDot([0,0,-.1],.23);
               m.restore();
            }
         });

      lineWidth(2);

      for (var sign = -1 ; sign <= 1 ; sign += 2) {
         var _a = p(sign * .57, .22, .9),
             _b = p(sign * .38, .22-E+I, .95),
             _c = p(sign * .23, .22, .9);
         var C = makeSpline(sign == -1 ? [_a,_b,_c] : [_c,_b,_a]);
         this.afterSketch(function() {
            color(backgroundColor);
            var n = C.length - 1;
            mFillCurve([ [C[n][0]+.23,C[n][1]   ,C[n][2]],
                         [C[n][0]+.23,C[n][1]-.3,C[n][2]],
                         [C[0][0]-.23,C[0][1]-.3,C[0][2]],
                         [C[0][0]-.23,C[0][1]   ,C[0][2]],
                       ].concat(C));
            color(palette.color[this.colorId]);
         });
         mCurve(C);

         this.afterSketch(function() {
            var _a = p(sign * .57, .22, .9),
                _b = p(sign * .38, .22+E+I, .95),
                _c = p(sign * .23, .22, .9);
            var C = makeSpline(sign == -1 ? [_a,_b,_c] : [_c,_b,_a]);
            color(backgroundColor);
            var n = C.length - 1;
            mFillCurve([ [C[n][0]+.23,C[n][1]   ,C[n][2]],
                         [C[n][0]+.23,C[n][1]+.3,C[n][2]],
                         [C[0][0]-.23,C[0][1]+.3,C[0][2]],
                         [C[0][0]-.23,C[0][1]   ,C[0][2]],
                       ].concat(C));
            color(palette.color[this.colorId]);
            mCurve(C);
         });
      }

      lineWidth(1);

      mSpline([p(-.20 + O  , -.45 + H    ),
               p(-.08 + O/2, -.45 - A*.75),
               p( .08 - O/2, -.45 - A*.75),
               p( .20 - O  , -.45 + H    )]);

      this.afterSketch(function() {

         lineWidth(2);

         mSpline([p(-.55,.4), p(-.4,.4+(E+I)*.4-D), p(-.25,.4-D*1.5)]);
         mSpline([p( .55,.4), p( .4,.4+(E+I)*.4-D), p( .25,.4-D*1.5)]);

         lineWidth(1);

         mSpline([p(-.1,-.2), p(0,-.2,1.05), p(.1,-.2)]);

         mSpline([p(-.20 + O      , -.45 + H        ),
                  p(-.08 + O/2 - S, -.45 + A*.75 + S),
                  p( .08 - O/2 + S, -.45 + A*.75 + S),
                  p( .20 - O      , -.45 + H        )]);

         this.state = [a,d,e,h,i,o,s,u,v,x,y,z];
      });
   }

   this.output = function() { return this.state; }
}

