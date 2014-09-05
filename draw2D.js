
// 2D GRAPHICS PRIMITIVES.

   function arrow(ax, ay, bx, by, r) {
      if (! isDef(r))
         r = 10;

      var angle = Math.atan2(bx - ax, by - ay);
      var x = r * Math.cos(angle), y = r * Math.sin(angle);

      _g.beginPath();
      _g_moveTo(ax, ay);
      _g_lineTo(bx, by);
      _g.stroke();

      _g_moveTo(bx - x - y, by + y - x);
      _g_lineTo(bx, by);
      _g_lineTo(bx + x - y, by - y - x);
      _g.stroke();
   }

   function line(ax, ay, bx, by) {
      _g.beginPath();
      _g_moveTo(ax, ay);
      _g_lineTo(bx, by);
      _g.stroke();
   }

   function drawClosedCurve(c, i0) {
      drawCurve(c.concat([c[0]]), i0);
   }

   function drawCurve(c, i0) {
      startCurve(c, i0);
      _g.stroke();
   }

   function fillCurve(c, i0) {
      startCurve(c, i0);
      _g.fill();
   }

   function startCurve(c, i0) {
      if (i0 === undefined)
         i0 = 0;
      if (c.length <= i0)
         return;
      _g.beginPath();
      _g_moveTo(c[i0][0], c[i0][1]);
      for (var i = i0 + 1 ; i < c.length ; i++)
         _g_lineTo(c[i][0], c[i][1]);
   }

   function color(red, grn, blu) {
      if (red === undefined)
         return _g.strokeStyle;
      _g.strokeStyle = _g.fillStyle = _rgb_to_string(red, grn, blu);
   }

   function fill(red, grn, blu) {
      if (red === undefined)
         return _g.fillStyle;
      _g.fillStyle = _rgb_to_string(red, grn, blu);
   }

   function _rgb_to_string(red, grn, blu) {
      return ! isDef(grn) ? red : "rgba(" + red + "," + grn + "," + blu + ",255)";
   }

   function drawPolygon(p, x, y, r, isOpen) {
      makePath(p, x, y, r, isOpen);
      _g.stroke();
   }

   function fillPolygon(p, x, y, r) {
      _g.suppressSketching++;
      makePath(p, x, y, r);
      _g.fill();
      _g.suppressSketching--;
   }

   function drawRect(x, y, w, h) {
      makeRectPath(x, y, w, h);
      _g.stroke();
   }

   function fillRect(x, y, w, h) {
      makeRectPath(x, y, w, h);
      _g.fill();
   }

   function drawOval(x, y, w, h, n, angle0, angle1) {
      makeOvalPath(x, y, w, h, n, angle0, angle1);
      _g.stroke();
   }

   function fillOval(x, y, w, h, n, angle0, angle1) {
      makeOvalPath(x, y, w, h, n, angle0, angle1);
      _g.fill();
   }

   function drawDiamond(x, y, w, h) {
      makeDiamondPath(x, y, w, h);
      _g.stroke();
   }

   function fillDiamond(x, y, w, h) {
      makeDiamondPath(x, y, w, h);
      _g.fill();
   }

   function drawOctagon(x, y, w, h) {
      makeOctagonPath(x, y, w, h);
      _g.stroke();
   }

   function fillOctagon(x, y, w, h) {
      makeOctagonPath(x, y, w, h);
      _g.fill();
   }

   function makeRectPath(x, y, w, h) {
      makePath([ [x,y],[x+w,y], [x+w,y+h], [x,y+h] ]);
   }

   function makeDiamondPath(x, y, w, h) {
      makePath([ [x,y+h/2],[x+w/2,y], [x+w,y+h/2],[x+w/2,y+h] ]);
   }

   function makeOctagonPath(x, y, w, h) {
      var x1 = x+w/4, x2 = x+3*w/4, x3 = x + w,
          y1 = y+h/4, y2 = y+3*h/4, y3 = y + h;
      makePath([ [x,y1], [x1,y], [x2,y], [x3,y1], [x3,y2], [x2,y3], [x1,y3], [x,y2] ]);
   }

   function makeOval(x, y, w, h, n, angle0, angle1) {
      if (! isDef(n))
         n = 32;
      if (! isDef(angle0))
         angle0 = 0;
      if (! isDef(angle1))
         angle1 = 2 * Math.PI;

      var xy = [];
      for (var i = 0 ; i < n ; i++) {
         var theta = angle0 + (angle1 - angle0) * i / (n-1);
         xy.push([x + w/2 + w/2 * Math.cos(theta),
                  y + h/2 + h/2 * Math.sin(theta)]);
      }
      return xy;
   }

   function makeOvalPath(x, y, w, h, n, angle0, angle1) {
      makePath(makeOval(x, y, w, h, n, angle0, angle1));
   }

   function makePath(p, x, y, r, isOpenPath) {
      if (! isDef(x)) x = 0;
      if (! isDef(y)) y = 0;
      if (! isDef(r)) r = 0;
      var n = p.length;
      _g.beginPath();
      if (r == 0) {
         _g_moveTo(x + p[0][0], y + p[0][1]);
         for (i = 1 ; i < n ; i++)
            _g_lineTo(x + p[i][0], y + p[i][1]);
         if (! isOpenPath)
            _g_lineTo(x + p[0][0], y + p[0][1]);
      }
      else {
         var s = Math.sin(r);
         var c = Math.cos(r);
         _g_moveTo(x + c*p[0][0] + s*p[0][1], y - s*p[0][0] + c*p[0][1]);
         for (i = 1 ; i < n ; i++)
            _g_lineTo(x + c*p[i][0] + s*p[i][1], y - s*p[i][0] + c*p[i][1]);
         if (! isOpenPath)
            _g_lineTo(x + c*p[0][0] + s*p[0][1], y - s*p[0][0] + c*p[0][1]);
      }
   }

   function polygonArea(P) {
      var area = 0;
      for (var i = 0 ; i < P.length ; i++) {
         var j = (i + 1) % P.length;
         area += (P[i][1] - P[j][1]) * (P[i][0] + P[j][0]) / 2;
      }
      return area;
   }

   function textWidth(str, context) {
      if (context == undefined)
         context = _g;
      return context.measureText(str).width;
   }

   function textHeight(value) {
      if (isDef(value))
         _g.textHeight = value;
      return _g.textHeight;
   }

   function text(message, x, y, alignX, alignY, font) {
      var th = _g.textHeight;
      if (isDrawingSketch2D) {
         var xx = x, yy = y;
         x = sk().transformX2D(xx, yy);
         y = sk().transformY2D(xx, yy);
         th *= sk().scale();
      }
      x = sk().adjustX(x);
      y = sk().adjustY(y);

      if (! isDef(alignX))
         alignX = 0;
      if (! isDef(alignY))
         alignY = 1;
      _g.font = th + 'pt ' + (isDef(font) ? font : isDrawingSketch2D ? 'Comic Sans MS' : 'Calibri');
      _g.fillText(message, x - alignX * textWidth(message), y + (1-alignY) * th);
   }

