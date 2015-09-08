function() {
   this.label = 'mixer';
   this.render = function() {
      mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
      mLine([0,.5],[0,-.5]);
      mLine([-.5,0],[.5,0]);
   }
   this.output = function() {
      var inputs = this.inValue;
      return function(t) {
         var sum = 0;
         for (var i = 0 ; i < inputs.length ; i++)
	    if (inputs[i])
               sum += valueOf(inputs[i], t);
         return sum;
      };
   }
}

