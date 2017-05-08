"use strict";

AT.defineType({
   typename: "Mesh",
   init: function(vertices) {
      if (!(vertices instanceof Array)) {
         throw AT.ConstructionError("Mesh must be created with an array of vertices.");
      }
      this.mesh = vertices;
   },
   transform: function(matrix) {
      if (matrix instanceof AT.Matrix) {
         matrix = matrix.values;
      }
      return new AT.Mesh(mult(matrix.toFlatArray(), this.mesh));
   }
});
