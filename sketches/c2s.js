
   function C2S() {
      this.initSketchTo3D("c2s", [ makeOval(-1,-1,2,2,20,-PI/2,3*PI/2) ], function() { return root.addGlobe(); });
   }
   C2S.prototype = new SketchTo3D;
   addSketchType("C2S");

