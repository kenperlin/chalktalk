
   function Lens() {
      this.initSketchTo3D(
         "lens",
	 [
            makeOval(-1,-1.1, 2, 2.7, 20, TAU*5/8, TAU*7/8),
            [[-.7,-.7],[.7,-.7]],
	 ],
	 function() {
            var node = root.addNode();
            var shape = node.addGlobe(32,8, 0,TAU, -PI,PI/3);
	    shape.getMatrix().translate(0,.6,0).scale(.8,.8,-.8);
            var material = new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.5});
            material.side = THREE.DoubleSide;

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

   function Ball() {
      this.initSketchTo3D(
         "ball",
	 [
            makeOval(-1,-1, 2, 2, 20, TAU/2, -TAU/2)
         ],
	 function() {
            var ball = root.addNode();
            ball.ballMaterial = new phongMaterial().setAmbient(.3,.0,.0)
	                                           .setDiffuse(.3,.0,.0)
	                                           .setSpecular(.2,.2,.2,10);
	    return ball;
	 }
      );
      this.render = function(elapsed) {
         Ball.prototype.render.call(this, elapsed);
	 if (this.shapeSketch !== undefined) {
	    var ball = this.shapeSketch.mesh;
	    ball.update = function(elapsed) {
	       if (ball.develop === undefined)
	          ball.develop = 0;
	       ball.develop = min(1, ball.develop + elapsed / 20);
	       ball.theta = PI * sCurve(ball.develop);

	       if (ball.shape !== undefined)
	          ball.remove(ball.shape);
	       ball.shape = ball.addGlobe(40, 16, 0, TAU, 0, ball.theta);
	       ball.shape.getMatrix().rotateX(PI/2).translate(0,-cos(ball.theta),0);
	       ball.shape.setMaterial(ball.ballMaterial);

               if (ball.theta > PI/4) {
                  var t = sin(min(PI/2, ball.theta));
                  var r = t * 50 * ball.sc;
	          var s = max(.5, ball.theta - PI/2) / (PI/2);
                  var x = ball.sketch.tX - 30 * t * s;
                  var y = ball.sketch.tY + 30 * t * s;
	          annotateStart();
		  var n = 20;
	          for (var i = 0 ; i < n ; i += 3) {
                     color('rgba(' + floor(lerp(i/n,0,32)) + ',0,0,' + lerp(i/n, 0.0, 0.1) + ')');
	             var rr = lerp(t, 0.7, 1.1) * r - i;
	             fillOval(x - rr, y - rr, 2 * rr, 2 * rr);
                  }
	          annotateEnd();
               }
            }
         }
      }
   }
   Ball.prototype = new SketchTo3D;

