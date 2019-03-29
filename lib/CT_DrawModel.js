"use strict";

// USER FUNCTIONS

CT.drawModelCreate = function(scene) {
   var model = new CT.Node();
   model._draw_hash = 'Node'; 
   scene.add(model);
   model._gl = scene._gl;
   return model;
}

CT.Object.prototype.Begin = function() { return this._drawChild('Node'); }
CT.Object.prototype.End   = function() { return this._draw_hash == 'Node' ? this._parent : this._parent._parent; }

CT._defaultModel = new CT.Object();

const WEE = {
   obj : null,
   mat : null
}

CT.createDrawFunction = function(type) {
   eval('CT.Object.prototype.draw' + type + ' = function(a,b,c,d) { const child = this._drawChild("' + type + '",a,b,c,d); WEE.obj = child; return child; }');
   eval('window.m' + type + ' = function(a,b,c,d) {\
      sk()._isModel = true;\
      return sk().glyphTransition > 0 ? sk().model().draw' + type + '(a,b,c,d).xform(m._m())\
                                      : CT._defaultModel; };');
}

CT._drawTypes = 'Cube Cylinder Disk Extruded OpenCylinder Parametric Polyhedron Revolved Sphere Square Torus'.split(' ');
for (var i in CT._drawTypes)
   CT.createDrawFunction(CT._drawTypes[i]);

function mBoxes(B) {
   var vf = CT.vfBoxes(B);
   return mPolyhedron(vf[0], vf[1]);
}

function mBox(L, H) {
   var p = mPolyhedron([
      L[0], L[1], L[2], H[0], L[1], L[2],
      L[0], H[1], L[2], H[0], H[1], L[2],
      L[0], L[1], H[2], H[0], L[1], H[2],
      L[0], H[1], H[2], H[0], H[1], H[2] ], [ 0,2,3, 3,1,0,   4,5,7, 7,6,4,
                                              0,4,6, 6,2,0,   1,3,7, 7,5,1,
                                              0,1,5, 5,4,0,   2,6,7, 7,3,2 ]);
   return p;
}

function mPolygon(p) {
   var faces = [], i, n = p.length/3;
   for (var i = 0 ; i < n - 2 ; i++)
      faces.push(0, (i + 1) % n, (i + 2) % n);
   return mPolyhedron(p, faces);
}


CT.Object.prototype.color   = function(r,g,b) { this._draw_color = r instanceof Array ? r : [r, g, b]; return this; }
CT.Object.prototype.move    = function(x,y,z) { this._draw_t = x instanceof Array ? x : [x, y, z]; return this; }
CT.Object.prototype.texture = function(file)  { this._draw_texture = file; return this; }
CT.Object.prototype.turnX   = function(a)     { this._draw_rx = a; return this; }
CT.Object.prototype.turnY   = function(a)     { this._draw_ry = a; return this; }
CT.Object.prototype.turnZ   = function(a)     { this._draw_rz = a; return this; }
CT.Object.prototype.size    = function(x,y,z) { if (x instanceof Array) { z = x[2]; y = x[1]; x = x[0]; }
                                                this._draw_s = [x, CT.def(y,x), CT.def(z,x)]; return this; }
CT.Object.prototype.xform   = function(m) {
   var tm = CT.matrixTranslated(0,0,-ctScene.getFL());
   this._draw_matrix = CT.matrixMultiply(tm, m);
   return this;
}
CT.Object.prototype.applyRecursively = function(property, value) {
   (this[property])(value);
   for (var i = 0 ; i < this._children.length ; i++)
      this._children[i].applyRecursively(property, value);
}


// INTERNAL AND BOOKKEEPING FUNCTIONS

CT.Object.prototype._beginFrame = function() {
   this._draw_rx =
   this._draw_ry =
   this._draw_rz = 0;
   this._draw_s = [1,1,1];
   this._draw_t = [0,0,0];
   this._draw_texture = null;
   if (this._parent && this._parent._draw_color)
      this._draw_color = this._parent._draw_color;
   this._draw_count = 0;
}

// test = CT.matrixMultiply(pixelSpaceTo3DSpaceMatrix(), WEE.mat);
var deferredMeshDataSend = null;
var matTranslationBuff   = [0, 0, 0];
var matRotationBuff      = [0, 0, 0];
var matScaleBuff         = [0, 0, 0];
function getTranslation(matrix) {
   matTranslationBuff[0] = matrix[12];
   matTranslationBuff[1] = matrix[13];
   matTranslationBuff[2] = matrix[14];

   return matTranslationBuff;
}

function getRotation(matrix) {
   //matRotationBuff[0] = matrix[0];
   //matRotationBuff[1] = matrix[5];
   //matRotationBuff[2] = matrix[10];

   return matRotationBuff;
}

function getScale(matrix) {
   matScaleBuff[0] = matrix[0];
   matScaleBuff[1] = matrix[5];
   matScaleBuff[2] = matrix[10];
   
   return matScaleBuff;
}

CT.Object.prototype._endFrame = function() {
   this._matrix = CT.matrixMultiply(this._draw_matrix,
                  CT.matrixMultiply(CT.matrixTranslated(this._draw_t),
                  CT.matrixMultiply(CT.matrixRotatedX  (this._draw_rx),
                  CT.matrixMultiply(CT.matrixRotatedY  (this._draw_ry),
                  CT.matrixMultiply(CT.matrixRotatedZ  (this._draw_rz),
                                    CT.matrixScaled    (this._draw_s)
   )))));

   // if (this.deferredMeshDataSend != null) {
   //    this.deferredMeshDataSend(this._matrix);
   //    this.deferredMeshDataSend = null;
   // }

   WEE.mat = this._matrix;

   var rgb = this._draw_color ? this._draw_color : [1, 1, 1];
   var alpha = sk().getAlpha();
   if (alpha < 1)
      rgb = mix(backgroundRGB(), rgb, alpha);
   this.setColor(rgb);

   if (this._draw_texture && this._draw_texture != this._textureFile0) {
      this.setTexture(this._draw_texture);
      this.setGL(this._gl);
   }

   if (this._draw_hash == 'Node') {
      for (let i = 0 ; i < this._draw_count ; i++)
         this._children[i]._endFrame();
      this._children.splice(this._draw_count, this._children.length);
   }
   else {
      //console.log(this._globalMatrix[12], this._globalMatrix[13], this._globalMatrix[14], this._globalMatrix[15]);
   }
}

var meshDataSendCallbackQueue = [];
function enqueueSendMeshData(type, child, sketch) {
   if (!child._shape) {
	   console.log("HEHE: child._shape not exist");
      return;
   }
   console.log("HEHE: func enqueueSendMeshData: type\t" + type);
   const a = child._shape.argA;
   const b = child._shape.argB;
   const c = child._shape.argC;
   const d = child._shape.argD;

   meshDataSendCallbackQueue.push(function() {
      const matResult = child._globalMatrix;//CT.matrixMultiply(pixelSpaceTo3DSpaceMatrix(), matrix);

      const trans = getTranslation(matResult);
      const rot   = getRotation(matResult);
      const scale = sketch.scale() * sketch.xyzS() / 7;
      //getScale(matResult);

      //console.log(trans, scale);
      if (isNaN(trans[0])) {
         return;
      }

      // temp
      // rot[0] = sketch.rX;
      // rot[1] = sketch.rY;
      // rot[2] = 0;

      const rx = sketch.rX; 
      const ry = sketch.rY;
      const yy = min(1, 4 * ry * ry);

      const rotX = -PI * ry;
      const rotY = PI * rx * (1 - yy);
      const rotZ = -PI * rx *      yy;

      rot[0] = rotX;
      rot[1] = rotY;
      rot[2] = rotZ;


      _sendMeshData(
         0, type /* temp */, sketch.id, 0 /* temp 0, need to increment for each sub mesh */, 
         trans[0], trans[1], sketch.zOffset(),
         rot[0], rot[1], rot[2], scale,
         matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
         [a, b, c, d]
      );

      // (KTR):
      // eventually when not sending individual components, still need to send the z offset and add it to the
      // original position.z
      
      //_sendMeshData(
      //   0, type /* temp */, sketch.id, 0 /* temp 0, need to increment for each sub mesh */, 
      //   sketch.zOffset(),
      //   someCorrectMatrixResult,
      //   [a, b, c, d]
      //);
   });
}

CT.Object.prototype._drawChild = function(type, a, b, c, d) {
   var that = this;
   if (that._draw_hash != 'Node')
      that = that._parent;

   var i, child = that._children[that._draw_count], hash = type;

   if (a !== undefined) hash += ',' + a;
   if (b !== undefined) hash += ',' + b;
   if (c !== undefined) hash += ',' + c;
   if (d !== undefined) hash += ',' + d;

   // IF NO EXISTING CHILD, OR CHILD IS NOT THE RIGHT TYPE:


   if (! child || child._draw_hash != hash) {
      // REBUILD ALL CHILDREN FROM THIS ONE FORWARD,

      that._children.splice(that._draw_count, that._children.length);

      // THEN CREATE A NEW CHILD OF THE PROPER TYPE.
      
      eval('child = new CT.' + type + '(a,b,c,d)');
      child._draw_hash = hash;
      that.add(child);

      function initGL(obj) {
         obj._gl = that._gl;
         if (obj._shape)
            obj._shape._initGL(that._gl);
         if (obj._children)
            for (var i = 0 ; i < obj._children.length ; i++)
               initGL(obj._children[i]);
      }
      initGL(child);

      if (window.displayListener) {
            console.log(type);
         const S = sk();
         if (S) {
            //console.log(time, child._globalMatrix[12], child._globalMatrix[13], child._globalMatrix[14], child._globalMatrix[15]);
            let Q = [child];
            while (Q.length != 0) {
               let c = Q.shift();

               enqueueSendMeshData(c.typeName, c, S);

               if (c._children) {
                  const children = c._children;
                  for (let i = 0; i < children.length; i += 1) {
                     Q.unshift(children[i]);
                  }
               }
            }
         }
      }
   }
   else if (child) {
      if (window.displayListener) {
         // temp send every time
         const S = sk();
         if (S) {
            //console.log(time, child._globalMatrix[12], child._globalMatrix[13], child._globalMatrix[14], child._globalMatrix[15]);
            let Q = [child];
            while (Q.length != 0) {
               let c = Q.shift();

               enqueueSendMeshData(c.typeName, c, S);

               if (c._children) {
                  const children = c._children;
                  for (let i = 0; i < children.length; i += 1) {
                        Q.unshift(children[i]);
                  }
               }
            }
         }
      }
   }

   child._beginFrame();
   that._draw_count++;
   return child;
}

