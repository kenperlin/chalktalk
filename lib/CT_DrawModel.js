
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
   eval('CT.Object.prototype.draw' + type + ' = function(a,b,c,d) { return this._drawChild("' + type + '",a,b,c,d); }');
   eval('m' + type + ' = function(a,b,c,d) { sk()._isModel = true; return sk().glyphTransition > 0 ? sk().model().draw' +
                                             type + '(a,b,c,d).xform(m._m()) : CT._defaultModel; };');
}

CT._drawTypes = 'Cube Cylinder Disk Extruded OpenCylinder Parametric Revolved Sphere Square Torus'.split(' ');
for (var i in CT._drawTypes)
   CT.createDrawFunction(CT._drawTypes[i]);

CT.Object.prototype.color = function(r,g,b) { this._draw_color = r instanceof Array ? r : [r, g, b]; return this; }
CT.Object.prototype.move  = function(x,y,z) { this._draw_t = [x, y, z]; return this; }
CT.Object.prototype.turnX = function(a)     { this._draw_r[0] = a; return this; }
CT.Object.prototype.turnY = function(a)     { this._draw_r[1] = a; return this; }
CT.Object.prototype.turnZ = function(a)     { this._draw_r[2] = a; return this; }
CT.Object.prototype.size  = function(x,y,z) { if (x instanceof Array) { z = x[2]; y = x[1]; x = x[0]; }
                                              this._draw_s = [x, CT.def(y,x), CT.def(z,x)]; return this; }
CT.Object.prototype.xform = function(m)     { this._draw_matrix = m; return this; }
CT.Object.prototype.applyRecursively = function(property, value) {
   (this[property])(value);
   for (var i = 0 ; i < this._children.length ; i++)
      this._children[i].applyRecursively(property, value);
}


// INTERNAL AND BOOKKEEPING FUNCTIONS

CT.Object.prototype._beginFrame = function() {
   this._draw_r = [0,0,0];
   this._draw_s = [1,1,1];
   this._draw_t = [0,0,0];
   if (this._parent && this._parent._draw_color)
      this._draw_color = this._parent._draw_color;
   this._draw_count = 0;
}

CT.Object.prototype._endFrame = function() {
   var i;

   this._matrix = this._draw_matrix ? this._draw_matrix :
                  CT.matrixMultiply(CT.matrixTranslated(this._draw_t),
                  CT.matrixMultiply(CT.matrixRotatedX  (this._draw_r[0]),
                  CT.matrixMultiply(CT.matrixRotatedY  (this._draw_r[1]),
                  CT.matrixMultiply(CT.matrixRotatedZ  (this._draw_r[2]),
                                    CT.matrixScaled    (this._draw_s)))));

   this.setColor(this._draw_color ? this._draw_color : [1, 1, 1]);

   if (this._draw_hash == 'Node') {
      for (i = 0 ; i < this._draw_count ; i++)
         this._children[i]._endFrame();
      this._children.splice(this._draw_count, this._children.length);
   }
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
      that.addChild(child);

      function initGL(obj) {
         obj._gl = that._gl;
         if (obj._shape)
            obj._shape._initGL(that._gl);
         if (obj._children)
	    for (var i = 0 ; i < obj._children.length ; i++)
	       initGL(obj._children[i]);
      }
      initGL(child);
   }

   child._beginFrame();
   that._draw_count++;
   return child;
}

