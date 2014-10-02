
   function Abacus() {
      this.initSketchTo3D(
         "abacus",
         [
	    [[-1,1],[1,1],[1,-1],[-1,-1],[-1,1]],
	    [[ -1,.5],[  1,.5]],
	    [[-.5, 1],[-.5,-1]],
	    [[  0, 1],[  0,-1]],
	    [[ .5, 1],[ .5,-1]],
         ],
         function() {
            var abacus = root.addNode();
            abacus.addCylinder(16).getMatrix().translate( 0,  1,0).rotateZ(PI/2).scale(.05,1 ,.1);
            abacus.addCylinder(16).getMatrix().translate( 0,.45,0).rotateZ(PI/2).scale(.10,1 ,.1);
            abacus.addCylinder(16).getMatrix().translate( 0, -1,0).rotateZ(PI/2).scale(.05,1 ,.1);
            abacus.addCylinder(16).getMatrix().translate(-1, 0,0)               .scale(.05,1 ,.1);
            abacus.addCylinder(16).getMatrix().translate( 1, 0,0)               .scale(.05,1 ,.1);

            abacus.addGlobe(16, 8).getMatrix().translate(-1, 1,0)               .scale(.05,.05,.1);
            abacus.addGlobe(16, 8).getMatrix().translate( 1, 1,0)               .scale(.05,.05,.1);
            abacus.addGlobe(16, 8).getMatrix().translate(-1,-1,0)               .scale(.05,.05,.1);
            abacus.addGlobe(16, 8).getMatrix().translate( 1,-1,0)               .scale(.05,.05,.1);

            abacus.addCylinder(16).getMatrix().translate(-.6,0,0).scale(.03,1,.03);
            abacus.addCylinder(16).getMatrix().translate(  0,0,0).scale(.03,1,.03);
            abacus.addCylinder(16).getMatrix().translate( .6,0,0).scale(.03,1,.03);

            abacus.stones = abacus.addNode();
	    for (var i = 0 ; i < 3 ; i++) {
	       var x = -.6 + .6 * i;
	       for (var j = 0 ; j < 6 ; j++)
	          if (j != 4) {
	             var y = (j == 5 ? 1.5 : j * .3) - .8;
	             abacus.stones.addNode().addGlobe(16,8).getMatrix().translate(x,y,0).scale(.2,.155,.2);
                  }
            }

            abacus.setMaterial(new phongMaterial().setAmbient(.2,.1,.05)
	                                          .setDiffuse(.2,.1,.05)
	                                          .setSpecular(.2,.2,.2,20));

	    return abacus;
         }
      );
      this.render = function(elapsed) {
         Abacus.prototype.render.call(this, elapsed);
	 var sketch = this.shapeSketch;
	 if (sketch !== undefined) {
	    if (sketch.digits === undefined) {
               sketch.digits = [0,0,0];
               sketch.digitsIndex = 0;
            }
	    sketch.mouseDown = function(x, y) {
	       var xx = (x - this.xlo + x - this.xhi) / (this.xhi - this.xlo);
	       var yy = (y - this.ylo + y - this.yhi) / (this.yhi - this.ylo);
	       this.digitsIndex = xx < -.4 ? 0 : xx < .4 ? 1 : 2;
	       this.xx = xx;
	       this.yy = yy;
	    }
	    sketch.mouseDrag = function(x, y) {
	       var xx = (x - this.xlo + x - this.xhi) / (this.xhi - this.xlo);
	       var yy = (y - this.ylo + y - this.yhi) / (this.yhi - this.ylo);
	       var index = this.digitsIndex;
	       value = this.digits[index] - (yy - this.yy) / 20;
	       this.digits[index] = max(0, min(9.99, value));
	    }
	    sketch.mouseUp = function(x, y) {
	       var xx = (x - this.xlo + x - this.xhi) / (this.xhi - this.xlo);
	       var yy = (y - this.ylo + y - this.yhi) / (this.yhi - this.ylo);
	       if (abs(xx - this.xx) > abs(yy - this.yy))
	          this.animateAbacus = this.animateAbacus === undefined ? true : undefined;
	    }
	    sketch.mesh.update = function(elapsed) {
	       var sketch = this.sketch;
	       var stones = this.stones;

	       if (sketch.code == null)
	          sketch.code = [["","000"]];

	       if (sketch.animateAbacus !== undefined)
	          sketch.digits[2] += 16 * elapsed;

               for (var index = 2 ; index >= 0 ; index--)
	          if (sketch.digits[index] >= 10) {
	             sketch.digits[index] -= 10;
		     if (index > 0)
		        sketch.digits[index-1]++;
	          }
	          else if (sketch.digits[index] < 0) {
	             sketch.digits[index] += 10;
		     if (sketch.digits[index] > 0)
		        sketch.digits[index-1]--;
	          }

               if (isCodeWidget && sketch == codeSketch) {
	          sketch.oldDigits = sketch.newDigits;
	          sketch.newDigits = floor(sketch.digits[0]) + "" +
	                             floor(sketch.digits[1]) + "" +
				     floor(sketch.digits[2]) ;
                  if (sketch.newDigits != sketch.oldDigits) {
		     sketch.code = [["", sketch.newDigits]];
		     toggleCodeWidget();
		     toggleCodeWidget();
		  }
	       }

	       for (var i = 0 ; i < stones.children.length ; i++) {
	          var n = i % 5;
	          var d = sketch.digits[floor(i/5)];
	          stones.children[i].getMatrix().identity();
		  if (n==0 ? d % 5 >= 4 :
		      n==1 ? d % 5 >= 3 :
		      n==2 ? d % 5 >= 2 :
		      n==3 ? d % 5 >= 1 : d >= 5)
	             stones.children[i].getMatrix().translate(0, .1, 0);
	       }
	    }
	 }
      }
   }
   Abacus.prototype = new SketchTo3D;

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
            var material = new phongMaterial().setAmbient(.2,.2,.4)
	                                      .setDiffuse(.2,.2,.4)
	                                      .setSpecular(.4,.4,.4,10);
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

   // Letters A-Z in Morse Code.

   var morseCode = [
      ".-",	"-...",	"-.-.",	"-..",	".",
      "..-.",	"--.",	"....",	"..",	".---",
      "-.-",	".-..",	"--",	"-.",	"---",
      ".--.",	"--.-",	".-.",	"...",	"-",
      "..-",	"...-",	".--",	"-..-",	"-.--",
      "--..",
   ];

   function Teleg() {
      this.labels = "teleg".split(' ');
      this.code = [["", "sos"]];

      this.render = function(elapsed) {
         m.save();
	 mLine([-1, -1], [1, -1]);
	 mLine([ 1, -1], [1,  1]);
         this.afterSketch(function() {
	    if (this.nPorts == 0)
	       this.addPort("f", 1, 0);

            var pattern = "      ";
            var msg = this.code[0][1].toLowerCase();
	    for (var n = 0 ; n < msg.length ; n++) {
	       var cc = msg.charCodeAt(n);
	       if (cc == 32)
	          pattern += "   ";
               else {
	          var i = cc - 97;
	          if (i >= 0 && i < morseCode.length) {
		     var p = morseCode[i];
		     for (var j = 0 ; j < p.length ; j++) {
		        switch (p.charAt(j)) {
			case ".": pattern += ". "  ; break;
			case "-": pattern += "... "; break;
			}
		     }
		  }
               }
	    }

            var n = floor(time / 0.075) % pattern.length;
	    isTelegraphKeyPressed = pattern.charAt(n) != " ";

            this.setOutValue("f", isTelegraphKeyPressed ? 300 : 0);
         });
         m.restore();
      }
   }
   Teleg.prototype = new Sketch;

