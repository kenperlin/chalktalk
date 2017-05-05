function() {
   this.label = 'gain';
   this.setSketchText(0, '1', [-.3, 0], .2);

   this.defineInput(AT.Function(AT.Seconds, AT.AudioSample));
   this.defineInput(AT.Function(AT.Seconds, AT.Float));

   this.defineOutput(AT.Function(AT.Seconds, AT.AudioSample), function() {
      var input = this.inputs.value(0);
      var gain  = def(this.inputs.value(1), this.sketchTexts[0].value);
      return function(t) {
         return valueOf(gain, t) * valueOf(input, t);
      };
   });

   this.render = function() {
      mCurve([[-1,1],[1,0,],[-1,-1]]);
      mLine([-1,1],[-1,-1]);
      this.afterSketch(function() {
         let hasControlInput = this.inputs.hasValue(1);
         this.sketchTexts[0].isVisible = !hasControlInput;
         if (hasControlInput) {
            m.translate(-.3, 0, 0);
            mCurve(curveForSignal);
         }
      });
   }
}

