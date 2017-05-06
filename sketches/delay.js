function() {
   this.label = 'delay';
   this.setSketchText(0, '1', [0, 0], .3);

   this.defineInput(AT.Function(AT.Seconds, AT.AudioSample));
   this.defineInput(AT.Function(AT.Seconds, AT.Seconds));

   this.defineOutput(AT.Function(AT.Seconds, AT.AudioSample), function() {
      var input = def(this.inputs.value(0), function(t) { return 0; });
      var delay = def(this.inputs.value(1), 
         function(t) { return this.sketchTexts[0].value; }.bind(this));

      return function(t) {
         return input(t - delay(t));
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

