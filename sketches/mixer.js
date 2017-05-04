function() {
   this.label = 'mixer';
   this.render = function() {
      mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
      mLine([0,.5],[0,-.5]);
      mLine([-.5,0],[.5,0]);
   }
   this.defineAllRemainingInputs(AT.Function(AT.Seconds, AT.AudioSample));
   this.defineOutput(AT.Function(AT.Seconds, AT.AudioSample), function() {
      let mixer = this;
      return function(t) {
         var sum = 0;
         for (var i = 0 ; i < mixer.inputs.numPorts(); i++) {
            if (mixer.inputs.hasValue(i)) {
               sum += valueOf(mixer.inputs.value(i), t);
            }
         }
         return sum;
      };
   });
}

