
   var toolTipFreehandSketchHelp = [
      ['Click here',
       'then again on sketch',
       'to delete the sketch.',
       ,
       'Click here then swipe right',
       'to associate this sketch',
       'with contents of page.',
       ,
       'Click here then swipe down',
       'to unassociate sketch.'
      ].join('\n'),

      '',

      , // move + arrow

      , // copy

      , // scale

      ['Click here, then',
       'draw on sketch, to',
       'make hand-drawn text.',
       ,
       'Click on background',
       'when done.',
      ].join('\n'),

      , // rotate

      ['Click here',
       'then click on sketch',
       'to enter undraw mode.',
       ,
       'Move mouse left/right',
       'shows how to draw sketch.',
       ,
       'Click again when done.'
      ].join('\n'),
   ];

   var toolTipSketchHelp = [
      ['Click here',
       'then again on sketch',
       'to delete the sketch.',
      ].join('\n'),

      ['Click here',
       'then click on sketch',
       'to convert the sketch',
       'to a hand drawn sketch.',
      ].join('\n'),

      ['Click here, then',
       'click on sketch,',
       'then move mouse.',
       ,
       'Click again when done.',
       ,
       'Or click then drag',
       'to another sketch',
       'to create an arrow.',
      ].join('\n'),

      ['Click here',
       'then click on sketch to',
       'make a copy of sketch.',
       ,
       'The copy will',
       'move with your mouse.',
       ,
       'Click again when done.',
      ].join('\n'),

      ['Click here, then click on',
       'sketch, then move mouse',
       'up or down to scale.',
       ,
       'Click again when done.',
       ,
       'Click here then drag',
       'to another sketch',
       'to create a link.',
      ].join('\n'),

      ['Click here to do',
       'CMD modifier before',
       'clicking or dragging',
       'on the sketch.',
      ].join('\n'),

      ['Click here, then',
       'click on sketch, then',
       'move mouse to rotate.',
       ,
       'Click again when done.',
       ,
       'Or click here, then',
       'drag downward, to lock',
       'or unlock the sketch.',
      ].join('\n'),

      ['Click here,',
       'then click on sketch,',
       'to open a code window',
       'for this sketch.',
       ,
       'Repeat to close',
       'the code window.'
      ].join('\n'),
   ];

   function drawToolTip() {
      var d, th, txt, dragOp, cx, cy, r, rx, ry, i, c, s, t, x, y, rc, rs;

      var SAVE_textHeight = _g.textHeight;

      // TOOL TIP FOR A SKETCH

      var mode = 0, dir;
      if (isk()) {
         x = sketchPage.x;
         y = sketchPage.y;
         d = 8 * sketchPadding;
	 if (isHover())
	    mode = 2;
         else if ( sk().xlo - d < x && sk().xhi + d > x &&
                   sk().ylo - d < y && sk().yhi + d > y ) {
            dir = pieMenuIndex(x - (sk().xlo + sk().xhi) / 2,
                               y - (sk().ylo + sk().yhi) / 2, 8);
            mode = 1;
         }
      }

      if (mode > 0) {
         dragOp = ',,arrow,,link,draw text,lock,,'.split(',');
         if (isFreehandSketch(sk())) {
	    dragOp[0] = 'save/load';
	    if (! sk()._isGlyphable)
	       dragOp[6] = 'unlock';
         }

         cx = (sk().xlo + sk().xhi) / 2;
         cy = (sk().ylo + sk().yhi) / 2;
         r  = max(sk().xhi - sk().xlo, sk().yhi - sk().ylo) / 2;
         rx = r + 60;
         ry = r + 40;

         th = 1.5 * sqrt(r);
         _g.textHeight = th;

         color(bgScrimColor(0.5));
         fillRect(sk().xlo, sk().ylo, sk().xhi - sk().xlo, sk().yhi - sk().ylo);

         color(bgScrimColor(0.5));
         fillRoundRect(sk().xlo, sk().ylo, sk().xhi - sk().xlo, sk().yhi - sk().ylo, sketchPadding);
         color(overlayScrimColor(0.25));
         fillRoundRect(sk().xlo, sk().ylo, sk().xhi - sk().xlo, sk().yhi - sk().ylo, sketchPadding);

         color(overlayColor);

	 if (sk().onClick !== undefined && typeof sk().onClick !== 'function')
	    utext('click here to\n' +  sk().onClick[0], cx, cy, .5, .5);

         for (var i = 0 ; i < 8 ; i++) {
	    if (mode == 1 && dir != i)
	       continue;

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

	    if (mode == 1) {
	       txt = toolTipSketchHelp[i];
	       if (isFreehandSketch(sk()) && toolTipFreehandSketchHelp[i] !== undefined)
	          txt = toolTipFreehandSketchHelp[i];
	       if (txt !== undefined) {
                  _g.textHeight = th * 0.8;
	          utext(txt, cx, cy, .5, .5);
                  _g.textHeight = th;
               }
            }

            else if (sk().swipe[i] !== undefined && sk().swipe[i] != null) {
               rc = r * c * t * .75;
               rs = r * s * t * .75;
               utext(sk().swipe[i][0], cx + rc, cy - rs, .5, .5);
               arrow(cx + rc * .1, cy - rs * .1, cx + rc * .6, cy - rs * .6);
            }
         }

	 if (mode == 2 && isFreehandSketch(sk()) && sk().isGlyphable)
	    utext('Click here\nto interpret.', cx, cy, .5, .5);
      }

      // TOOL TIP OVER THE BACKGROUND

      else {
         _g.textHeight = 12;

         x = bgClickCount == 0 ? sketchPage.x : bgClickX;
         y = bgClickCount == 0 ? sketchPage.y : bgClickY;
         r = 64;

	 bgDragGestures[6][0] = sketchPage.isGlyphable ? 'lock' : 'unlock';

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
                  utext(i == -1 ? '1' : '2', cx, cy-.25, .5, .5);
               }
               color(overlayColor);
               var data = bgClickGestures[i];
               _g.textHeight = 12;
               utext(str, cx - dx[i], cy + .5 * dy[i], .5, .5);
            }
         }
      }

      _g.textHeight = SAVE_textHeight;
   }

