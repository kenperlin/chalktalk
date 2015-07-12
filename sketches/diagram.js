function Diagram() {
   this.labels = "rectangle circle refract circles".split(' ');

   this.raySegment = function(vx, vy, wx, wy, p0, p1) {
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

   this.rayCurve = function(vx, vy, wx, wy, curve) {
      var roots = [];
      for (var i = 0 ; i < curve.length-1 ; i++) {
         var p = this.raySegment(vx, vy, wx, wy, curve[i], curve[i+1]);
         if (p)
            roots.push(p);
      }
      return roots;
   }

   this.isWandering = false;
   this.isExiting = false;

   this.dragX = 0;
   this.dragY = 0;

   this.sx = 1;
   this.sy = 1;

   this.mouseDown = function() {}
   this.mouseDrag = function() {}
   this.mouseUp   = function() {}

   this.swipe[1] = ['show\nx,y,z and r', function() { this.showParts  = true; }];
   this.swipe[3] = ['show\nS and N'    , function() { this.showNormal = true; }];

   this.render = function() {

      this.initCopy = function() {
         this.firstTime = undefined;
         this.exitDx = undefined;
      }

      var w = this.width;
      var h = this.height;
      if (this.isMakingGlyph !== undefined) h = w;

      var sel = (this.selection + 1000 * this.labels.length) % this.labels.length;

      if (this.mousePressed)
         switch (this.labels[this.selection]) {
         case 'rectangle':
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
         this.n1 = this.getInValue(0, 1.0);
         this.n2 = this.getInValue(1, 1.5);

         var mouseX = -100, mouseY = -100;

         if (isNumeric(this.xlo) && isk() && sk() == this && isHover() && sketchPage.isPressed) {
            mouseX = this.x - (this.xlo + this.xhi) / 2;
            mouseY = this.y - (this.ylo + this.yhi) / 2;
         }

         var x0 = 0, y0 = 0, x1, y1, r1, x2, y2, r2;

         this.afterSketch(function() {
            color('rgba(0,128,255,.001)');
            fillRect(-w/2,-w/2,w,w);

            if (this.n1 < this.n2) {
               color('rgba(0,128,255,.1)');
               fillRect(-w/2,y0,w,w/2);
            }
            else if (this.n1 > this.n2) {
               color('rgba(0,128,255,.1)');
               fillRect(-w/2,-w/2,w,w/2);
            }
         });

         x1 = mouseX;
         y1 = mouseY;
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

         this.setOutPortValue(asin(s2 < 1 ? s2 : s1));

         color(defaultPenColor);
         line(-w/2,0,w/2,0);
         drawCurve([ [x1,y1], [0,0] ]);
         drawCurve([ [0,0], [x2,y2] ]);

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
            this.region = makeOval(-d-w/4,-w/4,w/2,w/2,10,-TAU*5/6,-TAU*7/6).concat(
                          makeOval( d-w/4,-w/4,w/2,w/2,10,-TAU*2/6,-TAU*4/6));

         drawOval(-d-w/4, -w/4, w/2, w/2, 40, TAU*1/6, TAU*7/6);
         drawOval( d-w/4, -w/4, w/2, w/2, 40, TAU*2/6, TAU*8/6);

         this.afterSketch(function() {

            color('blue');
            lineWidth(6);
            drawPolygon(this.region);

            var mouseX = -1000, mouseY = -1000;
            if (isNumeric(this.xlo)) {
               mouseX = this.x - (this.xlo + this.xhi) / 2;
               mouseY = this.y - (this.ylo + this.yhi) / 2;
            }

            if (mouseX < -w/2 || mouseY < -h/2)
               return;

            color('red');
            var x0 = -w*0.35;
            var y0 = -h*0.35;
            var x1 = mouseX;
            var y1 = mouseY;
            var dx = x1-x0, dy = y1-y0, d = Math.sqrt(dx*dx + dy*dy);
            dx /= d;
            dy /= d;

            lineWidth(2);
            fillOval(x0-w*0.01,y0-w*0.01,w*0.02,w*0.02);
            arrow(x0, y0, x1, y1);

            var p = this.rayCurve(x0, y0, dx, dy, this.region);
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

      case "rectangle":
         var xx = w/2 * this.sx;
         var yy = h/2 * this.sy * .8;
         drawClosedCurve([ [xx,-yy], [xx,yy], [-xx,yy], [-xx,-yy] ]);
         break;

      case "circle":
         var xx = w/2 * this.sx;
         var yy = h/2 * this.sy;
         var c = [];
         for (var a = 0 ; a < TAU ; a += 0.1)
            c.push([xx*cos(a),-yy*sin(a)]);
         drawClosedCurve(c);
         var X = xx * cos(PI/4), Y = yy * sin(PI/4);
         if (this.showParts !== undefined) {
            line(0, 0, X, -Y);
            text("x,y,z", 0, 0, .5, -.5);
            text("r", X/2, -Y/2, 1.3, 1.2);
         }
         if (this.showNormal !== undefined) {
            arrow(-X, -Y, -X*1.5, -Y*1.5);
            text("N", -X*1.7, -Y*1.7, .5, .5);
            text("S", -X, -Y, -.25, -.25);
         }
         break;

      case "triangle":
         var xx = w/2 * this.sx;
         var yy = h/2 * this.sy;
         drawClosedCurve([ [0,-yy], [-xx,yy], [xx,yy] ]);
         break;
      }

      this.afterSketch(function() {
         this.drawText(_g);
      });
   }
}
Diagram.prototype = new Sketch2D;
addSketchType('Diagram');
