function() {
   this.label = "lathe";

   this.computeStatistics = function() {

      // GET STATISTICS ON POSITION AND SIZE OF CENTRAL AXIS (1ST STROKE).

      var bounds = computeCurveBounds(this.sketchTrace[0]);
      var axisX = (bounds[0] + bounds[2]) / 2;
      var axisY = (bounds[1] + bounds[3]) / 2;
      var axisR = (bounds[3] - bounds[1]) / 2;

      // USE AXIS INFO TO CONVERT 4TH STROKE INTO A PROFILE.

      this.profile = [];
      var stroke = this.sketchTrace[3];
      for (var i = 0 ; i < stroke.length ; i++)
         this.profile.push( newVec3( (stroke[i][0]-axisX) / axisR, 0, -(stroke[i][1]-axisY) / axisR ) );
   }

   this.render = function() {
      this.duringSketch(function() {
         mLine([0,1],[0,-1]);
         mLine([0,-1],[-1,-1]);
         mLine([0,-1],[1,-1]);
         mLine([.5,1],[.5,-1]);

	 // MORPH TO THE PROFILE THAT THE USER DREW, NOT TO THE GLYPH VERSION.

	 if (this.xyz.length == 3)
	    this.trace[3] = this.sketchTrace[3];
      });
   }

   this.createMesh = function() {
      var P = this.profile;

      // SHOULD WE BUILD A TORUS?

      var zMin = 10000, zMax = -10000;
      for (var i = 0 ; i < P.length ; i++) {
         zMin = min(zMin, P[i].z);
         zMax = max(zMax, P[i].z);
      }
      var isTorus = P[0].z > zMin && P[P.length-1].z < zMax;

      // BUILD POINTS ARRAY BACK TO FRONT, SO LATHE ISN'T EVERTED.  ADD END CAPS.

      var points = [];
      if (isTorus)
         points.push(P[0]);
      else
         points.push(newVec3(0,0,P[P.length-1].z));
      for (var i = P.length-1 ; i >= 0 ; i--)
         points.push(P[i]);
      if (! isTorus)
         points.push(newVec3(0,0,P[0].z));

      var material = this.shaderMaterial();
      var lathe = new THREE.Mesh(new THREE.LatheGeometry(points, 32), material);

      // ROTATE LATHE SO THAT ITS Z AXIS ALIGNS WITH THE GLOBAL Y AXIS.

      var mesh = new THREE.Mesh();
      mesh.add(lathe);
      lathe.rotation.x = -PI / 2;
      mesh.material = material;
      return mesh;
   }
}
