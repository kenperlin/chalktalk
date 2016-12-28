function() {
   this.label = 'delay';
   this.setSketchText(0, '1', [0, 0], .3);

   this.render = function() {
      mCurve([[-1,.7],[1,.7],[1,-.7],[-1,-.7]]);
      mLine([-1,.7],[-1,-.7]);
      this.afterSketch(function() {
         if (! (this.sketchTexts[0].isVisible = this.inValue_DEPRECATED_PORT_SYSTEM[1] === undefined))
            mCurve(curveForSignal);
      });
   }

   this.output = function() {
      var input = this.inValue_DEPRECATED_PORT_SYSTEM[0];
      var delay = def(this.inValue_DEPRECATED_PORT_SYSTEM[1], this.sketchTexts[0].value);
      return function(t) {
         return valueOf(input, t - valueOf(delay, t));
      }
   }
}

