function() {
   this.label = "newsketchstub"

   this.setup = function() {
   };

   this.render = function(elapsed) {
      m.save();
         m.translate(0.2, -0.2, 0);
         mDrawOval([-1 * 0.4, -1 * 0.4],[1 * 0.4, 1 * 0.4], 36, PI/2, PI/2-TAU);
      m.restore();
/*TODO...curveQuarter*/
/*TODO...curveQuarter*/

      this.duringSketch(function() {
         /*TODO*/
      });

      this.afterSketch(function() {
         /*TODO*/
      });

   };

   this.output = function() {
      /*TODO*/
   };

}
