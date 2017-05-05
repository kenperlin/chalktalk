function() {
   this.label = 'delay';
   this.setSketchText(0, '1', [0, 0], .3);

   this.defineInput(AT.Function(AT.Seconds, AT.AudioSample));
   this.defineInput(AT.Seconds);
   this.defineOutput(AT.Function(AT.Seconds, AT.AudioSample), function() {
      var input = this.inputs.value(0);
      var delay = def(this.inputs.value(1), this.sketchTexts[0].value);
      return function(t) {
         return valueOf(input, t - valueOf(delay, t));
      }
   });

   this.render = function() {
      mCurve([[-1,.7],[1,.7],[1,-.7],[-1,-.7]]);
      mLine([-1,.7],[-1,-.7]);
      this.afterSketch(function() {
         let hasControlInput = this.inputs.hasValue(1);
         this.sketchTexts[0].isVisible = !hasControlInput;
         if (hasControlInput) {
            mCurve(curveForSignal);
         }
      });
   }
}

