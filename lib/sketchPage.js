"use strict";

// THE SKETCH BOOK CONTAINS ALL THE SKETCH PAGES.

   function SketchBook() {
      this.onbeforeunload = function(e) {
         if (isAudiencePopup())
            removeAudiencePopup();
      }
      this.sketchPage = function() {
         return this.sketchPages[this.page];
      }
      this.setPage = function(page) {
         this.page = page;
         if (this.sketchPages[page] === undefined)
            this.sketchPages[page] = new SketchPage();
         return this.sketchPages[page];
      }
      this.clear = function() {
         this.page = 0;
         this.sketchPages = [new SketchPage()];
      }
      this.clear();
   }

   function computeStandardView() {
      sk().standardView();

      if (! sk().pointToPixelMatrix)
         sk().pointToPixelMatrix = new THREE.Matrix4();

      for (var i = 0 ; i < 16 ; i++)
         sk().pointToPixelMatrix.elements[i] = m._m()[i];
   }

   function computeStandardViewInverse() {
      sk().standardViewInverse();

      if (! sk().pixelToPointMatrix)
         sk().pixelToPointMatrix = new THREE.Matrix4();

      for (var i = 0 ; i < 16 ; i++)
         sk().pixelToPointMatrix.elements[i] = m._m()[i];
   }

// HOT KEYS ARE RECOGNIZED BY THE SKETCH PAGE.

   var hotKeyMenu = [
      ['spc', "show/hide help"],
      ['C'  , "casual font"],
      ['F'  , "toggle fog"],
      ['U'  , "toggle lightpen"],
      ['f'  , "fuzzy lines"],
      ['i'  , "insert text"],
      ['j'  , "add joined stroke"],
      ['m'  , "move sketch"],
      ['M'  , "print model file"],
      ['n'  , "toggle notes"],
      ['o'  , "output glyphs"],
      ['p'  , "pan view"],
      ['r'  , "rotate sketch"],
      ['s'  , "scale sketch"],
      ['t'  , "toggle clock"],
      ['u'  , "toggle video size"],
      ['v'  , "show/hide video"],
      ['w'  , "show/hide images"],
      ['#'  , "graph paper"],
      ['-'  , "blackbd / whitebd"],
      ['='  , "show glyphs"],
      ['esc', "hide text bubble"],
      ['alt', "copy sketch"],
      ['del', "delete sketch"],
      [L_ARROW, "previous image"],
      [R_ARROW, "next image"],
   ];


// MOST USER INTERACTION IS MEDIATED BY THE CURRENT SKETCH PAGE.

   function SketchPage() {
      this.altCmdState = 0;
      this.fadeAway = 1;
      this.imageLibrary_alpha =  0;
      this.imageLibrary_index = -1;
      this.isCTObject = false;
      this.isCTRotate = 0;
      this.isFocusOnLink = false;
      this.isGraphPaper = false;
      this.isLocked = false;
      this.keyPressed = -1;
      this.letterPressed = '\0';
      this.letterPressedTime = 0;
      this.needToStartSketchDragAction = false;
      this.scaleRate = 0;
      this.sketches = [];
      this.zoom = 1;
      palette.dragXY = null;
   }

   SketchPage.prototype = {

///////// SAVING / LOADING THE PAGE TO / FROM THE SERVER //////////

      serialize : function () {
         var linksData = [], n, out, k, link, index, sketchCopies = [];

         // TEMPORARILY REMOVE LINKS, TO AVOID CIRCULAR REFERENCES.
         // ALSO REMOVE FUNCTIONS - THEY CAN'T BE SERIALIZED

         for (n = 0 ; n < nsk() ; n++) {
            if ((out = sk(n).out[0]) !== undefined)
               for (var k = 0 ; k < out.length ; k++) {
                  link = out[k];
                  for (index = 0 ; sk(index) != link.b ; index++) ;
                  linksData.push([ n , index , link.j , link.s ]);
                  link.remove();
               }
            var copy = copyWithoutFunctions(sk(n));
            sketchCopies.push(copy);
         }

         return [sketchCopies, linksData, _g.panX, _g.panY];
      },

      unpackSketches : function(data) {
         var di = nsk();
         this._sketchesFromData(data[0]);
         this._linksFromData   (data[1], di);
         if (di == 0) {
            _g.panX = data[2];
            _g.panY = data[3];
         }
         else {
            for (var n = di ; n < nsk() ; n++)
               sk(n).translate(data[2] - _g.panX, data[3] - _g.panY);
         }
         for (var n = di ; n < nsk() ; n++)
            sk(n).fadeUp = 0;
      },

      savePage : function(name) {
      	var sketchData = this.serialize();
	      //var stringifiedData = stringify(sketchData);
	      //server.set('state/collection_' + name, stringifiedData);
            server.set('state/collection_' + name, sketchData);
	      this._linksFromData(sketchData[1]);
      },
      
      loadPage : function(name) {
         var that = this;
         server.get('state/collection_' + name, function(data) {
            that.unpackSketches(data);
         });
      },

      _sketchesFromData : function(d) {
         for (var n = 0 ; n < d.length ; n++)
            if (d[n].glyph === undefined) {
               addSketch(new FreehandSketch());
               copyFromData(d[n], sk());
            }
            else {
               eval(d[n].glyph.name);
               copyFromData(d[n], sk());
               sk().sketchTrace = null;
               sk().mesh = undefined;
            }
      },

      _linksFromData : function(d, di) {
         if (di === undefined)
            di = 0;
         for (var n = 0 ; n < d.length ; n++)
            new SketchLink(sk(di+d[n][0]), 0, sk(di+d[n][1]), d[n][2], d[n][3]);
      },

///////////////////// EVENT HANDLERS /////////////////////////

      // HANDLE MOUSE DOWN FOR THE SKETCH PAGE.

      mouseDown : function(x, y, z) {

         if (imageLibrary_isShowingLibrary)
            return;

         if (overview_alpha > 0)
            return;

         this.isFocusOnSketch = false;

         if (window._is_after_updateF) {
            isTextMode = false;
            return;
         }

         this.mx = x;
         this.my = y;

         if (this.setPageInfo !== undefined)
            return;

         this.isPressed = true;
         this.isClick = true;
         this.isMouseDownOverBackground = ! isHover();
         this.travel = 0;
         this.xDown = x;
         this.yDown = y;
         this.zDown = z;
         this.x = x;
         this.y = y;
         this.z = z;
         this.panXDown = _g.panX;
         this.panYDown = _g.panY;
         this.panZDown = _g.panZ;

         this.linkAtMouseDown = null;
         isSketchDragActionEnabled = false;
         isBgActionEnabled = false;

         if (isShowingGlyphs) {
            for (var i = 0 ; i < glyphs.length ; i++) {
               var b = glyphChart.bounds(i);
               if (x >= b[0] && x < b[2] && y >= b[1] && y < b[3]) {
                  glyphChart.isDragging = true;
                  glyphChart.iDragged = i;
                  break;
               }
            }
            return;
         }

         if (bgClickCount == 1 && group.contains(x, y)) {
            group.startAction(pieMenuIndex(bgClickX - x, bgClickY - y, 8));
            bgClickCount = 0;
         }

         if (! group.isCreating && group.mouseDown(x, y))
            return;


         if (bgClickCount == 1) {
            isSketchCmdMode = pieMenuIndex(bgClickX - x, bgClickY - y, 8) == 5;

            if (linkAtCursor != null) {
               this.linkAtMouseDown = linkAtCursor;
               this.linkAtMouseDown.mouseDown(x, y);
            }
            else if (isSketchDragActionEnabled = isHover()) {
               this.needToStartSketchDragAction = true;
            }
            else {
               isBgActionEnabled = true;
               bgActionDown(x, y);
            }
	    if (! isSketchCmdMode)
               return;
         }

         if (! isShowingGlyphs) {
            if (palette.colorId >= 0) {
               palette.dragXY = null;
               return;
            }
         }

         if (isTextMode) {
            strokes = [[[x,y]]];
            strokesStartTime = time;
            return;
         }

         // BEFORE PROCEEDING, FINISH ANY UNFINISHED SKETCH.

         if (isk())
            finishDrawingUnfinishedSketch(sk());

         this.isFocusOnLink = false;
         if (linkAtCursor != null) {
            this.isFocusOnLink = true;
            return;
         }

         if (arrowNearCursor != null) {
            this.isFocusOnArrow = true;
            return;
         }

         // IN EVERY CASE, EITHER MOUSE DOWN OVER AN EXISTING SKETCH, OR CREATE A NEW SKETCH.

         this.isFocusOnSketch = true;
         this.isStartingToDrawFreehandSketch = false;

         // SEND MOUSE DOWN/DRAG COMMANDS TO AN EXISTING SKETCH.

         this.isFocusOnGlyphSketch = false;

         if (sketchDragMode != 7 && this.stretchIndex !== undefined)
            return;

         if (isk() && sk().isMouseOver) {
            x = sk().unadjustX(x);
            y = sk().unadjustY(y);
            if (sk().sketchProgress == 1) {
               this.isFocusOnGlyphSketch = ! (sk() instanceof FreehandSketch);
               sk().isPressed = true;
               sk().isClick = true;
               sk().travel = 0;
               sk().xDown = x;
               sk().yDown = y;
               sk().x = x;
               sk().y = y;
            }
            if (outPort == -1 || sk() instanceof NumericSketch) {
               m.save();
               computeStandardViewInverse();
               if (! sk().sketchTextsMouseDown(x, y)) {
                  sk().mouseDown(x, y, z);
                  this.skCallback(isSketchCmdMode ? 'onCmdPress' : 'onPress', x, y, z);
               }
               m.restore();
            }
         }

         // START TO DRAW A NEW FREEHAND SKETCH.

         else {
            this.isStartingToDrawFreehandSketch = true;

            addSketch(new FreehandSketch());
            sk().sketchProgress = 1;
            sk().sketchState = 'finished';
            x = sk().unadjustX(x);
            y = sk().unadjustY(y);

            m.save();
            computeStandardViewInverse();
            sk().mouseDown(x, y, z);
            m.restore();
         }
      },

      // HANDLE MOUSE DRAG FOR THE SKETCH PAGE.

      mouseDrag : function(x, y, z) {

         var index, incr, w, h, dx, dy, n, a, b;

         if (imageLibrary_isShowingLibrary)
            return;

         if (overview_alpha > 0)
            return;

         if (window._is_after_updateF) {
            return;
         }

         if (! group.isCreating && group.mouseDrag(x, y))
            return;

         this.mx = x;
         this.my = y;

         w = width();
         h = height();

         if (this.setPageInfo !== undefined)
            return;

         dx = x - this.x;
         dy = y - this.y;
         this.travel += len(dx, dy);
         this.x = x;
         this.y = y;

         if (glyphChart.isDragging) {
            return;
         }

         if (this.linkAtMouseDown != null) {
            this.linkAtMouseDown.mouseDrag(x, y);
            return;
         }

         if (isSketchDragActionEnabled && this.travel > clickSize()) {
            if (this.needToStartSketchDragAction) {
               startSketchDragAction(this.xDown, this.yDown);
               this.needToStartSketchDragAction = false;
            }
            doSketchDragAction(x, y);
	    if (! isSketchCmdMode)
               return;
         }

         if (isBgActionEnabled) {
            if (this.travel > clickSize())
               bgActionDrag(x, y);
            return;
         }

         if (bgClickCount == 1 && ! isSketchCmdMode)
            return;

         if (! isTouchDevice && palette.colorId >= 0) {
            palette.dragXY = [x,y];
            if (! palette.isVisible) {
               index = palette.findColorIndex(x, y);
               if (index >= 0)
                  palette.colorId = index;
            }
            return;
         }

         if (outPort >= 0 && isDef(outSketch.defaultValue[outPort]) && ! this.click) {
            if (isNumeric(outSketch.defaultValue[outPort])) {
               if (this.portValueDragMode === undefined)
                  this.portValueDragMode = abs(x-this.xDown) > abs(y-this.yDown) ? "portValueDragX" : "portValueDragY";
               if (this.portValueDragMode == "portValueDragY") {
                  incr = floor((y-dy)/10) - floor(y/10);
                  outSketch.defaultValue[outPort] += incr * outSketch.defaultValueIncr[outPort];
               }
            }
            return;
         }

         if (isTextMode) {
            strokes[0].push([x, y]);
            return;
         }

         if (this.isFocusOnLink) {
            if (linkAtCursor != null)
               linkAtCursor.computeCurvature([x,y]);
            return;
         }

         if (this.isFocusOnArrow) {
            if (arrowNearCursor != null) {
               n = arrowNearCursor.n;
               a = arrowNearCursor.s;
               b = a.arrows[n][1];
               a.arrows[n][0] = computeCurvature([a.cx(),a.cy()], [x,y], [b.cx(),b.cy()]);
            }
            return;
         }

         if (sketchDragMode != 7 && this.stretchIndex !== undefined)
            return;

         // SEND DRAG EVENT TO THE SKETCH THAT HAS FOCUS, IF ANY.

         if (isk() && this.isFocusOnSketch) {
            x = sk().unadjustX(x);
            y = sk().unadjustY(y);
            if (sk().sketchProgress == 1) {
               sk().travel += len(x - sk().x, y - sk().y);
               if (sk().travel > clickSize())
                  sk().isClick = false;
               sk().x = x;
               sk().y = y;
            }
            if (outPort == -1 || sk() instanceof NumericSketch) {

               m.save();
               computeStandardViewInverse();
               if (! sk().sketchTextsMouseDrag(x, y)) {
                  sk().mouseDrag(x, y, z);
                  this.skCallback(isSketchCmdMode ? 'onCmdDrag' : 'onDrag', x, y, z);
               }
               m.restore();

            }
         }
      },

      // HANDLE MOUSE UP FOR THE SKETCH PAGE.

      mouseUp : function(x, y, z) {
         var glyph, name, dx, dy, i, j, s, n;

         this.isPressed = false;

         if (imageLibrary_isShowingLibrary) {
            imageLibrary_isShowingLibrary = false;
            return;
         }

         if (! group.isCreating && group.mouseUp(x, y)) {
            this.x = x;
            this.y = y;
            return;
         }

         if (overview_alpha > 0) {
            overview_click(x, y, z);
            return;
         }

         if (window._is_after_updateF) {
            window._is_after_updateF = undefined;
            return;
         }

         if (this.setPageInfo !== undefined) {
            setPage(this.setPageInfo.page);
            delete this.setPageInfo;
            return;
         }

         if (this.isClick && bgClickCount == 0 && isHover() && sk().isFreehandSketch() && sk().keys) {
            if (sk()._keysMotionPath && computeCurveLength(sk()._keysMotionPath) > clickSize())
               sk().keysMotionPath = sk()._keysMotionPath;
            else
               sk().keysStartTime = sk().keysStartTime ? 0 : time;
            return;
         }

         if (sketchDragMode != 7 && this.stretchIndex !== undefined) {
            delete this.stretchIndex;
            return;
         }

         if (this.linkAtMouseDown != null) {
            this.linkAtMouseDown.mouseUp(x, y);
            bgClickCount = 0;
            return;
         }

         if (this.portValueDragMode !== undefined) {
            if (this.portValueDragMode == "portValueDragX") {
               outSketch.defaultValue[outPort] *= x > this.xDown ? 0.1 : 10;
               outSketch.defaultValueIncr[outPort] *= x > this.xDown ? 0.1 : 10;
            }
            delete this.portValueDragMode;
            return;
         }

         if (isShowingGlyphs && ! glyphChart.isDragging) {
            isShowingGlyphs = false;
            return;
         }

         if (glyphChart.isDragging) {
            glyphs[glyphChart.iDragged].toFreehandSketch(This().mouseX, This().mouseY, 2.5 * height() / glyphChart.glyphsPerCol);
            glyphChart.isDragging = false;
            isShowingGlyphs = false;
            return;
         }

         if (isSketchDragActionEnabled && this.travel > clickSize()) {
            endSketchDragAction(x, y);
            bgClickCount = 0;
            isSketchDragActionEnabled = false;
         }

         if (palette.colorId >= 0) {

            // MOUSE-UP OVER PALETTE TO SET THE DRAWING COLOR.

            if (this.travel <= clickSize()) {
               palette.dragXY = null;
               this.colorId = palette.colorId;
            }

            // DRAG A COLOR SWATCH FROM THE PALETTE TO CHANGE COLOR OF A SKETCH.

            else {
               if (group.contains(x, y))
                  group.setColorId(palette.colorId);

               else if (isk() && sk().isMouseOver)
                  sk().setColorId(palette.colorId);

               palette.dragXY = null;
            }

            palette.isVisible = false;
            return;
         }

         // A COLOR GESTURE THAT DOES NOTHING LEAVES A DEGENERATE STROKE,

         if (palette.isVisible) {
            sk().delete();           // SO WE NEED TO DELETE THAT STROKE.
            palette.isVisible = false;
            return;
         }

         if (isBgActionEnabled) {
            bgActionUp(x, y);
            bgClickCount = 0;
            isBgActionEnabled = false;
            return;
         }

         if (this.travel > clickSize())
            this.isClick = false;

         // SPECIAL HANDLING FOR TEXT MODE.

         if (isTextMode) {

            // HANDLE CLICK IN TEXT MODE.

            if (this.isClick) {

               // CLICK ON STROKE SETS THE TEXT CURSOR.

               if (isHover())
                  sk().setTextCursor(sk().unadjustX(x), sk().unadjustY(y));

               // CLICK NOT ON STROKE TURNS OFF TEXT MODE.

               else
                  toggleTextMode();
            }

            else {

               glyph = findGlyph(strokes, glyphs);

               if (glyph != null && ! isCreatingGlyphData) {

                  // IF A NUMBER SKETCH WAS FOUND, TREAT IT AS A DIGIT CHARACTER.

                  name = glyph.name;
                  if (glyph.name.indexOf('number_sketch') >= 0)
                     name = name.replace(/[^0-9]/g,'');

                  this.handleDrawnTextChar(name);
               }
            }

            strokes = [];
            return;
         }

         if (this.isFocusOnLink && bgClickCount != 1) {

            // CLICK ON A LINK TO DELETE IT.

            if (this.isClick)
               linkAtCursor.remove();

            // DRAGGING A LINK TO A SKETCH THAT HAS AN OPEN CODE EDITOR WINDOW
            // CAUSES ALL INSTANCES OF THAT VARIABLE TO BE REPLACED BY ITS VALUE.

            else if (isCodeWidget && codeSketch.contains(x, y)) {
               j = linkAtCursor.j;
               codeTextArea.value = variableToValue(codeTextArea.value,
                                                    "xyz".substring(j, j+1),
                                                    roundedString(codeSketch.inValue[j]));
               linkAtCursor.remove();
            }

	    // DRAGGING A LINK TO A SKETCH CAUSES THE LINK TO BE SPLIT,
	    // AND THE SKETCH TO BE INSERTED BETWEEN THE TWO RESULTING LINKS.

            else if (isk() && sk().isMouseOver)
               linkAtCursor.split();

            return;
         }

         // CLICK ON AN ARROW TO DELETE IT.

         if (this.isClick && arrowNearCursor != null && bgClickCount != 1) {
            s = arrowNearCursor.s;
            n = arrowNearCursor.n;
            s.arrows[n][2] = 0.9;
            return;
         }

         // CLICKING ON A SKETCH.

         if (this.isClick && isHover()) {

            // CLICK ON A SKETCH WITH KEYS TO ANIMATE IT.

            if (bgClickCount == 0 && sk().isFreehandSketch() && sk().keys) {
               sk().keysStartTime = sk().keysStartTime ? 0 : time;
               return;
            }

            // CLICK ON A CODE SKETCH TO BRING UP ITS CODE.

            if (bgClickCount == 0 && sk().onClick === undefined && sk().code != null) {
               if (isCodeWidget && codeSketch != sk())
                  toggleCodeWidget();
               codeSketch = sk();
               toggleCodeWidget();
               return;
            }

            // CLICK ON A SKETCH AFTER CLICKING ON BACKGROUND TO DO A SKETCH ACTION.

            else if (doSketchClickAction(sk().unadjustX(x), sk().unadjustY(y)))
	       if (! isSketchCmdMode)
                  return;
         }

         // IF WE JUST CLICKED, THEN WE ARE NOT REALLY STARTING TO DRAW A SIMPLE SKETCH.

         if (this.isStartingToDrawFreehandSketch && this.isClick)
            this.isFocusOnSketch = false;

         // SEND UP EVENT TO THE SKETCH THAT HAS FOCUS, IF ANY.

         if (isk() && this.isFocusOnSketch) {

            x = sk().unadjustX(x);
            y = sk().unadjustY(y);

            if (sk().sketchProgress == 1)
               sk().isPressed = false;
            sk().isDrawingEnabled = true;

            if (outPort == -1 || sk() instanceof NumericSketch) {
               m.save();
               computeStandardViewInverse();
               if (! sk().sketchTextsMouseUp(x, y)) {
                  sk().mouseUp(x, y, z);
                  this.skCallback(isSketchCmdMode ? 'onCmdRelease' : 'onRelease', x, y, z);
               }
               m.restore();
            }

            if (! isSketchCmdMode && ! this.isClick && isk())
               if (! sk().suppressSwipe)
                  if (sk().doSwipe(pieMenuIndex(x - this.xDown, y - this.yDown, 8)))
                     return;
            sk().suppressSwipe = false;

	    isSketchCmdMode = false;

            if (this.isClick && isHover() && isDef(sk().onClick)) {
               m.save();
               computeStandardViewInverse();
               this.skCallback('onClick', x, y, 0);
               m.restore();
               return;
            }
         }

	 isSketchCmdMode = false;

         // DETECT A CLICK OVER BACKGROUND

         if (this.isClick && this.isMouseDownOverBackground) {
            deleteSketch(sk());
            bgClickCount++;
            bgClickX = x;
            bgClickY = y;
         }
      },

      // HANDLE MOUSE MOVE FOR THE SKETCH PAGE.

      mouseMove : function(x, y, z) {

         this.isMouseMoveWhileKeyPressed = this.keyPressed > 0;

         if (this.setPageInfo !== undefined) {
            if (len(x - this.setPageInfo.x, y - this.setPageInfo.y) > clickSize())
               delete this.setPageInfo;
         }

         this.x = x;
         this.y = y;

         if (isFakeMouseDown) {
            this.mouseDrag(x, y, z);
            return;
         }

         if (group.mouseMove(x, y))
            return;

         // IF IN SKETCH-ACTION MODE, MOVING MOUSE DOES THE SKETCH ACTION.

         if (sketchAction != null) {
            switch (sketchAction) {
            case 'nudging'     : nudgeCurve(sk().sp0, sk().m2s([x,y])); break;
            case 'translating' : this.doTranslate(x, y); break;
            case 'rotating'    : this.doRotate(x, y); break;
            case 'scaling'     : this.doScale(x, y); break;
            case 'undrawing'   : this.doUndraw(x, y); break;
            }

            this.mx = x;
            this.my = y;
            bgClickCount = 0;
            return;
         }

         // SPECIAL HANDLING OF MOUSE MOVE IF VARIOUS KEYS ARE PRESSED.

         switch (this.letterPressed) {
         case 'spc':
            break;
         case '0':
            break;
         case '2': case 'm':
            this.doTranslate(x, y);
            break;
         case '6': case 'r':
            this.doRotate(x, y);
            break;
         case '4': case 's':
            this.isManualScaling = true;
            this.doScale(x, y);
            break;

         // HANDLING FOR MOUSE MOVE IF NO KEY IS PRESSED.

         default:

            // IF CURRENT SKETCH IS FINISHED, SEND EVENT TO THE SKETCH.

            if (isk() && sk().sketchState == 'finished') {
               findOutSketchAndPort();

               m.save();
               computeStandardViewInverse();
               let _x = sk().unadjustX(x);
               let _y = sk().unadjustY(y);
               sk().mouseMove(_x, _y, z);
               this.skCallback('onMove', _x, _y, z);

               if (sk().onEnter !== undefined || sk().onExit !== undefined) {
		  var xy = sk().inverseTransform([_x, _y, z]);
                  if (sk()._previous_xy) {
                     function isWithinSketch(xy) {
                        return xy[0] >= -1 && xy[0] < 1 && xy[1] >= -1 && xy[1] < 1;
                     }
                     var wasWithin = isWithinSketch(sk()._previous_xy);
                     var isWithin  = isWithinSketch(xy);

                     if (sk().onEnter && ! wasWithin && isWithin)
                        sk().onEnter();
                     if (sk().onExit && wasWithin && ! isWithin)
                        sk().onExit();
                  }
                  sk()._previous_xy = xy;
               }

               m.restore();
            }
            break;
         }

         this.mx = x;
         this.my = y;
         this.mz = z;

         // WHEN MOUSE MOVES OVER THE COLOR PALETTE, SET THE PALETTE COLOR.

         if (! isTouchDevice)
            palette.colorId = palette.findColorIndex(x, y);
      },

      keyDown : function(key) {

         // Ignore multiple presses of the same key

         if (key == this.keyPressed) {
            return;
         }
         this.keyPressed = key;

         // Catch ALT-CMD-key escape, because it won't trigger
         // any keyUp to reset letterPressed to '\0'.

         if (key == 18) {
            this.altCmdState |= 1;
         }
         else if (key == 91) {
            this.altCmdState |= 2;
         }
         else if (this.altCmdState == 3) {
            this.altCmdState = 0;
            this.letterPressed = '\0';
            return;
         }

         var letter = charCodeToString(key, isShiftPressed, isControlPressed);
         this.letterPressed = letter;
         this.letterPressedTime = time;

         if (outPort >= 0 && isDef(outSketch.defaultValue[outPort])) {
            isTextMode = true;
            this.isPortValueTextMode = true;
         }

         if (isTextMode) {
            switch (letter) {
            case 'alt':
               isAltPressed = true;
               break;
            case 'command':
               isCommandPressed = true;
               break;
            case 'control':
               isControlPressed = true;
               break;
            case 'cap':
               isShiftPressed = true;
               break;
            }
            return;
         }

         if (isShowingGlyphs && key >= 48 && key <= 48 + 9) {
            glyphChart.setStrokeCountBit(key - 48, true);
            return;
         }

         switch (letter) {
         case '3': case 'alt':
            isAltPressed = true;
            return;
         case 'command':
            isCommandPressed = true;
            return;
         case 'control':
            isControlPressed = true;
            return;
         case 'ret':
	    events_canvas.onmousedown({ clientX: _g.lastX, clientY: _g.lastY });
	    break;
         case 'cap':
            isShiftPressed = true;
            return;
         case '\\':
         case 'p':
            isPanning = true;
            break;
         case '2': case 'm':
         case '4': case 's':
            if (this.isGroupAction = group.contains(mouseMoveEvent.clientX, mouseMoveEvent.clientY)) {
               group.x = mouseMoveEvent.clientX;
               group.y = mouseMoveEvent.clientY;
            }
            break;
         default:
            if (isk())
              sk().keyDown(letter);
            break;
         }
      },

      hideScript : function() {
         if (codeSketch != null && codeSketch.isShowingScript) {
            var save_index = this.index;
            this.index = this.findIndex(codeSketch);
            this.toggleShowScript();
            this.index = save_index;
         }
      },

      previousImage : function() {
         if (this.imageLibrary_index >= 0) {
            imageLibrary_isShowingImage = true;
            this.imageLibrary_index = (imageLibrary_images.length + this.imageLibrary_index - 1) % imageLibrary_images.length;
            this.imageLibrary_alpha = 1;
         }
      },

      nextImage : function() {
         if (this.imageLibrary_index >= 0) {
            imageLibrary_isShowingImage = true;
            this.imageLibrary_index = (this.imageLibrary_index + 1) % imageLibrary_images.length;
            this.imageLibrary_alpha = 1;
         }
      },

      keyUp : function(key) {
         var letter, r, theta, dx, dy, i, val, handle, sketches;
         var sketch, prop, type, name, strokes, m, x0, y0, xlo, index;
         
         // Part of logic to account for multiple presses of the same key.

         this.keyPressed = -1;

         // Convert key to the proper letter encoding.

         this.letterPressed = '\0';

         letter = charCodeToString(key, isShiftPressed, isControlPressed);

         if (isCommandPressed && key == 91) {
            isCommandPressed = false;
            return;
         }

         if (isShowingGlyphs && key >= 48 && key <= 48 + 9) {
            glyphChart.setStrokeCountBit(key - 48, false);
            return;
         }

         // USE DIGIT KEY TO SIMULATE SWIPE.

         if (! isTextMode && isk() && isHover() && key >= 48 && key < 48 + 8) {
            if (sk().doSwipe(key - 48)) {
               return;
            }
         }

         // HIT ` KEY WHEN MOUSE IS OVER A TEXT SKETCH TO EVAL THAT TEXT.

         if (letter == '`' && isHover()) {
            sk().evalCode(sk().text);
            return;
         }

         // Special handling for when in text mode.

         if (isTextMode) {
            switch (letter) {
            case 'alt':
            case 'command':
            case 'control':
               break;
            default:
               if (this.isMouseMoveWhileKeyPressed)
                  return;

               if (this.isPortValueTextMode !== undefined) {
                  val = "" + outSketch.defaultValue[outPort];
                  if (letter == 'del') {
                     if (val.length > 0) {
                        val = val.substring(0, val.length-1);
                        if (isNumeric(val))
                           val = parseFloat(val);
                     }
                  }
                  else if (isNumeric(val) && isNumeric(letter))
                     val = parseFloat(val) + parseFloat(letter);
                  else
                     val += letter;
                  outSketch.defaultValue[outPort] = isNumeric(val) ? val : val.length == 0 ? 0 : val;
               }
               else {
                  this.handleTextChar(letter);
               }
               return;
            }
         }

         switch (letter) {
	 case 'spc': // Space bar toggles tool tips.
            isShowingHelp = !isShowingHelp;
	    break;
         case '!':
            this.clear();
            break;
         case '#':
            this.isGraphPaper = ! this.isGraphPaper;
            break;
         case 'smaller':
            _font_scale_factor /= 1.1;
            break;
         case 'larger':
            _font_scale_factor *= 1.1;
            break;
         case 'P':
         case PAGE_UP:
         case PAGE_DN:
            handle = window[_g.canvas.id];
            if (isWand) {
               if (window._wandPixel === undefined)
                  _wandPixel = newVec3();
               sk().pointToPixel(_wandPixel.set(wand.x, wand.y, wand.z));
               mouseMoveEvent.clientX = _wandPixel.x;
               mouseMoveEvent.clientY = _wandPixel.y;
               mouseMoveEvent.clientZ = _wandPixel.z;
            }
            if (! isFakeMouseDown) {
               handle.mouseX = mouseMoveEvent.clientX;
               handle.mouseY = mouseMoveEvent.clientY;
               handle.mouseZ = mouseMoveEvent.clientZ;

               handle.mousePressedAtX = handle.mouseX;
               handle.mousePressedAtY = handle.mouseY;
               handle.mousePressedAtZ = handle.mouseZ;

               handle.mousePressedAtTime = time;
               handle.mousePressed = true;
               if (isDef(handle.mouseDown))
                  handle.mouseDown(handle.mouseX, handle.mouseY, handle.mouseZ);
            }
            else {
               if (sketchAction != null)
                  sketchActionEnd();
               else {
                  handle.mouseX = mouseMoveEvent.clientX;
                  handle.mouseY = mouseMoveEvent.clientY;
                  handle.mouseZ = mouseMoveEvent.clientZ;

                  handle.mousePressed = false;
                  if (isDef(handle.mouseUp))
                     handle.mouseUp(handle.mouseX, handle.mouseY, handle.mouseZ);
               }
            }
            isFakeMouseDown = ! isFakeMouseDown;
            break;
         case L_ARROW:
            this.previousImage();
            break;
         case U_ARROW:
            setPage(pageIndex - 1);
            break;
         case R_ARROW:
            this.nextImage();
            break;
         case D_ARROW:
            setPage(pageIndex + 1);
            break;
         case 'esc':
            if (isCodeWidget)
               toggleCodeWidget();
            break;
         case '0': case 'del':
            if (isk())
               if (isShiftPressed)
                  sk().removeLastStroke();
               else {
                  sketchActionEnd();
                  sk().fade();
                  fadeArrowsIntoSketch(sk());
                  setTextMode(false);
               }
               else
                  setTextMode(false);
            break;
         case '3': case 'alt':
            if (isAltKeyCopySketchEnabled) {
               copySketch(sk());
               sketchAction = 'translating';
            }
            isAltPressed = false;
            break;
         case 'command':
            isCommandPressed = false;
            break;
         case 'control':
            isControlPressed = false;
            break;
         case 'cap':
            isShiftPressed = false;
            break;
         case '=':
         case '+':
            isShowingGlyphs = ! isShowingGlyphs;
            break;
         case '?':
            isShowingNLParse = ! isShowingNLParse;
            break;
         case 'C':
            isCasualFont = ! isCasualFont;
            break;
         case 'F':
/*
            isFog = ! isFog;
            backgroundColor = isFog ? 'rgb(24,43,62)' : isWhiteBackground() ? whiteBackgroundColor
	                                                                    : blackBackgroundColor;
            background.style.backgroundColor = backgroundColor;
*/
            isFog = ! isFog;
            setFog(isFog ? [24/255, 43/255, 62/255] : []);
            break;
         case 'H':
            this.toggleHMDTracking();
            break;
         case 'M':
            if (isk() && sk()._model) {
                var child = sk()._model._children[0];
                if (child) {
                   var typeName = sk().typeName;
                   typeName = typeName.substring(0, typeName.indexOf('_'));
                   server.writeFile('assets/models/' + typeName + '.obj', child.toObj(typeName));
                }
            }
            break;
         case 'O':
            this.isCTObject = ! this.isCTObject;
            break;
         case '/':
         case 'R':
            this.isCTRotate = 1 - this.isCTRotate;
            break;
         case 'S':
            this.toggleStereo();
            break;
         case 'T':
            addSketch(new cube_sketch());
            finishSketch();
            break;
         case 'h':
	    this.toggleShowScript();
            break;
         case 'i':
            toggleTextMode();
            break;
         case 'j':
            if (isk() && sk() instanceof FreehandSketch)
               sk().joinNextStroke = true;
            break;
         case 'J':
            server.set("state/sketchpage", this.sketches);
            break;
         case 'l':
	    isShowingLinks = ! isShowingLinks;
	    break;
         case 'ret':
	    events_canvas.onmouseup({ clientX: _g.lastX, clientY: _g.lastY });
	    break;
         case '\'':
	    events_canvas.onmousedown({ clientX: _g.lastX, clientY: _g.lastY });
	    events_canvas.onmouseup  ({ clientX: _g.lastX, clientY: _g.lastY });
	    break;
         case 'n':
            isSpeakerNotes = ! isSpeakerNotes;
            break;
         case 'A':
            break;
         case 'o':
            isCreatingGlyphData = ! isCreatingGlyphData;
            break;
         case '\\':
         case 'p':
            isPanning = false;
            break;
         case 'q':
            _g.query = 0;
            break;
	 case '2': case 'm':
	 case '6': case 'r':
            break;
         case '4': case 's':
            sketchActionEnd();
            this.isManualScaling = false;
            break;
         case 't':
            isShowingTime = ! isShowingTime;
            break;
         case 'w':
            imageLibrary_isShowingImage = ! imageLibrary_isShowingImage;
            break;
         case 'W':
            if (this.wandEmulation === undefined)
               this.wandEmulation = newVec3();
            else
               this.wandEmulation = undefined;
            break;
         case '-':
            this.toggleColorScheme();
            break;
         case '^':
            if (videoLayer !== null)
               videoLayer.Scale_X = 3.1 - videoLayer.Scale_X;
            break;
         case 'c':
	    isShowingCameraData = ! isShowingCameraData;
	    break;
         case 'f':
	    this.setFuzzyLines(! this.isFuzzyLines());
	    break;
         case 'u':
            if (videoLayer == null)
               initVideoLayer();
            videoLayer.toggleSize();
	    this.setFuzzyLines(true);
	    isLightTracking = true;
            break;
         case 'U':
	    isLightTracking = ! isLightTracking;
            break;
         case 'v':
            if (videoLayer == null)
               initVideoLayer();
            else
               videoLayer.toggle();
            break;
         case 'V':
            videoLayer.toggleControls();
            break;
         case 'y':
            window.open('http://mrl.nyu.edu/~perlin/video_links.html');
            break;
         default:
            if (isk())
               sk().keyUp(letter);
            break;
         }
      },

//////////////////////////////////////////////////////////////


      remove : function(s) {
         for (var i = 0 ; i < this.sketches.length ; i++)
            if (this.sketches[i] == s) {
               this.sketches.splice(i, 1);
               break;
            }
      },

      bringToFront : function(s) {
         this.remove(s);
         this.sketches.push(s);
      },

      clear : function() {
         this.fadeAway = 1;
      },

      doFadeAway : function(elapsed) {
         this.fadeAway = max(0.0, this.fadeAway - elapsed / 0.25);
         _g.globalAlpha = this.fadeAway;
         if (this.fadeAway == 0.0) {
            this.clearAfterFadeAway();
            _g.sketchProgress = 1;
            _g.suppressSketching = 0;
            _g.globalAlpha = 1.0;
         }
      },

      beginTextSketch : function() {
         // Simulate hitting the "i" key to enter text insertion mode
         this.keyDown(64 + 9);
         this.keyUp(64 + 9);
         return sk();
      },

      addTextToTextSketch : function(text) {
         for (var i = 0 ; i < text.length ; i++) {
            var charCode = text.charCodeAt(i);
            this.keyDown(charCode);
            this.keyUp(charCode);
         }
         return sk();
      },

      createTextSketch : function(text) {
         this.beginTextSketch();
         this.addTextToTextSketch(text);
         setTextMode(false);
         return sk();
      },

      createLink : function() {

         // AVOID CREATING DUPLICATE LINKS.

         if (inPort >= inSketch.in.length || inSketch.in[inPort] === undefined
                                          || inSketch.in[inPort].a != outSketch
                                          || inSketch.in[inPort].i != outPort )

            new SketchLink(outSketch, outPort, inSketch, inPort);
      },

      clearAfterFadeAway : function() {
         if (isCodeWidget)
            toggleCodeWidget();

         this.colorId = 0;
         this.index = -1;
         while (this.sketches.length > 0)
            deleteSketch(this.sketches[0]);
         isShowingNLParse = false;

         if (renderer != null && isDef(renderer.scene)) {
            var root = renderer.scene.root;
            if (isDef(root))
               for (var i = root.children.length ; i > 0 ; i--)
                  root.remove(i);
         }
      },

      findIndex : function(sketch) {
         for (var i = 0 ; i < this.sketches.length ; i++)
            if (this.sketches[i] == sketch)
               return i;
         return -1;
      },

      add : function(sketch) {
         this.sketches.push(sketch);
         this.index = this.sketches.length - 1;
         sketch.index = this.index;
      },

      getSketchesByLabel : function(label) {
         var sketches = [];
         for (var i = 0 ; i < this.sketches.length ; i++)
            if (label == this.sketches[i].labels[this.sketches[i].selection])
                  sketches.push(this.sketches[i]);
         return sketches;
      },

      skCallback : function(actionName, x, y, z) {
         if (isk() && sk()[actionName] !== undefined) {
            sk().computeCursorPoint(x, y, z);
            var action = sk()[actionName];
            sk()._action_function = typeof action == 'function' ? action : action[1];
            sk()._action_function(sk()._cursorPoint);
         }
      },

      handleDrawnTextChar : function(textChar) {
         if (textChar.length > 0 && textChar.indexOf('(') > 0) {
            if (textChar == 'kbd()')
               kbd();
            return;
         }

         switch (textChar) {
         case 'cap':
            isShiftPressed = ! isShiftPressed;
            break;
         case null:
            break;
         default:
            this.handleTextChar(shift(textChar));
            break;
         }
      },

      // ROTATE CURRENT SKETCH.

      doRotate : function(x, y) {
         if (isk()) {
            sk().rX += 2 * (x - this.mx) /  width();
            sk().rY += 2 * (y - this.my) / -height();
         }
      },

      // SCALE CURRENT SKETCH.

      doScale : function(x, y) {
         if (this.isGroupAction) {
            group.scale(x - group.x, y - group.y);
            group.x = x;
            group.y = y;
         }
         else if (isk())
            sk().scale(pow(16, (y - this.my) / -height()));
      },

      // TRANSLATE CURRENT SKETCH.

      doTranslate : function(x, y) {
         if (this.isGroupAction) {
            group.translate(x - group.x, y - group.y);
            group.x = x;
            group.y = y;
         }
         else if (isk()) {
            sk().translate(sk().unadjustD(x - this.mx), sk().unadjustD(y - this.my));
            if (isSketchInProgress()) {
               cursorX += x - this.mx;
               cursorY += y - this.my;
               sk().sp[0] = [sk().xStart = cursorX, sk().yStart = cursorY, 0];
            }
            var sketches = sk().intersectingSketches();
            for (var i = 0 ; i < sketches.length ; i++) {
               if (isDef(sk().onIntersect))
                  sk().onIntersect(sketches[i]);
               if (isDef(sketches[i].onIntersect))
                  sketches[i].onIntersect(sk());
            }
         }
      },

      // TEMPORARILY UNDRAW CURRENT SKETCH.

      doUndraw : function(x, y) {
         if (isk() && sk() instanceof FreehandSketch) {
            this.tUndraw = max(0, min(1, (x - this.xDown) / 200));
         }
      },

      // ZOOM THE SKETCH PAGE

      doZoom : function(x, y) {
         this.zoom *= 1 - (y - this.my) / height();
      },

      handleTextSketchChar : function(letter) {
         if (currentTextSketch) {
            var SAVED_index = sketchPage.index;
            sketchPage.index = sketchPage.findIndex(currentTextSketch);
            sketchPage.handleTextChar(letter);
            sketchPage.index = SAVED_index;
         }
      },

      handleTextChar : function(letter) {

         if (window.suppressNextTextChar) {
            window.suppressNextTextChar = false;
	    return;
	 }

         if (isk() && sk().isFreehandSketch())
            currentTextSketch = sk();

         switch (letter) {
         case 'control': if (isk()) sk().insertText(CONTROL); break;
         case 'alt'    : if (isk()) sk().insertText(ALT    ); break;
         case 'command': if (isk()) sk().insertText(COMMAND); break;
         case L_ARROW:
            if (isk()) sk().moveCursor(-1);
            break;
         case R_ARROW:
            if (isk()) sk().moveCursor(+1);
            break;
         case U_ARROW:
            if (isk()) sk().moveLine(-1);
            break;
         case D_ARROW:
            if (isk()) sk().moveLine(+1);
            break;
         case 'command':
            isCommandPressed = false;
            break;
         case 'control':
            isControlPressed = false;
            break;
         case 'shift':
            isShiftPressed = ! isShiftPressed;
            break;
         case 'cap':
            isShiftPressed = false;
            break;
         case 'esc':
            setTextMode(false);
            break;
         case '\b':
         case 'del':
            if (isk())
               sk().deleteChar();
            break;
         default:
            switch (letter) {
            case 'spc':
               letter = ' ';
               break;
            case 'ret':
               letter = '\n';
               break;
            }
            if (isk())
               sk().insertText(letter);
         break;
         }
      },

      toggleStereo : function() {
         ctScene.setStereo(! ctScene.getStereo());
      },

      toggleHMDTracking : function() {
         this.isHMDTracking = this.HMDTracking ? false : true;
         server.broadcast("toggleHMDTracking");
      },
      toggleShowScript : function() {
         if (isk() && isDef(sk().typeName)) {
            if (! isDef(sk().isShowingScript)) {
               sk().isShowingScript = true;
               codeSketch = sk();
            }
            toggleCodeWidget();
            return true;
         }
         return false;
      },

      isFuzzyLines : function() {
         return def(this._isFuzzyLines, false);
      },

      setFuzzyLines : function(state) {
         if (def(this._isFuzzyLines, false) != state) {
            this._isFuzzyLines = state;
	    initCTPath();
	    sketchPadding = this._isFuzzyLines ? 30 : 10;
         }
      },

      toggleColorScheme : function() {
         if (isWhiteBackground()) {
            backgroundColor = blackBackgroundColor;
            defaultPenColor = 'white';
            palette.rgb[0][0] =
            palette.rgb[0][1] =
            palette.rgb[0][2] = 255;
         }
         else {
            backgroundColor = whiteBackgroundColor;
            defaultPenColor = 'black';
            palette.rgb[0][0] =
            palette.rgb[0][1] =
            palette.rgb[0][2] = 0;
         }
         bodyElement.style.color = defaultPenColor;

         document.getElementsByTagName('body')[0].style.backgroundColor = backgroundColor;

         background.color = backgroundColor;
         background.style.backgroundColor = backgroundColor;
         palette.color[0] = defaultPenColor;
         for (var i = 0 ; i < this.sketches.length ; i++)
            if (this.sketches[i].colorId == 0)
               this.sketches[i].setColorId(0);

         if (codeTextArea != null) {
            codeTextArea.style.backgroundColor = codeTextBgColor();
            codeTextArea.style.color = codeTextFgColor();
         }

         if (codeSelector != null) {
            codeSelector.style.backgroundColor = codeSelectorBgColor();
            codeSelector.style.color = codeSelectorFgColor();
         }
      },

      scaleSelectedSketch : function() {
         if (isk() && ! this.isManualScaling) {
            if (sketchAction == "scaling") {
               if (this.scaleRate < 1)
                  this.scaleRate = mix(this.scaleRate, 1, .1);
            }
            else if (this.scaleRate > 0) {
               if ((this.scaleRate = mix(this.scaleRate, 0)) < .01, .1)
                  this.scaleRate = 0;
            }
            if (this.scaleRate > 0) {
               var dy = this.yDown - this.moveY;
               sk().scale(pow(dy > 0 ? 1.015 : 1/1.015, this.scaleRate * abs(dy) / 100));
            }
         }
      },

      setViewMatrix : function(m) {
         if (! this.cameraDistanceMatrix)
            this.cameraDistanceMatrix = CT.matrixTranslated(0, 0, ctScene.getFL());
         ctScene.setViewMatrix( CT.matrixMultiply(m, this.cameraDistanceMatrix) );
      },

      animate : function(elapsed) {

         if (this.isHMDTracking && server.headBuffer) {
            var p = server.headBuffer.position,
                q = server.headBuffer.rotation;
            this.setViewMatrix(pq2m([ p.x, p.y, p.z,  q.x, q.y, q.z, q.w ]));
         }
         else {
            var fl = ctScene.getFL();
            ctScene.setViewMatrix( CT.translate(CT.rotateY(CT.matrixTranslated(0,0,-fl), this.isCTRotate * time), 0,0,fl) );
         }

         if (! this.isCTObject) {
            if (this.ctObject) {
               ctScene.remove(this.ctObject);
               delete this.ctObject;
            }
         }
         else {
            if (! this.ctObject) {
               this.ctObject = new CT.Node();
               ctScene.add(this.ctObject);
               this.ctObject.add(new CT.Cube());
               this.ctObject.add(new CT.Cylinder(8));
               this.ctObject.add(new CT.Extruded(16,100,
                  function(u,v){ v=.15+.06*cos(3*TAU*v); u*=TAU; return [v*cos(u),v*sin(u)] },          // PROFILE
                  function(v){v*=2*TAU;var r=1+cos(1.5*v)/5;return[sin(1.5*v)/2,r*cos(v),r*sin(v)];})); // PATH
               this.ctObject.add(new CT.Parametric(20,20,function(u,v){return[2*u-1,2*v-1,.5*noise(3*u,3*v,.5)];}));
               var spline = makeSpline([[.001,-1],[.5,-1],[.45,-.95],[.15,-.9],[.09,-.85],[.05,-.6],[.1,0],
                                        [.2,.1],[.4,.2],[.6,.5],[.5,.98],[.48,1],[.46,.98],[.55,.5],[.35,.3],[.001,.2]]);
               this.ctObject.add(new CT.Revolved(16, 64, function(t){return sample(spline,t);}));
               this.ctObject.add(new CT.Sphere(16, 8));
               this.ctObject.add(new CT.Square());
               this.ctObject.add(new CT.Torus(32, 16, .6));
               for (var i = 0 ; i < this.ctObject.nChildren() ; i++) {
                  var C = palette.rgb[i];
                  this.ctObject.getChild(i).setColor(C[0]/255, C[1]/255, C[2]/255);
               }
               this.ctObject.getChild(0).setTexture('images/xy.png');

               this.ctObject.getChild(1).setFragmentShader(
                  ['precision highp float;'
                  ,'varying vec3 vNormal;'
		  ,'varying float vClipX;'
                  ,'void main() { vec3 n = normalize(vNormal);'
		  ,'   gl_FragColor = vec4(n*n,1.);'
		  ,'   if (vClipX < 0.) discard;'
		  ,'}'
                  ].join('\n')
               );

               this.ctObject.getChild(4).setMetal(1, .4, .1);
               this.ctObject.getChild(5).setColor(1, 1, 1).setTexture('images/brick.png');
               this.ctObject.getChild(6).setNormalMap('images/normal_map_1.png');
               this.ctObject.getChild(7).setPhong([.1,.04,.01, 1,.4,.1, .2,.2,.2,5])
                                   .setTexture('images/This_is_not_a_bagel.jpg')
                                   .setNormalMap('images/normal_map_2.jpg');

               var knot = this.ctObject.getChild(2);
	       var knotShape = knot.getShape();
	       for (let i = 0 ; i < knotShape.nVertices() ; i++) {
	          let t = .5 + .5 * sin(20 * TAU * i / knotShape.nVertices());
		  knot.setVertexColor(i, t, t, t);
	       }
            }

            CT.time = time;
            var t = time;
            this.ctObject.identity().translate(0,0,-ctScene.getFL()).scale(.08);
            for (var i = 0 ; i < this.ctObject.nChildren() ; i++)
               this.ctObject.getChild(i).identity().translate(6*(i%4)-10, i<4?2:-2, 0).rotateY(t).rotateX(t/2);
            this.ctObject.getChild(0).identity().translate(0, 5 * sin(3 * t), 0).rotateY(t);
            this.ctObject.getChild(4).scale(1.3);

            this.ctObject.draw();
         }

         var w = width();
         var h = height();
         var sketch, PUSHED_sketchPage_index;

         if (nsk() == 0)
            outPort = -1;

         if (this.fadeAway > 0)
            this.doFadeAway(elapsed);

         isDrawingSketch = true;

         // WHILE BEING DRAWN, EACH SKETCH TEMPORARILY BECOMES, IN TURN, THE CURRENT SKETCH.
         // WE CAN LOOK AT sketchPage.trueIndex TO FIND OUT WHAT THE REAL CURRENT SKETCH IS.

         this.trueIndex = this.index;
         var skTrue = sk();

         if (this.isGraphPaper) {
            annotateStart();

// GRAPH PAPER

            var r = w / 32;
            color(defaultPenColor);
            lineWidth(isWhiteBackground() ? 0.1 : 0.15);
            var x0 = r * floor(-_g.panX / r);
            var y0 = r * floor(-_g.panY / r);
            var x1 = x0 + w + r;
            var y1 = y0 + h + r;
            for (var x = x0 ; x < x1 ; x += r)
               line(x, y0, x, y1);
            for (var y = y0 ; y < y1 ; y += r)
               line(x0, y, x1, y);

            annotateEnd();
         }

         if (xmlWriteEnabled)
            xmlWriteStartFrame();

         imageLibrary_update();

// DRAW ALL THE SKETCHES.

         for (var I = 0 ; I < nsk() ; I++) {

            // WHILE RENDERING IT, TEMPORARILY MAKE THIS SKETCH THE SELECTED SKETCH.

            PUSHED_sketchPage_index = this.index;
            this.index = I;
            sketch = sk();

            // DELETE ANY LEFT-OVER EMPTY TEXT SKETCHES.

            if (! isHover() && ! isTextMode
                            && sk() instanceof FreehandSketch
                            && sk().text.length == 0
                            && sk().sp.length <= 1 ) {
               deleteSketch(sk());
               this.index = PUSHED_sketchPage_index;
               continue;
            }

            _g.inSketch = true;

            sketch.updateSelectionWeights(elapsed);

            color(sketch.color);

            lineWidth(sketchLineWidth * mix(1, .6, sketch.styleTransition)
                                      * this.zoom / sketch.zoom);

            _g.save();

            // FADE UP THIS SKETCH AS NEEDED.

            sketch.fadeUp = min(1, sketch.fadeUp + elapsed / 0.25);

            // FADE AWAY THIS SKETCH BEFORE DELETING IT.

            if (sketch.fadeAway > 0) {
               sketch.fadeAway = max(0, sketch.fadeAway - elapsed / 0.25);
               if (sketch.fadeAway == 0) {
                  deleteSketch(sketch);
                  _g.restore();
                  _g.globalAlpha = 1;
                  bgClickCount = 0;
                  I--;
                  continue;
               }
               _g.globalAlpha = sketch.fadeAlpha();
            }
            if (sketch.sketchTrace != null && sketch.sketchState != 'finished')
               sketch.trace = [];

            m.save();
               computeStandardView();
               sketch.renderWrapper(elapsed);
            m.restore();

            if (sketch.sketchTrace != null && sketch.sketchState != 'finished') {
               sketch.morphToGlyphSketch();

               var rate = sketch.glyphTransition < 0.5 ? 1 : 1.5;
               sketch.glyphTransition = min(1, sketch.glyphTransition + rate * elapsed);

               if (sketch.glyphTransition >= 1) {
                  finishDrawingUnfinishedSketch(sketch);
                  sketch.sketchTrace = null;
               }
            }

            _g.restore();
            _g.globalAlpha = 1;

            _g.inSketch = false;

            this.index = PUSHED_sketchPage_index;

            if (sk(I) == sk())
               sk(I).drawStretchValues();
         }

         if (xmlWriteEnabled)
            xmlWriteEndFrame();

         isDrawingSketch = false;

         // DRAW THE POP-UP PALETTE, IF ANY.

         if (! isShowingHelp && this.isShowingPalette()) {
            isScreenView = true;
            palette.draw();
            isScreenView = false;
         }

         // DRAW THE DRAGGED PALETTE COLOR, IF ANY.

         if (palette.dragXY != null) {
            color(palette.color[palette.colorId]);
            fillOval(palette.dragXY[0] - 12,
                     palette.dragXY[1] - 12, 24, 24);
         }

         // IF SHOWING TOOL TIPS, SHOW HINT AFTER CLICK ON BACKGROUND

         if (isShowingHelp && bgClickCount == 1) {
            function bigDot(x,y) { line(x - 1, y - 1, x, y); }
            annotateStart();
            color(overlayColor);
            var d = 20;
            lineWidth(d);
            bigDot(bgClickX, bgClickY);
            if (isHover()) {
               _g.font = d + 'pt Arial';
               var dir = pieMenuIndex(bgClickX - This().mouseX, bgClickY - This().mouseY, 8);
               _g_text(sketchClickActionName(dir, sk()), [bgClickX + d, bgClickY + d/2]);
            }
            annotateEnd();
         }

         if (isTextMode) {
            this.drawTextStrokes();
         }
         // if tips toggled on, display,
         // (Entry into text mode resets tool tip hint state to "off",
         // this is somewhat inconsistent, but otherwise the entire screen
         // goes blue for some reason. The toggle-off behavior might make sense
         // though, as text mode is its own separate mode. You can re-toggle
         // tool tips after typing for a bit. Maybe someone can figure why
         // the entire screen goes blue when you disable the line in g.js,
         // "isShowingHelp = isShowingHelp && !isTextMode;" and
         // enter text mode while in tip mode)
         // NOTE: holding space still causes the cursor to flicker
         else if (isShowingHelp && !palette.isVisible) {
            Tooltips.draw();
         }
         else {
            // original set-up made "space" and "," cases mutually exclusive,
            // update if necessary 
            switch (this.letterPressed) {
            case ',':
               if (time - this.letterPressedTime > 0.5) {
                  imageLibrary_isShowingLibrary = true;
               }
               break;
            }
         } 


         // RENDER THE THREE.JS SCENE.

         renderer.render(renderer.scene, renderer.camera);

         // DRAW THE SPEECH BUBBLE FOR THE CODE WIDGET.

         if (isCodeWidget) {
            drawCodeWidget(isCodeScript() ? codeScript() : code(),
                           codeSketch.xlo, codeSketch.ylo,
                           codeSketch.xhi, codeSketch.yhi,
                           codeElement.codeSketch != codeSketch);
            codeElement.codeSketch = codeSketch;
         }
      },
      isShowingPalette : function() {
         if (imageLibrary_isShowingLibrary)
            return false;
         if (palette.isVisible)
            return true;

         return false;
      },
      overlay : function() {

         isScreenView = true;

         var w = width(), h = height();
         var dx = -_g.panX;
         var dy = -_g.panY;

         // SHOW THE GLYPH DICTIONARY

         if (isShowingGlyphs) {
            glyphChart.draw();
         }

         annotateStart();

         // IF NOT IN TEXT INSERTION MODE, SHOW THE AVAILABLE KEYBOARD SHORTCUTS.

         if (! isShowingGlyphs && ! isTextMode) {
            color(overlayColor);
            lineWidth(1);
	    let sc = 26, font = '17pt Arial';
            let y0 = 10 - _g.panY;
            for (let j = 0 ; j < hotKeyMenu.length ; j++) {
               let y = y0 + j * sc*14/18;
               utext(hotKeyMenu[j][0], dx + sc* 8/18, y, 0, 0, font);
               utext(hotKeyMenu[j][1], dx + sc*48/18, y, 0, 0, font);
            }
         }

         // DRAW THE COLOR PALETTE

         if (this.isShowingPalette())
            palette.draw();

         color(overlayColor);

         isScreenView = true;

         // LIGHTLY OUTLINE ALL SKETCHES

         _g.save();
         lineWidth(.5);
         for (var i = 0 ; i < nsk() ; i++)
            sk(i).drawBounds();
         _g.restore();

         // REMIND THE PRESENTER IF CARRYING OUT A SKETCH ACTION.

         if (sketchAction != null) {
            _g.font = 'bold 60pt Calibri';
            color('rgba(0,32,128,.15)');
            _g_text(sketchAction, [(w - textWidth(sketchAction)) / 2, 80]);
         }

         // REMIND THE PRESENTER WHEN INTERFACE IS IN TEXT INSERTION MODE.

         if (isCreatingGlyphData) {
            color(overlayColor);
            _g.font = 'bold 20pt Calibri';
            var str = "outputting glyphs";
            _g_text(str, [w - textWidth(str) - 20, 35]);
         }

         if (isTextMode)
            this.drawTextModeMessage();

         // REMIND THE PRESENTER WHEN INTERFACE IS IN AUTO-SKETCHING MODE.


         // SHOW PRESENTER THE AUTO-SKETCHING GUIDE PATTERN.

         if (isk() && sk().sp.length > 0
                   && sk().sketchProgress < 1
                   && ! sk().isFreehandSketch()) {

            var x0 = sk().sp[0][0], y0 = sk().sp[0][1], r = 14;
            fillPolygon([ [x0-r,y0], [x0,y0-r], [x0+r,y0], [x0,y0+r] ]);

            for (var i = 1 ; i < sk().sp.length ; i++) {
               var p = sk().sp[i-1];
               var q = sk().sp[i];
               lineWidth(2);
               color(q[2] == 0 ? 'rgba(0,64,255,.1)' :
                                 'rgba(0,64,255,.5)' );
               var x = (p[0] + q[0]) / 2;
               var y = (p[1] + q[1]) / 2;
               arrow(p[0], p[1], x, y);
               line(x, y, q[0], q[1]);
            }
         }

         // SHOW LINKS BETWEEN SKETCHES.

         if (! this.isPressed)
            linkAtCursor = null;

         for (var I = 0 ; I < nsk() ; I++)
            if (sk(I).parent == null) {
               var a = sk(I);
               for (var i = 0 ; i < a.out.length ; i++)
                  if (isDef(a.out[i]))
                     for (var k = 0 ; k < a.out[i].length ; k++) {
                        var link = a.out[i][k];
                        link.draw(! isAudiencePopup());
                        if (! this.isPressed && isMouseNearCurve(link.C))
                           linkAtCursor = link;
                        if (linkAtCursor == link)
                           link.highlight();        // HIGHLIGHT LINK AT CURSOR.
                     }
            }

         if (isAudiencePopup() && ! isShowingGlyphs) {
            color('rgba(0,32,128,.2)');
            var msg = "AUDIENCE POPUP IS SHOWING";
            _g.font = 'bold 40pt Calibri';
            _g_text(msg, [(w - textWidth(msg)) / 2, h * 0.9]);
         }

         annotateEnd();
      },

      computePortBounds : function() {
         var saveFont = _g.font;
         _g.font = '12pt Calibri';
         for (var I = 0 ; I < nsk() ; I++) {
            var sketch = sk(I);
            if (sketch.parent == null)
               for (var i = 0 ; i < sketch.portName.length ; i++)
                  if (sketch.sketchProgress == 1 && isDef(sketch.portName[i])) {
                     var str = sketch.portName[i];
                     var A = sketch.portXY(i);
                     var tw = max(portHeight, textWidth(str) + 10);
                     var px = A[0] - tw/2;
                     var py = A[1] - portHeight/2;
                     var pw = tw;
                     var ph = portHeight;
                     sketch.portBounds[i] = [px, py, px + pw, py + ph];
                  }
         }
         _g.font = saveFont;
      },

      advanceCurrentSketch : function() {

         // AFTER SKETCHING: TRANSITION SKETCH STYLE AND RESTORE CURSOR POSITION.

         if (isk() && sk().sketchState == 'in progress')
            if (sk().sketchProgress < 1) {
               var n = sk().sp.length;
               sk().cursorX = sk().sp[n-1][0];
               sk().cursorY = sk().sp[n-1][1];
            }
            else {
               var t = sCurve(sk().cursorTransition);
               cursorX = mix(sk().cursorX, This().mouseX, t);
               cursorY = mix(sk().cursorY, This().mouseY, t);

               sk().styleTransition  = min(1, sk().styleTransition + 1.4 * This().elapsed);
               sk().cursorTransition = min(1, sk().cursorTransition + This().elapsed);

               if (sk().cursorTransition == 1)
                  sk().sketchState = 'finished';
            }
      },

      drawTextModeMessage : function() {
         var w = width(), h = height();
         color('rgba(0,32,128,.07)');
         fillRect(0,0,w,h);
         _g.font = 'bold 60pt Calibri';
         var msg = isShiftPressed ? "TAP TO EXIT TEXT MODE"
                                  : "tap to exit text mode" ;
         color('rgba(0,32,128,.2)');
         _g_text(msg, [(w - textWidth(msg)) / 2, 80]);

         if (isCreatingGlyphData) {
            var str = "outputting glyphs";
            _g_text(str, [(w - textWidth(str)) / 2, 200]);
         }
      },

      drawTextStrokes : function() {
         if (isCreatingGlyphData || This().mousePressed) {
            var ts = This().mousePressed ? strokes[0]
                                         : strokesGlyph == null ? []
                                         : strokesGlyph.data[0];

            if (isDef(ts) && ts.length > 0) {
               _g.lineWidth = 4;
               _g_beginPath();
               if (ts.length > 0) {
                  _g_moveTo(ts[0][0], ts[0][1]);
                  for (var i = 1 ; i < ts.length ; i++)
                     _g_lineTo(ts[i][0], ts[i][1]);
                  _g_stroke();
               }
            }
         }
      },

      sketchesAt : function(x, y) {
         var sketches = [];
         for (var I = nsk() - 1 ; I >= 0 ; I--)
            if (sk(I).parent == null && sk(I).contains(x,y))
               sketches.push(sk(I));
         return sketches;
      },
   };

   function convertTextSketchToGlyphSketch(sketch, x, y) {
      var indexName = sketch.text.trim();
      for (var n = 0 ; n < glyphs.length ; n++) {
         var glyph = glyphs[n];
         if (indexName == glyph.indexName) {
            deleteSketch(sketch, 6);
            var name = glyph.name;
            if (name.indexOf("(") < 0)
               return;
            var a = name.indexOf("'");
            if (a >= 0) {
               var b = name.indexOf("'", a+1);
               var c = name.indexOf("'", b+1);
               var d = name.indexOf("'", c+1);
               var type = name.substring(a+1, b);
               var label = name.substring(c+1, d);
               eval("addSketch(new " + type + "())");
               sk().setSelection(label);
               finishSketch();
               sk().tX = x - width()/2;
               sk().tY = y - height()/2;
            }
            else {
               eval(name);
               sk().tX += x - sketchPage.x;
               sk().tY += y - sketchPage.y;
            }
            bgClickCount = 0;
            return;
         }
      }
   }

   function initVideoLayer() {
     videoLayer = new ChromaKeyedVideo();
     videoLayer.init(video_canvas);
  }

// GLOBAL VARIABLES PRIMARILY RELATED TO SKETCH PAGES.

var isAltPressed = false;                 // g sketchPage
var isCommandPressed = false;             // g sketchPage
var isControlPressed = false;             // sketchPage
var isFakeMouseDown = false;              // g sketchPage
var isPanning = false;                    // g sketchPage
var isShiftPressed = false;               // g sketchPage
var isShowingGlyphs = false;              // g sketchPage
var isShowingTime = false;                // g sketchPage
var isSketchDragActionEnabled = false;    // g sketchPage

var currentTextSketch = null;             // g sketch sketchPage
var sketchAction = null;                  // g sketch sketchPage
var isSketchCmdMode = false;              // sketchPage

var codeSketch = null;                    // sketch sketchPage widgets

var sketchBook = new SketchBook();        // g sketchPage
var sketchPage = sketchBook.setPage(0);   // g glyphChart imageLibrary overview palette
                                          //   sketch sketchGlyph sketchPage toolTips
var sketchPages = sketchBook.sketchPages; // g

