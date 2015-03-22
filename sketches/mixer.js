function() {
   this.label = 'mixer';
   this.render = function() {
      mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
      mLine([0,.5],[0,-.5]);
      mLine([-.5,0],[.5,0]);
      this.afterSketch(function() {
         var inValue = this.inValue;
         var func = function() {
            var inputs = [];
            for (var i = 0 ; i < inValue.length ; i++)
               inputs.push(inValue[i]);

return function(t) {
   var sum = 0;
   for (var i = 0 ; i < inputs.length ; i++)
      sum += valueOf(inputs[i], t);
   return sum;
};

         };
         this.setOutPortValue(func());
      });
   }
}
