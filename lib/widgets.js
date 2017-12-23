"use strict";

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

   var codeElement,
       codeSelector,
       codeTextArea,
       isCodeWidget = false,
       setCodeAreaText = function() {
          codeTextArea.value = codeSelector.value;
          updateF(true, true);
       },
       updateF = function(rememberCall, calledFromCodeSelector) {

          // UNDEFINED VARIABLES CREATE EXCEPTIONS THAT ARE NOT CAUGHT,
          // SO WE MAKE THE USER TYPE THE ` KEY AS A TRIGGER TO REPARSE.

          function isBackQuote() {
             var s = codeTextArea.value;
             var i = codeTextArea.selectionStart - 1;
             if (s.charAt(i) == '`') {
                codeTextArea.value = s.substring(0, i) + s.substring(i + 1, s.length);
                codeTextArea.selectionStart =
                codeTextArea.selectionEnd = i;

                if (isCodeScript())
                   codeSketch._codeScript = codeTextArea.value;

                return true;
             }
             return false;
          }

          if (rememberCall)
             window._is_after_updateF = true;

          if (! calledFromCodeSelector && ! isBackQuote())
             return;

          var text = codeTextArea.value;

          if (isCodeScript()) {

             // EVAL THE PART OF SKETCH SCRIPT WITHIN { ... }, INSIDE CONTEXT OF codeSketch.
             // THIS WILL REDEFINE THE SKETCH METHODS ONLY FOR THIS ONE INSTANCE.

             var i = text.indexOf('{');
             var j = text.lastIndexOf('}');
             try {
                codeSketch._temporaryFunction = new Function(text.substring(i + 1, j));
                codeSketch._temporaryFunction();
             } catch (e) { console.log(e); }
          }

          else if (code() != null) {

             var index = codeSelector.selectedIndex;

             // WHEN EVALUATING EXPRESSIONS, UNEVALUATED FUNCTIONS CANNOT BE PROPERLY PARSED,
             // SO DON'T ALLOW EVAL OF USER-CODED EXPRESSIONS IF SUCH FUNCTIONS ARE PRESENT.

             if (isDef(code()[index][2]) || isParsableCode(text)) {

                code()[index][1] = text;
                codeSketch.selectedIndex = index;
                if (code()[index][2] !== undefined) {

                   // EVALUATE EXPRESSION WITHIN THE SCOPE OF THE SKETCH.

                   try {
                      codeSketch._temporaryFunction = code()[index][2];
                      codeSketch._temporaryFunction();
                   } catch(e) { console.log(e); }
                }
                else {
                   codeSketch.evalCode(text);
                }
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
      return codeSketch._codeScript ? codeSketch._codeScript : sketchFileData[codeSketch.typeName][1];
   }
   function code() {
      return codeSketch == null ? null : codeSketch.code;
   }
   function codeSelectorBgColor() {
      if (codeIsBook()) return bookPaperColor;
      return isWhiteBackground() ? 'rgba(0,0,0,0)'
                                 : 'rgba(128,192,255,' + (0.3 * codeSketch.fadeAlpha()) + ')';
   }
   function codeSelectorFgColor() {
      return codeTextFgColor();
   }
   function codeTextBgColor() {
      if (codeIsBook()) return bookPaperColor;
      return 'rgba(0,0,0,0)';
   }
   function codeTextFgColor() {
      if (codeIsBook()) return 'black';
      return (isWhiteBackground() ? 'rgba(0,112,224,' : 'rgba(128,192,255,') + codeSketch.fadeAlpha() + ')';
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

      if (! isCodeWidget)
         return;


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
       + " style=';outline-width:0;border-style:none;resize:none;overflow:scroll;border-color:#b46868;'"
       + " onkeyup='updateF(true, false)'>"
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

      updateF(false, false);
   }

   function drawCodeWidget(text, xlo, ylo, xhi, yhi, isChanged) {
      if (xlo === undefined)
         return;

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

      rows = min(rows, 0.8 * height() / sfs(fontHeight));

      codeTextArea.rows = max(1, rows);
      codeTextArea.cols = cols + 1;

      codeTextArea.style.color = codeTextFgColor();

      codeSelector.style.backgroundColor = codeSelectorBgColor();
      codeSelector.style.borderColor = codeTextFgColor();
      codeSelector.style.color = codeSelectorFgColor();

      var columnWidth = sfs(9);
      var w = min(columnWidth * (cols + 4), width() * 0.75);

      if (text.length > 1)
         rows += isCodeScript() ? 0.5 : 0.8;

      var h = sfs(1.2 * fontHeight * rows);

      // IF CODE SELECTOR IS VISIBLE, MAKE THE SPEECH BUBBLE TALLER.

      if (codeSelector.style.visibility == 'visible')
         h += sfs(1.5 * fontHeight);

      h = min(h, height() - 20);

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

      var cr = sfs(19) * (rows < 2 ? 0.66 : rows < 3 ? 0.8 : 1);

      var cx = x - _g.panX - w/2;
      var cy = y - _g.panY + sfs(rows < 2 ? 0 : 4);
      var bubble = createRoundRect(cx, cy, w, h, cr);

      // ADD THE "TAIL" OF THE SPEECH BUBBLE THAT POINTS TO THE SKETCH.

      var c = resampleCurve(bubble.concat([bubble[0]]), 200);

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
            ax = x0;     // [ax,ay] IS THE POINT ON THE BUBBLE NEAREST TO THE TAIL TIP.
            ay = y0;
            bx = x1;     // [bx,by] IS THE LOCATION OF THE TAIL TIP.
            by = y1;
         }
      }

      // HANDLE SPECIAL CASES WHEN TAIL IS ALONG AN EDGE OF THE BUBBLE.

      ay = y + h;
      if      (ay >= y     && ay < y+h  ) ay = mix(y     + cr, y+h   - cr, sCurve((ay -  y     ) / h));
      else if (ax >= x-w/2 && ax < x+w/2) ax = mix(x-w/2 + cr, x+w/2 - cr, sCurve((ax - (x-w/2)) / w));

      // ADD THE TAIL TO THE BUBBLE.

      var iMax = 0, iMin = c.length - 1;
      if (by > ay) {
         ax = min(ax, x + w/2 - 2*cr - _g.panX);
         ax = max(ax, x - w/2 + 2*cr - _g.panX);
         bx -= _g.panX;
         for (var i = c.length - 1 ; i >= 0 ; i--) {
            if (c[i][1] >= cy + h - 1 && len(c[i][0] - ax, c[i][1] - ay) < cr) {
               c[i][0] = bx;
               c[i][1] = by;
	       iMax = max(iMax, i);
	       iMin = min(iMin, i);
            }
         }
      }

      // DRAW THE SPEECH BUBBLE AS A TRANSPARENT FILL AND AN OUTLINE.

      var fade = codeSketch.fadeAway == 0 ? 1 : codeSketch.fadeAway;
      color(isWhiteBackground() ? fadedColor(.5 * fade, [128,128,255])
                                : fadedColor(.1 * fade, [  0,  0,255]));

      // CALL FILL SEPARATELY FOR BUBBLE AND TAIL, SO THAT EACH FILL WILL BE OF A CONVEX SHAPE.

      fillCurve(bubble);                               // FILL THE BUBBLE.
      if (iMin < iMax)
         fillCurve([ [bx,by], c[iMax+1], c[iMin-1] ]); // FILL THE TAIL, IF ANY.

      lineWidth(2);
      color(codeTextFgColor());
      drawCurve(c);
   }

//////////////// OPTIONAL SEPARATE AUDIENCE POPUP WINDOW ///////////////////////////////////

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


//////////////////////////////////// WEB CLIENT ICONS //////////////////////////////////////

   function webClientIconX(i) {
      return 48 + 24 * i;
   }

   function webClientIconY(i) {
      return 20;
   }

   function isOverWebClientIcons(x, y) {
      return x >= webClientIconX(0) - 12 &&
             x < webClientIconX(server.nClients - 1) + 12 &&
             y < webClientIconY(0) + 12 ;
   }

   function drawWebClientIcons() {
      var r = 12, i, x, y;
      annotateStart();
      for (i = 0 ; i < server.nClients ; i++) {
         x = webClientIconX(i) - _g.panX;
         y = webClientIconY(i) - _g.panY;
         color(fadedColor(0.5, i));
         if (i == server.myClientId)
            fillRect(x-.9*r, y-.9*r, 1.8*r, 1.8*r);
         else
            fillOval(x-.9*r, y-.9*r, 1.8*r, 1.8*r);
         if (! isClientMouseDown[i]) {
            color(backgroundColor);
            if (i == server.myClientId)
               fillRect(x-.65*r, y-.65*r, 1.3*r, 1.3*r);
            else
               fillOval(x-.65*r, y-.65*r, 1.3*r, 1.3*r);
         }
      }
      annotateEnd();
   }

