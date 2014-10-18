
   function S2C() {
      this.initSketchTo3D("s2c", [ [[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1] ] ], function() { return root.addCube(); });
   }
   S2C.prototype = new SketchTo3D;
   addSketchType("S2C");

