
function Spiky() {
   this.labels = 'spiky1 spiky2'.split(' ');
   this.noise = new Noise();

   var myVertexShader = [
   ,'varying vec3 vPosition;'
   ,'varying vec3 vNormal;'
   ,'float displace(vec3 p) { return 0.2 * noise(vec3(p.x, p.y, p.z + 1.5 * uTime)); }'
   ,'void main() {'
   ,'   vNormal = normalize((modelViewMatrix * vec4(normal, 0.)).xyz);'
   ,'   vPosition = position;'
   ,'   float _d = displace(position);'
   ,'   float _x = displace(position + vec3(.001, 0., 0.));'
   ,'   float _y = displace(position + vec3(0., .001, 0.));'
   ,'   float _z = displace(position + vec3(0., 0., .001));'
   ,'   vNormal = normalize(vNormal + vec3(_x - _d, _y - _d, _z - _d) / .001);'
   ,'   gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1. - _d), 1.);'
   ,'}'
   ].join("\n");

   var myFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform float uFoggy;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3 P = vPosition * 15.;'
   ,'   vec3 N = normalize(vNormal);'
   ,'   vec3 W = vec3(0.,0.,-1.);'
   ,'   vec3 R = W - 2. * N * dot(N, W);'
   ,'   float n = 1. + .5 * (noise(P) + noise(4. * P) / 4. + noise(vec3(24., 24., 12.) * P) / 12.);'
   ,'   vec3 color = vec3(.01,.01,.01);'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( .05 * max(0.,D) + pow(max(0., S), 10.) ) * n * n;'
   ,'   }'
   ,'   color *= vec3(.5,.15,.05);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), alpha);'
   ,'}'
   ].join("\n");

   var p = (1 + sqrt(5)) / 2;
   var P = [ [-1, p, 0], [ 1, p, 0], [-1,-p, 0], [ 1,-p, 0],
             [0, -1, p], [0,  1, p], [0, -1,-p], [0,  1,-p],
             [ p, 0,-1], [ p, 0, 1], [-p, 0,-1], [-p, 0, 1] ];

   var V = [], T = [];

   var a = newVec();
   var b = newVec();

   var r = 0.3;

   this.render = function() {

      this.duringSketch(function() {
         switch (this.labels[this.selection]) {
	 case 'spiky1':
	    if (V.length == 0) {
               function bit(n, b) { return n >> b & 1 ? 1 : -1; }
               V = [newVec(-r,0,0), newVec(r,0,0),
                    newVec(0,-r,0), newVec(0,r,0),
                    newVec(0,0,-r), newVec(0,0,r)];
               for (var i = 0 ; i <= 1 ; i++)
               for (var j = 2 ; j <= 3 ; j++)
               for (var k = 4 ; k <= 5 ; k++)
                  T.push([i,j,k]);
	    }
            mCurve([[0,-r],[ r,0],[0, r]]);
            mCurve([[0, r],[-r,0],[0,-r]]);
            break;

	 case 'spiky2':
	    if (V.length == 0) {
               for (var i = 0 ; i < P.length ; i++)
                  V.push(newVec(P[i][0]*.6,P[i][1]*.6,P[i][2]*.6));
               T = [ [0, 11, 5],  [0,  5,  1],  [ 0,  1,  7],  [ 0, 7, 10],  [0, 10, 11],
                     [1,  5, 9],  [5, 11,  4],  [11, 10,  2],  [10, 7,  6],  [7,  1,  8],
                     [3,  9, 4],  [3,  4,  2],  [ 3,  2,  6],  [ 3, 6,  8],  [3,  8,  9],
                     [4,  9, 5],  [2,  4, 11],  [ 6,  2, 10],  [ 8, 6,  7],  [9,  8,  1], ];
	    }
            mCurve([[.5,-1],[1,0],[.5,1]]);
            mCurve([[.5,1],[-.5,1],[-1,0]]);
            mCurve([[-1,0],[-.5,-1],[.5,-1]]);
            break;
         }
      });

      this.vertexShader = myVertexShader;
      this.fragmentShader = myFragmentShader;

      this.afterSketch(function() {
         for (var i = 0 ; i < V.length ; i++) {
            var spike = this.mesh.children[T.length + i];
	    var v = V[i];
	    var radius = this.selection == 0 ? .7 : .8;
	    a.copy(v).multiplyScalar(radius * (1 - .2 * this.noise.noise([v.x, v.y, v.z + 1.5 * time])));
	    b.copy(a).multiplyScalar(1.8);
            spike.placeLink(a, b);
         }
	 this.setUniform('uFoggy', exp(-this.scale()));
      });
   }

   this.createMesh = function() {

      var mesh = new THREE.Mesh();

      for (var n = 0 ; n < T.length ; n++) {
         var geom = new THREE.Geometry();
	 for (var i = 0 ; i < 3 ; i++)
            geom.vertices.push(V[T[n][i]]);
         geom.faces.push(new THREE.Face3(0, 1, 2));
         geom.faces.push(new THREE.Face3(2, 1, 0));
         geom.computeFaceNormals();

	 var facet = new THREE.Mesh(geom);
	 mesh.add(facet);
      }

      for (var i = 0 ; i < V.length ; i++) { 
         var radius = this.selection == 0 ? .05 : .1;
         var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.0, radius, 2, 4, 1, true));
         tube.rotation.x = Math.PI / 2;
         var spike = new THREE.Mesh();
         spike.add(tube);

         mesh.add(spike);
      }

      mesh.setMaterial(this.shaderMaterial());
      return mesh;
   }
}
Spiky.prototype = new Sketch;
addSketchType('Spiky');

