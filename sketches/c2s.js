function C2S() {

   this.label = "c2s";

   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-1,-1,2,2,20,-PI/2,3*PI/2));
      });
   }

   this.createMesh = function() {
      return new THREE.Mesh(globeGeometry(80,40), this.shaderMaterial());
   }
}
C2S.prototype = new Sketch;
addSketchType("C2S");

