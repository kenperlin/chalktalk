function Hypershape() {
   this.labels = ['pentatope', 'hypercube', 'aerochoron', 'octaplex'];
   this.is3D = true;

   var trackball = new Trackball(4);
   var mode = 0;

   var T0 = newVec();
   this.onCmdClick = function() {
      mode++;
   }
   this.onClick = function() {
      trackball.identity();
   }
   this.onPress = function(T1) {
      T0.copy(T1);
   }
   this.onDrag = function(T1) {
      trackball.rotate( [T0.x,T0.y,T0.z,1], [T1.x,T1.y,T1.z,1] );
      T0.copy(T1);
   }

   function _bit(n, b) { return n >> b & 1; }
   function bit(n, b) { return n >> b & 1 ? 1 : -1; }
   var C = [];
   for (var n = 0 ; n < 16 ; n++)
      C.push([ bit(n, 0), bit(n, 1), bit(n, 2), bit(n, 3) ]);

   var A = [];
   for (var n = 0 ; n < 8 ; n++) {
      var axis = floor(n/2);
      A.push([ axis==0 ? bit(n  , 0) : 0, axis==1 ? bit(n-2, 0) : 0,
               axis==2 ? bit(n-4, 0) : 0, axis==3 ? bit(n-6, 0) : 0 ]);
   }

   var r5 = sqrt(5);
   var S = [
      [ 1,-1,-1, -1/r5],
      [-1, 1,-1, -1/r5],
      [-1,-1, 1, -1/r5],
      [ 1, 1, 1, -1/r5],
      [ 0, 0, 0, r5 - 1/r5],
   ];

   var V = [];
   for (var n = 0 ; n < 24 ; n++)
      V.push([0,0,0,0]);

   var P = [];
   for (var n = 0 ; n < 24 ; n++)
       P.push(newVec());

   var tmp = [0,0,0,0];
   function project(a, b) {
      trackball.transform(a, tmp);
      var s = .9 + .1 * tmp[3];
      b.set(s * tmp[0], s * tmp[1], s * tmp[2]);
   }

   this.placeVertex = function(n, pt) {
      project(pt, P[n]);
      var vertex = this.mesh.children[n];
      vertex.position.copy(P[n]);
      vertex.scale.set(.1,.1,.1);
      this.extendBounds([[P[n].x,P[n].y,P[n].z]]);
   }

   this.placeEdge = function(n, a, b) {
      var edge = this.mesh.children[n];
      edge.position.copy(a).lerp(b, 0.5);
      edge.lookAt(b);
      edge.scale.z = a.distanceTo(b) / 2;
   }

   var edges = [ [0,2,4,6,8,10,12,14],
                 [0,1,4,5,8, 9,12,13],
                 [0,1,2,3,8, 9,10,11],
                 [0,1,2,3,4, 5, 6, 7] ];

   this.render = function() {
      this.code = null;
      switch (this.labels[this.selection]) {

      case 'pentatope':
         if (this.glyphTransition < 1) {
            mClosedCurve([[-.85,-.85], [.85,-.85], [.85,.85], [-.85,.85]]);
            mCurve([[-.85,.85], [.85,-.85]]);
            mCurve([[.85,.85], [-.85,-.85]]);
	    this.extendBounds([[-1,-1],[1,1]]);
         }
	 this.afterSketch(function() {
            var n = 0;
	    for ( ; n < S.length ; n++)
	       this.placeVertex(n, S[n]);
	    for (var i = 0   ; i < 4 ; i++)
	    for (var j = i+1 ; j < 5 ; j++)
	       this.placeEdge(n++, P[i], P[j]);
	 });
         break;

      case 'hypercube':
         if (this.glyphTransition < 1) {
            mClosedCurve([[-1 ,-1 ],[1 ,-1 ],[1 ,1 ],[-1 ,1 ]]);
            mClosedCurve([[-.8,-.8],[.8,-.8],[.8,.8],[-.8,.8]]);
         }
         this.afterSketch(function() {
            var n = 0;
            for ( ; n < 16 ; n++)
               this.placeVertex(n, C[n]);
            for (var axis = 0 ; axis < 4 ; axis++)
               for (var i = 0 ; i < 8 ; i++) {
                  var j = edges[axis][i];
                  this.placeEdge(n++, P[j], P[j + (1<<axis)]);
               }
         });
         break;

      case 'aerochoron':
         if (this.glyphTransition < 1) {
            mClosedCurve([[0,-1],[1,0],[0,1],[-1,0]]);
            mLine([0,1],[0,-1]);
            mLine([-1,0],[1,0]);
         }
	 this.afterSketch(function() {
            for (var n = 0 ; n < 8 ; n++)
               this.placeVertex(n, A[n]);
	    for (var i = 0   ; i < 4 ; i++)
	    for (var j = i+1 ; j < 4 ; j++)
	    for (var k = 0   ; k < 4 ; k++)
	       this.placeEdge(n++, P[2*i + _bit(k,0)], P[2*j + _bit(k,1)]);
	 });
         break;

      case 'octaplex':
         if (this.glyphTransition < 1) {
            mClosedCurve([[-1, -1],[1, -1],[1, 1],[-1, 1]]);
            mClosedCurve([[0,-1],[1,0],[0,1],[-1,0]]);
         }
	 this.afterSketch(function() {
	    function edgeColor(a, b) {
	       var x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2], w = a[3] - b[3];
	       var dd = x * x + y * y + z * z + w * w;
	       if (! (dd > 1.99 && dd < 2.01))
	          return -1;
               switch (mode % 3) {
	       case 0:
	          return 0;
	       case 1:
                  if (a[0] != 0 && x == 0) return 1;
                  if (a[1] != 0 && y == 0) return 2;
                  if (a[2] != 0 && z == 0) return 3;
                  if (a[3] != 0 && w == 0) return 4;
		  break;
               case 2:
	          for (var i = 0 ; i < 4 ; i++)
	             if (a[i] == 0 && b[i] == 0)
		        return i + 1;
		  break;
	       }
	    }
	    var n = 0;
	    for (var i = 0   ; i < 4 ; i++)
	    for (var j = i+1 ; j < 4 ; j++)
	    for (var k = 0   ; k < 4 ; k++) {
	       var v = V[n];
	       v[0] = v[1] = v[2] = v[3] = 0;
	       v[i] = bit(k, 0);
	       v[j] = bit(k, 1);
	       this.placeVertex(n++, v);
	    }
	    for (var i = 0   ; i < 23 ; i++)
	    for (var j = i+1 ; j < 24 ; j++) {
	       var k = edgeColor(V[i], V[j]);
	       if (k >= 0) {
		  this.mesh.children[n].setMaterial(materials[k]);
	          this.placeEdge(n++, P[i], P[j]);
               }
            }
	 });
         break;
      }
   }

   this.createVertex = function(material) {
      var vertex = new THREE.Mesh();
      vertex.addGlobe(16, 8);
      vertex.scale.set(.001,.001,.001);
      return vertex.setMaterial(material);
   }

   this.createEdge = function(material, radius) {
      var edge = new THREE.Mesh();
      edge.radius = radius;
      var tube = edge.addOpenCylinder(8);
      tube.rotation.x = Math.PI / 2;
      tube.scale.set(radius, 1, radius);
      return edge.setMaterial(material);
   }

   var materials = [];

   this.createMesh = function() {
      var R = [1,2,0,0,2,2],
          G = [1,0,1,0,2,0],
	  B = [1,0,0,2,0,2];
      for (var i = 0 ; i < R.length ; i++)
         materials.push(this.shaderMaterial(R[i], G[i], B[i]));

      var mesh = new THREE.Mesh();

      switch (this.labels[this.selection]) {
      case 'pentatope':
         for (var i = 0 ; i < 5 ; i++)
            mesh.add(this.createVertex(materials[i+1]));
         for (var i = 0 ; i < 10 ; i++)
	    mesh.add(this.createEdge(materials[0], .035));
         break;

      case 'hypercube':
         for (var i = 0 ; i < 16 ; i++)
            mesh.add(this.createVertex(materials[0]));
         for (var i = 0 ; i < 32 ; i++)
	    mesh.add(this.createEdge(materials[1 + floor(i/8)], .05));
         break;

      case 'aerochoron':
         for (var i = 0 ; i < 8 ; i++)
	    mesh.add(this.createVertex(materials[1 + floor(i/2)]));
         for (var i = 0 ; i < 24 ; i++)
	    mesh.add(this.createEdge(materials[0], .03));
         break;

      case 'octaplex':
         for (var i = 0 ; i < 24 ; i++)
	    mesh.add(this.createVertex(materials[0]));
         for (var i = 0 ; i < 96 ; i++)
	    mesh.add(this.createEdge(materials[0], .02));
         break;
      }

      return mesh;
   }
}
Hypershape.prototype = new Sketch;
addSketchType('Hypershape');

