
   function Lens() {
      this.initSketchTo3D(
         "lens",
	 [
            makeOval(-1,-1.1, 2, 2.7, 20, TAU*5/8, TAU*7/8),
            [[-.7,-.7],[.7,-.7]],
	 ],
	 function() {
            var node = root.addNode();
            var shape = node.addGlobe(32,8, 0,2*PI, -PI,PI/3);
	    shape.getMatrix().translate(0,0.6,0).scale(0.8);
            var material = new phongMaterial().setAmbient(.25,.3,.35)
	                                      .setDiffuse(.5,.6,.7)
					      .setSpecular(1,1,1,20);
            material.side = THREE.DoubleSide;
            material.transparent = true;
            material.opacity = 0.5;
            node.setMaterial(material);
	    return node;
	 }
      );
   }
   Lens.prototype = new SketchTo3D;

