function() {
   this.label = "fan";
   this.defaultTurnRate = 0;

   this.onSwipe[2] = ['spin\nright', function() { this.defaultTurnRate++; }];
   this.onSwipe[6] = ['spin\nleft' , function() { this.defaultTurnRate--; }];

   this.turnRate = 0;
   this.angle = 0;
   this.blades = makeSpline([[0,0],[ .8,.2],[ 1,0],[ .8,-.1],
                             [0,0],[-.8,.1],[-1,0],[-.8,-.2],[0,0]]);
   this.drawBlades = function() {
      color(backgroundColor);
      mFillCurve(this.blades);
      color(defaultPenColor);
      mCurve(this.blades);
      if (abs(this.turnRate) > 0.1) {
         _g.save();
         lineWidth(this.mScale(0.02));
         var smear = min(PI/4, this.turnRate);
         for (var i = 0 ; i < 3 ; i++) {
            var radius = 1 - .075 * i;
            var ds = i == 0 ? 0 : i == 1 ? 0.14 : 0.22;
            if (smear > 0) ds = -0.5 * ds;
            color(fadedColor(.25 - i * .05, this.colorId));
            mCurve(arc(0, 0, radius,      ds,      smear + ds, 5));
            mCurve(arc(0, 0, radius, PI + ds, PI + smear + ds, 5));
         }
         _g.restore();
      }
   }
   this.render = function(elapsed) {
      if (this.time === undefined)
         this.time = time;
      mClosedCurve([[0,.6],[.2,-1],[.1,-1.04],[0,-1.05],[-.1,-1.04],[-.2,-1]]);
      m.save();
      m.translate(0,.6,0);
      m.rotateZ(this.angle);
      mCurve(this.blades);
      this.afterSketch(function() {
         this.drawBlades();
         m.rotateZ(PI/2);
         this.drawBlades();
         this.turnRate = mix(this.turnRate, isDef(this.inValues[0])
                             ? this.inValues[0]
                             : this.defaultTurnRate, 3 * elapsed);
         this.angle -= 4 * this.turnRate * elapsed;
         this.extendBounds(arc(0, 0, 1, 0, TAU, 20));
      });
      m.restore();
   }
   this.output = function() {
      return this.angle;
   }
}
