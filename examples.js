
   registerGlyph("axes3DSketch()",   [ [[0,0],[0,1]], [[0,0],[1,-.1]], [[0,0],[-.2,-.2]] ]);
// registerGlyph("cubeSketch()",     [ [[-1,-1],[-1, 1],[ 1, 1],[ 1,-1],[-1,-1]] ]);
// registerGlyph("cylinderSketch()", [ [[ 1,-1],[ 1, 1],[-1, 1],[-1,-1],[ 1,-1]] ]);
   registerGlyph("sphereSketch()",
      [ makeOval(-1,-1,2,2,20,3*PI/2,-PI/2) ]
   );

   function sphereSketch()   { geometrySketch(root.addGlobe()); }
// function cubeSketch()     { geometrySketch(root.addCube()); }
   function cylinderSketch() { geometrySketch(root.addCylinder()); }
   function axes3DSketch() {
      var a = root.addNode();
      a.addCube().getMatrix().translate( .5, .0, .0).scale(.50,.03,.03);
      a.addCube().getMatrix().translate( .0, .5, .0).scale(.03,.50,.03);
      a.addCube().getMatrix().translate( .0, .0, .5).scale(.03,.03,.50);
      a.addCube().getMatrix().translate(-.5, .0, .0).scale(.50,.01,.01);
      a.addCube().getMatrix().translate( .0,-.5, .0).scale(.01,.50,.01);
      a.addCube().getMatrix().translate( .0, .0,-.5).scale(.01,.01,.50);
      a.setMaterial(bgMaterial());
      geometrySketch(a, [-.25,.3,-.1,-.1,2]);
   }

   function alan() { image('alan_kay_smiling.jpg', 1.8); }
   function diner() { image('red_fox_diner.jpg', 0.75); }
   function face() { image('smiling_cat.jpg', 0.35); }
   function kwa() { image('kwalado.jpg'); }

   function unitCube() {
      drawUnitCube();
   }

   function unitDisk() {
      drawUnitDisk();
   }

   function unitTube() {
      drawUnitTube();
   }

   updateScene = function(elapsed) {
      //root.getMatrix().rotateY(elapsed).rotateX(2 * elapsed);
      //root.getMatrix().identity().translate(1,0,0).scale(1,1,.01);
   }

