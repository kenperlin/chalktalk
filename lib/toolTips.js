"use strict";

window.Tooltips = (function() {
   let Tooltips = {};

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

      ['Click here',
       'then click on sketch',
       'to start curve nudge.',
       ,
       'Click again when done.'
      ].join('\n'),

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
       'then move mouse left/right',
       'shows how to draw sketch,',
       'then click when done.'
       ,
       'Click here',
       'then drag right on sketch',
       'to create keyframes.',
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

      ['Click here, then',
       'swipe left or right',
       'on sketch to toggle',
       'code view.',
      ].join('\n'),
   ];

   Tooltips.draw = function() {
      var d, th, txt, dragOp, cx, cy, r, rx, ry, i, c, s, t, x, y;

      var SAVE_textHeight = _g.textHeight;

      // TOOL TIP FOR A SKETCH

      var mode = 0, dir;
      if (isk()) {
         x = sketchPage.x;
         y = sketchPage.y;
         d = 8 * sketchPadding;
         if (isHover()) {
            // Mode 2: hovering directly over a sketch
            mode = 2;
         }
         else if ( sk().xlo - d < x && sk().xhi + d > x &&
            sk().ylo - d < y && sk().yhi + d > y )
         {
            // Mode 1: just off the side of a sketch, showing tooltip for a command
            dir = pieMenuIndex(x - (sk().xlo + sk().xhi) / 2,
               y - (sk().ylo + sk().yhi) / 2, 8);
            mode = 1;
         }
      }

      if (mode > 0) {
         dragOp = ',,arrow,,link,draw text,lock,,'.split(',');
         if (sk().isFreehandSketch()) {
            dragOp[0] = 'save/load';
            if (sk()._isLocked)
               dragOp[6] = 'unlock';
            else if (sk().text.length > 0)
               dragOp[1] = 'create';
            dragOp[7] = 'draw keys';
         }
         else {
            if (isCodeWidget)
               dragOp[0] = 'save code';
            if (sk().stretchValues !== undefined)
               dragOp[7] = 'params/code';
            else
               dragOp[7] = 'toggle code';
         }

         cx = (sk().xlo + sk().xhi) / 2;
         cy = (sk().ylo + sk().yhi) / 2;
         r  = max(sk().xhi - sk().xlo, sk().yhi - sk().ylo) / 2;
         rx = r + 60;
         ry = r + 40;

         th = 1.5 * sqrt(r);
         _g.textHeight = th;
         color(overlayColor);

         if (sk().onClick !== undefined && typeof sk().onClick !== 'function')
            utext('click here to\n' +  sk().onClick[0], cx, cy, .5, .5);

         // IF A FREEHAND SKETCH, SHOW A HINT OF WHAT IT WOULD PARSE TO IF CLICKED ON.

         if (sk().isFreehandSketch() && sk().glyph)
            utext('(' + sk().glyph.indexName + ')', cx, sk().yhi + 10, .5, .5);

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
               if (txt.length > 0)
                  utext('\u2022' + txt, x, y, .5, 1.3);
               utext('-' + dragOp[i], x, y, .5, -.3);
            }
            else if (txt.length > 0)
               utext('\u2022' + txt, x, y, .5, .5);

            if (mode == 1) {
               txt = toolTipSketchHelp[i];
               if (sk().isFreehandSketch() && toolTipFreehandSketchHelp[i] !== undefined)
                  txt = toolTipFreehandSketchHelp[i];
               if (! sk().isFreehandSketch() && isCodeWidget && i == 0)
                  txt += '\n\nOr click here,' +
                  '\nthen drag right' +
                  '\nto save new code.';
               if (sk().isFreehandSketch() && i == 1 && sk().text.length > 0)
                  txt = 'Click here, then\n' +
                  'drag from sketch\n' +
                  'back to here,\n' +
                  'to create a\n' +
                  'new sketch type.';
               if (! sk().isFreehandSketch() && i == 7 && sk().stretchValues)
                  txt += '\n\nor swipe up/down' +
                  '\non sketch to change' +
                  '\nparameter values.';
               if (txt !== undefined) {
                  _g.textHeight = th * 0.8;
                  utext(txt, cx, cy, .5, .5);
                  _g.textHeight = th;
               }
            }

            else if (sk().onSwipe[i] || sk().onCmdSwipe[i]) {
               let rc = r * c * t * .75;
               let rs = r * s * t * .75;
               arrow(cx + rc * .1, cy - rs * .1, cx + rc * .6, cy - rs * .6);
               let sText = sk().onSwipe[i] ? sk().onSwipe[i][0] : '';
               let cText = sk().onCmdSwipe[i] ? sk().onCmdSwipe[i][0] : '';
               utext(sText, cx + rc, cy - rs, .5, .5);
	       if (cText)
                  utext('(' + cText + ')', cx + rc, cy - rs + th, .5, .5);
            }
         }

         if (mode == 2 && sk().isFreehandSketch() && ! sk().isLocked())
            utext('Click here\nto interpret.', cx, cy, .5, .5);

         // SHOW SKETCH LABEL.

         if (mode != 1 && ! sk().isFreehandSketch())
            utext(sk().labels[sk().selection], sk().xlo + th / 2, sk().ylo + th / 2, 0, 0);

         if (sk().isFreehandSketch()) {
            annotateStart();
            color('red');
            var _c = [];
            for (var i = 0 ; i < sk().sp.length ; i++) {
               if (sk().sp[i][2] == 0) {
                  if (_c.length > 1)
                     drawCurve(_c);
                  _c = [];
               }
               _c.push([sk().sp[i][0], sk().sp[i][1]]);
            }
            drawCurve(_c);
            annotateEnd();
         }
      }

      // TOOL TIP OVER THE BACKGROUND

      else {
         isScreenView = true;

         _g.textHeight = 13;

         x = bgClickCount == 0 ? sketchPage.x : bgClickX;
         y = bgClickCount == 0 ? sketchPage.y : bgClickY;
         r = 64;

         bgDragGestures[6][0] = sketchPage.isLocked ? 'unlock' : 'lock';

         var rs = 0.707 * r;
         var dx = [r,rs,0,-rs,-r,-rs, 0, rs]; dx[-1] = 0;
         var dy = [0,rs,r, rs, 0,-rs,-r,-rs]; dy[-1] = 0;
         for (i = -1 ; i < 8 ; i++) {
            var str = '';
            if (bgClickGestures[i] !== undefined)
               str += '\u2022' + bgClickGestures[i][0];
            if (bgDragGestures[i] !== undefined) {
               if (str.length > 0)
                  str += '\n';
               else if (i == -1)
                  str += '\n\n';
               str += '-' + bgDragGestures[i][0];
            }
            if (str.length > 0) {
               var cx = x - dx[i];
               var cy = y + dy[i];
               if (bgClickCount == 0 || i > -1) {
                  color(overlayColor);
                  fillOval(cx - .18 * r, cy - .18 * r, .36 * r, .36 * r);
                  color(backgroundColor);
                  _g.textHeight = 14;
                  utext(i == -1 ? '1' : '2', cx, cy-.25, .5, .5);
               }
               color(overlayColor);
               var data = bgClickGestures[i];
               _g.textHeight = 13;
               utext(str, cx - dx[i], cy + .5 * dy[i], .5, .5);
            }
         }
         isScreenView = false;
      }
      if (sk() && sk().tooltip) {
         _g.textHeight = 20;
         utext(sk().tooltip, (3 * sk().xhi - sk().xlo) / 2, (sk().ylo + sk().yhi) / 2, 0, .5);
      }

      _g.textHeight = SAVE_textHeight;
   }

   return Tooltips;
})();
