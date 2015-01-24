function Lathe() {
   this.label = "lathe";
   var nRows = 40;
   var nCols = 32;

   this.computeStatistics = function() {
      var bounds = computeCurveBounds(this.sketchTrace[0]);
      var axisX = (bounds[0] + bounds[2]) / 2;
      var axisY = (bounds[1] + bounds[3]) / 2;
      var axisR = (bounds[3] - bounds[1]) / 2;

      this.profile = [];
      for (var i = 0 ; i < this.sketchTrace[3].length ; i++)
         this.profile.push([(this.sketchTrace[3][i][0] - axisX) / axisR,
                            (axisY - this.sketchTrace[3][i][1]) / axisR]);
   }

   this.render = function() {
      this.duringSketch(function() {
         mLine([0,1],[0,-1]);
         mLine([0,-1],[-1,-1]);
         mLine([0,-1],[1,-1]);
         mLine([.5,1],[.5,-1]);
	 if (this.xyz.length == 3)
	    this.trace[3] = this.sketchTrace[3];
      });
   }

   this.createMesh = function() {
      var P = this.profile, nP = P.length;
      var material = this.shaderMaterial();

      var points = [];
      points.push(newVec(0         ,0,P[nP-1][1]));
      points.push(newVec(P[nP-1][0],0,P[nP-1][1]));
      for (var i = nP-1 ; i >= 0 ; i--)
         points.push(newVec(P[i][0], 0, P[i][1]));
      points.push(newVec(P[0][0],0,P[0][1]));
      points.push(newVec(0      ,0,P[0][1]));

      var lathe = new THREE.Mesh(new THREE.LatheGeometry(points, nCols), material);

      var mesh = new THREE.Mesh();
      mesh.add(lathe);
      lathe.rotation.x = -PI / 2;
      mesh.material = material;
      return mesh;
   }
}
Lathe.prototype = new Sketch;
addSketchType("Lathe");

