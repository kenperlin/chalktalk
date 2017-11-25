function() {
   this.label = 'holospecs';
   this.is3D = true;
   this.displayMode = 0;
   this.onClick = ['next mode', function() { this.displayMode = (this.displayMode + 1) % 4; }];
   function curve1(x) { return [[x,.3],[x,-.3],[.2*x,-.3],[.1*x,.3]]; }
   function curve2(x) { return [[x,.3,-1.25],[x,.05,-1.55],
      [x,-.02,-1.6],
      [x,-.1,-1.6],[x,-.15,-1.55],
      [x,-.17,-1.475],
      [x,-.15,-1.4],[x,-.1,-1.34],
      [x,.05,-1.24],[x,.085,-1.185],[x,.1,-1.1]]; };
   this.render = function() {
      m.translate(0,0,.5);
      mLine([-1,.3],[1,.3]);
      for (var x = -1 ; x <= 1 ; x += 2) {
         var X = 1.1 * x;
         mCurve(curve1(x));
         this.afterSketch(function() {
            color(backgroundColor);
            mFillCurve(curve1(x));
            color(palette.color[this.colorId]);

            mLine([x,.3,0],[x,.3,-1.25]);
            mCurve([[x,.1,-1.1],[x,.1,-.6],[x,-.3,0]]);
            mCurve(curve2(x));
            color(backgroundColor);
            if (this.displayMode <= 2)
               mFillCurve([[x,-.3,0],[x,.3,0],[x,.3,-.6],[x,.1,-.6]]);
            mFillCurve([[x,.1,-.6],[x,.3,-.6],[x,.3,-1.25],[x,.1,-1.1]]);
            mFillCurve(curve2(x));
            var A0 = [x, .26,  0], A1 = [X, .26,-.1];
            var B0 = [x,-.26,  0], B1 = [X,-.16,-.1];
            var C0 = [x, .26,-.6], C1 = [X, .26,-.6];
            var D0 = [x, .15,-.6], D1 = [X, .15,-.6];
            var E0 = [x, .15, -1], E1 = [X, .15, -1];
            mFillCurve([A0,A1,B1,B0]);
            mFillCurve([B0,B1,D1,D0]);
            mFillCurve([D0,D1,E1,E0]);
            color(palette.color[this.colorId]);

            mCurve([[x,.26,-1],[X,.26,-1],[X,.15,-1],[x,.15,-1]]);
            mCurve([[x,.26,0],[x,.26,-1],[x,.15,-1],[x,.15,-.6],[x,-.26,0]]);
            mCurve([[X,.26,-.1],[X,.26,-1],[X,.15,-1],[X,.15,-.6],[X,-.16,-.1]]);
            mCurve([[x,.26,0],[X,.26,-.1],[X,-.16,-.1],[x,-.26,0]]);

            var lcdColor = this.displayMode == 0 ? backgroundColor : 'rgb(100,100,100)', n = -1;
            if (this.displayMode > 1) {
               n = floor((2 * time) % 3);
               if (this.displayMode > 2) {
                  var _C = isBlackBackground() ? 0 : 100;
                  var C = [_C,_C,_C];
                  C[n] = isBlackBackground() ? 32 : 255;
                  color('rgb(' + C[0] + ',' + C[1] + ',' + C[2] + ')');
                  mFillCurve([A0,A1,B1,B0]);
                  mFillCurve([A0,C0,D0,B0]);
                  mFillCurve([B0,B1,D1,D0]);
               }
               lcdColor = n==0 ? 'red' : n==1 ? 'green' : 'blue';
            }
            color(lcdColor);

            mFillCurve([C0,C1,D1,D0]);
            mFillCurve([[.95*x,.25,.01],[.95*x,-.25,.01],[.24*x,-.25,.01],[.16*x,.25,.01]]);
         });
      }
   }
}


