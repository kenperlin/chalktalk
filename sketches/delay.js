function() {
   this.label = 'delay';
   this._value = 1;
   this.useNumberMouseHandler();
   this.render = function() {
      mCurve([[-1,.7],[1,.7],[1,-.7],[-1,-.7]]);
      mLine([-1,.7],[-1,-.7]);
      this.afterSketch(function() {


         var inValue = this.inValue;
         var _value = this._value;

         var func = function() {
            var input = inValue[0];
            var delay = _value;

return function(t) {
   return valueOf(input, t - delay);
};
         };

         this.setOutPortValue(func());
         mNumberText(this._value, [0, 0], .3);
      });
   }
}

