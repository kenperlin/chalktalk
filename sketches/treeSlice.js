
function TreeSlice() {
   this.labels = "treeSlice".split(' ');

   this.vertices = tree_obj.vertices;
   this.faces = tree_obj.faces;

   this.render = function(elapsed) {
      var z = isDef(this.in[0]) ? this.inValue[0] : 0;

      for (var f = 0 ; f < this.faces.length ; f++) {
         var face = this.faces[f];
         var P = [ this.vertices[face[0]-1],
                   this.vertices[face[1]-1],
                   this.vertices[face[2]-1] ];
         var C = [];
         for (var i = 0 ; i < 3 ; i++) {
            var j = (i + 1) % 3;
            if (P[i] === undefined || P[j] === undefined)
               continue;
            if ((P[i][2] > z) != (P[j][2] > z)) {
               var t = (z - P[i][2]) / (P[j][2] - P[i][2]);
               var x = lerp(t, P[i][0], P[j][0]);
               var y = lerp(t, P[i][1], P[j][1]);
               C.push([x,y,z]);
            }
         }
         if (C.length > 1)
            mCurve(C);
      }
   }
}
TreeSlice.prototype = new Sketch;
addSketchType("TreeSlice");

