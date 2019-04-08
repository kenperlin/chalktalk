/* Utility string parsing function */

var to_array = (string) => string.split(' ').map(Number);

/* Collada geometry parsing functions */

var get_mesh_array = (mesh, i) => to_array(mesh.source[i].float_array.value);

var get_mesh_indices = (mesh, offset) => {
   return to_array(mesh.polylist.p)
      .filter((_, i) => (i - offset) % 3 == 0);
}

/* Collada skin parsing functions */

var get_blends = (skin, remap) => {
   /* Array of unique float weights */
   let raw_weights = to_array(skin.source[2].float_array.value);

   /* Number of joints affecting each vertex */
   let counts = to_array(skin.vertex_weights.vcount);

   /* Array of matrix-weight pairs */
   let mappings = to_array(skin.vertex_weights.v);

   let vertices = [];
   var root = 0;

   /* Iterate through vertex blend data */
   for (var i = 0; i < counts.length; ++i) {
      let m_indices = [];
      let weights = [];
      var sum = 0;

      /* Iterate through matrix-weight pairs for this vertex */
      for (var j = 0; j < counts[i]; ++j) {
         /* Get remapped matrix index */
         let m_index = remap(mappings[root]);
         m_indices.push(m_index);

         /* Get weight for this vertex/matrix */
         let w_index = mappings[root + 1];
         let weight = raw_weights[w_index];

         console.assert(
            w_index < raw_weights.length,
            'Invalid weight index. Check for \'\\n\' in the JSON.'
         );

         weights.push(weight);
         sum += weight;

         root += 2;
      }

      /* Normalize weights */
      for (var k = 0; k < weights.length; ++k) {
         weights[k] /= sum;
      }

      vertices.push(
         {
            m_indices,
            weights,
         }
      );
   }

   return vertices;
}

/* Object data wrapper */

var get_mesh_data = (file, i, remap) => {
   var mesh = null;
   var skin = null;

   if (i < 0) {
      mesh = file.COLLADA.library_geometries.geometry.mesh;
      skin = file.COLLADA.library_controllers.controller.skin;
   } else {
      mesh = file.COLLADA.library_geometries.geometry[i].mesh;
      skin = file.COLLADA.library_controllers.controller[i].skin;
   }

   return {
      positions: get_mesh_array(mesh, 0),
      p_indices: get_mesh_indices(mesh, 0),
      normals:   get_mesh_array(mesh, 1),
      n_indices: get_mesh_indices(mesh, 1),
      uvs:       get_mesh_array(mesh, 2),
      u_indices: get_mesh_indices(mesh, 2),
      blends:    get_blends(skin, remap),
   }
}
