function() {
   this.label = "mistmat";
   this.isRolled = false;

   this.onSwipe = function(dx, dy) {
      switch (pieMenuIndex(dx, dy)) {
      case 2: this.isRolled = true; break;
      case 0: this.isRolled = false; break;
      }
   }

   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve( [[-1.5,0],[-1.4,0],[-1.3,0]] );
         mCurve( [[-1.5,0],[1.5,0]] );
      });
      this.afterSketch(function() {
         if (this.mesh != null) {
	    var dx = 0.01;
	    if (this.mistmat === undefined) {
	       this.mistmat = this.mesh.addNode();
	       this.mistmat.getMatrix().perspective(0, 0, -20);

               var head = this.mistmat.addCylinder(16);
	       head.getMatrix().translate(-1.5+.1,.002,0).rotateZ(PI/2).rotateX(-PI/2).scale(.01,1.2-.001,.1);
               var shape = head.geometry;
               var vertices = shape.vertices;
               for (var i = 0 ; i < vertices.length ; i++) {
                  var v = vertices[i];
	          v.x = v.x < 0 ? 0 : v.x - .6 * (v.z + 1) * (v.z - 1);
               }
               //shape.computeCentroids();
               shape.computeVertexNormals();
               head.setMaterial(new THREE.MeshPhongMaterial());
               head.material.color = head.material.emissive = new THREE.Color(0x404040);

               var bodyMaterial = new THREE.MeshPhongMaterial();
               bodyMaterial.color = new THREE.Color(0x202020);
               bodyMaterial.emissive = new THREE.Color(0x000000);
               bodyMaterial.ambient = new THREE.Color(0x808080);
  
               this.body = this.mistmat.addNode();
	       this.body.getMatrix().translate(-1.5 - dx, 0, 0);
	       var joint = this.body;
	       for (var x = -1.5 ; x < 1.5 ; x += dx)
	          joint = joint.addNode();

	       joint = this.body;
	       for (var x = -1.5 ; x < 1.5 ; x += dx) {
	          joint = joint.children[0];
                  var slat = joint.addCube();
                  slat.getMatrix().translate(dx/2, 0, 0).scale(dx/2,.007,1.2);
                  slat.setMaterial(bodyMaterial);
	       }
            }
	    if (this.rollValue === undefined)
	       this.rollValue = 0;
	    this.rollValue = this.isRolled ? min(1, this.rollValue + elapsed)
	                                   : max(0, this.rollValue - elapsed);
	    var rolled = sCurve(this.rollValue);
            var x0 = mix(1.5, -1.3, rolled);
	    var joint = this.body;
	    for (var x = -1.5 ; x < 1.5 ; x += dx) {
	       joint = joint.children[0];
	       var t = (1.5 - x) / (1.5 - x0);
	       joint.getMatrix().identity().translate(dx, 0, 0).rotateZ(x < x0 ? 0 : 7 / (.5 + sqrt(t) / dx) / rolled);
	    }
	 }
      });
   }

   this.createMesh = function() { return new THREE.Mesh(); }
}
