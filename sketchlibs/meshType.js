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
         matrix = matrix.toFlatArray();
      }
      return new AT.Mesh(mult(matrix, this.mesh));
   }
});

// For use in the matrix sketch, show pairs of matrices and meshes just as matrices
// when connecting to the background or convering to a string.
AT.defineConversionsViaIntermediary(AT.Pair(AT.Matrix, AT.Mesh), AT.Matrix, AT.String);
