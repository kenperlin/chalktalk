function() {
   this.label = "bulb";
   this.light = 0;

   this.onSwipe[0] = ['next\ncolor' , function() { this.setColorId((this.colorId + 1) % palette.color.length); }];
   this.onSwipe[2] = ['turn\non'    , function() { this.light = 1; }];
   this.onSwipe[4] = ['prev.\ncolor', function() { this.setColorId((this.colorId + palette.color.length - 1) % palette.color.length); }];
   this.onSwipe[6] = ['turn\noff'   , function() { this.light = 0; }];

   var S = makeSpline([[-.5,-1.6],[-.55,-1],[-.7,-.7],[-.95,0],[-.7,.7],
                       [0,1],
                       [.7,.7],[.95,0],[.7,-.7],[.55,-1],[.5,-1.6]]);

   var A = [
         [-.3,-2.2],[-.45,-2.2],
         [-.5,-2.15],[-.5,-2.05],[-.45,-2.0],
         [-.5,-1.95],[-.5,-1.85],[-.45,-1.8],
         [-.5,-1.75],[-.5,-1.65],[-.45,-1.6],
      ];

    var B = [
         [.45,-1.6],[.5,-1.65],[.5,-1.75],
         [.45,-1.8],[.5,-1.85],[.5,-1.95],
         [.45,-2.0],[.5,-2.05],[.5,-2.15],
         [.45,-2.2],[.3,-2.2],
      ];

   var C = makeOval(-.3,-2.5,.6,.6,10,2*PI,PI);

   this.render = function(elapsed) {
      var light = this.getInValue(0, this.light);

      this.duringSketch(function() {
         mCurve(A.concat(S.concat(B)));
      });

      this.afterSketch(function() {
         color(palette.color[this.colorId]);
         mCurve(S);

         color(fadedColor(mix(.03, 1, pow(light, 3)), this.colorId));
         mFillCurve(S);

         lineWidth(1);
         color(defaultPenColor);
         mCurve(A);
         mCurve(B);
      });

      lineWidth(1);
      color(defaultPenColor);
      mCurve(C);
   }

   this.output = function() { return this.getInValue(0, this.light); }
}

