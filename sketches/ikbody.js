function() {
   this.label = "ikbody";
   this.ikBody = new IKBody(ik_data);

   this.render = function() {
      this.code = [];
      this.duringSketch(function() {
         mLine([-1,.5],[  1,.5]);
         mLine([ 0, 1],[  0, 0]);
         mLine([ 0, 0],[-.5,-1]);
         mLine([ 0, 0],[ .5,-1]);
      });
      this.afterSketch(function() {
         this.ikBody.render(time);
      });
   }
   this.createMesh = function() {
      return this.ikBody.mesh;
   }
}
