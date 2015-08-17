function() {
   this.label = "lathe";

   this.computeStatistics = function() {

      // GET STATISTICS ON POSITION AND SIZE OF CENTRAL AXIS (1ST STROKE).

      var axisX = this.size * S(0).x;
      var axisY = this.size * S(0).y;
      var axisR = this.size * S(0).height / 2;

      // USE AXIS INFO TO CONVERT 4TH STROKE INTO A PROFILE.

      console.log("computing this.profile");

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
      this.afterSketch(function() {
         if (typeof this.inValue[0] == 'function') {
            if (this.mesh !== undefined)
               root.remove(this.mesh);
            delete this.mesh;
            this.code = null;
         }
      });
   }

   this.inputIsFunction = function() {
      return typeof this.inValue[0] == 'function';
   }

   this.profileCurve = function() {
      if (this.inputIsFunction()) {
         var f = this.inValue[0], P = [], p, t;
         for (t = 0 ; t < 1.001 ; t += 0.01) {
            p = f(min(t, 0.999));
            P.push(newVec3(1+p[0],p[2],p[1]));
         }
         return P;
      }
      else
         return this.profile;
   }

   this.createMesh = function() {
      var P = this.profileCurve();
      var isTorus = false;
      var isLoop = P[0].distanceTo(P[P.length-1]) < 0.01;
      if (isLoop)
         P[P.length-1].copy(P[0]);

      if (! isLoop && ! this.inputIsFunction()) {
         var zMin = 10000, zMax = -10000;
         for (var i = 0 ; i < P.length ; i++) {
            zMin = min(zMin, P[i].z);
            zMax = max(zMax, P[i].z);
         }
         isTorus = P[0].z > zMin && P[P.length-1].z < zMax;
      }

      // BUILD POINTS ARRAY BACK TO FRONT, SO LATHE ISN'T EVERTED.  ADD END CAPS.

      var points = [];

      if (! isLoop)
         points.push(isTorus ? P[0] : newVec3(0,0,P[P.length-1].z));

      for (var i = P.length-1 ; i >= 0 ; i--)
         points.push(P[i]);

      if (! isLoop && ! isTorus)
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
