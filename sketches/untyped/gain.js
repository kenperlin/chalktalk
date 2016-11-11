function() {
   this.label = 'gain';
   this.setSketchText(0, '1', [-.3, 0], .2);

   this.render = function() {
      mCurve([[-1,1],[1,0,],[-1,-1]]);
      mLine([-1,1],[-1,-1]);
      this.afterSketch(function() {
         if (! (this.sketchTexts[0].isVisible = this.inValue[1] === undefined)) {
            m.translate(-.3, 0, 0);
            mCurve(curveForSignal);
         }
      });
   }

   this.output = function() {
      var input = this.inValue[0];
      var gain  = def(this.inValue[1], this.sketchTexts[0].value);
      return function(t) {
         return valueOf(gain, t) * valueOf(input, t);
      };
   }
}

