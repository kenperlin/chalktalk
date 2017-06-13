function() {
   this.label = 'scope';
   this.setSketchText(0, '1', [0,-.8],.1);

   this.defineInput(AT.Function(AT.Seconds, AT.Float));

   this.render = function() {
      mClosedCurve([[-1,1],[1,1],[1,-1],[-1,-1]]);
      this.duringSketch(function() {
         mCurve(curveForSignal);
      });
      this.afterSketch(function() {
         if (!this.inputs.hasValue(0)) {
            mCurve(curveForSignal);
         }
         else {
            var func = this.inputs.value(0);
            var freq = this.sketchTexts[0].value;

            var curve = [];
            var eps = 0.01;
            var T = floor(time * freq);
            for (var t = 0 ; t <= 1 + eps/2 ; t += eps)
               curve.push([2 * t - 1, max(-1,min(1,func((T + t) / freq)))]);

            lineWidth(0.75);
            mCurve(curve);
         }

         textHeight(this.mScale(.17));
         mText("freq:", [-.95,-.8],0,.5);
      });
   }
}
