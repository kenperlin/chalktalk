
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
	    shape.getMatrix().translate(0,.6,0).scale(.8,.8,-.8);
            var material = new phongMaterial().setAmbient(.125,.15,.2)
	                                      .setDiffuse(.125,.15,.2)
					      .setSpecular(.1,.1,.1,40);
            material.side = THREE.DoubleSide;
            material.transparent = true;
            material.opacity = 0.1;
            node.setMaterial(material);
	    return node;
	 }
      );
   }
   Lens.prototype = new SketchTo3D;

   function Radio() {
      this.initSketchTo3D(
         "radio",
	 [
	    [[-1,-1.4],[-1,0]].concat(makeOval(-1,-1, 2, 2, 20, TAU/2, 0))
	                      .concat([[1,0],[1,-1.4],[-1,-1.4]]),
            makeOval(-.7,-.7, 1.4, 1.4, 20, TAU/2, -TAU/2)
	 ],
	 function() {
            var radio = root.addNode();

	    var node = radio.addNode();
	    node.getMatrix().translate(0,.2,0);

            var shape1 = node.addCylinder(32);
	    shape1.getMatrix().rotateX(PI/2).scale(1,.5,1);

            var shape2 = node.addCube();
	    shape2.getMatrix().translate(0,-.7,0).scale(1,.7,.5);

            var shapeMaterial = new phongMaterial().setAmbient(.1,.1,.1)
	                                           .setDiffuse(.9,.9,.9);
            radio.setMaterial(shapeMaterial);

            var dial1 = node.addCylinder(32);
	    dial1.getMatrix().rotateX(PI/2).translate(0,.2,0).scale(.7,.5,.7);
            var dialMaterial = new phongMaterial().setAmbient(.1,.1,.1)
	                                          .setDiffuse(.5,.5,.5);
            dial1.setMaterial(dialMaterial);

	    return radio;
	 }
      );
   }
   Radio.prototype = new SketchTo3D;

