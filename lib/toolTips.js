
   function drawToolTip() {
      var txt, dragOp, cx, cy, r, rx, ry, i, c, s, t, x, y, rc, rs;

      var SAVE_textHeight = _g.textHeight;

      // TOOL TIP FOR A SKETCH

      if (isk() && isHover()) {

         dragOp = ',,,copies,link,,arrow,,'.split(',');
         if (isSimpleSketch(sk()))
	    dragOp[0] = 'save/load';

         cx = (sk().xlo + sk().xhi) / 2;
         cy = (sk().ylo + sk().yhi) / 2;
         r  = max(sk().xhi - sk().xlo, sk().yhi - sk().ylo) / 2;
         rx = r + 60;
         ry = r + 40;

         _g.textHeight = 1.5 * sqrt(r);

         color(bgScrimColor(0.5));
         fillRect(sk().xlo, sk().ylo, sk().xhi - sk().xlo, sk().yhi - sk().ylo);

         color(bgScrimColor(0.5));
         fillRect(sk().xlo, sk().ylo, sk().xhi - sk().xlo, sk().yhi - sk().ylo);
         color(overlayScrimColor(0.25));
         fillRect(sk().xlo, sk().ylo, sk().xhi - sk().xlo, sk().yhi - sk().ylo);

         color(overlayColor);

         for (var i = 0 ; i < 8 ; i++) {
            c = cos(TAU * i / 8);
            s = sin(TAU * i / 8);
            t = pow (pow(c, 4) + pow(s, 4) , 1/4);
            x = cx + rx * c / t;
            y = cy - ry * s / t;

            txt = sketchClickActionName(i, sk());

            if (dragOp[i].length > 0) {
               utext(txt, x, y, .5, 1.3);
               utext('\u279c' + dragOp[i], x, y, .5, -.3);
            }
            else
               utext(txt, x, y, .5, .5);

            if (sk().swipe[i] !== undefined && sk().swipe[i] != null) {
               rc = r * c * t * .75;
               rs = r * s * t * .75;
               utext(sk().swipe[i][0], cx + rc, cy - rs, .5, .5);
               arrow(cx + rc * .1, cy - rs * .1, cx + rc * .6, cy - rs * .6);
            }
         }
      }

      // TOOL TIP OVER THE BACKGROUND

      else {
         _g.textHeight = 12;

         x = bgClickCount == 0 ? sketchPage.x : bgClickX;
         y = bgClickCount == 0 ? sketchPage.y : bgClickY;
         r = 64;

	 bgClickGestures[1][0] = sketchPage.isGlyphable ? 'lock' : 'unlock';

         var rs = 0.707 * r;
         var dx = [r,rs,0,-rs,-r,-rs, 0, rs]; dx[-1] = 0;
         var dy = [0,rs,r, rs, 0,-rs,-r,-rs]; dy[-1] = 0;
         for (i = -1 ; i < 8 ; i++) {
	    var str = '';
            if (bgClickGestures[i] !== undefined)
	       str += bgClickGestures[i][0];
            if (bgDragGestures[i] !== undefined) {
	       if (str.length > 0)
	          str += '\n';
	       else if (i == -1)
	          str += '\n\n';
	       str += '\u279c' + bgDragGestures[i][0];
            }
	    if (str.length > 0) {
               var cx = x - dx[i];
               var cy = y + dy[i];
	       if (bgClickCount == 0 || i > -1) {
                  color(overlayColor);
                  fillOval(cx - .18 * r, cy - .18 * r, .36 * r, .36 * r);
                  color(backgroundColor);
                  _g.textHeight = 13;
                  utext(i == -1 ? '1' : '2', cx, cy, .5, .5);
               }
               color(overlayColor);
               var data = bgClickGestures[i];
               _g.textHeight = 12;
               utext(str, cx - .85 * dx[i], cy + .4 * dy[i], .5, .5);
            }
         }
      }

      _g.textHeight = SAVE_textHeight;
   }

