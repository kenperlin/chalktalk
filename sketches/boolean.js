
function() {
   this.label = "Boolean";
   this.state = true;
   this.onClick = function() { this.state = ! this.state; }
   this.render = function() {
      lineWidth(this.mScale(0.2));
      if (this.output().b) {
         mLine([  0,1],[ 0,-1]);
         mLine([-.9,1],[.9, 1]);
      }
      else {
         mCurve([[.7,1],[-.5,1],[-.5,-1]]);
         mLine([-.5, 0],[ .1,0]);
      }
   }
   this.output = function() {
      // TODO: move some of this type checking to infrastructure, shouldn't have to implement it
      // in the individual sketches.
      if (this.inValue[0] instanceof AT.Type) {
         if (this.inValue[0] instanceof AT.Bool) {
            return this.inValue[0];
         }
         else {
            let converted = this.inValue[0].convert("Bool");
            return (converted !== undefined) ? converted : new AT.Bool(this.state);
         }
      }
      else {
         return new AT.Bool(this.state);
      }
   }
}

