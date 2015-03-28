
//////////////// DATA USED BY BOTH PIE MENUS AND PULL DOWN MENUS ///////////////

   var pageActionLabels = "text clone group whiteboard clear".split(' ');
   var sketchTypeLabels = [];

/////////////////////////////////// HELP MENU //////////////////////////////////

   function drawHelpMenu() {
      if (isk()) {
         var clickOp = 'delete,unparse,move,copy,scale,cmd,rotate,undraw/see code'.split(',');
         var dragOp = ',,path,copies,link,,arrow,group,'.split(',');
         var cx = (sk().xlo + sk().xhi) / 2;
         var cy = (sk().ylo + sk().yhi) / 2;
         var rx = (sk().xhi - sk().xlo) / 2 + 60;
         var ry = (sk().yhi - sk().ylo) / 2 + 40;
         for (var i = 0 ; i < 8 ; i++) {
            var c = cos(TAU * i / 8);
            var s = sin(TAU * i / 8);
            var t = pow (pow(c, 4) + pow(s, 4) , 1/4);
            var x = cx + rx * c / t;
            var y = cy - ry * s / t;
            if (dragOp[i].length > 0) {
               text(clickOp[i], x, y, .5, 1.3, defaultFont);
               text('(' + dragOp[i] + ')', x, y, .5, -.3, defaultFont);
            }
            else
               text(clickOp[i], x, y, .5, .5, defaultFont);
         }
      }
   }

//////////////////////////////////// PIE MENU //////////////////////////////////

   // EXTERNAL VARS

   var pieMenuCursorWeight = 0;
   var pieMenuIsActive = false;
   var pieMenuStroke = [];
   var pieMenuX = 0;
   var pieMenuY = 0;

   // INTERNAL VARS

   var pieMenuCode = [];
   var pieMenuMouseX = 0;
   var pieMenuMouseY = 0;
   var pieMenuStrokes = null;
   var pieMenuXDown = 640;
   var pieMenuYDown = 360;

   function pieMenuStart(x, y) {
      pieMenuStrokes = null;
      pieMenuIsActive = true;
      pieMenuX = pieMenuMouseX = pieMenuXDown = x;
      pieMenuY = pieMenuMouseY = pieMenuYDown = y;
   }

   function pieMenuEnd() {

      pieMenuStrokes = segmentCurve(pieMenuStroke);
      pieMenuStroke = [];

      pieMenuCode = [];
      for (var n = 1 ; n < pieMenuStrokes.length ; n++)
         pieMenuCode.push(pieMenuIndex(pieMenuStrokes[n][0][0] - pieMenuXDown,
                                       pieMenuStrokes[n][0][1] - pieMenuYDown, 8));
      if (pieMenuCode.length > 0) {
         var index = 0;
         if (pieMenuCode.length > 1)
            index = (pieMenuCode[1] - pieMenuCode[0] + PMA) % PMA;
         if (pieMenuCode[0] == 0)
            menuSelectSketchPageAction(index);
         else {
            addSketchOfType(pieMenuCode[0] - 1);
            sk().setSelection(index);
            sk().isDrawingEnabled = true;
         }
      }
      pieMenuCursorWeight = 1;
   }

   function pieMenuUpdate(x, y) {
      if (pieMenuCursorWeight > 0) {
         pieMenuCursorWeight = max(0, pieMenuCursorWeight - This().elapsed);
         pieMenuX = mix(x, pieMenuXDown, pieMenuCursorWeight);
         pieMenuY = mix(y, pieMenuYDown, pieMenuCursorWeight);
         if (pieMenuCursorWeight == 0) {
            pieMenuIsActive = false;
            pieMenuXDown = width() / 2;
            pieMenuYDown = height() / 2;
         }
      }
   }

   function pieMenuDraw() {
      var w = width(), h = height();
      var R = 130, r = 30;

      var x0 = pieMenuXDown;
      var y0 = pieMenuYDown;

      var mouseX = This().mouseX;
      var mouseY = This().mouseY;

      if (sketchPage.isPressed) {
         var r0 = len(pieMenuMouseX - x0, pieMenuMouseY - y0);
         if (r0 < R - r/2) {
            var r1 = len(mouseX - x0, mouseY - y0);
            if (r1 > r0) {
               pieMenuMouseX = mouseX;
               pieMenuMouseY = mouseY;
            }
         }
         else {
            mouseX = pieMenuMouseX;
            mouseY = pieMenuMouseY;
         }
      }

      var P = [];
      var choice = -1;
      for (var n = 0 ; n < PMA ; n++) {
         var theta = TAU * n / PMA;
         P.push([x0 + R * cos(theta), y0 - R * sin(theta)]);
         if (len(P[n][0] - mouseX, P[n][1] - mouseY) < r)
            choice = n;
      }

      lineWidth(1);
      textHeight(10);

      if (choice >= 0) {
         color('blue');
         fillOval(x0 - 4, y0 - 4, 8, 8);
      }
      for (var n = 0 ; n < PMA ; n++) {
         color('blue');
         if (choice < 0)
            line(x0, y0, P[n][0], P[n][1]);
         else if (choice == 0) {
            if (n < pageActionLabels.length) {
               line(P[0][0], P[0][1], P[n][0], P[n][1]);
               color('rgba(0,0,255,0.2)');
               line(x0, y0, P[n][0], P[n][1]);
            }
         }
         else if (choice-1 < sketchTypeLabels.length) {
            if ((n - choice + PMA) % PMA < sketchTypeLabels[choice-1].length) {
               line(P[choice][0], P[choice][1], P[n][0], P[n][1]);
               color('rgba(0,0,255,0.2)');
               line(x0, y0, P[n][0], P[n][1]);
            }
         }
      }

      var str;
      for (var n = 0 ; n < PMA ; n++) {
         color(n == choice ? 'rgba(0,0,255,0.05)' : backgroundColor);
         fillOval(P[n][0] - r, P[n][1] - r, r+r, r+r);
         color('blue');
         drawOval(P[n][0] - r, P[n][1] - r, r+r, r+r);

         if (choice < 0)
            str = (n == 0 ? "page" : sketchTypes[n-1]);
         else if (choice == 0)
            str = pageActionLabels[n];
         else if (choice-1 < sketchTypeLabels.length)
            str = sketchTypeLabels[choice-1][(n - choice + PMA) % PMA];

         if (isDef(str))
            text(str, P[n][0], P[n][1], .5, .5);
      }
   }

   function pieMenuOverlay() {
      if (pieMenuStroke.length > 0) {
         lineWidth(10);
         color('rgba(0,0,255,0.1)');
         drawCurve(pieMenuStroke);
      }
   }

///////////////////////////////// PULL DOWN MENU //////////////////////////////////

   var pagePullDownLabels = pageActionLabels; // sketchTypes for the current page will be appended
   var pullDownIsActive = false;
   var pullDownLabels = [];
   var pullDownSelection = -1;
   var pullDownX = 0;
   var pullDownY = 0;
   var sketchActionLabels = "linking translating rotating scaling parsing deleting".split(' ');
   var sketchLabelSelection = -1;

   function pullDownStart(x, y) {
      if (pullDownLabels.length > 0) {
         pullDownIsActive = true;
         pullDownSelection = -1;
         sketchLabelSelection = -1;
         pullDownX = x;
         pullDownY = y;
      }
   }

   function pullDownUpdate() {
      if (pullDownSelection >= 0) {

         // AFTER PULLDOWN OVER THE PAGE BACKGROUND

         if (pullDownLabels == pagePullDownLabels) {

            // BASIC MENU ACTIONS FOR ANY PAGE

            if (pullDownSelection < pageActionLabels.length)
               menuSelectSketchPageAction(pullDownSelection);

            // CREATE A NEW SKETCH OF SOME TYPE

            else {
               This().mouseX = pullDownX;
               This().mouseY = pullDownY;
               addSketchOfType(pullDownSelection - pageActionLabels.length);
               sk().setSelection(max(0, sketchLabelSelection));
            }
         }

         // AFTER PULLDOWN OVER A SKETCH

         else {

            // BASIC MENU ACTIONS FOR ANY SKETCH TYPE

            if (pullDownSelection < sketchActionLabels.length) {
               sketchAction = sketchActionLabels[pullDownSelection];
               sketchPage.mx = This().mouseX;
               sketchPage.my = This().mouseY;
               switch(sketchAction) {
               case "text":
                  toggleTextMode(sk());
                  break;
               case "parsing":
                  sk().parse();
                  sketchAction = null;
                  break;
               case "deleting":
                  deleteSketch(sk());
                  sketchAction = null;
                  break;
               }
            }

            // GROUP-SPECIFIC ACTIONS

            else if (sk().isGroup()) {
               switch (pullDownLabels[pullDownSelection]) {
               case 'ungroup':
                  sketchPage.toggleGroup();
                  break;
               }
            }

            // PREPARE FOR MOUSE MOVE RESPONSE SPECIFIC TO THIS SKETCH TYPE

            else {
               sk().setSelection(pullDownSelection - sketchActionLabels.length);
            }
         }

      }

      pullDownIsActivePressed = false;
      pullDownIsActive = false;
   }

   function pullDownDraw() {

      // PH IS THE PULLDOWN CELL HEIGHT.  IT CONTROLS THE SIZE OF THE PULLDOWN.

      var PH = 30;

      var isPageMenu = pullDownLabels == pagePullDownLabels;

      var n = pullDownLabels.length;
      var x = pullDownX, y = pullDownY, w = PH * 5, h = PH * n;
      var mx = This().mouseX, my = This().mouseY;

      if (mx >= x && mx < x + w) {
         var t = (my - y) / PH;
         pullDownSelection = t < 0 || t >= pullDownLabels.length ? -1 : floor(t);
      }
      else if (!(mx >= x + w && isPageMenu &&
          pullDownSelection >= pageActionLabels.length &&
          sketchTypeLabels[pullDownSelection - pageActionLabels.length].length > 0))
         pullDownSelection = -1;

      function drawMenu(x, y, labels, selection) {
         var w = PH * 5;
         var h = PH * labels.length;

         // DRAW A SHADOW BEHIND THE MENU.

         color(backgroundColor == 'white' ? 'rgba(0,0,0,.02)' : 'rgba(255,255,255,.02)');
         for (var i = 0 ; i < 10 ; i += 2)
            fillRect(x + PH/2 + i, y + PH/2 + i, w - 2 * i, h - 2 * i);

         // FILL THE MENU WITH ITS BACKGROUND COLOR.

         color(backgroundColor == 'white' ? 'rgb(247,251,255)' : 'rgb(8,4,0)');
         fillRect(x, y, w, h);

         // HIGHLIGHT THE CURRENT SELECTION.

         if (selection >= 0) {
            color(backgroundColor == 'white' ? 'rgba(0,128,255,.2)' : 'rgba(255,128,0.2)');
            fillRect(x, y + PH * selection, w, PH);
         }

         // DRAW ALL THE TEXT LABELS.

         color(defaultPenColor);
         textHeight(PH * 3 / 5);
         for (var row = 0 ; row < labels.length ; row++)
            text(labels[row], x + PH/7, y + PH/2 + PH * row, 0, .55);

         // DARKEN THE RIGHT AND BOTTOM EDGES.

         lineWidth(1);

         color(scrimColor(.24));
         line(x, y, x + w, y);
         line(x, y, x, y + h);

         color(scrimColor(.48));
         line(x + w, y, x + w, y + h);
         line(x, y + h, x + w, y + h);
      }

      drawMenu(x, y, pullDownLabels, pullDownSelection);

      // DRAW SEPARATOR BETWEEN FIXED CHOICES AND VARIABLE CHOICES.

      var actionLabels =
         pullDownLabels == pagePullDownLabels ? pageActionLabels
                                              : sketchActionLabels;

      color(backgroundColor == 'white' ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.28)');
      fillRect(x, y + actionLabels.length * PH, w - 1, 1);

      // IF SELECTED SKETCH TYPE CONTAINS OPTIONS, SHOW THE SECONDARY MENU.

      if (pullDownLabels == pagePullDownLabels) {
         for (var n = 0 ; n < sketchTypeLabels.length ; n++)
            if (sketchTypeLabels[n].length > 0) {
               var nn = pageActionLabels.length + n;

               // DRAW A SMALL RIGHT ARROW TO SHOW THIS SKETCH TYPE HAS OPTIONS.

               color('rgb(128,128,128)');
               var ax = x + w - PH*7/10;
               var ay = y + PH * nn + PH/4;
               fillPolygon([ [ax, ay], [ax + PH/2-1, ay + PH/4], [ax, ay + PH/2] ]);

               // FOR SELECTED SKETCH TYPE, SHOW WHAT THE OPTIONS ARE.

               if (nn == pullDownSelection) {
                  var tx = x+w, ty = y + PH*nn;
                  var nRows = sketchTypeLabels[n].length;
                  sketchLabelSelection = -1;
                  if ( mx >= tx && mx < tx + w &&
                       my >= ty && my < ty + PH * nRows )
                     sketchLabelSelection = floor((my - ty) / PH);
                  drawMenu(tx, ty, sketchTypeLabels[n], sketchLabelSelection);
               }
            }
      }
   }

   function menuSelectSketchPageAction(index) {
      switch (pageActionLabels[index]) {
      case "text"      : toggleTextMode(); break;
      case "clone"     : copySketch(sk()); break;
      case "group"     : sketchPage.isCreatingGroup = true; break;
      case "whiteboard": sketchPage.isWhiteboard = ! sketchPage.isWhiteboard; break;
      case "clear"     : sketchPage.clear(); break;
      }
   }

///////////////////////////////// SHORTHAND TEXT //////////////////////////////////

   var iOut = 0;
   var isNumericShorthandMode = false;
   var shRadius = 16; // radius of shorthand inner region

   function interpretShorthand() {
      var stroke = strokes[0];
      var n = stroke.length;
      if (len(stroke[n-1][0] - stroke[0][0],
              stroke[n-1][1] - stroke[0][1]) < shRadius) {
         if (iOut < n - 5)
            sketchPage.handleDrawnTextChar(interpretShorthandSegment(stroke, iOut, n));
         iOut = n;
      }
   }

   function interpretShorthandSegment(stroke, i0, i1) {

      function lookupChar(n, shape) {
         n = shape + 5 * n;
         //        1----2----3----4----5----6----7----8----
         var ch = "klSm.}nop~qrCsN/tuv{wxDyz Rab cdefg hij ".substring(n, n+1);
         switch (ch) {
         case ' ': ch = ''; break;
         case 'C': ch = U_ARROW; break;
         case 'D': ch = L_ARROW; break;
         case 'R': ch = D_ARROW; break;
         case 'S': ch = R_ARROW; break;
         }
         return ch;
      }

      var x = 0, y = 0;
      for (var i = i0 ; i < i1 ; i++) {
         x += stroke[i][0] - stroke[0][0];
         y += stroke[i][1] - stroke[0][1];
      }
      var angle = atan2(-y, x);
      var c = cos(angle), s = sin(angle);

      var xx = 0;
      var yy = 0;
      var sgn = 0;

      var iMean = (i0 + i1-1) / 2;
      for (var i = i0 ; i < i1 ; i++) {
         var x1 = stroke[i][0] - stroke[0][0];
         var y1 = stroke[i][1] - stroke[0][1];

         var x2 = x1 * c - y1 * s;
         var y2 = x1 * s + y1 * c;

         xx += x2 * x2;
         yy += y2 * y2;
         sgn += y2 > 0 == i > iMean ? 1 : -1;
      }

      var ratio = xx / yy;
      var shape = ratio <  10 ? sgn < 0 ? 0 : 4
                : ratio < 100 ? sgn < 0 ? 1 : 3
                : 2;

      var n = floor(8 * angle / TAU + 8.5) % 8;
      var text = lookupChar(n, shape);

      switch (text) {
      case R_ARROW: return " ";
      case L_ARROW: return "del";
      case U_ARROW: isShiftPressed = ! isShiftPressed; return null;
      case 'N': isNumericShorthandMode = ! isNumericShorthandMode; return null;
      case D_ARROW: return "ret";
      }

      return text;
   }

///////////////////////////// ON SCREEN KEYBOARD //////////////////////////////////

   var isOnScreenKeyboardMode = false;

   function kbd() {
      isOnScreenKeyboardMode = ! isOnScreenKeyboardMode;
   }

   function isOnScreenKeyboard() {
      return isOnScreenKeyboardMode && isTextMode;
   }

   function OnScreenKeyboard() {
      this.mx = 0;
      this.my = 0;
      this.x = 0;
      this.y = 0;
      this.key = null;
      this.keyPressed = null;
      this.mouseMove = function(x, y) {
         this.mx = x;
         this.my = y;
      }
      this.height = function() { return 3 * w / 11; }
      this.mouseDown = function(x, y) {
         path = [];
         path.push([x,y]);
         this.keyPressed = this.key;
         return this.keyPressed != null;
      }
      this.mouseDrag = function(x, y) {
         path.push([x,y]);
         return this.keyPressed != null;
      }
      this.mouseUp = function(x, y) {
         path.push([x,y]);
         var kw = w - 3*s/2;
         return (x > (this.x - kw/2) || x < (this.x + kw/2) ||
                 y > (this.y - s*13.05) || y < (this.y + s*2.5));
      }
      this.keyClick = function(x, y) {
         return this.keyPressed != null && this.key != null;
      }
      this.dismissClick = function(x, y) {
         var kw = w - 3*s/2;
         if (x < (this.x - kw/2) || x > (this.x + kw/2) ||
             y < (this.y - s*13.05) || y > (this.y + s*2.5)) {
            isOnScreenKeyboardMode = false;
            setTextMode(false);
            if (isCodeWidget) toggleCodeWidget();
            return true;
         } else {
            return false;
         }
      }
      this.render = function() {
         _g.save();
         lineWidth(1);
         var fgColor = backgroundColor=='white' ? '#444444' : '#80c0ff';
         var bgColor = backgroundColor=='white' ? 'rgba(0,0,255,.2)' : 'rgba(0,128,255,.5)';
         color(fgColor);
         var kw = w - 3*s/2;
         drawCurve(createRoundRect(this.x - kw/2, this.y - s*13.05, kw, s*15.55, 9));
         this.key = null;
         for (var row = 0 ; row < nRows()        ; row++)
         for (var k   = 0 ; k   < rowLength(row) ; k++  ) {
            var key = keyAt(row, k);
            switch (key) {
            case '\b': key = 'del'; break;
            case '\n': key = 'ret'; break;
            case '\f': key = 'shift'; break;
            case '\L': key = L_ARROW; break;
            case '\U': key = U_ARROW; break;
            case '\D': key = D_ARROW; break;
            case '\R': key = R_ARROW; break;
            }
            var x = this.x + X(row, k) - w/2;
            var y = this.y + Y(row, k);
            var _x = x-s/4, _y = y-s/4, _w = W(row, k)+s/2, _h = H(row, k)+s/2;
            isCurrentKey = this.mx >= _x && this.mx < _x + _w &&
                           this.my >= _y && this.my < _y + _h ;
            var margin = isCurrentKey && sketchPage.isPressed ? 3 : 1;
            var c = createRoundRect(_x + margin, _y + margin, _w - 2*margin, _h - 2*margin, 3);
            if (isCurrentKey) {
               this.key = key;
               color(bgColor);
               fillCurve(c);
               color(fgColor);
            }
            drawCurve(c);
            var isToRight = row != 1 && k == rowLength(row)-1;
            var dx = isToRight ? 0.7 : .5;
            var jx = isToRight ? 0.6 : .5;
            text(key, x + (_w-s/2) * dx, y + _h/2, jx, .75, 'Arial');
         }
/*
FOR WHEN WE HAVE DRAW_PATH SHORTCUT:
         color('red');
         drawCurve(path);
*/
         _g.restore();
      }

      function keys()        { return isShiftPressed ? uc : lc; }
      function nRows()       { return keys().length;         }
      function rowLength(row){ return keys()[row].length;  }
      function keyAt(row, k) { return keys()[row].substring(k, k+1); }
      function isSpace(row, k) { return row == 4 && k == 0; }
      function isArrow(row, k) { return row == 4 && k > 0; }
      function X(row, k) { return 6*s + 3*s*k - 3*s*(3-row)/2 + (row==0 ? 0 : 3*s) + (!isSpace(row,k)?0:4.45*s) + (!isArrow(row,k)?0:16.5*s); }
      function Y(row, k) { return 3*s*row - s - w/4; }
      function W(row, k) { x=X(row,k), r=x+3*s;
                           return isSpace(row,k) ? 14.1*s : row==3&&k==10 ? 4.5*s : (r>w-3*s ? w-s/2 : r)-x-s; }
      function H(row, k) { return 2 * s; }
      var w = 550, s = w/45;
      var lc = ["`1234567890-=\b","qwertyuiop[]\\","asdfghjkl;'\n","zxcvbnm,./\f"," \L\U\D\R"];
      var uc = ["~!@#$%^&*()_+\b","QWERTYUIOP{}|" ,'ASDFGHJKL:"\n',"ZXCVBNM<>?\f"," \L\U\D\R"];
      var path = [];
   }

   var onScreenKeyboard = new OnScreenKeyboard();

//////////////////////////// NATURAL LANGUGE PARSING /////////////////////////////

   var isShowingNLParse = false;

   var nlPatterns = [
      ["I ", "I ..."],
      ["When ", "When ..."],
   ];

   function Sentence() {
      var articles = "a an the".split(' ');
      var prepositions = ("about across around atop before behind beside by " +
                          "from in into of off on over through to under").split(' ');

      this.parse = function(words, i) {
         this.subject = null;
         this.predicate = null;
         this.preposition = null;
         this.article = null;
         this.object = null;

         i = def(i, 0);
         this.subject = words[i++];
         this.predicate = words[i++];
         this.preposition = null;
         this.article = null;
         this.object = words[i++];

         var j = getIndex(prepositions, this.object);
         if (j >= 0) {
            this.preposition = this.object;
            this.object = words[i++];
         }

         j = getIndex(articles, this.object);
         if (j >= 0) {
            this.article = this.object;
            this.object = words[i++];;
         }

         return this;
      }

      this.toString = function() {
         return (this.subject     == null ? "" : "SUBJECT"     + " [ " + this.subject     + " ] ") +
                (this.predicate   == null ? "" : "PREDICATE"   + " [ " + this.predicate   + " ] ") +
                (this.preposition == null ? "" : "PREPOSITION" + " [ " + this.preposition + " ] ") +
                (this.article     == null ? "" : "ARTICLE"     + " [ " + this.article     + " ] ") +
                (this.object      == null ? "" : "OBJECT"      + " [ " + this.object      + " ] ") ;
      }
   }

   var nlParseData = [];

   function nlParse(text) {

       if (text.charAt(text.length-1) == ".")
          text = text.substring(0, text.length-1);

       var sentence = new Sentence();

       for (var n = 0 ; n < nlPatterns.length ; n++) {
          var len = nlPatterns[n][0].length;
          if (text.length >= len && text.substring(0, len) == nlPatterns[n][0]) {
             switch (n) {
             case 0:
                var words = text.split(" ");
                nlParseData[0] = sentence.parse(words).toString();
                nlParseData[1] = "";
                break;
             case 1:
                var clauses   = text.split(",\n");
                var condition = clauses[0].trim().split(" ");
                var action    = clauses[1].trim().split(" ");
                nlParseData[0] = "CONDITION = { " + sentence.parse(condition, 1).toString() + " }";
                nlParseData[1] = "   ACTION = { " + sentence.parse(action      ).toString() + " }";
                break;
             }
             return true;
          }
       }
       return false;
   }

   function showNLParse() {
      color(defaultPenColor);
      for (var i = 0 ; i < nlParseData.length ; i++)
         text(nlParseData[i], 10, 20 + 20 * i);
   }

////////////////////////////// CODE TEXT EDITOR //////////////////////////////////

   function innerCode(src) {
   }

   keyCount = 0;

   var codeElement,
       codeSelector,
       codeTextArea,
       isCodeWidget = false,
       setCodeAreaText = function() {
          codeTextArea.value = codeSelector.value;
          updateF();
       },
       updateF = function(forgetCall) {

          if (! forgetCall)
             window._is_after_updateF = true;

          if (isCodeScript()) {

             // IF EDITING JAVASCRIPT SOURCE, UNDEFINED VARIABLES CAUSE PROBLEMS,
             // SO WE MAKE THE USER IT THE ` KEY AS A TRIGGER TO REPARSE.

             var s = codeTextArea.value;
             var i = codeTextArea.selectionStart - 1;
             if (s.charAt(i) == '`') {

                // FIRST REMOVE ` CHAR FROM TEXT, THEN RESTORE CURSOR POSITION.

                codeTextArea.value = s.substring(0, i) + s.substring(i + 1, s.length);
                codeTextArea.selectionStart =
                codeTextArea.selectionEnd = i;

                // EVAL THE PART OF SKETCH SCRIPT WITHIN { ... }, INSIDE CONTEXT OF codeSketch.
                // THIS WILL REDEFINE THE SKETCH METHODS ONLY FOR THIS ONE INSTANCE.

                var text = codeTextArea.value;
                var i = text.indexOf('{');
                var j = text.lastIndexOf('}');
                try {
                   codeSketch._temporaryFunction = new Function(text.substring(i + 1, j));
                   codeSketch._temporaryFunction();
                } catch (e) { console.log(e); }
             }
          }

          else if (code() != null) {
             var text = codeTextArea.value;

             // WHEN EVALUATING EXPRESSIONS, UNEVALUATED FUNCTIONS CANNOT BE PROPERLY PARSED,
             // SO DON'T ALLOW EVAL OF USER-CODED EXPRESSIONS IF SUCH FUNCTIONS ARE PRESENT.

             if (isParsableCode(text)) {

                var index = codeSelector.selectedIndex;
                code()[index][1] = text;
                codeSketch.selectedIndex = index;
                if (code()[index][2] !== undefined) {

                   // EVALUATE EXPRESSION WITHIN THE SCOPE OF THE SKETCH.

                   try {
                      codeSketch._temporaryFunction = code()[index][2];
                      codeSketch._temporaryFunction();
                   } catch(e) { console.log(e); }
                }
                else
                   codeSketch.evalCode(text);
             }
          }
       };

   var bookPaperColor = 'rgb(255,248,240)';

   function codeIsBook() {
      return codeSketch != null && codeSketch.isBook !== undefined;
   }
   function isCodeScript() {
      return codeSketch != null && codeSketch.isShowingScript !== undefined;
   }
   function codeScript() {
      return sketchScript[codeSketch.typeName];
   }
   function code() {
      return codeSketch == null ? null : codeSketch.code;
   }
   function codeSelectorBgColor() {
      if (codeIsBook()) return bookPaperColor;
      return backgroundColor === 'white' ? 'rgba(0,0,0,0)'
                                         : 'rgba(128,192,255,' + (0.3 * codeSketch.fade()) + ')';
   }
   function codeSelectorFgColor() {
      if (codeIsBook()) return 'black';
      return backgroundColor === 'white' ? bgScrimColor(codeSketch.fade())
                                         : 'rgba(192,224,255,' + codeSketch.fade() + ')';
   }
   function codeTextBgColor() {
      if (codeIsBook()) return bookPaperColor;
      return 'rgba(0,0,0,0)';
   }
   function codeTextFgColor() {
      if (codeIsBook()) return 'black';
      return (backgroundColor == 'white' ? 'rgba(0,112,224,' : 'rgba(128,192,255,') + codeSketch.fade() + ')';
   }

   function toggleCodeWidget() {
      if (! isCodeWidget && (codeSketch == null || (! isCodeScript() && codeSketch.code == null)))
         return;

      if (isCodeWidget && codeSketch != null)
         codeSketch.isShowingScript = undefined;

      isCodeWidget = ! isCodeWidget;

      codeElement = document.getElementById('code');
      codeElement.innerHTML = "";

      codeSelector = null;
      if (isCodeWidget) {
         var options = "";
         if (! isCodeScript()) {
            for (var i = 0 ; i < code().length ; i++)
               options += "<option value='" + code()[i][1] + "'>"
                        + code()[i][0]
                        + "</option>";
         }

         codeElement.innerHTML =
            "<select id=code_selector onchange='setCodeAreaText()'>"
          + options
          + "</select>"
          + "<br>"
          + "<textArea rows=8 cols=24 id=code_text resize='none'"
          + " style=';outline-width:0;border-style:none;resize:none;overflow:scroll'"
          + " onkeyup='updateF()'>"
          + "</textArea>";

         codeSelector = document.getElementById("code_selector");
         codeSelector.style.backgroundColor = codeSelectorBgColor();
         codeSelector.style.borderColor = codeTextFgColor();
         codeSelector.style.color = codeSelectorFgColor();
         codeSelector.style.visibility = ! isCodeScript() && code().length > 1 ? "visible" : "hidden";
         if (isDef(codeSketch.selectedIndex))
            codeSelector.selectedIndex = codeSketch.selectedIndex;

         codeTextArea = document.getElementById("code_text");
         codeTextArea.onchange = 'console.log("button clicked")';
         codeTextArea.style.backgroundColor = codeTextBgColor();
         codeTextArea.style.borderColor = backgroundColor;
         codeTextArea.style.color = codeTextFgColor();
         codeTextArea.value = isCodeScript() ? codeScript() : code()[codeSelector.selectedIndex][1];
         if (codeIsBook()) {
            codeTextArea.style.width = sfpx(650);
         }

         if (isCodeScript() || code().length < 2) {
            codeTextArea.style.position = "absolute";
            codeTextArea.style.top = 0;
         }

         codeTextArea.onclick = function(event) {
            setTextMode(true);
         };

         updateF(true);
      }
   }

   function drawCodeWidget(text, xlo, ylo, xhi, yhi, isChanged) {

      var fontHeight = codeIsBook() ? 17 : 15;

      codeSelector.style.font = sfpx(18) + ' courier';
      codeTextArea.style.font = sfpx(fontHeight) + (codeIsBook() ? ' serif' : ' courier');

      xlo += _g.panX;
      xhi += _g.panX;

      // COMPUTE THE POSITION OF THE SPEECH BUBBLE.

      var x = (xlo + xhi) / 2;
      var y = sfs(10);

      // COMPUTE THE SIZE OF THE SPEECH BUBBLE.

      var text = codeTextArea.value;

      var rows = text.replace(/./g,'').length;

      if (text.charAt(text.length-1) != '\n')
         rows++;

      var cols = 10;
      var lines = text.split('\n');
      for (var i = 0 ; i < lines.length ; i++)
         cols = max(cols, lines[i].length);

      if (text.length > 0)
         for (var i = 0 ; i < text.length ; i++)
            cols = max(cols, text[i][0].length);

      rows = max(0.5, rows);

      rows = min(rows, 0.9 * height() / sfs(fontHeight));

      codeTextArea.rows = max(1, rows);
      codeTextArea.cols = cols;

      codeTextArea.style.color = codeTextFgColor();

      codeSelector.style.backgroundColor = codeSelectorBgColor();
      codeSelector.style.borderColor = codeTextFgColor();
      codeSelector.style.color = codeSelectorFgColor();

      var columnWidth = sfs(9);
      var w = min(columnWidth * (cols + 4), width() * 0.75);

      if (text.length > 1)
         rows += isCodeScript() ? 0.5 : 0.8;

      var h = sfs(fontHeight * rows);

      // IF CODE SELECTOR IS VISIBLE, MAKE THE SPEECH BUBBLE TALLER.

      if (codeSelector.style.visibility == 'visible')
         h += sfs(fontHeight);

      ///////////// ANIMATE THE CODE BUBBLE TO AVOID THE SKETCH IF NECESSARY. //////////////

      var x1 = (ylo > h
                ? ( (xlo + xhi)/2 + width()/2 ) / 2
                  : (xlo + xhi) / 2 < width() / 2
                    ? xhi + (xhi - xlo) / 2 + w/2
                    : xlo - (xhi - xlo) / 2 - w/2) + _g.panX;

      x1 = max(x1, w/2 + _g.panX);
      x1 = min(x1, width() - w/2 + _g.panX);

      codeElement.x1 = x1;

      x = codeElement.x = codeElement.x === undefined
                          ? x
                          : isChanged
                            ? codeElement.x1 - _g.panX
                            : mix(codeElement.x, codeElement.x1 - _g.panX, 0.1);

      //////////////////////////////////////////////////////////////////////////////////////

      codeElement.style.left = x - w/2 + sfs(10);
      codeElement.style.top = y + sfs(rows == 0 ? 10 : 5);

      if (codeIsBook())
         return;

      // CREATE THE ROUNDED SPEECH BUBBLE SHAPE.

      var cr = width() / 70 * (rows < 2 ? 0.66 : rows < 3 ? 0.8 : 1);

      var cx = x - _g.panX - w/2;
      var cy = y - _g.panY + sfs(rows < 2 ? 0 : 4);
      var c = createRoundRect(cx, cy, w, h, cr);

      // ADD THE "TAIL" OF THE SPEECH BUBBLE THAT POINTS TO THE SKETCH.

      c = resampleCurve(c, 1000);

      var ddMin = Number.MAX_VALUE, ax=0, ay=0, bx=0, by=0;
      for (var i = 0 ; i < c.length ; i++) {
         var x0 = c[i][0];
         var y0 = c[i][1];
         var x1 = (xlo + xhi) / 2;
         var y1 = (ylo + yhi) / 2;

         var tx0 = x0 > xlo ? 0 : (xlo - x0) / (x1 - x0);
         var ty0 = y0 > ylo ? 0 : (ylo - y0) / (y1 - y0);
         var tx1 = x0 < xhi ? 0 : (xhi - x0) / (x1 - x0);
         var ty1 = y0 < yhi ? 0 : (yhi - y0) / (y1 - y0);
         var t = max(tx0, max(ty0, max(tx1, ty1)));
         x1 = mix(x0, x1, t);
         y1 = mix(y0, y1, t);

         var dd = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
         if (dd < ddMin) {
            ddMin = dd;
            ax = x0;
            ay = y0;
            bx = x1;
            by = y1;
         }
      }

      ay = y + h;
      if      (ay >= y     && ay < y+h  ) ay = mix(y     + cr, y+h   - cr, sCurve((ay -  y     ) / h));
      else if (ax >= x-w/2 && ax < x+w/2) ax = mix(x-w/2 + cr, x+w/2 - cr, sCurve((ax - (x-w/2)) / w));

      if (by > ay) {
         ax = min(ax, x + w/2 - 2*cr - _g.panX);
         ax = max(ax, x - w/2 + 2*cr - _g.panX);
         bx -= _g.panX;
         for (var i = c.length - 1 ; i >= 0 ; i--) {
            if (c[i][1] >= cy + h - 1 && len(c[i][0] - ax, c[i][1] - ay) < cr) {
               c[i][0] = bx;
               c[i][1] = by;
            }
         }
      }

      // DRAW THE SPEECH BUBBLE AS AN OUTLINE AND A HIGHLY TRANSPARENT FILL.

      var fade = codeSketch.fadeAway == 0 ? 1 : codeSketch.fadeAway;
      color(backgroundColor == 'white' ? 'rgba(224,224,255,' + (0.5 * fade) + ')'
                                       : 'rgba(  0,  0,255,' + (0.2 * fade) + ')');
      fillCurve(c);

      lineWidth(2);
      color(codeTextFgColor());
      drawCurve(c);
   }

   // DRAW A DOT ON THE SCREEN FOR DEBUGGING PURPOSES.

   function debugDot(x, y, color) {
      _g.save();
      _g.fillStyle = def(color, 'red');
      _g.beginPath();
      _g.moveTo(x-3,y-3);
      _g.lineTo(x+3,y-3);
      _g.lineTo(x+3,y+3);
      _g.lineTo(x-3,y+3);
      _g.fill();
      _g.restore();
   }


//////////////////////////////// AUDIENCE VIEW ///////////////////////////////////

   function isAudiencePopup() {
      return audiencePopup != null;
   }

   function createAudiencePopup() {
      var w = _g.canvas.width;
      var h = _g.canvas.height;
      audiencePopup = window.open("", "audiencePopup", ""
      +  " width=" + w
      +  " height=" + (h+52)
      );
      audiencePopup.moveTo(0, height());
      audiencePopup.document.write( ""
      +  " <head><title>SKETCH</title></head>"
      +  " <body>"

      +  " <table width=" + (w-24) + " height=" + (h+24) + " cellspacing=0 cellpadding=0"
      +  " style='z-index:1;position:absolute;left:0;top:0;'>"
      +  " <tr><td id='slide' align=center valign=center>"
      +  " </td></tr></table>"

      +  " <canvas id=audienceCanvas"
      +  " width=" + (w - 24)
      +  " height=" + h
      +  " style='z-index:1;position:absolute;left:0;top:0;'"
      +  " tabindex=1></canvas>"

      +  " </body>"
      );
      audienceCanvas = audiencePopup.document.getElementById("audienceCanvas");
      audienceContext = audienceCanvas.getContext("2d");
      audiencePopup.blur();
   }

   function removeAudiencePopup() {
      audiencePopup.close();
      audiencePopup = null;
   }



