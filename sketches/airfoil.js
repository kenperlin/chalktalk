function Airfoil() {
   this.labels = "airfoil".split(' ');

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve( [[-1,0],[-.8,.2],[1,0]] );
         mCurve( [[-1,0],[1,0]] );
      });
   }

   this.createMesh = function() {
      var airfoil = new THREE.Mesh();
      airfoil.addCylinder(16).getMatrix().rotateZ(PI/2).rotateX(-PI/2).scale(.1,2,1);
      var shape = airfoil.children[0].geometry;
      var vertices = shape.vertices;
      for (var i = 0 ; i < vertices.length ; i++) {
         var v = vertices[i];
	 v.x -= .6 * (v.z + 1) * (v.z - 1);
	 v.x += v.z * (v.x + .5);
      }
      shape.computeCentroids();
      shape.computeVertexNormals();
/*
      var normals = shape.attributes["normal"].array;
      for (var i = 0 ; i < vertices.length ; i++) {
         var v = vertices[i];
	 if (v.y == -1) {
	    normals[3 * i    ] =  0;
	    normals[3 * i + 1] = -1;
	    normals[3 * i + 2] =  0;
	 }
	 else if (v.y == 1) {
	    normals[3 * i    ] =  0;
	    normals[3 * i + 1] =  1;
	    normals[3 * i + 2] =  0;
	 }
      }
*/
      airfoil.setMaterial(new THREE.MeshPhongMaterial());
      airfoil.material.color = airfoil.material.emissive = new THREE.Color(0x202020);
      return airfoil;
   }
}
Airfoil.prototype = new Sketch;
addSketchType("Airfoil");


