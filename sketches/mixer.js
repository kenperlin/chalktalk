function() {
   this.label = 'mixer';
   this.render = function() {
      mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
      mLine([0,.5],[0,-.5]);
      mLine([-.5,0],[.5,0]);
   }
   this.defineAllRemainingInputs(AT.Function(AT.Seconds, AT.AudioSample));
   this.defineOutput(AT.Function(AT.Seconds, AT.AudioSample), function() {
      return function(t) {
         var sum = 0;
         for (var i = 0 ; i < this.inputs.numPorts(); i++) {
            if (this.inputs.hasValue(i)) {
               sum += valueOf(this.inputs.value(i), t);
            }
         }
         return sum;
      };
   });
}

