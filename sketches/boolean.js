
function() {
   this.label = "Boolean";
   this.state = true;
   this.onClick = ['toggle T/F', function() { this.state = ! this.state; }];
   this.render = function() {
      lineWidth(this.mScale(0.2));
      if (this.output()) {
         mLine([  0,1],[ 0,-1]);
         mLine([-.9,1],[.9, 1]);
      }
      else {
         mCurve([[.7,1],[-.5,1],[-.5,-1]]);
         mLine([-.5, 0],[ .1,0]);
      }
   }
   this.output = function() { return def(this.inValue[0], this.state) > 0 ? 1 : 0; }
}

