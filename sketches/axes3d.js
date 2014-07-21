
registerGlyph("axes3D()",  [ [[0,0],[0,-1]], [[0,0],[1,.1]], [[0,0],[-.2,.2]] ]);

function axes3D() {
   var a = root.addNode();
   a.addCube().getMatrix().translate( .5, .0, .0).scale(.50,.03,.03);
   a.addCube().getMatrix().translate( .0, .5, .0).scale(.03,.50,.03);
   a.addCube().getMatrix().translate( .0, .0, .5).scale(.03,.03,.50);
   a.addCube().getMatrix().translate(-.5, .0, .0).scale(.50,.01,.01);
   a.addCube().getMatrix().translate( .0,-.5, .0).scale(.01,.50,.01);
   a.addCube().getMatrix().translate( .0, .0,-.5).scale(.01,.01,.50);
   a.setMaterial(blackMaterial);

   geometrySketch(a, [-.25,.3,-.1,-.1,2]);

   a.update = function() {
      //this.getMatrix().rotateY(time);
   }
}
