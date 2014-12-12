define(["THREE"], function (THREE) {

   THREE.Material.prototype.setUniform = function(name, src) {
      if (this.uniforms[name] !== undefined) {
         var val = src;
         if (Array.isArray(src)) {
            if (! Array.isArray(src[0]))
               val = toVec(src);
            else {
               val = [];
               for (var i = 0 ; i < src.length ; i++)
                  val.push(toVec(src[i]));
            }
         }
         this.uniforms[name].value = val;
      }
   };

   THREE.Object3D.prototype.setMaterial = function(material) {
      if (isShowingMeshEdges)
         material = bgMaterial();
      this.material = material;
      for (var i = 0 ; i < this.children.length ; i++)
         this.children[i].setMaterial(material);
      return this;
   };

   THREE.Object3D.prototype.setOpacity = function(opacity) {
      this.material.opacity = opacity;
      this.material.transparent = true;
      for (var i = 0 ; i < this.children.length ; i++)
         this.children[i].setOpacity(opacity);
      return this;
   };

   THREE.Object3D.prototype.getMatrix = function() {
      if (this.mat === undefined)
         this.mat = new M4();
      return this.mat;
   };

   THREE.Object3D.prototype.setMatrix = function(mat) {
      if (this.mat === undefined)
         this.mat = new M4();
      this.mat.copy(mat._m());
   };

   THREE.Object3D.prototype.updateMatrix = function() {
      if (this.mat === undefined)
         this.matrix.compose( this.position, this.quaternion, this.scale );
      else {
         var v = this.mat._m();
         this.matrix.set(v[0],v[4],v[ 8],v[12],
                         v[1],v[5],v[ 9],v[13],
                         v[2],v[6],v[10],v[14],
                         v[3],v[7],v[11],v[15]);
      }
      this.matrixWorldNeedsUpdate = true;
   };

   THREE.Object3D.prototype.addTorus = function(r, m, n) {
      var geometry = torusGeometry(r, m, n);
      var mesh = new THREE.Mesh( geometry, bgMaterial() );
      this.add(mesh);
      return mesh;
   };

   THREE.Object3D.prototype.addLathe = function(p, nSegments) {
      var points = [];
      for (var i = 0 ; i < p.length ; i++)
         points.push( new THREE.Vector3( p[i][0],p[i][1],p[i][2] ) );
      var geometry = latheGeometry( points, nSegments );
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   };

   THREE.Object3D.prototype.addCylinder = function(n) {
      if (n === undefined) n = 24;
      var geometry = cylinderGeometry(n);
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   };

   THREE.Object3D.prototype.addOpenCylinder = function(n) {
      if (n === undefined) n = 24;
      var geometry = openCylinderGeometry(n);
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   };

   THREE.Object3D.prototype.addCube = function() {
      var geometry = cubeGeometry();
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   };

   THREE.Object3D.prototype.addPlane = function() {
      var geometry = planeGeometry();
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   };

   THREE.Object3D.prototype.addGlobe = function(m,n, p0,p1, t0,t1) {
      if (m === undefined) m = 32;
      if (n === undefined) n = floor(m / 2);
      var geometry = globeGeometry(m,n, p0,p1, t0,t1);
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   };

   THREE.Object3D.prototype.addNode = function() {
      var mesh = new THREE.Mesh();
      this.add(mesh);
      return mesh;
   };

   THREE.Geometry.prototype.computeEdges = function() {
      function testEdge(edges, a, b) {
         var h = Math.min(a, b) + "," + Math.max(a, b);
         if (hash[h] === undefined)
            hash[h] = n;
         else
            edges.push([hash[h], n, [a, b]]);
      }
      this.edges = [];
      var hash = {};
      for (var n = 0 ; n < this.faces.length ; n++) {
         var face = this.faces[n];
         testEdge(this.edges, face.a, face.b);
         testEdge(this.edges, face.b, face.c);
         testEdge(this.edges, face.c, face.a);
      }
   };

   THREE.Object3D.prototype.toStrokes = function() {
      return edgesToStrokes(this.projectVisibleEdges(this.findVisibleEdges()));
   };

   THREE.Object3D.prototype.findBoundsWorld = function(bb) {
      if (bb === undefined) {
         this.updateMatrixWorld();
         bb = [10000,10000,10000,-10000,-10000,-10000];
      }
      this.geometry.matrixWorld = this.matrixWorld;
      this.geometry.expandBoundsWorld(bb);
      for (var k = 0 ; k < this.children.length ; k++)
         this.children[k].findBoundsWorld(bb);
      return bb;
   };

   THREE.Object3D.prototype.findVisibleEdges = function(ve) {
      if (ve === undefined) {
         this.updateMatrixWorld();
         ve = [];
      }
      this.geometry.matrixWorld = this.matrixWorld;
      ve.push([ this.geometry, this.geometry.findVisibleEdges() ]);
      for (var k = 0 ; k < this.children.length ; k++)
         this.children[k].findVisibleEdges(ve);
      return ve;
   };

   THREE.Object3D.prototype.projectVisibleEdges = function(veds) {
      var e2 = [];

      function p2xy(p) { return [ projectX(p.x), projectY(p.y) ]; }
      function e2moveTo(p) { e2.push( [ p2xy(p) ] ); }
      function e2lineTo(p) {
         var e = e2[e2.length-1];
         var xy = p2xy(p);
         if (e[0][0] == xy[0] && e[0][1] == xy[1])
            e2.splice(e2.length-1, 1);
         else
            e.push(xy);
      }

      var E0 = new THREE.Vector3();
      var E1 = new THREE.Vector3();

      for (var k = 0 ; k < veds.length ; k++) {
         var geom  = veds[k][0];
         var edges = veds[k][1];

         for (var n = 0 ; n < edges.length ; n++) {
            var V0 = geom.vertexWorld(edges[n][0]);
            var V1 = geom.vertexWorld(edges[n][1]);

            var d = V0.distanceTo(V1);
            var nSteps = max(1, floor(d / 0.03));
            E1.copy(V0);
            var wasHidden = this.isHiddenPoint(E1);
            if (! wasHidden)
               e2moveTo(E1);
            for (var step = 1 ; step <= nSteps ; step++) {
               E0.copy(E1);
               E1.copy(V0).lerp(V1, step / nSteps);
               var isHidden = this.isHiddenPoint(E1);
               if (! wasHidden && isHidden)
                  e2lineTo(E0);
               if (wasHidden && ! isHidden)
                  e2moveTo(E1);
               wasHidden = isHidden;
            }
            if (! wasHidden)
               e2lineTo(E1);
         }
      }

      return e2;
   };

   THREE.Object3D.prototype.isHiddenPoint = function(p) {
      if (this.geometry.isHiddenPoint(p))
         return true;
      for (var k = 0 ; k < this.children.length ; k++)
         if (this.children[k].isHiddenPoint(p))
            return true;
      return false;
   };

   THREE.Geometry.prototype.expandBoundsWorld = function(bb) {
      for (var n = 0 ; n < this.vertices.length ; n++) {
         var v = this.vertexWorld(n);

         bb[0] = min(bb[0], v.x);
         bb[1] = min(bb[1], v.y);
         bb[2] = min(bb[2], v.z);

         bb[3] = max(bb[3], v.x);
         bb[4] = max(bb[4], v.y);
         bb[5] = max(bb[5], v.z);
      }
   };

   THREE.Geometry.prototype.findVisibleEdges = function() {
      var visibleEdges = [];

      if (this.edges === undefined)
         this.computeEdges();
      var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.matrixWorld);

      // COMPUTE VIEW DEPENDENT NORMAL FOR EVERY FACE.

      for (var n = 0 ; n < this.faces.length ; n++) {
         var face = this.faces[n];
         if (face.viewNormal === undefined)
            face.viewNormal = new THREE.Vector3();
         face.viewNormal.copy(face.normal).applyMatrix3(normalMatrix).normalize();
      }

      // FIND EDGES THAT ARE EITHER LOCALLY SILHOUETTE OR DIHEDRAL.

      for (var n = 0 ; n < this.edges.length ; n++) {
         var edge = this.edges[n];
         var n0 = this.faces[edge[0]].viewNormal;
         var n1 = this.faces[edge[1]].viewNormal;

         if ((n0.z >= -0.0001 && n1.z <= 0.0001) ||
             (n0.z <= 0.0001 && n1.z >= -0.0001) || 
             (n0.dot(n1) < 0.5)) 
         {
             // console.log("v  dot = " + (n0.dot(n1).toFixed(6)) + ", " + n0.z.toFixed(6) + ", " + n1.z.toFixed(6)); 
             visibleEdges.push(edge[2]);
         }
         else {
             // console.log("nv dot = " + (n0.dot(n1).toFixed(6)) + ", " + n0.z.toFixed(6) + ", " + n1.z.toFixed(6)); 
         }
      }

      // console.log("fve: hidden point count = " + ___hiddenpoint_count.toFixed(0));
      ___hiddenpoint_count = 0;

      return visibleEdges;
   };

   THREE.Geometry.prototype.vertexWorld = function(i) {
      if (this.verticesWorld === undefined)
         this.verticesWorld = [];

      if (this.verticesWorld[i] === undefined)
         this.verticesWorld[i] = new THREE.Vector3();

      return this.verticesWorld[i].copy(this.vertices[i]).applyMatrix4(this.matrixWorld);
   };


   THREE.Geometry.prototype.addLine = function(t, a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, d = sqrt(dx * dx + dy * dy);
      dx *= t/2 / d;
      dy *= t/2 / d;
      this.vertices.push(new THREE.Vector3(a.x + dy, a.y - dx, a.z + t));
      this.vertices.push(new THREE.Vector3(b.x + dy, b.y - dx, b.z + t));
      this.vertices.push(new THREE.Vector3(b.x - dy, b.y + dx, b.z + t));
      this.vertices.push(new THREE.Vector3(a.x - dy, a.y + dx, a.z + t));
      var nf = this.vertices.length;
      this.faces.push(new THREE.Face3(nf-4, nf-3, nf-2));
      this.faces.push(new THREE.Face3(nf-2, nf-1, nf-4));
   };

   THREE.Geometry.prototype.isHiddenPoint = function(p) {
      for (var n = 0 ; n < this.faces.length ; n++)
          if (this.isPointHiddenByFace(p, n)) {
              ___hiddenpoint_count++;
              return true;
          }
      return false;
   };

   THREE.Geometry.prototype.isPointHiddenByFace = function(p, n) {
      var face = this.faces[n];
      return isPointHiddenByTriangle(p, this.vertexWorld(face.a),
                                        this.vertexWorld(face.b),
                                        this.vertexWorld(face.c));
   };

   THREE.Material.prototype.setAmbient = function(r,g,b) {
      this.emissive = newColor(r, g, b);
      return this;
   };

   THREE.Material.prototype.setDiffuse = function(r,g,b) {
      this.color = newColor(r, g, b);
      return this;
   };

   THREE.Material.prototype.setSpecular = function(r,g,b,p) {
      this.specular = newColor(r, g, b);
      this.shininess = p;
      return this;
   };

   return THREE;

});