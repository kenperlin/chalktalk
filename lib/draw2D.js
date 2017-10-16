"use strict";

// 2D GRAPHICS PRIMITIVES.

   function arrow(ax, ay, bx, by, r) {
      if (! isDef(r))
         r = 10;

      var angle = Math.atan2(bx - ax, by - ay);
      var x = r * Math.cos(angle), y = r * Math.sin(angle);

      _g_beginPath();

      _g_moveTo(ax, ay);
      _g_lineTo(bx, by);
      _g_stroke();

      _g_moveTo(bx - x - y, by + y - x);
      _g_lineTo(bx, by);
      _g_lineTo(bx + x - y, by - y - x);

      _g_stroke();
   }

   function arrowHead(ax, ay, bx, by, r) {
      if (! isDef(r))
         r = 10;

      var angle = Math.atan2(bx - ax, by - ay);
      var x = r * Math.cos(angle), y = r * Math.sin(angle);

      _g_beginPath();
      _g_moveTo(bx - x - y, by + y - x);
      _g_lineTo(bx, by);
      _g_lineTo(bx + x - y, by - y - x);
      _g_stroke();
   }

   function line(ax, ay, bx, by) {
      _g_beginPath();
      _g_moveTo(ax, ay);
      _g_lineTo(bx, by);
      _g_stroke();
   }

   function drawClosedCurve(c) {
      drawCurve(c.concat([c[0]]));
   }

   function drawCurve(c) {
      if (xmlWriteEnabled)
         xmlWriteCurve(c);
      startCurve(c);
      _g_stroke();
   }

   function fillCurve(c) {
      startCurve(c);
      _g_fill();
   }

   function startCurve(c) {
      var curve = makeCurve(c), i;

      _g_beginPath();
      for (i = 0 ; i < curve.length ; i++)
         _g_sketchTo(curve[i], i > 0);
   }

   function color(red, grn, blu) {
      if (red === undefined)
         return _g.strokeStyle;
      _g.strokeStyle = _g.fillStyle = _rgb_to_string(red, grn, blu);
   }

   function drawTextCursor(x, y, dy, context) {
      y += 0.35 * dy;

      _g.save();

      _g.lineWidth = 1;
      _g.strokeStyle = defaultPenColor;

      var x0 = x - dy * 4/16;
      var x1 = x + dy * 4/16;

      var y0 = y - dy * 19/16;
      var y1 = y - dy * 18/16;
      var y2 = y + dy *  3/16;
      var y3 = y + dy *  4/16;

      _g_beginPath();
      _g_moveTo(x, y1);
      _g_lineTo(x, y2);
      _g_stroke();

      _g_beginPath();
      _g_moveTo(x0, y0);
      _g_lineTo(x , y1);
      _g_lineTo(x1, y0);
      _g_stroke();

      _g_beginPath();
      _g_moveTo(x0, y3);
      _g_lineTo(x , y2);
      _g_lineTo(x1, y3);
      _g_stroke();

      _g.restore();
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
      _g_stroke();
   }

   function fillPolygon(p, x, y, r) {
      _g.suppressSketching++;
      makePath(p, x, y, r);
      _g_fill();
      _g.suppressSketching--;
   }

   function drawRect(x, y, w, h) {
      makeRectPath(x, y, w, h);
      _g_stroke();
   }

   function fillRect(x, y, w, h) {
      makeRectPath(x, y, w, h);
      _g_fill();
   }

   function drawRoundRect(x, y, w, h, r) {
      makePath(createRoundRect(x, y, w, h, r));
      _g_stroke();
   }

   function fillRoundRect(x, y, w, h, r) {
      makePath(createRoundRect(x, y, w, h, r));
      _g_fill();
   }

   function drawOval(x, y, w, h, n, angle0, angle1) {
      makeOvalPath(x, y, w, h, n, angle0, angle1);
      _g_stroke();
   }

   function fillOval(x, y, w, h, n, angle0, angle1) {
      makeOvalPath(x, y, w, h, n, angle0, angle1);
      _g_fill();
   }

   function drawDiamond(x, y, w, h) {
      makeDiamondPath(x, y, w, h);
      _g_stroke();
   }

   function fillDiamond(x, y, w, h) {
      makeDiamondPath(x, y, w, h);
      _g_fill();
   }

   function drawOctagon(x, y, w, h) {
      makeOctagonPath(x, y, w, h);
      _g_stroke();
   }

   function fillOctagon(x, y, w, h) {
      makeOctagonPath(x, y, w, h);
      _g_fill();
   }

   function makeRectPath(x, y, w, h) {
      makePath([ [x,y], [x+w,y], [x+w,y+h], [x,y+h] ]);
   }

   function makeDiamondPath(x, y, w, h) {
      makePath([ [x,y+h/2],[x+w/2,y], [x+w,y+h/2],[x+w/2,y+h] ]);
   }

   function makeOctagonPath(x, y, w, h) {
      var x1 = x+w/4, x2 = x+3*w/4, x3 = x + w,
          y1 = y+h/4, y2 = y+3*h/4, y3 = y + h;
      makePath([ [x,y1], [x1,y], [x2,y], [x3,y1], [x3,y2], [x2,y3], [x1,y3], [x,y2] ]);
   }

   function makeOval(x, y, w, h, n, angle0, angle1, power) {
      if (! isDef(n))
         n = 32;
      if (! isDef(angle0))
         angle0 = 0;
      if (! isDef(angle1))
         angle1 = 2 * Math.PI;

      var xy = [];

      for (var i = 0 ; i < n ; i++) {
         var theta = angle0 + (angle1 - angle0) * i / (n-1);
         var c = Math.cos(theta);
         var s = Math.sin(theta);
         if (power !== undefined) {
            var t = pow(pow(abs(c), power) + pow(abs(s), power), 1/power);
            c /= t;
            s /= t;
         }
         xy.push([x + w/2 + w/2 * c, y + h/2 + h/2 * s]);
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
      _g_beginPath();
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
      return .5 * parseFloat(def(context, _g).font) * str.length * displayStrokes.textCharWidth();
   }

   function textHeight(value) {
      if (isDef(value))
         _g.textHeight = value;
      return _g.textHeight;
   }

   function textDot(message, x, y, r) {
      var rgb = color();
      fillOval(x - r, y - r, 2*r, 2*r);
      color(backgroundColor);
      var fontHeight = floor(1.4 * r);
      utext(message, x, y, .5, .5, fontHeight + 'pt Arial');
      color(rgb);
   }

   function utext(message, x, y, alignX, alignY, font) {
      _g.noAdjust = true;
      text(message, x, y, alignX, alignY, font);
      delete _g.noAdjust;
   }

   function text(message, x, y, alignX, alignY, font, m) {
      var z = 0;
      if (x instanceof Array) {
         z = def(x[2]);
         y = def(x[1]);
         x = x[0];
      }

      var th = _g.textHeight, line, i, dy;

      if (font !== undefined)
         th = parseInt(font);

      if (isk() && _g.noAdjust === undefined) {
         x = sk().adjustX(x);
         y = sk().adjustY(y);
      }

      if (! isDef(alignX))
         alignX = 0;
      if (! isDef(alignY))
         alignY = 1;
      _g.font = isDef(font) ? font : th + 'pt ' + defaultFont;

      var p = [0,0,0];

      var align = viewForwardMat.transform([alignX, alignY, 0, 0]);

      var rot = m ? new Rotation(m._m()) : undefined;

      var lines = ('' + message).split('\n');
      for (i = 0 ; i < lines.length ; i++) {
         var di = 1.6 * (i + .5 - lines.length / 2);

         p[0] = x - align[0] * textWidth(lines[i]);
         p[1] = y + (-.2 - align[1] + di) * th * .65;
	 p[2] = z;

         if (rot)
	    p = rot.rotateAbout([x,y,z], p);

         if (! isScreenView)
	    viewForwardMat.transform(p, p);

         _g_text(lines[i], p, m);
      }
   }

   function uvColor(u, v) {
      return 'rgb(' + floor(255 * u) + ',' + floor(255 * v) + ',0)';
   }

