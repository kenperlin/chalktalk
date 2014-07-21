
function Adder() {
   this.labels = "adder".split(' ');
   this.xin = 0;
   this.yin = 0;

   this.render = function() {
      m.save();

      mCurve([[-.5,.5],[.5,.5],[.5,-.5],[-.5,-.5],[-.5,.5]]);
      mCurve([[0,.3],[0,-.3]]);
      mCurve([[-.3,0],[.3,0]]);

      this.afterSketch(function() {
         if (this.portLocation.length == 0) {
            this.addPort("x", -.5,.3);
            this.addPort("y", -.5,-.3);
            this.addPort("o", .5,0);
         }
      });

      if (this.isInValue("x"))
         this.xin = this.getInFloat("x");

      if (this.isInValue("y"))
         this.yin = this.getInFloat("y");

      this.setOutValue('o', this.xin + this.yin);

      m.restore();
   }
}
Adder.prototype = new Sketch;
