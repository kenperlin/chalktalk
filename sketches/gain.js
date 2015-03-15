function() {
   this.label = 'gain';
   this._value = 1;
   this.useNumberMouseHandler();
   this.render = function() {
      mCurve([[-1,1],[1,0,],[-1,-1]]);
      mLine([-1,1],[-1,-1]);
      this.afterSketch(function() {

         var srcInput = this.inValue[0];
         var srcGain  = this.inValue[1] !== undefined ? this.inValue[1] : this._value;

         var func = function() {
            var input = srcInput;
            var gain  = srcGain;

return function(t) {
   return valueOf(gain, t) * valueOf(input, t);
};
         };

         this.setOutPortValue(func());
	 if (this.inValue[1] === undefined)
            mLabel(this._value, [-.3, 0], .2);
         else
	    mCurve(curveForSignal);
      });
   }
}

