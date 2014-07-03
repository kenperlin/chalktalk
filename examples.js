   registerGlyph("axes3D()",  [ [[0,0],[0,-1]], [[0,0],[1,.1]], [[0,0],[-.2,.2]] ]);
   registerGlyph("cube()",    [ [[-1,1],[-1,-1],[1,-1],[1,1],[-1,1]] ]);
   registerGlyph("cylinder()",[ makeOval(-1,-1,2,2,20,-PI/2,3*PI/2) ]);
   registerGlyph("globe()",   [ makeOval(-1,-1,2,2,20,3*PI/2,-PI/2) ]);

   registerGlyph("long_nose()", [ [[-1,.5],[1,.5]],[[1,.5],[1,-.5]], [[-1,.5],[.8,.3],[1,-.5]] ]);
   registerGlyph("tron()"     , [ [[0,-1.5],[0,-1]], makeOval(-.5,-1, 1,.25, 32, PI/2, PI/2 + TAU) ]);

   function cube()     { geometrySketch(root.addCube()); }
   function cylinder() { geometrySketch(root.addCylinder()); }
   function globe()    { geometrySketch(root.addGlobe()); }
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

   function alan() { image('alan_kay_smiling.jpg', 1.8); }
   function blinn() { image('blinn.png', 2.4); }
   function diner() { image('red_fox_diner.jpg', 0.8); }
   function face() { image('smiling_cat.jpg', 0.35); }
   function kwa() { image('kwalado.jpg'); }
   function long_nose() { image('long_nose.jpg'); }
   function bumpmap() { image('strawberry.jpg', 0.7); }
   function tron() { image('tron.jpg', 0.5); }
   function vase() { image('vase.png', 0.7); }

   function unitCube() {
      drawUnitCube();
   }

   function unitDisk() {
      drawUnitDisk();
   }

   function unitTube() {
      drawUnitTube();
   }

   function Bird() {
      this.T = 0;
      this.walkT = 0;
      this.labels = "bird".split(' ');
      this.isTall = false;
      this.tall = 0.0;

      this.choice = new Choice();

      this.onSwipe = function(dx, dy) {
         switch (pieMenuIndex(dx, dy)) {
	 case 0:
	    this.choice.set(2);
	    break;
	 case 1:
	    this.isTall = true;
	    break;
	 case 2:
	    this.choice.set(1);
	    break;
	 case 3:
	    this.isTall = false;
	    break;
	 }
      }

      this.render = function(elapsed) {
         this.choice.update(elapsed);

         this.tall = this.isTall ? min(1, this.tall + 2 * elapsed)
                                 : max(0, this.tall - 2 * elapsed);

         var idle = this.choice.get(1);
         var walk = this.choice.get(2);

         // WHEN THE BIRD WALKS OFF THE SCREEN, DELETE IT.

         if (this.xlo > width()) {
            sketchToDelete = this;
            return;
         }

         function walkX(t) { return 2.2 * t; }

         // IF AUTO-SKETCHED, KEEP SKETCHY STYLE EVEN AFTER FINISHED DRAWING.

         if (this.glyphTransition == 0) {
            noisy = 1;
            this.styleTransition = 0;
         }

         // T CONTROLS WALK, IS ZERO UNTIL SKETCH IS FINISHED.

         var state = this.choice.value;

         this.afterSketch(function() {
            switch (state) {
            case 1:
            case 2:
               if (this.time === undefined) {
                  this.time = time;
                  this.T = 0;
                  this.walkT = 0;
               }
               break;
            }
         });

         var pace = 1.1;

         // LEFT AND RIGHT FOOT ARE DISPLACED IN TIME.

         var t = pace * this.walkT;
         var TFoot = [ (saw(t)/2 - .5) / pace, (saw(t+.5)/2 - .5) / pace ];

         // WALKING MOVEMENT IS DRIVEN BY SINUSOIDAL WAVES.

         var s2 = 0, c2 = 1, s4 = 0, c4 = 1;

         if (walk > 0) {
            var phase = pace * TAU * this.walkT;
            s2 = sin(    phase);
            c2 = cos(    phase);
            s4 = sin(2 * phase);
            c4 = cos(2 * phase);
         }

         // BODY PROPORTIONS.

         var tall = sCurve(this.tall);
         var footY = -1.2;
         var spineBase = footY + lerp(tall, 1.0, 1.5);
         var spineTop = spineBase + lerp(tall, 0.8, 1.3);
         var uLeg  =  (spineBase - footY) / lerp(tall, 1.2, 1.5);
         var lLeg  =  0.9 * uLeg;

         // PARAMETERS THAT CONTROL BODY LANGUAGE.

         var liftFoot = 0;
         var lookUp   = 0.2      + 1.5 * noise2(this.T / 3.0, 10);
         var lookSide = 0.0      + 3.0 * noise2(this.T / 3.0, 20);
         var bounce   = 0.1 * s4 + 0.2 * noise2(this.T / 1.5, 30);
         var bob      = 0.1 * c4 + 0.3 * noise2(this.T / 1.5, 40);

         // COMPUTED VALUES.

         var hipX = 0;
         var hipY = spineBase + bounce;
         var neckX = bob - .3 * lookUp - .1;
         var neckY = spineTop + bounce;

         m.save();
            m.scale(this.size / 400);
            m.translate(walkX(this.walkT), 0, 0);

            // HEAD

            m.save();
               m.translate(neckX,neckY,0);
               m.rotateZ(lookUp);
               m.rotateY(lookSide);
               mCurve([[.0,.0,0],[.8,.3,0],[.0,.6,0],[.0,.0,0]]);
            m.restore();

            // SPINE

            var spine = [];
            var arching = lerp(tall, .1, .2);
            for (var t = 0 ; t <= 1 ; t += 1/10) {
               var arch = arching * sin(PI * t);
               spine.push([ lerp(t, neckX, hipX) + arch * (1 - 2.7 * bounce),
                            lerp(t, neckY, hipY),
                            0 ]);
            }
            mCurve(spine);

            // LEGS

            for (var n = 0 ; n < 2 ; n++) {
               var footLift = max(0, (n==0 ? .3 : -.3) * s2);
               var Foot = [-hipX + walkX(TFoot[n]) + .15,
                           footY-hipY + footLift, .6];
               var Knee = [-1,0,0];
               ik(uLeg, lLeg, Foot, Knee);

               var c = [];
               m.save();
                  m.translate(hipX,hipY,0);
                  c.push(m.transform([0,0,0]));
                  c.push(m.transform(Knee));
                  c.push(m.transform(Foot));
                  m.save();
                     m.translate(Foot[0],Foot[1],Foot[2]);
                     m.rotateZ(.6*footLift);
                     c.push(m.transform([0,0,0]));
                     c.push(m.transform([.3,0,0]));
                  m.restore();
               m.restore();
               drawCurve(c);
            }

         m.restore();

         this.afterSketch(function() {
            switch (state) {
            case 1:
            case 2:
               this.T += time - this.time;
               if (state == 2)
                  this.walkT += time - this.time;
               this.time = time;
               break;
            }
         });
      }
   }
   Bird.prototype = new Sketch;

   function David() {
      this.labels = "david1".split(' ');
      this.render = function(elapsed) {
         var sc = this.size / 400;
         m.save();
	 m.scale(sc);
	 mCurve([[-1,-1],[0, 1],[1,-1]]);
	 mCurve([[-1, 1],[0,-1],[1, 1]]);
         m.restore();
      }
   }
   David.prototype = new Sketch;

   function Control() {
      this.labels = "slideX slideY".split(' ');

      this.flip = 1;

      this.computeStatistics = function() {
         var c = this.glyphTrace[1-this.selection];
         var y0 = c[0][1];
         var y1 = c[c.length - 1][1];
	 this.flip = y0 > y1 ? 1 : -1;
      }

      this.lo = 0;
      this.hi = 1;
      this.t = 0.5;

      this.mouseDrag = function(x, y) {
         m.save();
         var sc = this.size / 180;
         this.standardViewInverse();
         var p = m.transform([x,y]);
         p = [p[0]/sc, p[1]/sc];
         this.t = max(0, min(1, p[this.selection] + .5));
         m.restore();
      }

      this.render = function(elapsed) {

         var sc = this.size / 180;

         this.afterSketch(function() {
            if (this.portLocation.length == 0) {
               switch (this.selection) {
               case 0:
                  this.addPort("lo", -.62 * sc, 0);
                  this.addPort("hi",  .62 * sc, 0);
                  break;
               case 1:
                  this.addPort("lo", 0, -.62 * sc);
                  this.addPort("hi", 0,  .62 * sc);
                  break;
               }
               this.addPort("t", 0, 0);
	       this.setDefaultValue("lo", 0);
	       this.setDefaultValue("hi", 1);
            }
         });

         var t = this.t;
         if (this.isInValue("t"))
            t = max(0, min(1, this.getInFloat("t")));

         this.lo = this.isInValue("lo") ? this.getInFloat("lo") : this.getDefaultValue("lo");
         this.hi = this.isInValue("hi") ? this.getInFloat("hi") : this.getDefaultValue("hi");

         this.setOutValue("t", lerp(t, this.lo, this.hi));

         m.save();
         m.scale(sc);

         var x = t - .5;
         switch (this.selection) {
         case 0:
            mLine([-.5,0],[.5,0]);
            mLine([x,-.20*this.flip],[x,.20*this.flip]);
            break;
         case 1:
            mLine([0,-.5*this.flip],[0,.5*this.flip]);
            mLine([-.20,x],[.20,x]);
            break;
         }

         this.afterSketch(function() {
            textHeight(16);
            switch (this.selection) {
            case 0:
               mText(roundedString(this.lo), [-.6,0], 1, .5);
               mText(roundedString(this.hi), [ .6,0], 0, .5);
               break;
            case 1:
               mText(roundedString(this.lo), [0,-.6], .5, 0);
               mText(roundedString(this.hi), [0, .6], .5, 1);
               break;
            }

	    if (this.lo == floor(this.lo) && this.hi == floor(this.hi)) {
	       for (var i = this.lo + 1 ; i < this.hi ; i++) {
	          var t = (i - this.lo) / (this.hi - this.lo) - .5;
	          switch (this.selection) {
		  case 0:
		     mLine([t,-.02],[t,.02]);
		     break;
		  case 1:
		     mLine([-.02,t],[.02,t]);
		     break;
	          }
	       }
	    }
         });
         m.restore();
      }
   }
   Control.prototype = new Sketch;

   registerGlyph(sketchTypeToCode('Control', 'slideX'), [ [[-.5,0],[.5,0]], [[0,-.2],[0,.2]] ]);
   registerGlyph(sketchTypeToCode('Control', 'slideY'), [ [[0,-.5],[0,.5]], [[-.2,0],[.2,0]] ]);

   function Diagram() {
      this.labels =
         "refract scan rgb circles ".concat(
         "square circle triangle flap").split(' ');

      this.isWandering = false;

      this.dragX = 0;
      this.dragY = 0;

      this.sx = 1;
      this.sy = 1;

      this.onSwipe = function(dx, dy) {
         var dir = pieMenuIndex(dx, dy);
         switch (this.labels[this.selection]) {
         case "flap":
            if (dir == 2) {
               this.wanderTime = time;
               this.isWandering = ! this.isWandering;
            }
	    break;
         }
      }

      this.render = function() {
         var w = this.width;
         var h = this.height;
         var sel = (this.selection + 1000 * this.labels.length) % this.labels.length;

         if (this.mousePressed)
            switch (this.labels[this.selection]) {
	    case 'square':
	    case 'circle':
	    case 'triangle':
	       this.sx *= (this.size - (this.dragX - this.x)) / this.size;
	       this.sy *= (this.size + (this.dragY - this.y)) / this.size;
	       break;
            }
	 this.dragX = this.x;
	 this.dragY = this.y;

         switch (this.labels[this.selection]) {

         case "refract":

            if (sel != this.sel) {
               this.sel = sel;
               this.clearPorts();
               this.addPort("n1", w/30 - w/2, -w/30);
               this.addPort("n2", w/30 - w/2,  w/30);
               this.addPort(S_THETA + "1", w/2 - w/30, -w/30);
               this.addPort(S_THETA + "2", w/2 - w/30,  w/30);
            }

            if (this.isInValue("n1"))
               this.n1 = this.getInFloat("n1");

            if (this.isInValue("n2"))
               this.n2 = this.getInFloat("n2");

            if (this.firstTime === undefined) {
               this.firstTime = true;
               this.mouseX = -w/4;
               this.mouseY = -w/4;
               this.n1 = 1.0;
               this.n2 = 1.5;
            }

            var x0 = 0, y0 = 0, x1, y1, r1, x2, y2, r2;

            this.afterSketch(function() {
               if (this.n1 < this.n2) {
                  color('rgba(0,128,255,.1)');
                  fillRect(-w/2,y0,w,w/2);
               }
               else if (this.n1 > this.n2) {
                  color('rgba(0,128,255,.1)');
                  fillRect(-w/2,-w/2,w,w/2);
               }
            });

            x1 = this.mouseX;
            y1 = this.mouseY;
            r1 = sqrt(x1*x1+y1*y1);

            var n1 = y1 < 0 ? this.n1 : this.n2;
            var n2 = y1 < 0 ? this.n2 : this.n1;

            var s1 = abs(x1) / r1;
            var s2 = n1 * s1 / n2;
            if (s2 < 1) {

               // REFRACTION

               var t2 = tan(asin(s2));
               y2 = -y1;
               x2 = y2 * t2 * (x1 < 0 == y1 < 0 ? 1 : -1);
               r2 = sqrt(x2*x2+y2*y2);
               x2 *= r1/r2;
               y2 *= r1/r2;
            }
            else {

               // REFLECTION

               x2 = -x1;
               y2 = y1;
               r2 = sqrt(x2*x2+y2*y2);
            }

            this.setOutValue(S_THETA + "1", asin(s1));
            this.setOutValue(S_THETA + "2", asin(s2 < 1 ? s2 : s1));

            color(defaultPenColor);
            line(-w/2,0,w/2,0);
            drawCurve([ [x1,y1], [0,0], [x2,y2] ]);

            this.afterSketch(function() {
               arrow(0,0, x2,y2);
               drawOval(x1-w/100,y1-w/100,w/50,w/50);

               color('rgb(255,244,244)');
               fillOval(x1-w/100,y1-w/100,w/50,w/50);

               color('rgb(160,160,160)');
               text("n1 = " + roundedString(this.n1), w/60 - w/2, -w/30, 0, 0.5);

               color('rgb(128,152,255)');
               text("n2 = " + roundedString(this.n2), w/60 - w/2,  w/30, 0, 0.5);

               line(0,-h/4,0,h/4);

               var t = function(x,y,r,s) {
                  var a = atan2(y,x);
                  var tx = x;
                  var ty = y + (y<0?-r:r);
                  var tr = sqrt(tx*tx + ty*ty);
                  tx *= w/10/tr;
                  ty *= w/10/tr;
                  text(S_THETA, tx, ty, 0.8, 0.5);
                  text(s, tx, ty, -0.2, 0.0);
               }
               t(x1, y1, r1, '1');
               t(x2, y2, r2, '2');
            });

            break;

         case "scan":
	    this.code = [
	       ["artist", "light 1  : (-1,0,0)\n"
	                + "light 2  : ( 1,1,0)\n"
			+ "color    : yellow\n"
			+ "shininess: 10\n"
			+ "..."
		        ],
	       ["programmer", "color = program(point) {\n"
	                    + "\n"
	                    + "   THIS IS ALWAYS\n"
			    + "   THE SAME PROGRAM.\n"
	                    + "\n"
			    + "}"
			    ],
	    ];
            if (sel != this.sel) {
               this.sel = sel;
               this.clearPorts();
            }

            if (this.row === undefined) {
               this.nRows = 4;
               this.nCols = 6;
               this.row = 0;
               this.col = 0;
               this.X = -w/4;
               this.Y = -h/2;
               this.s = w/12;
               this.W = this.s * this.nCols;
               this.H = this.s * this.nRows;
               this.x1 = -w/2;
               this.y1 = -h/2;
            }

            var nr = this.nRows, nc = this.nCols, nrc = nr * nc;

            drawRect(this.X, this.Y, nc * this.s, this.nRows * this.s);
            line(-w/2 + w / (nrc+2)          , this.Y + this.H + w / (nrc-nr),
                 -w/2 + w / (nrc+2) * (nrc+1), this.Y + this.H + w / (nrc-nr));

            this.afterSketch(function() {

               var w=this.width, h=this.height, X=this.X, Y=this.Y;
               var W=this.W, H=this.H, s=this.s, x=this.mouseX, y=this.mouseY;
               var saveTextHeight = _g.textHeight;
               _g.textHeight = w/20;

               if (x >= X && x < X + W && y >= Y && y < Y + W*nr/nc) {
                  this.col = Math.floor(6 * (x - X) / W);
                  this.row = Math.floor(6 * (y - Y) / W);
               }
               else if (y >= Y + W*nr/nc) {
                  var n = Math.max(0, Math.min(23, 26 * (x+w/2) / w - 1));
                  this.col = Math.floor(n % nc);
                  this.row = Math.floor(n / nc);
               }

               for (var j = 0 ; j < nr ; j++)
                  line(X, Y + j * s, X + W, Y + j * s);
               for (var i = 0 ; i < nc ; i++)
                  line(X + i * s, Y, X + i * s, Y + H);
               fillRect(X + this.col * s, Y + this.row * s, s, s);

               for (var n = 0 ; n < nrc ; n++) {
                  if (n == this.row * nc + this.col)
                     fillRect((n + 1) * w / (nrc+2) - w/2, Y + H + w/(nrc-nr), w/(nrc+2), w/(nrc+2));
                  drawRect((n + 1) * w / (nrc+2) - w/2, Y + H + w/(nrc-nr), w/(nrc+2), w/(nrc+2));
               }

               text("col:", w/40 - w/2, Y + w/20);
               text("row:", w/40 - w/2, Y + w/20 + w/10);
               text(this.col, w/40 + w/7 - w/2, Y + w/20);
               text(this.row, w/40 + w/7 - w/2, Y + w/20 + w/10);

               _g.textHeight = saveTextHeight;
            });

            break;

         case "rgb":
            w = this.width = 400;
            h = this.height = 250;
            var yLo = -h/2, yHi = -150 + h*4/5 + h/4;

            function drawColorCurve(rgb, pts) {
               var c = [];
               for (var n = 0 ; n < pts.length ; n += 2) {
                  var x = (pts[n  ] - .04) / .81;
                  var y =  pts[n+1] * 4/5 - .4;
                  c.push([w * x - w/2, h * (4/5-y) - 3*h/4]);
               }
               color(rgb);
               drawCurve(c);
            }

            function evalCurve(pts, x) {
               x += .5;
               for (var n = 0 ; n < pts.length - 2 ; n += 2) {
                  var x0 = (pts[n    ] - .04) / .81;
                  var y0 =  pts[n + 1] * 4/5 - .4;
                  var x1 = (pts[n + 2] - .04) / .81;
                  var y1 =  pts[n + 3] * 4/5 - .4;
                  if (x0 < x && x1 > x)
                     return y0 + (y1 - y0) * (x - x0) / (x1 - x0) + 0.4;
               }
               return 0;
            }

            var blueCurve = [
               .05,0, .09,.14, .18,.6, .192,.62, .208,.62, .22,.6,
               .3,.185, .33,.1, .37,.025, .4,0,
            ];

            var greenCurve = [
               .1,0, .2,.05, .25,.1, .3,.2, .4,.8, .43,.9, .45,.92, .47,.9,
               .54,.67, .62,.3, .67,.17, .70,.1, .77,.01, .82,0,
            ];

            var redCurve = [
               .05,0, .09,.08, .11,.08, .14,.05, .17,.04,
               .2,.045, .25,.08, .3,.12, .32,.15, .34,.2,
               .40,.54, .42,.62, .45,.70, .5,.8, .52,.82, .55,.8,
               .57,.75, .70,.23, .74,.12, .78,.05, .81,.02, .85,0,
            ];

            color(defaultPenColor);
            line(-w/2,yHi,w/2,yHi);

            drawColorCurve('red', redCurve);
            drawColorCurve('#00e000', greenCurve);
            drawColorCurve('blue', blueCurve);

            this.afterSketch(function() {
               var x = max(-w/2, min(w/2, this.mouseX));
               var ty = yHi + w/32;
               color(defaultPenColor);
               textHeight(w/48);
               text("400", -w/2, ty);
               text("500", -w/2 + w/3 - w/20/3, ty);
               text("600", -w/2 + w*2/3 - w/20*2/3, ty);
               text("700", w/2 - w/20, ty);

               textHeight(w/30);

               color('red');
               var yr = evalCurve(redCurve, x / w);
               fillOval(x - 5, h * (4/5 - yr+.4) - 5 - 3*h/4, 10, 10);

               text("R:", w/60 - w/2, yLo + w/20);
               fillRect(w/16 - w/2, yLo + w/20*0.3, h * yr / 3, w/30);

               color('#00e000');
               var yg = evalCurve(greenCurve, x / w);
               fillOval(x - 5, h * (4/5 - yg+.4) - 5 - 3*h/4, 10, 10);

               text("G:", w/60 - w/2, yLo + w/20 * 2);
               fillRect(w/16 - w/2, yLo + w/20*1.3, h * yg / 3, w/30);


               color('blue');
               var yb = evalCurve(blueCurve, x / w);
               fillOval(x - 5, h * (4/5 - yb+.4) - 5 - 3*h/4, 10, 10);

               text("B:", w/60 - w/2, yLo + w/20 * 3);
               fillRect(w/16 - w/2, yLo + w/20*2.3, h * yb / 3, w/30);

               color(defaultPenColor);
               line(x, yLo, x, yHi);
            });

            break;

         case "circles":
            var d = w/8;
            if (this.region === undefined)
               this.region = makeOval(-d-w/4,-w/4,w/2,w/2,10,TAU*5/6,TAU*7/6).concat(
                             makeOval( d-w/4,-w/4,w/2,w/2,10,TAU*2/6,TAU*4/6));

            drawOval(-d-w/4, -w/4, w/2, w/2, 40, TAU*1/6, TAU*7/6);
            drawOval( d-w/4, -w/4, w/2, w/2, 40, TAU*2/6, TAU*8/6);

            this.afterSketch(function() {

               color('blue');
               drawPolygon(this.region);

               if (this.mouseX < -w/2 || this.mouseY < -h/2)
                  return;

               color('red');
               var x0 = -w*0.35;
               var y0 = -h*0.35;
               var x1 = this.mouseX;
               var y1 = this.mouseY;
               var dx = x1-x0, dy = y1-y0, d = Math.sqrt(dx*dx + dy*dy);
               dx /= d;
               dy /= d;

               lineWidth(2);
               fillOval(x0-w*0.01,y0-w*0.01,w*0.02,w*0.02);
               arrow(x0, y0, x1, y1);

               var p = rayCurve(x0, y0, dx, dy, this.region);
               if (p.length >= 2 && d > len(p[1][0]-x0, p[1][1]-y0)) {
                  color('blue');
                  lineWidth(6);
                  fillOval(p[1][0]-w*0.01, p[1][1]-w*0.01, w*0.02, w*0.02);
                  if (d < len(p[0][0]-x0, p[0][1]-y0))
                     arrow(p[1][0], p[1][1], x1, y1);
                  else {
                     line(p[1][0], p[1][1], p[0][0], p[0][1]);
                     fillOval(p[0][0]-w*0.01, p[0][1]-w*0.01, w*0.02, w*0.02);
                  }
               }
            });

            break;

         case "square":
	    var xx = w/2 * this.sx;
	    var yy = h/2 * this.sy;
            drawClosedCurve([ [-xx,-yy], [-xx,yy], [xx,yy], [xx,-yy] ]);
            break;

         case "circle":
	    var xx = w/2 * this.sx;
	    var yy = h/2 * this.sy;
            var c = [];
            for (var a = 0 ; a < TAU ; a += 0.2)
               c.push([xx*cos(a),-yy*sin(a)]);
            drawClosedCurve(c);
            break;

         case "triangle":
	    var xx = w/2 * this.sx;
	    var yy = h/2 * this.sy;
            drawClosedCurve([ [0,-yy], [-xx,yy], [xx,yy] ]);
            break;

         case "flap":
            var phase = 1;
            if (this.firstTime === undefined) {
               this.firstTime = true;
               this.phaseOffset = TAU * random();
            }
            else
               phase = this.phaseOffset + 8 * time + 1;
            if (isNaN(phase)) phase = 1;

            var a =  .2+.5 * sin(phase);
            var b = -.3-.5 * cos(phase);
            var ca = cos(a);
            var sa = sin(a);
            var cb = cos(a+b);
            var sb = sin(a+b);

            var ox = 0, oy = 0;
            if (this.isWandering) {
               var t = time - this.wanderTime;
               ox = w   * noise2(t/2, 10);
               oy = w/2 * noise2(t  , 20);
            }

            var dx1 = w/4;
            var dy1 = 0;

            var dx2 = w/4;
            var dy2 = 0;

            var x0 = 0;
            var y0 = -w/20 * cos(phase);

            var x1 = x0 + (dx1 * ca + dy1 * sa);
            var y1 = y0 + (dy1 * ca - dx1 * sa);

            var x2 = x1 + (dx2 * cb + dy2 * sb);
            var y2 = y1 + (dy2 * cb - dx2 * sb);

            drawCurve([ [ox-x2, oy+y2],
                        [ox-x1, oy+y1],
                        [ox+x0, oy+y0],
                        [ox+x1, oy+y1],
                        [ox+x2, oy+y2] ]);

            this.afterSketch(function() {
               var r = w/40;
               fillPolygon([ [ox-x1, oy+y1],
                             [ox-x2, oy+y2],
                             [ox-x1, oy+y1+r],
                             [ox+x0, oy+y0],
                             [ox+x1, oy+y1+r],
                             [ox+x2, oy+y2],
                             [ox+x1, oy+y1],
                             [ox+x0, oy+y0] ]);
            });

            break;
         }

         this.afterSketch(function() {
            this.drawText(_g);
         });
      }
   }
   Diagram.prototype = new Sketch2D;

   function Graph() {
      this.labels = "graph".split(' ');

      this.choice = new Choice();
      this.s = 0;
      var that = this;

      var values, minval, maxval;
      var scrolledBy, sinceLastMeasurement;

      var resetValues = function () {
         scrolledBy = 0;
         sinceLastMeasurement = 1000;
         values = [];

         switch (that.choice.value) {
         case 0:       // AUTO RANGE
            minval = null;
            maxval = null;
            break;
         case 1:       // UNIT RANGE (-1 to 1)
            minval = -1.5;
            maxval = 1.5;
            break;
         case 2:       // LOGIC RANGE (0 to 1)
            minval = -.2;
            maxval = 1;
            break;
         }
      };

      resetValues();

      var recordValue = function (v) {
         if (isDef(v) && v !== null && isNumber(v)) {
            v = Math.round(v*1000)/1000;
            if (values.length == 1 && v == values[0])
               return; // don't start recording until the value is changing

            values.push(v);

            if (that.choice.value == 0) {        // AUTO RANGE
               // update min/max
               if (values.length == 1 || minval === null || maxval === null) {
                  minval = v;
                  maxval = v;
               }

               maxval = Math.max(maxval, v);
               minval = Math.min(minval, v);
            }
         }
      };

      this.render = function(elapsed) {
         var sc = this.size / 400;

         this.afterSketch(function() {
            if (this.portLocation.length == 0) {
               this.addPort("Y", -sc, 0);
            }
         });

         m.save();
         m.scale(sc);

         var i,y1,y2,scrollAdj;
         mLine([-1,1],[-1,-1]);

         if (this.s != this.choice.value)
             resetValues();
         this.s = this.choice.value;

         // record measurement
         if (this.isInValue("Y")) {

            sinceLastMeasurement += elapsed

            if (sinceLastMeasurement > .0625) {
               if (values.length >= 100) {
                  // expire older records if buffer is full
                  values.splice(0,1);
                  scrolledBy += 1;
               }
               // Capture input
               recordValue(this.getInValue("Y"));

               //sinceLastMeasurement = 0;
            }
         }

         // zero line (if one is in range)
         if (this.choice.value == 2) {
            // LOGIC RANGE, draw the baseline below 0
            mLine([-1,-1],[1,-1]);

         }
	 else if (maxval > 0 && minval <= 0) {
            y1 = -minval/(maxval-minval)*2-1;
            mLine([-1, y1], [1, y1]);
         }
	 else if (values.length < 2) {
            mLine([-1,-1],[1,-1]);
         }

         // render line graph
         if (isDef(values) && values.length > 1) {
            scrollAdj = scrolledBy/100*2;

            dataStart();
            for (i = 1; i < values.length; i++) {
               y1 = (values[i-1]-minval)/(maxval-minval)*2-1;
               y2 = (values[i]-minval)/(maxval-minval)*2-1;
               mLine([(i-1)/100*2-1, y1], [i/100*2-1, y2]);
            }
            dataEnd();
         }

         m.restore();
      };
   };
   Graph.prototype = new Sketch;

   function Func() {
      this.s = -1;

      this.code = [
         ["cos", "cos(x)"],
         ["pow2", "pow(2, x)"],
         ["sin", "sin(x)"],
         ["sqr", "x * x"],
         ["floor", "floor(x-.5)"],
      ];

      this.labels = [];
      for (var i = 0 ; i < this.code.length ; i++)
         this.labels.push(this.code[i][0]);

      function makeCurve(f) {
         var curve = [];
         for (var t = -1 ; t <= 1 ; t += .1)
	    curve.push([t, f(t)]);
	 return curve;
      }

      var curves = [
         makeCurve(function(x) { return cos(PI * x) / PI; }),
         makeCurve(function(x) { return exp(x - 1); }),
         makeCurve(function(x) { return sin(PI * x) / PI; }),
         makeCurve(function(x) { return x * x; }),
         makeCurve(function(x) { return (floor(x)+.5); }),
      ];

      this.render = function(elapsed) {
         var sc = this.size / 400;

         if (this.nPorts == 0) {
            this.addPort("x", -sc, 0);
            this.addPort("f",  sc, 0);
         }

	 var s = this.selection;
	 if (isDef(this.selectedIndex))
            this.selection = this.selectedIndex;
         else
            this.selectedIndex = this.selection;

         m.save();
         m.scale(sc);

         var x = this.getInFloat("x");
         var result = null;
         try {
            eval("result = (" + this.code[s][1] + ")");
         } catch (e) {}
	 if (result != null)
            this.setOutValue("f", result);

         _g.lineWidth /= 3;
	 mLine([ 0,1],[0,-1]);
	 mLine([-1,0],[1, 0]);
         _g.lineWidth *= 3;

         mCurve(curves[s]);

	 m.restore();
      }
   }
   Func.prototype = new Sketch;

   function Logic() {
      this.labels = "buf and or xor not nand nor xnor".split(' ');

      this.IDENT = [[-.5,.4],[.5,0],[-.5,-.4],[-.5,.4]];
      this.AND   = [[-.5,.4]].concat(createArc(.1, 0, .4, PI/2, -PI/2, 12))
                             .concat([[-.5,-.4],[-.5,.4]]);
      this.OR    = [[-.5,.4]].concat(createArc( -.2 ,-.4, .80,  PI/2  ,  PI/6  , 12))
                             .concat(createArc( -.2 , .4, .80, -PI/6  , -PI/2  , 12))
                             .concat(createArc(-0.904,  0, .565, -PI/4  ,  PI/4  , 12));
      this.X     =                   createArc(-1.00,  0, .51,  PI/3.5, -PI/3.5, 12);

      this.INVERT = createArc(.6, .0, .1, PI, -PI, 24);

      this.s = -1;

      this.prevTime = 0;

      this.timerStart = 0;
      this.value = 0;

      this.binary = function(port) {
         return this.getInFloat(port) > 0;
      }

      this.getValue = function() {
         if (time > this.timerStart + this.getInFloat("d")) {
            this.value = this.binary("i");
            this.timerStart = time;
         }
         return this.value;
      }

      this.render = function() {
         var sc = this.size / 180;
         m.save();
         m.scale(sc);
         var s = (this.selection + 1000 * this.labels.length) % this.labels.length;

         if (this.code == null)
	    this.code = [["", codes[s]]];

         switch (s % 4) {
         case 0: mCurve(this.IDENT); break;
         case 1: mCurve(this.AND  ); break;
         case 2: mCurve(this.OR   ); break;
         case 3: mCurve(this.X    );
                 mCurve(this.OR   ); break;
         }
         if (s >= 4)
            mCurve(this.INVERT);

         if (s != this.s) {
            this.s = s;
            this.clearPorts();
            if (s % 4 == 0) {
               this.addPort("i", -.5 * sc, 0);
               this.addPort("d",   0, 0);
            }
            else {
               var x = s % 4 < 3 ? -.5 : -.65;
               this.addPort("i", x * sc,  .2 * sc);
               this.addPort("j", x * sc, -.2 * sc);
            }
            this.addPort("o", s < 4 ? .5 * sc : .6 * sc, 0);
         }

         function xor(a, b) { return a == b ? 0 : 1; }

	 var x = this.getInValue("i");
	 var y = this.getInValue("j");
	 if (s == 0 || s == 4)
	    x = this.getValue();

         var _outValue = null;
         try {
	    eval("_outValue = (" + this.code[0][1] + ")");
         } catch (e) { }
	 if (_outValue != null)
            this.setOutValue('o', _outValue);

         m.restore();
      }
   }
   var codes = [
      "x>0" , "min(x>0, y>0)",   "max(x>0, y>0)"  , "(x>0)!=(y>0)",
      "x<=0", "max(x<=0, y<=0)", "min(x<=0, y<=0)", "(x>0)==(y>0)"
   ];
   Logic.prototype = new Sketch;

   function Marker() {
      this.labels = "arrow".split(' ');

      this.a = [-1,0,0];
      this.b = [ 1,0,0];
      this.render = function() {
         var a = this.a, b = this.b;
         var d = vecScale(vecDiff(b, a), .1);
         m.save();
         mLine(a, b);
         mLine(b, vecSum(b, [-d[1] - d[0],  d[0] - d[1], 0]));
         mLine(b, vecSum(b, [ d[1] - d[0], -d[0] - d[1], 0]));
         m.restore();
      }

      this.mouseDrag = function(x, y) {
         m.save();
         this.standardViewInverse();
         var p = m.transform([x,y]);
         if ( normSqr(vecDiff(this.a, p)) < normSqr(vecDiff(this.b, p)) )
            this.a = p;
         else
            this.b = p;
         m.restore();
      }
   }
   Marker.prototype = new Sketch;

   function Adder() {
      this.labels = "adder".split(' ');
      this.xin = 0;
      this.yin = 0;

      this.render = function() {
         m.save();

         mCurve([[-.5,.5],[.5,.5],[.5,-.5],[-.5,-.5],[-.5,.5]]);
         mCurve([[0,.3],[0,-.3]]);
         mCurve([[-.3,0],[.3,0]]);

         this.afterSketch(function() {
            if (this.portLocation.length == 0) {
               this.addPort("x", -.5,.3);
               this.addPort("y", -.5,-.3);
               this.addPort("o", .5,0);
            }
         });

         if (this.isInValue("x"))
            this.xin = this.getInFloat("x");

         if (this.isInValue("y"))
            this.yin = this.getInFloat("y");

         this.setOutValue('o', this.xin + this.yin);

         m.restore();
      }
   }
   Adder.prototype = new Sketch;

   function Physics() {
      this.labels = "swing".split(' ');

      this.computeStatistics = function() {
         var b = traceComputeBounds(this.glyphTrace);
         this.hubWidth = 10 * (b[0][2] - b[0][0]) / this.size;
         this.radius = 5 * (b[2][2] - b[2][0] + b[2][3] - b[2][1]) / 2 / this.size;
         this.ht = 8.5 * ((b[2][1]+b[2][3])/2 - b[1][1]) / this.size;
      }

      this.hubWidth = 1;
      this.spring = new Spring();
      this.ht0 = 4.0;
      this.ht = this.ht0;
      this.radius = 1;
      this.force = 0;

      this.mouseDown = function(x, y) {
         this.xx = x;
         this.yy = y;
         this.swingMode = 'none';
      }

      this.mouseDrag = function(x, y) {
         var dx = x - this.xx;
         var dy = y - this.yy;
         if (this.swingMode == 'none')
            if (dx * dx + dy * dy > 10 * 10)
               this.swingMode = dx * dx > dy * dy ? 'swing' : 'height';
            else
               return;

         var sc = this.ht / height() / (this.scale()/4);
         switch (this.swingMode) {
         case 'swing':
            this.force = sc * dx;
            break;
         case 'height':
            this.ht += sc * dy;
            break;
         }
         this.xx = x;
         this.yy = y;
      }

      this.render = function(elapsed) {
         var sc = this.size / 400;

         this.afterSketch(function() {
            if (this.portLocation.length == 0) {
               this.addPort("H", -.25 * sc * this.hubWidth, sc);
               this.addPort("S",  .25 * sc * this.hubWidth, sc);
            }
         });

         if (this.isInValue("H"))
            this.ht = this.getInFloat("H");

         this.spring.setMass(this.ht / this.ht0);
         this.spring.setForce(this.force);
         this.force *= 0.9;
         this.spring.update(elapsed);

         var N = 32;
         m.save();
         m.scale(.5 * this.size / 400);
         m.translate(0, 2-this.ht, 0);
         this.anchor = m.transform([0,this.ht,0]);
         mCurve([[-.5*this.hubWidth,this.ht], [.5*this.hubWidth,this.ht]]);

         var angle = this.isInValue("S") ? this.getInFloat("S")
                                         : this.spring.getPosition();
         if (isNaN(angle)) angle = 0;

         this.setOutValue("S", "" + angle);

         m.translate(0,this.ht,0);
         m.rotateZ(angle);
         m.translate(0,-this.ht,0);

         mCurve([[0,this.ht], [0,this.radius]]);
         var c = [];
         for (var i = 0 ; i <= N ; i++) {
            var a = TAU * i / N;
            c.push([this.radius * sin(a), this.radius * cos(a)]);
         }
         mCurve(c);

         m.restore();
      }
   }
   Physics.prototype = new Sketch;

   function raySegment(vx, vy, wx, wy, p0, p1) {
      var a = p0[1] - p1[1];
      var b = p1[0] - p0[0];
      var c = -(a * p0[0] + b * p0[1]);

      var t = -(a * vx + b * vy + c) / (a * wx + b * wy);
      var px = vx + t * wx;
      var py = vy + t * wy;

      var u = (py - p0[1]) / (p1[1] - p0[1]);
      if (u >= 0.0 && u <= 1.0)
         return [px, py];
      else
         return null;
   }

   function rayCurve(vx, vy, wx, wy, curve) {
      var roots = [];
      for (var i = 0 ; i < curve.length-1 ; i++) {
         var p = raySegment(vx, vy, wx, wy, curve[i], curve[i+1]);
         if (p)
            roots.push(p);
      }
      return roots;
   }

   function Shape3D() {
      this.labels = "box".split(' ');

      this.sx = 1;
      this.sy = 1;
      function drawLens() {
         m.save();
            m.translate(0,0,1);
            m.scale(.5,.5,.4);
            m.translate(0,0,1);
            unitTube();
            m.translate(0,0,1);
            unitDisk();
         m.restore();
      }
      this.dragx = 0;
      this.dragy = 0;
      this.mouseDown = function(x, y) {
         this.dragx = x;
         this.dragy = y;
      }
      this.mouseDrag = function(x, y) {
         this.sx *= (400 + x - this.dragx) / 400;
         this.sy *= (400 - y + this.dragy) / 400;
         this.dragx = x;
         this.dragy = y;
      }
      this.mouseUp = function(x,y) {
      }
      this.render = function() {
         m.save();
         var s = this.size / 400;
         m.scale(s * this.sx, s * this.sy, s);
         switch (this.selection) {
         case 0:
            unitCube();
            break;
         case 1:
            var a = m.transform([0,0,0]);
            var b = m.transform([0,0,1.5]);
            if (b[2] > a[2]) {
               unitCube();
               drawLens();
            }
            else {
               drawLens();
               unitCube();
            }
            break;
         }
         m.restore();
      }
   }
   Shape3D.prototype = new Sketch;

   function IO() {
      this.labels = "speaker".split(' ');
      this.code = [
         ["sin", "sin(2 * PI * x * time)"],
         ["sawtooth", "x = x * time % 1.0;\nreturn x / 4;"],
         ["triangle", "x = 2 * x * time % 2;\nx = x < 1 ? x : 2 - x;\nreturn x;"],
         ["square", "x = 2 * x * time % 2;\nx = 2 * floor(x) - 1;\nreturn x / 8;"],
         ["noise", "return 3 * noise(3 * x * time)"],
         ["fractal", "return 3 * fractal(3 * x * time)"],
         ["turbulence", "return 5 * turbulence(3 * x * time) - 1.5"],
      ];
      this.savedCode = "";
      this.savedX = "";
      this.savedY = "";
      this.savedZ = "";
      this.audioShape = null;

      this.cleanup = function() {
         setAudioSignal(function(t) { return 0; });
      }

      this.render = function(elapsed) {
         var cs = isDef(this.selectedIndex) ? this.selectedIndex : 0;
         var t = 1/3;
         m.save();
            m.scale(this.size / 400);
	    mCurve([[1,1],[1,-1],[-t,-t],[-1,-t],[-1,t],[-t,t],[1,1]]);
	    if ( this.code[cs][1] != this.savedCode ||
	         isDef(this.in[0]) && this.inValue[0] != this.savedX ||
	         isDef(this.in[1]) && this.inValue[1] != this.savedY ||
	         isDef(this.in[2]) && this.inValue[2] != this.savedZ ) {

	       var code = this.savedCode = this.code[cs][1];

	       if (isDef(this.in[0])) this.savedX = this.inValue[0];
	       if (isDef(this.in[1])) this.savedY = this.inValue[1];
	       if (isDef(this.in[2])) this.savedZ = this.inValue[2];

	       var var_xyz = "var x=(" + (isDef(this.in[0]) ? this.inValue[0] : 0) + ")," +
	                         "y=(" + (isDef(this.in[1]) ? this.inValue[1] : 0) + ")," +
	                         "z=(" + (isDef(this.in[2]) ? this.inValue[2] : 0) + ");" ;

               // MAKE SURE THE CODE IS VALID.

	       var isError = false;
	       try {
	          var c = code;
	          var i = c.indexOf("return ");
		  if (i >= 0)
		     c = c.substring(0,i) + c.substring(i+7, c.length);
	          eval(var_xyz + c);
               } catch (e) { isError = true; console.log("aha"); }

               // IF IT IS, SEND THE FUNCTION TO THE OUTPUT.

               this.audioShape = null;
	       if (! isError) {
		  var i = code.indexOf("return ");
		  if (i < 0)
		     code = "return " + code;
                  var audioFunction = new Function("time", var_xyz + code);
	          setAudioSignal(audioFunction);

                  this.audioShape = [];
		  for (var t = 0 ; t <= 1 ; t += .01)
		     this.audioShape.push([2*t-1, audioFunction(t/100)/TAU]);
	       }
	    }
	    this.afterSketch(function() {
	       if (this.audioShape != null) {
	          lineWidth(1);
	          mCurve(this.audioShape);
               }
	    });
         m.restore();
      }
   }
   IO.prototype = new Sketch;

   var root, box3D;
   var redMaterial = new phongMaterial();
   redMaterial.setAmbient(.2,0,0).setDiffuse(.8,0,0).setSpecular(1,1,1,20);
   var whiteMaterial = new phongMaterial();
   whiteMaterial.setAmbient(.4,.4,.4).setDiffuse(.3,.3,.3).setSpecular(0,0,0,1);

   updateScene = function(elapsed) {
      //root.getMatrix().rotateY(elapsed).rotateX(2 * elapsed);
      //root.getMatrix().identity().translate(1,0,0).scale(1,1,.01);
   }

