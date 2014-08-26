
   var renderer = null;

   window.addEventListener('resize', function() {
      renderer.setSize(width(), height());
      renderer.camera.aspect = width() / height();
      renderer.camera.updateProjectionMatrix();
   });

   THREE.Object3D.prototype.setMaterial = function(material) {
      this.material = material;
      for (var i = 0 ; i < this.children.length ; i++)
         this.children[i].setMaterial(material);
      return this;
   }

   THREE.Object3D.prototype.getMatrix = function() {
      if (this.mat === undefined)
         this.mat = new M4();
      return this.mat;
   }

   THREE.Object3D.prototype.setMatrix = function(mat) {
      if (this.mat === undefined)
         this.mat = new M4();
      this.mat.copy(mat._m());
   }

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
   }

   function cylinderGeometry(n) { return new THREE.CylinderGeometry(1, 1, 2, n, 1, false); }
   function openCylinderGeometry(n) { return new THREE.CylinderGeometry(1, 1, 2, n, 1, true); }
   function latheGeometry(points, n) { return new THREE.LatheGeometry(points, n); }
   function torusGeometry(r, m, n) { return new THREE.TorusGeometry(1, r, m, n); }
   function cubeGeometry() { return new THREE.BoxGeometry(2, 2, 2); }
   function globeGeometry(m, n) { return new THREE.SphereGeometry(1, m, n); }

   THREE.Object3D.prototype.addTorus = function(r, m, n) {
      var geometry = torusGeometry(r, m, n);
      var mesh = new THREE.Mesh( geometry, blackMaterial );
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addLathe = function(p, nSegments) {
      var points = [];
      for (var i = 0 ; i < p.length ; i++)
         points.push( new THREE.Vector3( p[i][0],p[i][1],p[i][2] ) );
      var geometry = latheGeometry( points, nSegments );
      var mesh = new THREE.Mesh(geometry, blackMaterial);
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addCylinder = function(n) {
      if (n === undefined) n = 24;
      var geometry = cylinderGeometry(n);
      var mesh = new THREE.Mesh(geometry, blackMaterial);
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addOpenCylinder = function(n) {
      if (n === undefined) n = 24;
      var geometry = openCylinderGeometry(n);
      var mesh = new THREE.Mesh(geometry, blackMaterial);
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addCube = function() {
      var geometry = cubeGeometry();
      var mesh = new THREE.Mesh(geometry, blackMaterial);
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addGlobe = function(m, n) {
      if (m === undefined) m = 32;
      if (n === undefined) n = floor(m / 2);
      var geometry = globeGeometry(m, n);
      var mesh = new THREE.Mesh(geometry, blackMaterial);
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addNode = function() {
      var mesh = new THREE.Mesh();
      this.add(mesh);
      return mesh;
   }

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
   }

   THREE.Object3D.prototype.findVisibleEdges = function(matrix, ve) {
      if (matrix === undefined)
         matrix = new THREE.Matrix4();

      if (ve === undefined)
         ve = [];

      matrix = matrix.multiply(this.matrix);

      ve.push([ matrix, this.geometry, this.geometry.findVisibleEdges(matrix) ]);

      for (var k = 0 ; k < this.children.length ; k++) {
         var childMatrix = new THREE.Matrix4();
	 childMatrix.copy(matrix);
         this.children[k].findVisibleEdges(childMatrix, ve);
      }

      return ve;
   }

   THREE.Geometry.prototype.findVisibleEdges = function(matrix) {
      var visibleEdges = [];
      if (this.edges === undefined)
         this.computeEdges();
      var normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
      var N = [new THREE.Vector3(), new THREE.Vector3()];
      for (var n = 0 ; n < this.edges.length ; n++) {
         for (var k = 0 ; k < 2 ; k++)
            N[k].copy(this.faces[this.edges[n][k]].normal)
                .applyMatrix3(normalMatrix).normalize();
	 if ( (N[0].z > 0 || N[1].z > 0) &&
              (N[0].z < 0 || N[1].z < 0 || N[0].dot(N[1]) < 0.5))
            visibleEdges.push(this.edges[n][2]);
      }
      return visibleEdges;
   }

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
   }

   var PI = Math.PI;
   var TAU = 2 * PI;
   function abs(t) { return Math.abs(t); }
   function acos(t) { return Math.acos(t); }
   function asin(t) { return Math.asin(t); }
   function atan(t) { return Math.atan(t); }
   function atan2(a,b) { return Math.atan2(a,b); }
   function ceil(t) { return Math.ceil(t); }
   function cos(t) { return Math.cos(t); }
   function exp(t) { return Math.exp(t); }
   function floor(t) { return Math.floor(t); }
   function ik(a, b, C, D) {
      if (C instanceof THREE.Vector3) {
         var cc = C.dot(C), x = (1 + (a*a - b*b)/cc) / 2, y = C.dot(D)/cc;
         D.set(D.x - y * C.x, D.y - y * C.y, D.z - y * C.z);
         y = sqrt(max(0,a*a - cc*x*x) / D.dot(D));
         D.set(x*C.x + y*D.x, x*C.y + y*D.y, x*C.z + y*D.z);
      }
      else {
         var cc = dot(C,C), x = (1 + (a*a - b*b)/cc) / 2, y = dot(C,D)/cc;
         for (var i = 0 ; i < 3 ; i++) D[i] -= y * C[i];
         y = sqrt(max(0,a*a - cc*x*x) / dot(D,D));
         for (var i = 0 ; i < 3 ; i++) D[i] = x * C[i] + y * D[i];
      }
   }
   function log(a,b) { return Math.log(a,b); }
   function matToEuler(mat, e) {
      e.y = asin(mat[0+4*2]);
      var C = cos(e.y);
      if (abs(C) > 0.005) {
         e.x = -atan2( mat[1+4*2] / C, mat[2+4*2] / C);
         e.z =  atan2(-mat[0+4*1] / C, mat[0+4*0] / C);
      }
      else {
         e.x =  0;
         e.z =  atan2( mat[1+4*0] / C, mat[1+4*1] / C);
      }
   }

   function ambientLight(color) {
      return new THREE.AmbientLight(color);
   }

   function directionalLight(x, y, z, color) {
      var myLight = new THREE.DirectionalLight(color);
      myLight.position.set(x,y,z).normalize();
      return myLight;
   }

   function phongMaterial(ambient, diffuse, shiny, power) {
      if (ambient === undefined) ambient = 0;
      if (diffuse === undefined) diffuse = 0;
      if (shiny   === undefined) shiny   = 0;
      if (power   === undefined) power   = 1;
      return new THREE.MeshPhongMaterial({
         ambient  : ambient,
         emissive : 0,
         color    : diffuse,
         specular : shiny,
         shininess: power
      });
   }

   function newColor(r,g,b) {
      var red = floor(255 * r);
      var grn = floor(255 * g);
      var blu = floor(255 * b);
      return new THREE.Color((red << 16) + (grn << 8) + blu);
   }

   THREE.Material.prototype.setAmbient = function(r,g,b) {
      this.emissive = newColor(r, g, b);
      return this;
   }

   THREE.Material.prototype.setDiffuse = function(r,g,b) {
      this.color = newColor(r, g, b);
      return this;
   }

   THREE.Material.prototype.setSpecular = function(r,g,b,p) {
      this.specular = newColor(r, g, b);
      this.shininess = p;
      return this;
   }

   var blackMaterial = new phongMaterial(0x000000,0x000000,0x000000,20);

   function node() {
      return new THREE.Mesh();
   }

   function animate(){
      var time = (new Date()).getTime() / 1000;
      var elapsed = this.time === undefined ? .03 : time - this.time;
      this.time = time;
      updateScene(elapsed);
      renderer.render(renderer.scene, renderer.camera);
      requestAnimationFrame(function(){ animate(); });
   }

   var renderer, cameraFOV = 15, mouseX = 0, mouseY = 0;

   function fourStart() {
      renderer = new THREE.WebGLRenderer( { alpha: true} );
      renderer.setClearColor(0, 0);
      renderer.setSize(width(), height());

      document.addEventListener('mousemove', function(event) {
         mouseX = event.clientX;
         mouseY = event.clientY;
      }, false);

      renderer.camera = new THREE.PerspectiveCamera(cameraFOV/20,width()/height(),1,1100);
      renderer.camera.position.set(0,0,10*20);
   }

function gl() { return renderer.context; }
function isValidVertexShader  (string) { return isValidShader(gl().VERTEX_SHADER  , string); }
function isValidFragmentShader(string) { return isValidShader(gl().FRAGMENT_SHADER, string); }
function isValidShader(type, string) {
   string = "precision highp float;\n" + string;
   var shader = gl().createShader(type);
   gl().shaderSource(shader, string);
   gl().compileShader(shader);
   return gl().getShaderParameter(shader, gl().COMPILE_STATUS);
};

function addUniforms(material, string) {

   // PARSE THE FRAGMENT SHADER CODE TO FIND CUSTOM UNIFORMS:

   var typeInfo = "float f 0 vec3 v2 [0,0] vec3 v3 [0,0,0]".split(' ');
   var declarations = string.substring(0, string.indexOf("void main")).split(";");
   for (var i = 0 ; i < declarations.length ; i++) {
      var declaration = declarations[i].trim();
      if (declaration.length > 0) {

         var words = declaration.split(" ");
         if (words[0] == 'uniform') {
            var type = words[1];
            var name = words[2];
            for (var n = 0 ; n < typeInfo.length ; n += 3)
               if (type == typeInfo[n]) {
                  material.uniforms[name] = { type: typeInfo[n+1], value: typeInfo[n+2] };
                  break;
               }
         }
      }
   }
}

function formFragmentShader(string) {

   // PREPEND THE HEADER OF PREDEFINED THINGS:

   return fragmentShaderHeader.concat(string);
}

function shaderMaterial(vertexShader, fragmentShaderString) {
   var material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: vertexShader,
   });

   var u = "alpha mx my pixelSize selectedIndex time x y z".split(' ');
   for (var i = 0 ; i < u.length ; i++)
      material.uniforms[u[i]] = { type: "f", value: (u[i]=="alpha" ? 1 : 0) };

   addUniforms(material, fragmentShaderString);
   material.fragmentShader = formFragmentShader(fragmentShaderString);

   return material;
}

// THIS VERTEX SHADER WILL SUFFICE FOR MOST SHADER PLANES:

var defaultVertexShader = ["\
   varying float dx;\
   varying float dy;\
   varying vec3 vPosition;\
   varying vec3 vNormal;\
   void main() {\
      dx = 2. * uv.x - 1.;\
      dy = 2. * uv.y - 1.;\
      vNormal = normalize((modelViewMatrix * vec4(normal, 0.)).xyz);\
      vPosition = position*.03;\
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);\
   }\
"].join("\n");

// DEFINES FRAGMENT SHADER FUNCTIONS noise() and turbulence() AND VARS x, y, time and alpha.

var fragmentShaderHeader = ["\
   vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
   vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
   vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }\
   vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\
   vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\
   float noise(vec3 P) {\
      vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));\
      vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);\
      vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);\
      vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;\
      vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);\
      vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\
      vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\
      gx0 = fract(gx0); gx1 = fract(gx1);\
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));\
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));\
      gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);\
      gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);\
      vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),\
           g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),\
           g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),\
           g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);\
      vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));\
      vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));\
      g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;\
      g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;\
      vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),\
                         dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),\
                    vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),\
                         dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);\
      return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);\
   }\
   float noise(vec2 P) { return noise(vec3(P, 0.0)); }\
   float fractal(vec3 P) {\
      float f = 0., s = 1.;\
      for (int i = 0 ; i < 9 ; i++) {\
         f += noise(s * P) / s;\
         s *= 2.;\
         P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);\
      }\
      return f;\
   }\
   float turbulence(vec3 P) {\
      float f = 0., s = 1.;\
      for (int i = 0 ; i < 9 ; i++) {\
         f += abs(noise(s * P)) / s;\
         s *= 2.;\
         P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);\
      }\
      return f;\
   }\
   uniform float alpha;\
   varying float dx;\
   varying float dy;\
   uniform float mx;\
   uniform float my;\
   uniform float pixelSize;\
   uniform float selectedIndex;\
   uniform float time;\
   varying vec3 vNormal;\
   varying vec3 vPosition;\
   uniform float x;\
   uniform float y;\
   uniform float z;\
"].join("\n");


