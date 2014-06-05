
   var M4 = function() {
      this._mS = [];
      this._to = 0;
      this._mS[0] = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
      this._m = function(arg) {
         if (! (arg === undefined))
	    this._mS[this._to] = arg;
	 return this._mS[this._to];
      };
      this.aimX = function(mat) {
         var A = this._m();
         var B = mat._m();
         var X = [B[12] - A[12], B[13] - A[13], B[14] - A[14]];
         var Z = [A[8], A[9], A[10]];
         var Y = cross(Z, X);
         cross(X, Y, Z);
         return this.setOrientation(X, Y, Z);
      };
      this.aimY = function(mat) {
         var A = this._m();
         var B = mat._m();
         var Y = [B[12] - A[12], B[13] - A[13], B[14] - A[14]];
         var X = [A[0], A[1], A[2]];
         var Z = cross(X, Y);
         cross(Y, Z, X);
         return this.setOrientation(X, Y, Z);
      };
      this.aimZ = function(mat) {
         var A = this._m();
         var B = mat._m();
         var Z = [B[12] - A[12], B[13] - A[13], B[14] - A[14]];
         var Y = [A[4], A[5], A[6]];
         var X = cross(Y, Z);
         cross(Z, X, Y);
         return this.setOrientation(X, Y, Z);
      };
      this.copy = function(m) {
         for (var i = 0 ; i < 16 ; i++)
            this._m()[i] = m._m()[i];
         return this;
      }
      this.identity = function() {
         this._m(this._id());
         return this;
      };
      this.normalMatrix = function(m) {
         var a = m[0]*m[0] + m[1]*m[1] + m[ 2]*m[ 2],
	     b = m[4]*m[4] + m[5]*m[5] + m[ 6]*m[ 6],
	     c = m[8]*m[8] + m[9]*m[9] + m[10]*m[10];
	 return [m[0]/a,m[1]/a,m[ 2]/a,0,
	         m[4]/b,m[5]/b,m[ 6]/b,0,
		 m[8]/c,m[9]/c,m[10]/c,0,
		 0,0,0,1];
      };
      this.normalize = function(v) {
         var x = v[0],y = v[1],z = v[2],r = Math.sqrt(x*x + y*y + z*z);
	 v[0] /= r;
	 v[1] /= r;
	 v[2] /= r;
      };
      this.perspective = function(x,y,z) {
         this._xf(this._pe(x,y,z));
	 return this;
      };
      this.restore = function() {
         --this._to;
      };
      this.rotateX = function(a) {
         this._xf(this._rX(a));
	 return this;
      };
      this.rotateY = function(a) {
         this._xf(this._rY(a));
	 return this;
      };
      this.rotateZ = function(a) {
         this._xf(this._rZ(a));
	 return this;
      };
      this.save = function() {
         this._mS[this._to+1] = this._mS[this._to++];
      };
      this.scale = function(x,y,z) {
         if (y === undefined)
	    z=y=x;
	 this._xf(this._sc(x,y,z));
	 return this;
      };
      this.setOrientation = function(X, Y, Z) {
         this.normalize(X);
         this.normalize(Y);
         this.normalize(Z);
         var v = this._m();
         v[0] = X[0]; v[1] = X[1]; v[ 2] = X[2];
         v[4] = Y[0]; v[5] = Y[1]; v[ 6] = Y[2];
         v[8] = Z[0]; v[9] = Z[1]; v[10] = Z[2];
	 return this;
      }
      this.translate = function(x,y,z) {
         this._xf(this._tr(x,y,z));
	 return this;
      };
      this.transpose = function(m) {
         return [m[0],m[4],m[ 8],m[12],
	         m[1],m[5],m[ 9],m[13],
		 m[2],m[6],m[10],m[14],
		 m[3],m[7],m[11],m[15]];
      };
      this._xf = function(m) {
         return this._m(this._mm(m,this._m()));
      };
      this._id = function() {
         return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
      };
      this._tr = function(x,y,z) {
         return [1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
      };
      this._rX = function(a) {
         var c = Math.cos(a),s = Math.sin(a);
	 return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1];
      };
      this._rY = function(a) {
         var c = Math.cos(a),s = Math.sin(a);
	 return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];
      };
      this._rZ = function(a) {
         var c = Math.cos(a),s = Math.sin(a);
	 return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];
      };
      this._sc = function(x,y,z) {
         return [x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];
      };
      this._pe = function(x,y,z) {
         var rr = x*x + y*y + z*z;
	 return [1,0,0,x/rr, 0,1,0,y/rr, 0,0,1,z/rr, 0,0,0,1];
      };
      this._d = function(a,b) {
	 return a[0]*b[0] +
	        a[1]*b[1] +
		(b.length<3 ? 0 : a[2]*b[2]) +
		(b.length<4 ? a[3] : a[3]*b[3]);
      };
      this._x = function(m) {
         return [m[0],m[1],m[2],m[3]];
      };
      this._y = function(m) {
         return [m[4],m[5],m[6],m[7]];
      };
      this._z = function(m) {
         return [m[8],m[9],m[10],m[11]];
      };
      this._w = function(m) {
         return [m[12],m[13],m[14],m[15]];
      };
      this._mm = function(a,b) {
         var t = this.transpose(b);

         var x = this._x(a), y = this._y(a), z = this._z(a), w = this._w(a);
         var X = this._x(t), Y = this._y(t), Z = this._z(t), W = this._w(t);

         return [this._d(x, X), this._d(x, Y), this._d(x, Z), this._d(x, W), 
	         this._d(y, X), this._d(y, Y), this._d(y, Z), this._d(y, W), 
		 this._d(z, X), this._d(z, Y), this._d(z, Z), this._d(z, W), 
		 this._d(w, X), this._d(w, Y), this._d(w, Z), this._d(w, W)];
      };
      this._mv = function(m,v) {
         var M = this._m();
         var x = this._d( [M[0],M[4],M[ 8],M[12]] , v );
         var y = this._d( [M[1],M[5],M[ 9],M[13]] , v );
         var z = this._d( [M[2],M[6],M[10],M[14]] , v );
         var w = this._d( [M[3],M[7],M[11],M[15]] , v );
         return [x / w, y / w, z / w];
      };
      this.transform = function(v) {
         return this._mv(this._m(),v);
      }
   };
   function cross(a,b,c) {
      if (c === undefined)
         c = [0,0,0];
      c[0] = a[1] * b[2] - a[2] * b[1];
      c[1] = a[2] * b[0] - a[0] * b[2];
      c[2] = a[0] * b[1] - a[1] * b[0];
      return c;
   };
   function dot(a,b) {
      if (a.length < 3 || b.length < 3)
         return a[0]*b[0] + a[1]*b[1];
      return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
   };
   function lerp(t, a, b) {
      return a + t * (b - a);
   };
   function norm(v) {
      return sqrt(normSqr(v));
   };
   function normSqr(v) {
      return dot(v, v);
   };
   function vecDiff(a, b) {
      return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
   };
   function vecLerp(t,a,b) {
      return [lerp(t,a[0],b[0]),lerp(t,a[1],b[1]),lerp(t,a[2],b[2])];
   };
   function vecScale(v, s) {
      return [v[0] * s, v[1] * s, v[2] * s];
   };
   function vecSum(a, b) {
      return [a[0] + b[0],a[1] + b[1],a[2] + b[2]];
   };

   function drawUnitDisk(rgb) { renderUnitDisk(mDrawFace, rgb); }
   function fillUnitDisk(rgb) { renderUnitDisk(mFillFace, rgb); }
   function renderUnitDisk(renderFunction, rgb) {
      var p = [];
      for (var i = 0 ; i < 20 ; i++) {
         var t =  i * TAU / 20 + PI;
	 p.push([cos(t), sin(t), 0]);
      }
      renderFunction(p);
   }
   function drawUnitTube(rgb) { renderUnitTube(mDrawFace, rgb); }
   function fillUnitTube(rgb) { renderUnitTube(mFillFace, rgb); }
   function renderUnitTube(renderFunction, rgb) {
      for (var i = 0 ; i < 20 ; i++) {
         var t0 =  i    * TAU / 20 + PI;
         var t1 = (i+1) * TAU / 20 + PI;
	 var s0 = sin(t0), c0 = cos(t0);
	 var s1 = sin(t1), c1 = cos(t1);
	 renderFunction([[c0,s0,1],[c0,s0,-1],[c1,s1,-1],[c1,s1,1]]);
      }
   }
   function unitCubeCorners() {
      for (var i = 0 ; i < pCube.length ; i++)
         mPoint(pCube[i]);
   }
   function drawUnitCube(rgb) { renderUnitCube(mDrawFace, rgb); }
   function fillUnitCube(rgb) { renderUnitCube(mFillFace, rgb); }
   var pCube = [[-1,-1,-1],[ 1,-1,-1],[-1, 1,-1],[ 1, 1,-1],
                [-1,-1, 1],[ 1,-1, 1],[-1, 1, 1],[ 1, 1, 1]];
   function renderUnitCube(renderFunction, rgb) {
      var p = pCube;
      var f = [[0,1,5,4],[0,2,3,1],[0,4,6,2],[1,3,7,5],[2,6,7,3],[6,4,5,7]];
      for (var i = 0 ; i < f.length ; i++)
         renderFunction([p[f[i][0]],p[f[i][1]],p[f[i][2]],p[f[i][3]]], rgb);
   }
   function drawUnitSquare() {
      mCurve([[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]]);
   }
   function fillUnitSquare() {
      mFillFace([[-1,-1],[1,-1],[1,1],[-1,1]]);
      mDrawFace([[-1,-1],[1,-1],[1,1],[-1,1]]);
   }
   function standardView(x,y,phi,theta,psi,s) {
      s *= width()/3.5;
      m.translate(width()*x,height()*(1-y),0);
      m.perspective(0,0,-width()*2);

      m.rotateX(phi);
      m.rotateY(theta);
      m.rotateZ(psi);

      m.scale(s,-s,s);
   };
   function invertStandardView(x,y,phi,theta,psi,s) {
      s *= width()/3.5;
      m.identity();
      m.scale(1/s,-1/s,1/s);

      m.rotateZ(-psi);
      m.rotateY(-theta);
      m.rotateX(-phi);

      m.perspective(0,0,width()*2);
      m.translate(-width()*x,-height()*(1-y),0);
   }
   function mLine(a,b) {
      var A = m.transform(a);
      var B = m.transform(b);
      line(A[0],A[1],B[0],B[1]);
   };
   function mPoint(p) {
      var P = m.transform(p);
      _g_moveTo(P[0], P[1]);
   };
   function mDrawFace(c, rgb) {
      if (rgb === undefined) rgb = 'black';
      var P = [];
      for (var n = 0 ; n < c.length ; n++)
         P.push(m.transform(c[n]));
      if (polygonArea(P) > 0)
         drawPolygon(P);
   }
   function mFillFace(c, rgb) {
      if (rgb === undefined) rgb = 'white';
      var P = [];
      for (var n = 0 ; n < c.length ; n++)
         P.push(m.transform(c[n]));
      if (polygonArea(P) > 0) {
         var PUSHED_color = color();
         color('white');
         fillPolygon(P);
         color(PUSHED_color);
      }
   }
   function mCurve(c) {
      var cc = [];
      for (var n = 0 ; n < c.length ; n++)
         cc.push(m.transform(c[n]));
      curve(cc);
   };
   function mArrow(a,b){
      var A = m.transform(a);
      var B = m.transform(b);
      arrow(A[0],A[1],B[0],B[1]);
   };
   function mText(str,p,ax,ay){
      var P = m.transform(p);
      text(str,P[0],P[1],ax,ay);
   };

   var m = new M4();

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

   THREE.Object3D.prototype.addCylinder = function(n) {
      if (n === undefined) n = 24;
      var child = new node();
      var geometry = new THREE.CylinderGeometry(1, 1, 2, n, 1, false);
      var mesh = new THREE.Mesh(geometry, blackMaterial);
      mesh.rotation.x = PI / 2;
      child.add(mesh);
      child.material = blackMaterial;
      this.add(child);
      return child;
   }

   THREE.Object3D.prototype.addCube = function() {
      var geometry = new THREE.BoxGeometry(2, 2, 2);
      var child = new THREE.Mesh(geometry, blackMaterial);
      this.add(child);
      return child;
   }

   THREE.Object3D.prototype.addGlobe = function(m, n) {
      if (m === undefined) m = 32;
      if (n === undefined) n = floor(m / 2);
      var geometry = new THREE.SphereGeometry(1, m, n);
      var child = new THREE.Mesh(geometry, blackMaterial);
      this.add(child);
      return child;
   }

   THREE.Object3D.prototype.addNode = function() {
      var child = new THREE.Mesh();
      this.add(child);
      return child;
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
   function max(a,b) { return Math.max(a,b); }
   function min(a,b) { return Math.min(a,b); }
   function pow(a,b) { return Math.pow(a,b); }
   function random() { return Math.random(); }
   function round() { return Math.round(); }
   function sCurve(t) { return max(0, min(1, t * t * (3 - t - t))); }
   function sign(t) { return Math.sign(t); }
   function sin(t) { return Math.sin(t); }
   function sqrt(t) { return Math.sqrt(t); }
   function tan(t) { return Math.tan(t); }

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
         emissive : ambient,
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

   function width() { return window.innerWidth; }
   function height() { return window.innerHeight; }

   var renderer, cameraFOV = 15, mouseX = 0, mouseY = 0;

   function fourStart() {
      renderer = new THREE.WebGLRenderer( { alpha: true} );
      renderer.setClearColor(0, 0);
      renderer.setSize(width(), height());

      document.addEventListener('mousemove', function(event) {
         mouseX = event.clientX;
         mouseY = event.clientY;
      }, false);

      renderer.camera = new THREE.PerspectiveCamera(cameraFOV,width()/height(),1,1000);
      renderer.camera.position.set(0,0,10);
   }


