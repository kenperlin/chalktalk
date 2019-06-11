function() {

   this.label = "mesh_shape";

   this.shapeCommandIdx = 0;

   const tetrahedronData = (function() { 
      const alt = sqrt(3) * 1.0;
      const apo = alt / 3;
      const rad = alt - apo;

      const proj = sqrt(alt * alt - apo * apo);
      const low = proj * 0.25;
      const up = 3 * low;

      const V = [
          0.0, -low,  rad,
          1.0, -low, -apo,
         -1.0, -low, -apo,

          0.0, -low,  rad,
          1.0, -low, -apo,
         -1.0, -low, -apo,

          0.0, up, 0.0 // Peak
      ];

      const T = [
         0, 2, 1,
         3, 4, 6,
         4, 5, 6,
         5, 3, 6
      ];

      const _data = {V : V, T : T};

      return _data;

   }()); 

   const shapeCommands = [
      function() {
         // cube
         mCube();
      },
      function() {
         // sphere
         mSphere();
      },
      function() {
         mTorus(20, 20, 0.3);
      },
      function() {
         // diamond
         const V = [-1,0,0, 1,0,0, 0,-1,0, 0,1,0, 0,0,-1, 0,0,1];
         const T = [0,2,4, 1,2,4, 0,3,4, 1,3,4, 0,2,5, 1,2,5, 0,3,5, 1,3,5];
         mPolyhedron(V, T);
      },
      function() {
         // disk
         mDisk(20, 20, 15);
      },
      function() {
         // square
         mSquare(24, 24, 10);
      },
      function() {
         // tetrahedron
         mPolyhedron(tetrahedronData.V, tetrahedronData.T);
      },
      function() {
         const V = [
            -1,-1,-1, 1,-1,-1, -1,1,-1 
         ];
         const T = [0, 1, 2];

         mPolyhedron(V, T);
      }
      //function() {

         // define vertices and triangles and optionally normals to get any arbitrary shape / model (something interesting?),
         // send to mPolyhedron(V, T, N)
      //},
   ];


   this.onSwipe[0] = ["switch shape right", function() {  // swipe right
      this.shapeCommandIdx = (this.shapeCommandIdx + 1) % shapeCommands.length; 
   }];
   this.onSwipe[4] = ["switch shape left", function() { // swipe left
      if (shapeCommandIdx == 0) {
         this.shapeCommandIdx = shapeCommands.length - 1;
      }
      else {
         this.shapeCommandIdx -= 1;
      } 
   }];


   this.render = function(elapsedTime) {
      this.duringSketch(function() {
         mLine([-1, 1], [1, -1]);
         mLine([-1, 1], [1, -1]);
      });

      this.afterSketch(function() {
         shapeCommands[this.shapeCommandIdx]();
      });
   };
}
