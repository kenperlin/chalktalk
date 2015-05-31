function() {
   this.label = "cyl";

   this.render = function() {
      this.duringSketch(function() {
         mCurve([ [1,-1],[1,1],[-1,1],[-1,-1],[1,-1] ]);
      });
   }
   this.createMesh = function() {
      return new THREE.Mesh(cylinderGeometry(32), this.shaderMaterial());
   }
}
