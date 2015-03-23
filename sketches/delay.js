function() {
   this.label = 'delay';
   this._value = 1;
   this.setSketchText(0, '1', [0, 0], .3);

   this.render = function() {

      mCurve([[-1,.7],[1,.7],[1,-.7],[-1,-.7]]);
      mLine([-1,.7],[-1,-.7]);
      this.afterSketch(function() {

         var srcInput = this.inValue[0];
         var srcDelay = def(this.inValue[1], this.sketchTexts[0].value);

         var func = function() {
            var input = srcInput;
            var delay = srcDelay;

return function(t) {
   return valueOf(input, t - valueOf(delay, t));
};
         };

         this.setOutPortValue(func());

         if (!(this.sketchTexts[0].isVisible = this.inValue[1]===undefined))
	    mCurve(curveForSignal);
      });
   }
}

