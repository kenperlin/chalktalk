function() {
   this.label = "airfoil";

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve( [[-1,0],[-.8,.2],[1,0]] );
         mCurve( [[-1,0],[1,0]] );
      });
      this.afterSketch(function() {
         if (this.mesh != null && this.airfoil === undefined) {
	    var airfoil = this.airfoil = this.mesh.addNode();
            airfoil.addCylinder(16).getMatrix().rotateZ(PI/2).rotateX(-PI/2).scale(.1,12,1);
            var shape = airfoil.children[0].geometry;
            var vertices = shape.vertices;
            for (var i = 0 ; i < vertices.length ; i++) {
               var v = vertices[i];
	       v.x -= .6 * (v.z + 1) * (v.z - 1);
	       v.x += v.z * (v.x + .5);
            }
            shape.computeVertexNormals();
            airfoil.setMaterial(new THREE.MeshPhongMaterial());
            airfoil.material.color = airfoil.material.emissive = new THREE.Color(0x404040);
	 }
      });
   }

   this.createMesh = function() {
      return new THREE.Mesh();
   }
}
