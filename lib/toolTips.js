
   function drawToolTip() {
      var txt, dragOp, cx, cy, r, rx, ry, i, c, s, t, x, y, rc, rs;

      // TOOL TIP FOR A SKETCH

      if (isk() && isHover()) {

         dragOp = ',,path,copies,link,,arrow,,'.split(',');
         cx = (sk().xlo + sk().xhi) / 2;
         cy = (sk().ylo + sk().yhi) / 2;
         r  = max(sk().xhi - sk().xlo, sk().yhi - sk().ylo) / 2;
         rx = r + 60;
         ry = r + 40;

         var SAVE_textHeight = _g.textHeight;
         _g.textHeight = r / 8;

         color(bgScrimColor(0.5));
         fillRect(sk().xlo, sk().ylo, sk().xhi - sk().xlo, sk().yhi - sk().ylo);

         color(bgScrimColor(0.5));
         fillRect(sk().xlo, sk().ylo, sk().xhi - sk().xlo, sk().yhi - sk().ylo);
         color(overlayScrimColor(0.5));
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
               utext('(' + dragOp[i] + ')', x, y, .5, -.3);
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
         _g.textHeight = SAVE_textHeight;
      }

      // TOOL TIP OVER THE BACKGROUND

      else {
         var SAVE_textHeight = _g.textHeight;
         _g.textHeight = 12;

         x = bgClickCount == 0 ? sketchPage.x : bgClickX;
         y = bgClickCount == 0 ? sketchPage.y : bgClickY;
         r = 64;
         color(overlayColor);

         lineWidth(4);

         _g.textHeight = 13;

         if (bgClickCount == 0) {
            fillOval(x - .18 * r, y - .18 * r, .36 * r, .36 * r);
            color(backgroundColor);
            utext('1', x, y, .5, .5);
         }

	 bgClickGestures[1][-1][0] = sketchPage.isGlyphable ? 'lock' : 'unlock';

         var rs = 0.707 * r;
         var dx = [r,rs,0,-rs,-r,-rs, 0, rs];
         var dy = [0,rs,r, rs, 0,-rs,-r,-rs];
         for (i = -1 ; i < 8 ; i++) {
            (function() {
               if (Object.keys(bgClickGestures[i]).length > 0) {
                  color(overlayColor);
                  var cx = x - dx[i];
                  var cy = y + dy[i];

                  _g.textHeight = 12;

                  for (var prop in bgClickGestures[i]) {
                     var j = parseInt(prop);
                     var data = bgClickGestures[i][prop];
                     if (j == -1)
                        utext(data[0], cx - .8 * dx[i], cy + .6 * dy[i], .5, .5);
                     else {
		        lineWidth(2);
                        arrow(cx, cy, cx - .6 * dx[j], cy + .6 * dy[j], r/10);
		        var tw = textWidth(data[0]) * .7;
			var rx = cx - .3 * dx[j];
			var ry = cy + .3 * dy[j];
			color(backgroundColor);
			fillRect(rx - tw/2, ry - r/8 * .4, tw, r/4 * .8);
                        color(overlayColor);
                        utext(data[0], rx, ry, .5, .5, 'italic ' + (r/8) + 'pt Arial');
                     }
                  }

                  color(overlayColor);
                  fillOval(cx - .18 * r, cy - .18 * r, .36 * r, .36 * r);
                  color(backgroundColor);
                  _g.textHeight = 13;
                  utext('2', cx, cy, .5, .5);
               }
            })();
         }

         color(overlayColor);
         utext('Do two click gesture as above\n\nor click-drag to pan', x, y + 2.5 * r, .5, .5, 'italic 15px ' + defaultFont);

         _g.textHeight = SAVE_textHeight;
      }
   }

