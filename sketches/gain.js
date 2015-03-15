function() {
   this.label = 'gain';
   this._value = 1;
   this.useNumberMouseHandler();
   this.render = function() {
      mCurve([[-1,1],[1,0,],[-1,-1]]);
      mLine([-1,1],[-1,-1]);
      this.afterSketch(function() {

         var inValue = this.inValue;
         var _value = this._value;

         var func = function() {
            var input = inValue[0];
            var gain = _value;

return function(t) {
   return gain * valueOf(input, t);
};
         };

         this.setOutPortValue(func());
         mNumberText(this._value, [-.3, 0], .2);
      });
   }
}

