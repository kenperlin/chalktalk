
   registerGlyph("contactSketch()", [

      // TEMPLATE TO MATCH FOR THE FREEHAND SKETCH OF THE CONTACT LENS.

      makeOval(-1,-.8, 2, 2, 20, TAU*5/8, TAU*7/8),
      [[-.7,-.5],[.7,-.5]],
   ]);

   function contactSketch() {
      var node = root.addNode();
      node.addGlobe(32,8, 0,2*PI, -PI,PI/3);
      var material = new phongMaterial().setAmbient(.25,.3,.35).setDiffuse(.5,.6,.7).setSpecular(1,1,1,20);
      material.side = THREE.DoubleSide;
      material.transparent = true;
      material.opacity = 0.5;
      node.setMaterial(material);
      var sketch = geometrySketch(node, [0,-.45, 0*PI, 0*PI, 1.8]);
   }

