
/////// CHALKTALK MODELER FOR HTML5 ///////////////////////////////////////////////////////////////

if (! window.CT) CT = { };
CT.REVISION = "0";

CT.def = function(a, b) { return a !== undefined ? a : b !== undefined ? b : 0; }
CT.fovToFL = function(fov) { return 1 / Math.tan(fov / 2); }
CT.time = 0;

CT.vectorCross     = function(a, b) { return [ a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0] ]; }
CT.vectorDot       = function(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
CT.vectorNormalize = function(v)    { var d = Math.sqrt(CT.vectorDot(v,v)); v[0]/=d; v[1]/=d; v[2]/=d; return v; }

CT.matrixCopy     = function(s,d)   { for (var i = 0 ; i < 16 ; i++) d[i] = s[i]; }
CT.matrixIdentity = function()      { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }
CT.matrixRotatedX = function(a)     { return [1,0,0,0, 0,Math.cos(a),Math.sin(a),0, 0,-Math.sin(a),Math.cos(a),0, 0,0,0,1]; }
CT.matrixRotatedY = function(a)     { return [Math.cos(a),0,-Math.sin(a),0, 0,1,0,0, Math.sin(a),0,Math.cos(a),0, 0,0,0,1]; }
CT.matrixRotatedZ = function(a)     { return [Math.cos(a),Math.sin(a),0,0, -Math.sin(a),Math.cos(a),0,0, 0,0,1,0, 0,0,0,1]; }
CT.matrixScaled   = function(x,y,z) { if (x instanceof Array) { z = x[2]; y = x[1]; x = x[0]; }
                                      return [x,0,0,0, 0,CT.def(y,x),0,0, 0,0,CT.def(z,x),0, 0,0,0,1]; }
CT.matrixTranslated = function(x,y,z) { if (x instanceof Array) { z = x[2]; y = x[1]; x = x[0]; }
                                        return [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]; }

CT.matrixMultiply = function(a, b, dst) {
   var tmp = [], n;
   for (n = 0 ; n < 16 ; n++)
      tmp.push(a[n&3] * b[n&12] + a[n&3 | 4] * b[1 | n&12] + a[n&3 | 8] * b[2 | n&12] + a[n&3 | 12] * b[3 | n&12]);
   if (dst)
      CT.matrixCopy(tmp, dst);
   return CT.def(dst, tmp);
}
CT.matrixInverse = function(src) {
  function s(col, row) { return src[col & 3 | (row & 3) << 2]; }
  function cofactor(c0, r0) {
     var c1 = c0+1, c2 = c0+2, c3 = c0+3, r1 = r0+1, r2 = r0+2, r3 = r0+3;
     return (c0 + r0 & 1 ? -1 : 1) * ( (s(c1, r1) * (s(c2, r2) * s(c3, r3) - s(c3, r2) * s(c2, r3)))
                                     - (s(c2, r1) * (s(c1, r2) * s(c3, r3) - s(c3, r2) * s(c1, r3)))
                                     + (s(c3, r1) * (s(c1, r2) * s(c2, r3) - s(c2, r2) * s(c1, r3))) );
  }
  var n, dst = [], det = 0;
  for (n = 0 ; n < 16 ; n++) dst.push(cofactor(n >> 2, n & 3));
  for (n = 0 ; n <  4 ; n++) det += src[n] * dst[n << 2];
  for (n = 0 ; n < 16 ; n++) dst[n] /= det;
  return dst;
}
CT.matrixTransform = function(m, v)  {
    var x = v[0], y = v[1], z = v[2], w = CT.def(v[3], 1);
    return [ x*m[0] + y*m[4] + z*m[ 8] + w*m[12],
             x*m[1] + y*m[5] + z*m[ 9] + w*m[13],
             x*m[2] + y*m[6] + z*m[10] + w*m[14],
             x*m[3] + y*m[7] + z*m[11] + w*m[15] ]; }
CT.matrixTranspose = function(m) { return [m[0],m[4],m[ 8],m[12],m[1],m[5],m[ 9],m[13],
                                           m[2],m[6],m[10],m[14],m[3],m[7],m[11],m[15]]; }

CT.Scene = function(canvas) {
   this._fov = 0.5;
   this._gl = canvas.getContext('experimental-webgl');
   this._lColor = [0,0,0, 0,0,0, 0,0,0];
   this._lDirInfo = [0,0,0, 0,0,0, 0,0,0];
   this._objects = [];
   this._viewMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,this.getFL(),1];
}
CT.Scene.prototype = {
   add      : function(obj)   { this._objects.push(obj); return obj._scene = this; },
   getFL    : function()      { return CT.fovToFL(this._fov); },
   getFOV   : function()      { return this._fov; },
   getHDir  : function()      { this._updateLightVectors(); return this._hDir; },
   getLDir  : function()      { this._updateLightVectors(); return this._lDir; },
   getStereo: function()      { return CT.def(this._stereo); },
   setFOV   : function(fov)   { this._fov = fov; return this; },
   setStereo: function(y_n)   { this._stereo = y_n ? 1 : 0; return this; },

   doDepthTest : function(yes) { // TOGGLE WHETHER TO DO A DEPTH TEST WHEN DRAWING
      var gl = this._gl;
      if (yes) {
         gl.enable(gl.DEPTH_TEST);
         gl.depthFunc(gl.LEQUAL);
      }
      else
         gl.disable(gl.DEPTH_TEST);
   },
   getViewMatrix : function(matrix) {
      CT.matrixCopy(this._viewMatrix, matrix);
      return this;
   },
   getViewMatrixInverse : function() {
      if (! this._viewMatrixInverse)
         this._viewMatrixInverse = CT.matrixInverse(this._viewMatrix);
      return this._viewMatrixInverse;
   },
   remove : function(obj) {
      for (var i = 0 ; i < this._objects.length ; i++)
         if (obj == this._objects[i]) {
	    this._objects.splice(i, 1);
	    break;
	 }
   },
   setCanvas : function(canvas) {
      this._gl = canvas.getContext('experimental-webgl');
      for (var i = 0 ; i < this._objects.length ; i++)
         this._objects[i].setGL(this._gl);
   },
   setLight : function(n, lDir, lColor) {
      CT.vectorNormalize(lDir);
      for (var i = 0 ; i < 3 ; i++) {
	 this._lDirInfo[3 * n + i] = lDir[i];
         this._lColor  [3 * n + i] = lColor ? lColor[i] : 1;
      }
      delete this._lDir;
      return this;
   },
   setViewMatrix : function(matrix) {
      CT.matrixCopy(matrix, this._viewMatrix);
      delete this._viewMatrixInverse;
      delete this._lDir;
      return this;
   },
   _updateLightVectors : function() {
      if (! this._lDir) {
         var m = this.getViewMatrixInverse(), v = this._lDirInfo, dir, i;
         this._lDir = [];
         this._hDir = [];
         for (i = 0 ; i < v.length ; i += 3) {
            dir = CT.vectorNormalize(CT.matrixTransform(m, [ v[i], v[i+1], v[i+2], 0 ]));
	    this._lDir.push(dir[0], dir[1], dir[2]);
            dir = CT.vectorNormalize([dir[0], dir[1], dir[2] + 1]);
	    this._hDir.push(dir[0], dir[1], dir[2]);
         }
      }
   },
}

CT.Object = function() { } // BASE CLASS FOR COMPOSITE 3D OBJECTS.

CT.Object.prototype = {
   clear            : function()        { this._children = []; return this; },
   getChild         : function(i)       { return this._children[i]; },
   getProperty      : function(p, dflt) { return this[p] ? this[p] : this._parent ? this._parent.getProperty(p,dflt) : dflt; },
   getScene         : function()        { return this._scene = this.getProperty('_scene'); },
   getShape         : function()        { return this._shape; },
   identity         : function()        { this._matrix = CT.matrixIdentity(); return this; },
   numChildren      : function()        { return this._children.length; },
   rotateX          : function(a)       { CT.matrixMultiply(this._matrix, CT.matrixRotatedX(a), this._matrix); return this; },
   rotateY          : function(a)       { CT.matrixMultiply(this._matrix, CT.matrixRotatedY(a), this._matrix); return this; },
   rotateZ          : function(a)       { CT.matrixMultiply(this._matrix, CT.matrixRotatedZ(a), this._matrix); return this; },
   scale            : function(x, y, z) { CT.matrixMultiply(this._matrix, CT.matrixScaled(x,y,z), this._matrix); return this; },
   setColor         : function(r,g,b,p) { if (r instanceof Array) { p = r[3]; b = r[2]; g = r[1]; r = r[0]; }
                                              return this.setPhong([.1*r,.1*g,.1*b, .5*r,.5*g,.5*b, .5,.5,.5, CT.def(p,20)]); },
   setFragmentShader: function(str)     { this._fragmentShader = str; return this; },
   setMatrix        : function(matrix)  { CT.matrixCopy(matrix, this._matrix); return this; },
   setMetal         : function(r,g,b,p) { return this.setPhong([r/80,g/80,b/80, r/20,g/20,b/20, r,g,b, CT.def(p,7)]); },
   setNormalMap     : function(file)    { this._textureFile1 = file; return this; },
   setPhong         : function(phong)   { this._phong = phong; return this; },
   setTexture       : function(file)    { this._textureFile0 = file; return this; },
   setVertexShader  : function(str)     { this._vertexShader = str; return this; },
   translate        : function(x, y, z) { CT.matrixMultiply(this._matrix, CT.matrixTranslated(x,y,z), this._matrix); return this; },

   addChild : function(child) {
      this._children.push(child);
      child._parent = this;
      return child;
   },
   draw : function(globalMatrix) {
      if (! globalMatrix) {
	 var scene = this.getScene();
         if (this._gl != scene._gl)
	    this.setGL(scene._gl);
         globalMatrix = scene.getViewMatrixInverse();
      }
      CT.matrixMultiply(globalMatrix, this._matrix, this._globalMatrix);
      this._drawShape(this._shape, this._globalMatrix);
      for (var i = 0 ; i < this._children.length ; i++) 
          this._children[i].draw(this._globalMatrix);
   },
   init : function(shape) {
      this._children = [];
      this.identity();
      this._globalMatrix = CT.matrixIdentity();
      this._shape = shape;
      if (shape)
         shape._object = this;
      return this;
   },
   toObj : function(name, mInverse) {
      if (mInverse === undefined)
         window._toObj_nFaces = 0;
      var s = '', i, child;
      s += 'g ' + name + '\n';
      if (this._shape)
         s += this._shape.toObj(mInverse);
      if (this._children.length > 0) {
         if (mInverse === undefined)
	    mInverse = CT.matrixInverse(this._globalMatrix);
         for (i = 0 ; i < this._children.length ; i++) {
            child = this._children[i];
            s += child.toObj(name + '_' + i, CT.matrixMultiply(mInverse, child._globalMatrix));
         }
      }
      return s;
   },
   setGL : function(gl) {
      this._gl = gl;
      if (this._shape && this._shape._gl != gl)
         this._shape._initGL(gl);
      this._loadTexture(this._textureFile0, '_texture0');
      this._loadTexture(this._textureFile1, '_texture1');
      for (var i = 0 ; i < this._children.length ; i++)
         this._children[i].setGL(gl);
   },
   _drawShape : function(shape, globalMatrix) {
      if (shape) {
         shape._renderMatrix = globalMatrix;
         shape._useProgram();
         shape._draw();
      }
   },
   _loadTexture : function(fileName, textureId) {
      if (fileName && ! this[textureId]) {
         var that = this, gl = this._gl, image = new Image(), texture = gl.createTexture();
         image.onload = function() {
            gl.activeTexture (gl.TEXTURE0);
            gl.bindTexture   (gl.TEXTURE_2D, texture);
            gl.pixelStorei   (gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            that[textureId] = texture;
         };
         image.src = fileName;
      }
   },
}

CT.Shape = function() { } // A SHAPE IS THE OBJECT THAT HANDLES RENDERING OF A SINGLE TRIANGLE STRIP.

CT._vertexShaderPerspective =
   ['   pos.y *= uAspect;'
   ,'   pos = mix(pos, vec4(.5 * pos.xyz / pos.w, 1.), uEye * uEye);'
   ,'   pos.x += .5 * uEye;'
   ,'   vClipX = -pos.x * uEye;'
   ,'   pos.z = pos.z * .1;'
   ,'   gl_Position = pos;'
   ].join('\n');

CT.Shape.prototype = {
   getProperty     : function(p,dflt) { return this._object.getProperty(p, dflt); },
   getScene        : function()       { return this._object.getScene(); },
   getSceneProperty: function(p)      { return (this.getScene())[p]; },
   _address        : function(name)   { return this._gl.getUniformLocation(this._program, name); },

   surfaceExtruded : function(nu, nv, fu, fv) {
      this.surfaceParametric(nu, nv, function(u, v) {
         var xy = fu(u, v), x = xy[0], y = xy[1], p = fv(v), p1 = fv(v+.001);
	 var dz = CT.vectorNormalize([ p1[0]-p[0], p1[1]-p[1], p1[2]-p[2] ]);
	 var dx = [1, 0, 0];
	 var dy = CT.vectorNormalize(CT.vectorCross(dz, dx));
         return [ p[0] + x*dx[0] + y*dy[0]  ,  p[1] + x*dx[1] + y*dy[1]  ,  p[2] + x*dx[2] + y*dy[2] ];
      });
   },
   surfaceRevolved : function(nu, nv, f) {
      this.surfaceParametric(nu, nv, function(u, v) {
         var theta = 2 * Math.PI * u, xz = f(v);
         return [ xz[0] * Math.cos(theta), xz[0] * Math.sin(theta), xz[1] ];
      });
   },
   surfaceParametric : function(nu, nv, f) {              // CONVERT USER FUNCTION TO A PARAMETRIC SURFACE.
      var du = 1 / nu, dv = 1 / nv;
      var vertices = [], s;
      var addVertex = function(u, v) {                                                // COMPUTE PARAMETRIC VERTEX.
         var p = f( Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)) ),    // f MUST EVAL TO A POINT.
             pu = f(u+du/100, v),                                                  // APPROXIMATE TANGENTS BY
             pv = f(u, v+dv/100);                                                  // FINITE DIFFERENCING.
         var uu = CT.vectorNormalize([ pu[0] - p[0], pu[1] - p[1], pu[2] - p[2] ]);
         var vv = CT.vectorNormalize([ pv[0] - p[0], pv[1] - p[1], pv[2] - p[2] ]);
         var ww = CT.vectorCross(uu, vv);
         vertices.push(p[0],p[1],p[2],  uu[0],uu[1],uu[2],  vv[0],vv[1],vv[2],  ww[0],ww[1],ww[2],  u,v,  0,0);
      }
      var u = 0, d = du;
      for (var v = 0 ; v < 1 ; v += dv, d = -d)               // ZIGZAG ACROSS ROWS TO FORM A TRIANGLE STRIP.
         for (var i = 0 ; i <= nu ; i++) {
            addVertex(u, v);
	    addVertex(u, v + dv);
	    if (i < nu)
	       u += d;
            else
               addVertex(u, v);
         }
      this._vertices = new Float32Array(vertices);
   },
   toObj : function(m) {
      var s = '', v = this._vertices, nV = v.length / 16, nv, i, vec, nf = 0;

      function triangle(a, b, c) {
         a += _toObj_nFaces;
         b += _toObj_nFaces;
         c += _toObj_nFaces;
         s += 'f ' + a + '/' + a + '/' + a + ' '
	           + b + '/' + b + '/' + b + ' '
		   + c + '/' + c + '/' + c + '\n';
	 nf++;
      }

      if (m)
         for (i = 0 ; i < nV ; i++) {
	    vec = CT.matrixTransform(m, [v[16*i], v[16*i+1], v[16*i+2]]);
            s += 'v ' + vec[0] + ' ' + vec[1] + ' ' + vec[2] + '\n';
         }
      else
         for (i = 0 ; i < nV ; i++)
            s += 'v ' + v[16*i] + ' ' + v[16*i + 1] + ' ' + v[16*i + 2] + '\n';

      for (i = 0 ; i < nV ; i++)
         s += 'vt ' + v[16*i + 12] + ' ' + v[16*i + 13] + '\n';

      if (m) {
         m = CT.matrixTranspose(m);
         for (i = 0 ; i < nV ; i++) {
	    vec = CT.matrixTransform(m, [v[16*i + 9], v[16*i + 10], v[16*i + 11, 0]]);
            s += 'vn ' + vec[0] + ' ' + vec[1] + ' ' + vec[2] + '\n';
         }
      }
      else
         for (i = 0 ; i < nV ; i++)
            s += 'vn ' + v[16*i + 9] + ' ' + v[16*i + 10] + ' ' + v[16*i + 11] + '\n';

      if (this instanceof CT.ShapePolyhedron)
         for (i = 0 ; i < nV ; i += 3)
            triangle(i + 1, i + 2, i + 3);
      else
         for (i = 0 ; i < nV-1 ; i += 2) {
	    var i3 = i < nV - 2 ? i + 3 : i;
	    var i4 = i < nV - 3 ? i + 4 : i;
	    triangle(i + 1, i3, i + 2);
	    triangle(i + 2, i3, i4);
	 }

      _toObj_nFaces += nf;

      return s;
   },
   _addShader : function(type, str) {
      var gl = this._gl;
      var s = gl.createShader(type);
      gl.shaderSource(s, str);
      gl.compileShader(s);
      if (! gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.log("shader compiler error: " + gl.getShaderInfoLog(s));
      gl.attachShader(this._program, s);
   },
   _attrib : function(name, size, loc, stride) {
      var gl = this._gl, bpe = Float32Array.BYTES_PER_ELEMENT;
      gl.enableVertexAttribArray(this[name]);
      gl.vertexAttribPointer(this[name], size, gl.FLOAT, false, stride * bpe,  loc * bpe);
   },
   _cameraMatrix : function(f, eye) {
      return [ 1,0,0,0,  0,1,0,0,  0,0,-1,-1/f,  -.5*eye,0,-f,0 ];
   },
   _draw : function() {
      var gl = this._gl, program = this._program, scene = this.getScene();
      gl.uniform3fv      (this._address('uLColor'     ), this._lColor);
      gl.uniform3fv      (this._address('uLDir'       ), scene.getLDir());
      gl.uniform3fv      (this._address('uHDir'       ), scene.getHDir());
      gl.uniform1fv      (this._address('uPhong'      ), this.getProperty('_phong', [.05,.05,.05, .5,.5,.5, 1,1,1, 20]));
      gl.uniform1fv      (this._address('uTexture'    ), [this.getProperty('_texture0') ? 1 : 0 ,
                                                          this.getProperty('_texture1') ? 1 : 0 ] );
      gl.uniformMatrix4fv(this._address('uNorMatrix'  ), false,
         (function(m) { var x = m[0] * m[0] + m[1] * m[1] + m[ 2] * m[ 2],   // THE NORMAL MATRIX
                            y = m[4] * m[4] + m[5] * m[5] + m[ 6] * m[ 6],   // IS THE INVERSE
                            z = m[8] * m[8] + m[9] * m[9] + m[10] * m[10];   // TRANSPOSE OF THE
                        return [ m[0]/x, m[1]/x, m[ 2]/x, 0,                 // POSITION MATRIX.
                                 m[4]/y, m[5]/y, m[ 6]/y, 0,
                                 m[8]/z, m[9]/z, m[10]/z, 0,  0,0,0,1 ]; })(this._renderMatrix));

      this._drawArrays(this._vertices.length / 16);
   },
   _drawArrays : function(len) {
      var eye, fl, gl, matrix, stereo;
      fl = this.getScene().getFL();
      gl = this._gl;
      var drawMode = this instanceof CT.ShapePolyhedron ? gl.TRIANGLES : gl.TRIANGLE_STRIP;
      stereo = this.getScene().getStereo();
      gl.uniform1f(this._address('uAspect'), gl.canvas.width / gl.canvas.height);
      gl.uniform1f(this._address('uTime'), CT.time);
      for (eye = -stereo ; eye <= stereo ; eye += 2) {
         gl.uniformMatrix4fv(this._address('uMatrix'), false,
            CT.matrixMultiply(this._cameraMatrix(fl, eye), this._renderMatrix));
         gl.uniform1f(this._address('uEye'), eye);
	 gl.drawArrays(drawMode, 0, len);
      }
   },
   _initGL : function(gl) {
      this._gl           = gl;
      this._lColor       = this.getSceneProperty('_lColor');
      this._lDir         = this.getSceneProperty('_lDir');
      this._hDir         = this.getSceneProperty('_hDir');
      this._renderMatrix = CT.matrixIdentity();

      gl.enable    (gl.DEPTH_TEST);
      gl.depthFunc (gl.LEQUAL);
      gl.enable    (gl.BLEND);
      gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this._program = gl.createProgram();
      this._addShader(gl.VERTEX_SHADER  , this.getProperty('_vertexShader'  , this._defaultVertexShader  ));
      this._addShader(gl.FRAGMENT_SHADER, this.getProperty('_fragmentShader', this._defaultFragmentShader));
      gl.linkProgram(this._program);
      this._buffer  = gl.createBuffer();

      this._aPos      = gl.getAttribLocation(this._program, 'aPos');
      this._aTangent  = gl.getAttribLocation(this._program, 'aTangent');
      this._aBinormal = gl.getAttribLocation(this._program, 'aBinormal');
      this._aNormal   = gl.getAttribLocation(this._program, 'aNormal');
      this._aUV       = gl.getAttribLocation(this._program, 'aUV');
   },
   _isLoaded : function() {
      var gl = this._gl, texture, i;
      if (gl._program == this._program)
         return true;
      gl._program = this._program;
      gl.useProgram(this._program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
      gl.uniform1iv(this._address('uSampler'), [0,1,2,3,4,5,6,7]);
      for (i = 0 ; i < 8 ; i++)
         if (texture = this.getProperty('_texture' + i)) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture  (gl.TEXTURE_2D, texture);
         }
      return false;
   },
   _useProgram : function() {
      if (! this._isLoaded()) {
         this._attrib('_aPos'     , 3,  0, 16);
         this._attrib('_aTangent' , 3,  3, 16);
         this._attrib('_aBinormal', 3,  6, 16);
         this._attrib('_aNormal'  , 3,  9, 16);
         this._attrib('_aUV'      , 2, 12, 16);
      }
   },
   _defaultVertexShader :
      ['precision highp float;'
      ,'attribute vec3 aPos, aTangent, aBinormal, aNormal;'
      ,'attribute vec2 aUV;'
      ,'uniform mat4   uNorMatrix, uMatrix;'
      ,'uniform float  uEye, uAspect, uTime;'
      ,'varying vec3   vTangent, vBinormal, vNormal;'
      ,'varying vec2   vUV;'
      ,'varying float  vClipX;'
      ,'void main() {'
      ,'   vTangent  = normalize(uNorMatrix * vec4(aTangent ,0.)).xyz;'
      ,'   vBinormal = normalize(uNorMatrix * vec4(aBinormal,0.)).xyz;'
      ,'   vNormal   = normalize(uNorMatrix * vec4(aNormal  ,0.)).xyz;'
      ,'   vUV = aUV;'
      ,'   vec4 pos = uMatrix * vec4(aPos, 1.);'
      ,    CT._vertexShaderPerspective
      ,'}'
      ].join('\n'),

   _defaultFragmentShader :
      ['precision highp float;'
      ,'uniform sampler2D uSampler[8];'
      ,'uniform vec3  uLColor[3], uLDir[3], uHDir[3];'
      ,'uniform float uEye, uPhong[10], uTexture[2];'
      ,'varying vec3  vTangent, vBinormal, vNormal;'
      ,'varying vec2  vUV;'
      ,'varying float vClipX;'
      ,'void main(void) {'
      ,'   vec4 b = texture2D(uSampler[1], vUV);'
      ,'   vec3 normal = normalize(mix(vNormal, b.r * vTangent + b.g * vBinormal + b.b * vNormal, b.a * uTexture[1]));'
      ,'   vec3 rgb = vec3(uPhong[0], uPhong[1], uPhong[2]);'
      ,'   for (int i = 0 ; i < 3 ; i++) {'
      ,'      float d = max(0., dot(uLDir[i], normal));'
      ,'      float s = max(0., dot(uHDir[i], normal));'
      ,'      rgb += uLColor[i] * (vec3(uPhong[3], uPhong[4], uPhong[5]) * d +'
      ,'                           vec3(uPhong[6], uPhong[7], uPhong[8]) * pow(s, 4. * uPhong[9]));'
      ,'   }'
      ,'   vec4 texture = texture2D(uSampler[0], vUV);'
      ,'   rgb = mix(rgb, rgb * texture.rgb, texture.a * uTexture[0]);'
      ,'   gl_FragColor = vec4(pow(rgb, vec3(.45,.45,.45)), 1.) * step(vClipX, 0.);'
      ,'}'
      ].join('\n'),
}

CT.ShapePolyhedron = function(vs, fs, ns) {
   this._vertices = (function() {
      function addTriangle(a, b, c) {
         var ax = vs[3 * a], ay = vs[3 * a + 1], az = vs[3 * a + 2],
             bx = vs[3 * b], by = vs[3 * b + 1], bz = vs[3 * b + 2],
             cx = vs[3 * c], cy = vs[3 * c + 1], cz = vs[3 * c + 2];

	 var U = CT.vectorNormalize(                  [bx - ax, by - ay, bz - az]);
	 var W = CT.vectorNormalize(CT.vectorCross(U, [cx - bx, cy - by, cz - bz]));
	 var V = CT.vectorNormalize(CT.vectorCross(W, U));
         if (ns === undefined) {
            vertices.push(ax,ay,az, U[0],U[1],U[2], V[0],V[1],V[2], W[0],W[1],W[2], 0,0, 0,0);
            vertices.push(bx,by,bz, U[0],U[1],U[2], V[0],V[1],V[2], W[0],W[1],W[2], 0,0, 0,0);
            vertices.push(cx,cy,cz, U[0],U[1],U[2], V[0],V[1],V[2], W[0],W[1],W[2], 0,0, 0,0);
         }
	 else {
            vertices.push(ax,ay,az, U[0],U[1],U[2], V[0],V[1],V[2], ns[3 * a],ns[3 * a + 1],ns[3 * a + 2], 0,0, 0,0);
            vertices.push(bx,by,bz, U[0],U[1],U[2], V[0],V[1],V[2], ns[3 * b],ns[3 * b + 1],ns[3 * b + 2], 0,0, 0,0);
            vertices.push(cx,cy,cz, U[0],U[1],U[2], V[0],V[1],V[2], ns[3 * c],ns[3 * c + 1],ns[3 * c + 2], 0,0, 0,0);
	 }
      }
      var vertices = [];
      for (var i = 0 ; i < fs.length ; i += 3)
            addTriangle(fs[i], fs[i + 1], fs[i + 2]);
      return new Float32Array(vertices);
   })();
}
CT.ShapePolyhedron.prototype = new CT.Shape;

CT.ShapeCube = function() {
   this._vertices = (function() {
      function addFace(x,y,z, ax,ay,az, bx,by,bz) {
         vertices.push(x-ax-bx, y-ay-by, z-az-bz,  ax,ay,az, bx,by,bz,  x,y,z,  0,0, 0,0);
         vertices.push(x+ax-bx, y+ay-by, z+az-bz,  ax,ay,az, bx,by,bz,  x,y,z,  1,0, 0,0);
         vertices.push(x+ax+bx, y+ay+by, z+az+bz,  ax,ay,az, bx,by,bz,  x,y,z,  1,1, 0,0);
         vertices.push(x-ax+bx, y-ay+by, z-az+bz,  ax,ay,az, bx,by,bz,  x,y,z,  0,1, 0,0);
         vertices.push(x-ax-bx, y-ay-by, z-az-bz,  ax,ay,az, bx,by,bz,  x,y,z,  0,0, 0,0);
      }
      var vertices = [];
      addFace( 1, 0, 0,   0, 1, 0,   0, 0, 1);
      addFace( 0, 1, 0,   0, 0, 1,   1, 0, 0);
      addFace( 0, 0, 1,   1, 0, 0,   0, 1, 0);
      addFace( 0, 0,-1,  -1, 0, 0,   0, 1, 0);
      addFace( 0,-1, 0,   0, 0,-1,   1, 0, 0);
      addFace(-1, 0, 0,   0,-1, 0,   0, 0, 1);
      return new Float32Array(vertices);
   })();
}
CT.ShapeCube.prototype = new CT.Shape;

(CT.ShapeDisk         = function(n) { this.surfaceRevolved(n,1,function(t) { return [t+.001,0]; }); }).prototype = new CT.Shape;
(CT.ShapeExtruded     = function(nu,nv,fu,fv) { this.surfaceExtruded(nu, nv, fu, fv); }).prototype = new CT.Shape;
(CT.ShapeOpenCylinder = function(n) { this.surfaceRevolved(n, 2, function(t) { return [1, 2*t-1] }); }).prototype = new CT.Shape;
(CT.ShapeParametric   = function(nu,nv,f) { this.surfaceParametric(nu, nv, f); }).prototype = new CT.Shape;
(CT.ShapeRevolved     = function(nu,nv,f) { this.surfaceRevolved(nu, nv, f); }).prototype = new CT.Shape;

(CT.ShapeSphere = function(nu, nv) {
   nu = nu ? nu : 24;
   nv = nv ? nv : Math.floor(nu/2);
   this.surfaceRevolved(nu, nv, function(t) { var phi = Math.PI*t - Math.PI/2; return [ Math.cos(phi), Math.sin(phi) ]; });
}).prototype = new CT.Shape;

(CT.ShapeSquare = function(nu, nv) {
   this.surfaceParametric(1, 1, function(u, v) { return [2*u-1, 2*v-1, 0]; });
}).prototype = new CT.Shape;

(CT.ShapeTorus = function(nu, nv, r) {
   if (! r) r = 0.3;
   this.surfaceRevolved(nu, nv, function(t) { var phi = 2*Math.PI*t; return [ 1 - r * Math.cos(phi), -r * Math.sin(phi) ]; });
}).prototype = new CT.Shape;

// HERE ARE THE TYPES OF OBJECTS THAT THE MODELER CURRENTLY SUPPORTS.

CT.Cube         = function()        { this.init(new CT.ShapeCube());               }; CT.Cube.prototype         = new CT.Object;
CT.Cylinder     = function(n)       { this.init();
                                      if (n === undefined) n = 16;
                                      this.addChild(new CT.OpenCylinder(n));
                                      this.addChild(new CT.Disk(n)).translate(0,0,-1);
                                      this.addChild(new CT.Disk(n)).translate(0,0, 1);
                                                                                   }; CT.Cylinder.prototype     = new CT.Object;
CT.Disk         = function(n)       { this.init(new CT.ShapeDisk(n));              }; CT.Disk.prototype         = new CT.Object;
CT.Extruded = function(nu,nv,fu,fv) { this.init(new CT.ShapeExtruded(nu,nv,fu,fv));}; CT.Extruded.prototype     = new CT.Object;
CT.Node         = function()        { this.init();                                 }; CT.Node.prototype         = new CT.Object;
CT.OpenCylinder = function(n)       { this.init(new CT.ShapeOpenCylinder(n));      }; CT.OpenCylinder.prototype = new CT.Object;
CT.Parametric   = function(nu,nv,f) { this.init(new CT.ShapeParametric(nu,nv,f));  }; CT.Parametric.prototype   = new CT.Object;
CT.Polyhedron   = function(vs,fs,ns){ this.init(new CT.ShapePolyhedron(vs,fs,ns)); }; CT.Polyhedron.prototype   = new CT.Object;
CT.Revolved     = function(nu,nv,f) { this.init(new CT.ShapeRevolved(nu,nv,f));    }; CT.Revolved.prototype     = new CT.Object;
CT.Sphere       = function(m,n)     { this.init(new CT.ShapeSphere(m,n));          }; CT.Sphere.prototype       = new CT.Object;
CT.Square       = function()        { this.init(new CT.ShapeSquare());             }; CT.Square.prototype       = new CT.Object;
CT.Torus        = function(m,n,r)   { this.init(new CT.ShapeTorus(m,n,r));         }; CT.Torus.prototype        = new CT.Object;

