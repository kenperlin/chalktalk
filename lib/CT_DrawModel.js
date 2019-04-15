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

CT.createDrawFunction = function(type) {
   CT.Object.prototype["draw" + type] = function(a,b,c,d,e,f) { return this._drawChild(type,a,b,c,d,e,f); }
   window["m" + type] = function(a,b,c,d,e,f) {
      sk()._isModel = true;
      return sk().glyphTransition > 0 ? sk().model()["draw" + type](a,b,c,d,e,f).xform(m._m())
                                      : CT._defaultModel; 
   };
}

CT._drawTypes = 'Cone Cube Cylinder Disk Extruded OpenCone OpenCylinder Parametric Polyhedron Revolved Sphere Square Torus'.split(' ');

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


CT.Object.prototype.color   = function(r,g,b) { this._draw_color = typeof r == 'number' ? [r,g,b] : r; return this; }
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

CT.Object.prototype.fragmentShader = function(shader) {
   if (this._shape && ! this._fragmentShader) {
      this._fragmentShader = shader;
      this._shape._initGL(this._gl);
   }
}

CT.Object.prototype.vertexShader = function(shader) {
   if (this._shape && ! this._vertexShader) {
      this._vertexShader = shader;
      this._shape._initGL(this._gl);
   }
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

CT.colorsMap = new Map([
   ['white',  [1,1,1]],
   ['pink',   [1,.25,.25]],
   ['red',    [1,0,0]],
   ['orange', [1,.25,0]],
   ['yellow', [1,1,0]],
   ['green',  [0,1,0]],
   ['cyan',   [0,.7,.7]],
   ['blue',   [0,0,.5]],
   ['magenta',[1,0,.5]],
   ['brown',  [.2,.07,.05]],
   ['black',  [0,0,0]],
   ['gray',   [.25,.25,.25]],
   ['violet', [.115,0,.3]],
   ['clay'  , [.36,.17,.39]],
]);

CT.colorsArray = Array.from(CT.colorsMap.keys());
CT.colors = CT.colorsArray.join(',');

CT.getRGB = color => typeof color === 'string' ? CT.colorsMap.get(color) : def(color, [1,1,1]);

CT.Object.prototype._endFrame = function() {
   this._matrix = CT.matrixMultiply(this._draw_matrix,
                  CT.matrixMultiply(CT.matrixTranslated(this._draw_t),
                  CT.matrixMultiply(CT.matrixRotatedX  (this._draw_rx),
                  CT.matrixMultiply(CT.matrixRotatedY  (this._draw_ry),
                  CT.matrixMultiply(CT.matrixRotatedZ  (this._draw_rz),
                                    CT.matrixScaled    (this._draw_s)
   )))));

   let rgb = CT.getRGB(this._draw_color);
   var alpha = sk().getAlpha();
   if (alpha < 1)
      rgb = mix(backgroundRGB(), rgb, alpha);
   this.setColor(rgb);

   if (this._draw_texture && this._draw_texture != this._textureSrc0
       || CT.reflectionMap && ! this._textureSrc2) {
      this.setTexture(this._draw_texture);
      this.setGL(this._gl);
   }

   if (this._draw_hash == 'Node') {
      for (let i = 0 ; i < this._draw_count ; i++)
         this._children[i]._endFrame();
      this._children.splice(this._draw_count, this._children.length);
   }
}

CT.Object.prototype._drawChild = function(type, a, b, c, d, e, f) {
   var that = this;
   if (that._draw_hash != 'Node')
      that = that._parent;

   var i, child = that._children[that._draw_count], hash = type;

   if (a !== undefined) hash += ',' + a;
   if (b !== undefined) hash += ',' + b;
   if (c !== undefined) hash += ',' + c;
   if (d !== undefined) hash += ',' + d;
   if (e !== undefined) hash += ',' + e;
   if (f !== undefined) hash += ',' + f;

   // IF NO EXISTING CHILD, OR CHILD IS NOT THE RIGHT TYPE:

   if (! child || child._draw_hash != hash) {

      // REBUILD ALL CHILDREN FROM THIS ONE FORWARD,

      that._children.splice(that._draw_count, that._children.length);

      // THEN CREATE A NEW CHILD OF THE PROPER TYPE.
      
      child = new CT[type](a,b,c,d,e,f);
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
	  
	  // for unity
	  if (window.displayListener){
		  console.log(type);
		  _drawMeshChild(child);
	  }	  
   }else if(child){
	   // for unity
	   if (window.displayListener){
		  _drawMeshChild(child);
	  }	
   }

   child._beginFrame();
   that._draw_count++;
   return child;
}


