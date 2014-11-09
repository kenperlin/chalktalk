function C2S() {
   this.labels = "c2s".split(' ');

   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-1,-1,2,2,20,-PI/2,3*PI/2));
      });
      //this.setUniform('ambient', [.2,0,0]);
      //this.setUniform('diffuse', [.5,0,0]);
   }
   this.createMesh = function() {
      return new THREE.Mesh(globeGeometry(40,20), this.shaderMaterial());
   }
}
C2S.prototype = new SketchTo3D;
addSketchType("C2S");

