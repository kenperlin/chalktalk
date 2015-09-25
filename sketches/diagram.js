function Diagram() {
   this.labels = "rectangle refract circles".split(' ');

   this.theta = 0;

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

         this.theta = asin(s2 < 1 ? s2 : s1);

         color(defaultPenColor);
         line(-w/2,0,w/2,0);
         drawCurve([ [x1,y1], [0,0] ]);
         drawCurve([ [0,0], [x2,y2] ]);

         this.afterSketch(function() {
            textHeight(this.mScale(10));

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

   this.output = function() { return this.theta; }
}
Diagram.prototype = new Sketch2D;
addSketchType('Diagram');
