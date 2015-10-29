
function StrokesManager() {
   this._strokes = [];
   for (var i = 0 ; i < 7 ; i++)
      this._strokes.push([]);
}

StrokesManager.prototype = {

   // THE ROOT OBJECT TO ADD TO THE RENDERABLE THREE.js SCENE.

   getRoot : function() {
      if (! this.root) {
         this.root = new THREE.Object3D();
	 this.root.setMaterial(new shaderMaterial(defaultVertexShader, defaultFragmentShader));
      }
      return this.root;
   },

   // DO EVERY FRAME: beginFrame() , addStroke().... , endFrame()

   beginFrame : function() {
      var i, j;
      for (i = 0 ; i < this._strokes.length ; i++)
         for (j = 0 ; j < this._strokes[i].length ; j++)
	    delete this._strokes[i][j].mesh.parent;
      this.getRoot().children = [];
   },

   addStroke : function(curve, rgba) {
      var stroke = this._getStroke(curve.length);
      this.getRoot().children.push(stroke.mesh);
      stroke.mesh.parent = this.getRoot();
      stroke.curve = curve;
      stroke.rgba = rgba;
      return stroke;
   },

   endFrame : function() {
      var i, j, stroke;
      for (i = 0 ; i < this._strokes.length ; i++)
         for (j = 0 ; j < this._strokes[i].length ; j++) {
	    stroke = this._strokes[i][j];
	    if (stroke.mesh.parent)
	       stroke.render(stroke.curve, stroke.rgba);
         }
   },

   // MANAGE A REUSABLE STORE OF STROKES, ORGANIZED BY SIZE.

   _sizes : [16, 32, 64, 128, 256, 512, 1000],

   _getStroke : function(size) {
      var i, j, stroke;
      for (i = 0 ; i < this._sizes.length - 1 && size >= this._sizes[i] ; i++)
         ;
      for (j = 0 ; j < this._strokes[i].length && ! stroke ; j++)
         if (! this._strokes[i][j].mesh.parent)
	    stroke = this._strokes[i][j];
      if (! stroke) {
         this._strokes[i].push( stroke = new RenderedStroke(this._sizes[i]) );
      }
      return stroke;
   },
}

