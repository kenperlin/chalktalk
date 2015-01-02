
// GLOBAL VARIABLES PRIMARILY RELATED TO SKETCH PAGES.

var clickSize = 30;
var codeSketch = null;
var isAudioSignal = false;
var isBgDragActionEnabled = false;
var isBottomHover = false;
var isCommandPressed = false;
var isControlPressed = false;
var isDrawingSketch2D = false;
var isFakeMouseDown = false;
var isManualScaling = false;
var isPanning = false;
var isRightGesture = false;
var isRightHover = false;
var isShiftPressed = false;
var isShorthandMode = false;
var isShorthandTimeout = false;
var isShowingGlyphs = false;
var isSketchDragActionEnabled = false;
var isSpacePressed = false;
var isTogglingMenuType = false;
var isVerticalPan = false;
var isVideoBackground = false;
var menuType = 0;
var needToStartSketchDragAction = false;
var paletteColorId = 0;
var showingLiveDataMode = 0;
var sketchToDelete = null;

   function SketchLink(a, i, k, linkData) {
      this.a = a;
      this.i = i;
      this.k = k;
      this.linkData = linkData;
      this.s = 0;
   }

// POSITION AND SIZE OF THE COLOR PALETTE ON THE UPPER LEFT OF THE SKETCH PAGE.

   function paletteX(i) { return 30 - _g.panX; }
   function paletteY(i) { return 30 + i * 30 - _g.panY; }
   function paletteR(i) {
      var index = paletteColorId >= 0 ? paletteColorId : sketchPage.colorId;
      return i == index ? 12 : 8;
   }

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

   var pointToPixelMatrix = new THREE.Matrix4();
   var pixelToPointMatrix = new THREE.Matrix4();

   function computeStandardView() {
      sk().standardView();
      for (var i = 0 ; i < 16 ; i++)
         pointToPixelMatrix.elements[i] = m._m()[i];
   }

   function computeStandardViewInverse() {
      sk().standardViewInverse();
      for (var i = 0 ; i < 16 ; i++)
         pixelToPointMatrix.elements[i] = m._m()[i];
   }

   var sketchBook = new SketchBook();

// MOST USER INTERACTION IS MEDIATED BY THE CURRENT SKETCH PAGE.

   function SketchPage() {
      this.fadeAway = 0;
      this.isGlyphable = true;
      this.paletteColorDragXY = null;
      this.sketches = [];
      this.scaleRate = 0;

      this.clear = function() { this.fadeAway = 1; }

      this.doFadeAway = function(elapsed) {
         this.fadeAway = max(0.0, this.fadeAway - elapsed / 0.25);
         _g.globalAlpha = this.fadeAway;
         if (this.fadeAway == 0.0) {
            this.clearAfterFadeAway();
            _g.sketchProgress = 1;
            _g.suppressSketching = 0;
            _g.xp0 = _g.yp0 = _g.xp1 = _g.yp1 = 0;
            _g.globalAlpha = 1.0;
         }
      }

      this.beginTextSketch = function() {
         this.keyDown(64 + 9);            // enter text insertion mode
         this.keyUp(64 + 9);
         return sk();
      }

      this.addTextToTextSketch = function(text) {
         for (var i = 0 ; i < text.length ; i++) {
            var charCode = text.charCodeAt(i);
            this.keyDown(charCode);
            this.keyUp(charCode);
         }
         return sk();
      }

      this.createTextSketch = function(text) {
         this.beginTextSketch();
         this.addTextToTextSketch(text);
         setTextMode(false);
         return sk();
      }

      this.createLink = function() {

         // AVOID CREATING DUPLICATE LINKS.

         if (inPort < inSketch.in.length && inSketch.in[inPort] != undefined
                                         && inSketch.in[inPort].a == outSketch
                                         && inSketch.in[inPort].i == outPort )
             return;

         // IF NO OUTPUT SLOTS YET, CREATE EMPTY ARRAY OF OUTPUT SLOTS.

         if (outPort >= outSketch.out.length || outSketch.out[outPort] === undefined)
            outSketch.out[outPort] = [];

         outSketch.out[outPort].push(new SketchLink(inSketch, inPort, 0));
         inSketch.in[inPort] = new SketchLink(outSketch,outPort,0);
      }

      this.clearAfterFadeAway = function() {
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
      }

      this.clear();

      this.findIndex = function(sketch) {
         for (var i = 0 ; i < this.sketches.length ; i++)
            if (this.sketches[i] == sketch)
               return i;
         return -1;
      }

      this.add = function(sketch) {
         this.sketches.push(sketch);
         this.index = this.sketches.length - 1;
         sketch.index = this.index;
         pullDownLabels = sketchActionLabels.concat(sketch.labels);
      }

      this.getSketchesByLabel = function(label) {
         var sketches = [];
         for (var i = 0 ; i < this.sketches.length ; i++)
            if (label == this.sketches[i].labels[this.sketches[i].selection])
                  sketches.push(this.sketches[i]);
         return sketches;
      }

      this.isCreatingGroup = false;

      this.isFocusOnLink = false;

      // HANDLE MOUSE DOWN FOR THE SKETCH PAGE.

      this.mouseDown = function(x, y) {
         this.mx = x;
         this.my = y;

         if (this.setPageInfo !== undefined)
            return;

         this.isPressed = true;
         this.isClick = true;
         this.isPossibleClickOverBackground = ! isHover();
         this.travel = 0;
         this.xDown = x;
         this.yDown = y;
         this.x = x;
         this.y = y;
         this.panXDown = _g.panX;
         this.panYDown = _g.panY;

         if (isOnScreenKeyboard() && onScreenKeyboard.mouseDown(x,y)) {
            return;
         }

         if (this.hintTrace !== undefined) {
            this.hintTrace.push([[x,y]]);
            return;
         }

         isSketchDragActionEnabled = false;
         isBgActionEnabled = false;
         if (bgClickCount == 1) {
            if (isSketchDragActionEnabled = isHover()) {
               needToStartSketchDragAction = true;
            }
            else {
               isBgActionEnabled = true;
               bgActionDown(x, y);
            }
            return;
         }

         if (isShowingGlyphs) {
            for (var i = 0 ; i < glyphs.length ; i++) {
               var b = this.glyphBounds(i);
               if (x >= b[0] && x < b[2] && y >= b[1] && y < b[3]) {
                  this.isDraggingGlyph = true;
                  this.iDragged = i;
                  return;
               }
            }
         }

         if (paletteColorId >= 0) {
            this.paletteColorDragXY = null;
            return;
         }

         this.isPanViewGesture = false;
         if (this.isOnPanStrip) {
            var b = this.panViewBounds;
            this.isPanViewGesture = x >= b[0] && y >= b[1] && x < b[2] && y < b[3];
         }

         if (isRightHover || x >= width() - margin - _g.panX) {
            isRightGesture = true;
            this.yDown = y;
            return;
         }

         if (isBottomHover || y >= height() - margin - _g.panY) {
            isBottomGesture = true;
            this.xDown = x;
            return;
         }

         if (x >= width() - margin && y >= height() - margin - _g.panY) {
            isTogglingMenuType = true;
            return;
         }

         if (pieMenuIsActive) {
            pieMenuStroke = [[x,y]];
            return;
         }

         if (isTextMode) {
            strokes = [[[x,y]]];
            strokesStartTime = time;
/*
            isShorthandMode = true;
            isShorthandTimeout = false;
*/
            // FOR THIS VERSION WE ARE DISABLING SHORTHAND MODE.

            isShorthandMode = false;
            isShorthandTimeout = true;

            iOut = 0;
            return;
         }

         if (isShowingTimeline) {
            isDraggingTimeline = true;
            console.log("timeline down");
            return;
         }

         // BEFORE PROCEEDING, FINISH ANY UNFINISHED SKETCH.

         finishDrawingUnfinishedSketch();

         this.isFocusOnLink = false;
         if (linkAtCursor != null) {
            this.isFocusOnLink = true;
            return;
         }

         if (this.isCreatingGroup)
            return;

         // SEND MOUSE DOWN/DRAG COMMANDS TO AN EXISTING SKETCH.

         this.isFocusOnSketch = false;

         if (isk() && sk().isMouseOver) {
            x = sk().unadjustX(x);
            y = sk().unadjustY(y);
            if (sk().sketchProgress == 1) {
               this.isFocusOnSketch = ! (sk() instanceof SimpleSketch) || sk().isGroup();
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
               sk().mouseDown(x, y);
	       m.restore();

            }
         }

         // START TO DRAW A NEW SIMPLE SKETCH.

         else {
            addSketch(new SimpleSketch());
            sk().sketchProgress = 1;
            sk().sketchState = 'finished';
            x = sk().unadjustX(x);
            y = sk().unadjustY(y);

	    m.save();
	    computeStandardViewInverse();
            sk().mouseDown(x, y);
	    m.restore();

         }
      }

      // HANDLE MOUSE DRAG FOR THE SKETCH PAGE.

      this.mouseDrag = function(x, y) {
         this.mx = x;
         this.my = y;

         var w = width();
         var h = height();

         if (this.setPageInfo !== undefined)
            return;

         var dx = x - this.x;
         var dy = y - this.y;
         this.travel += len(dx, dy);
         this.x = x;
         this.y = y;

         if (this.isDraggingGlyph) {
            return;
         }

         if (isOnScreenKeyboard() && onScreenKeyboard.mouseDrag(x,y)) {
            return;
         }

         if (this.hintTrace !== undefined) {
            this.hintTrace[this.hintTrace.length-1].push([x,y]);
            return;
         }

         if (isSketchDragActionEnabled && this.travel > clickSize) {
            if (needToStartSketchDragAction) {
               startSketchDragAction(this.xDown, this.yDown);
               needToStartSketchDragAction = false;
            }
            doSketchDragAction(x, y);
            return;
         }

         if (isBgActionEnabled) {
            bgActionDrag(x, y);
            return;
         }

         if (bgClickCount == 1)
            return;

         if (paletteColorId >= 0) {
            var index = findPaletteColorIndex(x, y);
            if (index >= 0)
               paletteColorId = index;
            else
               this.paletteColorDragXY = [x,y];
            return;
         }

         if (x >= width() - margin - _g.panX) {
            isRightHover = true;
         } else {
            isRightHover = false;
         }

         if (this.isPanViewGesture)
            return;

         if (! isVerticalPan) {
            if (isBottomGesture) {
               _g.panX = min(0, _g.panX + x - this.xDown);
               return;
            }

            if (isRightHover && isRightGesture && ! isBottomGesture) {
               // DRAGGING TO QUICK SWITCH PAGES
               pageNumber = floor((y / (height() - margin)) * sketchPages.length);
               if (pageNumber != pageIndex)
                  setPage(pageNumber);
               return;
            }
         }
         else {
            if (isRightGesture) {
               _g.panY = min(0, _g.panY + y - this.yDown);
               return;
            }

            if (isBottomHover && isBottomGesture && ! isRightGesture) {
               // DRAGGING TO QUICK SWITCH PAGES
               pageNumber = floor((x / (width() - margin)) * sketchPages.length);
               if (pageNumber != pageIndex)
                  setPage(pageNumber);
               return;
            }
         }

         if (isTogglingMenuType)
            return;

         if (outPort >= 0 && isDef(outSketch.defaultValue[outPort]) && ! this.click) {
            if (isNumeric(outSketch.defaultValue[outPort])) {
               if (this.portValueDragMode === undefined)
                  this.portValueDragMode = abs(x-this.xDown) > abs(y-this.yDown) ? "portValueDragX" : "portValueDragY";
               if (this.portValueDragMode == "portValueDragY") {
                  var incr = floor((y-dy)/10) - floor(y/10);
                  outSketch.defaultValue[outPort] += incr * outSketch.defaultValueIncr[outPort];
               }
            }
            return;
         }

         if (pieMenuIsActive) {
            pieMenuStroke.push([x, y]);
            return;
         }

         if (isTextMode) {
            if ( ! isShorthandTimeout &&
                 len(x - strokes[0][0][0], y - strokes[0][0][1]) >= shRadius )
               isShorthandMode = false;

            strokes[0].push([x, y]);

            if (isShorthandMode)
               interpretShorthand();

            return;
         }

         if (isDraggingTimeline) {
            console.log("timeline drag");
            return;
         }

         if (this.isFocusOnLink) {
            if (linkAtCursor != null)
               computeLinkCurvature(linkAtCursor, [x, y]);
            return;
         }

         if (this.isCreatingGroup)
            return;

         if (isk()) {
            x = sk().unadjustX(x);
            y = sk().unadjustY(y);
            if (sk().sketchProgress == 1) {
               sk().travel += len(x - sk().x, y - sk().y);
               if (sk().travel > clickSize)
                  sk().isClick = false;
               sk().x = x;
               sk().y = y;
            }
            if (outPort == -1 || sk() instanceof NumericSketch) {

	       m.save();
	       computeStandardViewInverse();
               sk().mouseDrag(x, y);
	       m.restore();

            }
         }
      }

      // HANDLE MOUSE UP FOR THE SKETCH PAGE.

      this.mouseUp = function(x, y) {

         if (this.setPageInfo !== undefined) {
            setPage(this.setPageInfo.page);
            delete this.setPageInfo;
            return;
         }

         this.isPressed = false;

         if (this.hintTrace !== undefined) {
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

         if (this.isDraggingGlyph) {
            glyphs[this.iDragged].toSimpleSketch(This().mouseX, This().mouseY, 1.5);
            this.isDraggingGlyph = false;
            return;
         }

         if (isSketchDragActionEnabled && this.travel > clickSize) {
            endSketchDragAction(x, y);
            isSketchDragActionEnabled = false;
         }

         if (isBgActionEnabled) {
            if (this.travel <= clickSize) {
               bgActionEnd(x, y);
               bgClickCount = 0;
            }
            else {
               bgActionUp(x, y);
            }
            return;
         }

         if (paletteColorId >= 0) {

            // MOUSE-UP OVER PALETTE TO SET THE DRAWING COLOR.

            if (this.paletteColorDragXY == null)
               this.colorId = paletteColorId;

            // DRAG A COLOR SWATCH FROM THE PALETTE TO CHANGE COLOR OF A SKETCH.

            else {
               if (isk() && sk().isMouseOver) {
                  sk().setColorId(paletteColorId);
                  if (sk() instanceof GeometrySketch)
                     setMeshMaterialToRGB(sk().mesh, paletteRGB[sk().colorId]);
               }
               this.paletteColorDragXY = null;
            }
            return;
         }

         if (isOnScreenKeyboard() && !onScreenKeyboard.dismissClick(x,y) && onScreenKeyboard.mouseUp(x,y)) {
            if (!onScreenKeyboard.keyClick(x,y)) {
                return;
            } else {
                this.handleTextChar(onScreenKeyboard.key);
                return;
            }
         }

         if (! isVerticalPan) {
            if (isBottomGesture) {
               if (abs(_g.panX - this.panXDown) <= clickSize && y < height() - 100)
                  this.clear();
               isBottomGesture = false;
               return;
            }

            if (isRightHover && isRightGesture && ! isBottomGesture) {

               // CLICK TO SWITCH PAGES QUICKLY.

               pageNumber = floor((y / (height() - margin)) * sketchPages.length);
               if (pageNumber != pageIndex)
                  setPage(pageNumber);
               return;
            }
         }
         else {
            if (isRightGesture) {
               if (abs(_g.panY - this.panYDown) <= clickSize && x < width() - 100)
                  this.clear();
               isRightGesture = false;
               return;
            }

            if (isBottomHover && isBottomGesture && ! isRightGesture) {

               // CLICK TO SWITCH PAGES QUICKLY.

               pageNumber = floor((x / (width() - margin)) * sketchPages.length);
               if (pageNumber != pageIndex)
                  setPage(pageNumber);
               return;
            }
         }

         isRightGesture = false;
         isBottomGesture = false;

         if (isTogglingMenuType) {
            isTogglingMenuType = false;
            menuType = (menuType + 1) % 2;
            return;
         }

         if (this.travel > clickSize)
            this.isClick = false;

         if (pieMenuIsActive) {
            pieMenuEnd();
            return;
         }

         // SPECIAL HANDLING FOR TEXT MODE.

         if (isTextMode) {

            var stroke = strokes[0];
            if (! isShorthandTimeout &&
                len(stroke[stroke.length-1][0] - stroke[0][0],
                    stroke[stroke.length-1][1] - stroke[0][1]) < shRadius) {

               // CLICK ON STROKE SETS THE TEXT CURSOR.

               if (isHover())
                  sk().setTextCursor(sk().unadjustX(x), sk().unadjustY(y));

               // CLICK NOT ON STROKE TURNS OFF TEXT MODE.

               else
                  toggleTextMode();

               strokes = [];
               return;
            }

            // CLICKING ON THE INDEX NAME OF A GLYPH INSTANTIATES A GLYPH SKETCH OF THAT TYPE+LABEL.

            if (this.isClick && isHover()) {
               convertTextSketchToGlyphSketch(sk(), x, y);
               return;
            }

            if (this.isClick)
               toggleTextMode();

            else if (! isShorthandMode) {
               var glyph = findGlyph(strokes, glyphs);
               strokes = [];
               if (glyph != null && ! isCreatingGlyphData)
                  this.handleDrawnTextChar(glyph.name);
            }

            strokes = [];
            return;
         }

         if (isDraggingTimeline) {
            isDraggingTimeline = false;
            console.log("timeline up");
            return;
         }

         if (this.isFocusOnLink && bgClickCount != 1) {

            // CLICK ON A LINK TO DELETE IT.

            if (this.isClick)
               deleteLinkAtCursor();

            // DRAGGING A LINK TO A SKETCH THAT HAS AN OPEN CODE EDITOR WINDOW
            // CAUSES ALL INSTANCES OF THAT VARIABLE TO BE REPLACED BY ITS VALUE.

            else if (isCodeWidget && codeSketch.contains(x, y)) {
               var i = linkAtCursor.linkData.i;
               codeTextArea.value = variableToValue(codeTextArea.value,
                                                    "xyz".substring(i, i+1),
                                                    roundedString(codeSketch.inValue[i]));
               deleteLinkAtCursor();
            }
            return;
         }

         // CLICK AFTER DRAWING A GROUP-DEFINING PATH CREATES A NEW GROUP.

         if (this.isCreatingGroup) {
            this.isCreatingGroup = false;
            this.toggleGroup();
            return;
         }

         // CLICK ON A GROUP TO UNGROUP IT.

         if (isHover() && sk().isGroup()) {
            this.toggleGroup();
            return;
         }

         // CLICK ON AN OUT PORT STARTS A LINK.

	 if (this.isClick && outPort >= 0 && outSketch.disableClickToLink === undefined && bgClickCount != 1) {
            sketchAction = "linking";
            return;
         }

         // NON-EXPERT MODE: CLICK ON A SKETCH TO BRING UP ITS PULLDOWN MENU.

         if (/**** ! isExpertMode ****/ false) {
            if (this.isClick && this.isFocusOnSketch) {
               if (! doSketchClickAction(x, y)) {
                  sk().isPressed = false;
                  pullDownLabels = sketchActionLabels.concat(sk().labels);
                  pullDownStart(this.x, this.y);
               }
               return;
            }
         }

         // EXPERT MODE: CLICKING ON A SKETCH.

         else if (this.isClick && isHover()) {

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
               return;
         }

         // IN ALL OTHER CASES, IGNORE PREVIOUS CLICK ON THE BACKGROUND.

         else if (bgClickCount == 1) {
            bgClickCount = 0;
            return;
         }

         // SEND UP EVENT TO THE SKETCH AT THE MOUSE.

         if (isk()) {
            x = sk().unadjustX(x);
            y = sk().unadjustY(y);

            if (sk().sketchProgress == 1)
               sk().isPressed = false;
            sk().isDrawingEnabled = true;

	    m.save();
	    computeStandardViewInverse();
            sk().mouseUp(x, y);
	    m.restore();

            // BEGINNING OF IMPLEMENTATION OF SENTENCE LOGIC IN DRAWING LANGUAGE.
/*
            var sketches = sk().otherSketchesAt(x,y);
            if (sketches.length > 0) {
               console.log("SUBJECT = " + sk().indexName);
               console.log("PREDICATE = " + sketches[0].indexName);
               if (sketches.length > 1)
                  console.log("OBJECT = " + sketches[1].indexName);
            }
*/
            if (this.isClick && isHover() && isDef(sk().onClick)) {

	       m.save();
	       computeStandardViewInverse();
               sk().onClick(x, y);
	       m.restore();

               return;
            }

            if (! this.isClick && isk() && isDef(sk().onSwipe)) {

	       m.save();
	       computeStandardViewInverse();
               sk().onSwipe(x - this.xDown, y - this.yDown);
	       m.restore();

               return;
            }
         }

         // CLICK OVER BACKGROUND

         if (this.isClick && this.isPossibleClickOverBackground) {

            // EXPERT MODE: TWO CLICKS AT THE SAME PLACE TO BRING UP THE PIE MENU.

            if (/**** isExpertMode || menuType == 1 ****/ true) {
               switch (++bgClickCount) {
               case 1:
                  bgClickX = x;
                  bgClickY = y;
                  break;
               case 2:
                  if (len(x - bgClickX, y - bgClickY) < 20)
                     pieMenuStart(x, y);
                  bgClickCount = 0;
                  break;
               }
            }

            // NOT IN EXPERT MODE: BRING UP THE PAGE PULL DOWN MENU.

            else {
               pullDownLabels = pagePullDownLabels;
               pullDownStart(this.x, this.y);
            }
         }
      }

      // ROTATE CURRENT SKETCH.

      this.doRotate = function(x, y) {
         if (isk()) {
            sk().rX += 2 * (x - this.mx) /  width();
            sk().rY += 2 * (y - this.my) / -height();
         }
      }

      // SCALE CURRENT SKETCH.

      this.doScale = function(x, y) {
         if (isk())
            sk().scale(pow(16, (y - this.my) / -height()));
      }

      // TRANSLATE CURRENT SKETCH.

      this.doTranslate = function(x, y) {
         if (isk()) {
            if (sk().hasMotionPath()) {
               var X = sk().motionPath[0];
               var Y = sk().motionPath[1];
               var x0 = X[0];
               var y0 = Y[0];

               var curve = [], totalLength = 0;
               for (var i = 0 ; i < X.length ; i++) {
                  curve.push([X[i] - x0,Y[i] - y0]);
                  if (i > 0)
                     totalLength += len(X[i]-X[i-1],Y[i],Y[i-1]);
               }

               bendCurve(curve, [x - sk().tX, y - sk().tY], totalLength);

               X = [];
               Y = [];
               for (var i = 0 ; i < curve.length ; i++) {
                  X.push(curve[i][0] + x0);
                  Y.push(curve[i][1] + y0);
               }
               sk().motionPath = [X, Y];

               return;
            }
            sk().translate(sk().unadjustD(x - this.mx), sk().unadjustD(y - this.my));
            if (isSketchInProgress()) {
               cursorX += x - this.mx;
               cursorY += y - this.my;
               sk().sp[0] = [sk().xStart = cursorX, sk().yStart = cursorY, 0];
            }
            if (isDef(sk().hitOnDrag)) {
               var sketches = this.intersectingSketches();
               for (var i = 0 ; i < sketches.length ; i++)
                  sk().hitOnDrag(sketches[i]);
            }
         }
      }

      // TEMPORARILY UNDRAW CURRENT SKETCH.

      this.doUndraw = function(x, y) {
         if (isk() && sk() instanceof SimpleSketch) {
            this.tUndraw = max(0, min(1, (x - this.xDown) / 200));
         }
      }

      this.zoom = 1;

      // ZOOM THE SKETCH PAGE

      this.doZoom = function(x, y) {
         this.zoom *= 1 - (y - this.my) / height();
      }

      // RESPONSE TO MOUSE MOVE WHILE IN CREATING GROUP PATH MODE.

      this.groupMouseMove = function(x, y) {
         for (var I = 0 ; I < nsk() ; I++)
            if (sk(I).parent == null && sk(I).contains(this.mx, this.my))
               group[I] = true;
         if (isk()) {

	    m.save();
	    computeStandardViewInverse();
            sk().mouseMove(x, y);
	    m.restore();

         }
         groupPath.push([x,y]);
      }

      // UNPACK GROUP IF THERE IS ONE.  ELSE CREATE A NEW GROUP.

      this.toggleGroup = function() {

         // FOUND A GROUP: UNPACK IT.

         if (Object.keys(group).length == 0) {
            if (isHover() && sk().isGroup()) {
               for (var i = 0 ; i < sk().children.length ; i++)
                  sk().children[i].parent = null;
               deleteSketchOnly(sk());
            }
            return;
         }

         // OTHERWISE A NEW GROUP IS CREATED.

         addSketch(new SimpleSketch());
         sk().sketchProgress = 1;
         sk().sketchState = 'finished';
         for (var j in group)
            sk().children.push(sk(j));
         sk().computeGroupBounds();
         sk().groupPath = cloneArray(groupPath);
         sk().groupPathLen = computeCurveLength(groupPath);
         sk().labels = "ungroup".split(' ');
         group = {};
         groupPath = [];
      }

      // HANDLE MOUSE MOVE FOR THE SKETCH PAGE.

      this.mouseMove = function(x, y) {

         if (this.setPageInfo !== undefined) {
            if (len(x - this.setPageInfo.x, y - this.setPageInfo.y) > clickSize)
               delete this.setPageInfo;
         }

         this.x = x;
         this.y = y;

         if (y >= height() - margin - _g.panY && x < width() - margin) {
            isBottomHover = true;
         } else {
            isBottomHover = false;
         }

         if (x >= width() - margin - _g.panX && y < height() - margin) {
            isRightHover = true;
         } else {
            isRightHover = false;
         }

         if (isFakeMouseDown) {
            this.mouseDrag(x, y);
            return;
         }

         if (isOnScreenKeyboard()) {
            onScreenKeyboard.mouseMove(x, y);
         }

         // IF IN SKETCH-ACTION MODE, MOVING MOUSE DOES THE SKETCH ACTION.

         if (sketchAction != null) {
	    switch (sketchAction) {
            case "linking"    : findInSketchAndPort();
                                if (outPort == -1)
                                   sketchAction = null;
                                break;
            case "translating": this.doTranslate(x, y); break;
            case "rotating"   : this.doRotate(x, y); break;
            case "scaling"    : this.doScale(x, y); break;
            case "undrawing"  : this.doUndraw(x, y); break;
            }

            this.mx = x;
            this.my = y;
            bgClickCount = 0;
            return;
         }

         // SPECIAL HANDLING OF MOUSE MOVE IF VARIOUS KEYS ARE PRESSED.

         switch (letterPressed) {
         case 'spc':
            break;
         case 'b':
            if (sk().isGroup()) {

               var p0 = [];
               for (var i = 0 ; i < sk().children.length ; i++)
                  p0[i] = computeCentroid(sk(), sk().children[i], sk().groupPath);

               bendCurve(sk().groupPath, [x,y], sk().groupPathLen * sk().sc);

               for (var i = 0 ; i < sk().children.length ; i++) {
                  var s = sk().children[i];
                  var p1 = computeCentroid(sk(), s, sk().groupPath);
                  var dx = p1[0] - p0[i][0];
                  var dy = p1[1] - p0[i][1];
                  s.translate(dx, dy);
                  s.xlo += dx;
                  s.ylo += dy;
                  s.xhi += dx;
                  s.yhi += dy;
               }

               sk().computeGroupBounds();
            }
            else
               bendCurve(sk().sp0, sk().m2s([x,y]), sk().len, 1);
            break;
         case 'g':
            this.groupMouseMove(x, y);
            break;
         case 'r':
            this.doRotate(x, y);
            break;
         case 's':
            isManualScaling = true;
            this.doScale(x, y);
            break;
         case 't':
            this.doTranslate(x, y);
            break;
         case 'u':
            this.doUndraw(x, y);
            break;
         case 'z':
            this.doZoom(x, y);
            break;

         // HANDLING FOR MOUSE MOVE IF NO KEY IS PRESSED.

         default:

            // IF IN GROUP-CREATE MODE, EXTEND THE GROUP PATH.

            if (this.isCreatingGroup)
               this.groupMouseMove(x, y);

            // OTHERWISE IF CURRENT SKETCH IS FINISHED, SEND EVENT TO THE SKETCH.

            else if (isk() && sk().sketchState == 'finished') {
               findOutSketchAndPort();

	       m.save();
	       computeStandardViewInverse();
               sk().mouseMove(x, y);
	       m.restore();

            }
            break;
         }

         this.mx = x;
         this.my = y;

         // WHEN MOUSE MOVES OVER THE COLOR PALETTE, SET THE PALETTE COLOR.

         paletteColorId = findPaletteColorIndex(x, y);
      }

      var altCmdState = 0;

      var keyPressed = -1;

      this.keyDown = function(key) {

         // Ignore multiple presses of the same key

         if (key == keyPressed)
            return;
         keyPressed = key;

         // Catch ALT-CMD-key escape, because it won't trigger
         // any keyUp to reset letterPressed to '\0'.

         if (key == 18) altCmdState |= 1;
         else if (key == 91) altCmdState |= 2;
         else if (altCmdState == 3) {
            altCmdState = 0;
            letterPressed = '\0';
            return;
         }

         var letter = charCodeToString(key);
         letterPressed = letter;

         if (outPort >= 0 && isDef(outSketch.defaultValue[outPort])) {
            isTextMode = true;
            this.isPortValueTextMode = true;
         }

         if (isTextMode) {
            switch (letter) {
            case 'cap':
               isShiftPressed = true;
               break;
            }
            return;
         }

         switch (letter) {
         case 'alt':
            isAltPressed = true;
            return;
         case 'command':
            isCommandPressed = true;
            return;
         case 'control':
            isControlPressed = true;
            return;
         case 'cap':
            isShiftPressed = true;
            return;
         case 'spc':
            isSpacePressed = true;
            return;
         case 'p':
            isPanning = true;
            break;
         }
      }

      this.handleDrawnTextChar = function(textChar) {
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
      }

      this.handleTextChar = function(letter) {
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
            if (isk()) sk().deleteChar();
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
            if (isk()) sk().insertText(letter);
         break;
         }
      }

      this.keyUp = function(key) {

         // Part of logic to account for multiple presses of the same key.

         keyPressed = -1;

         // Convert key to the proper letter encoding.

         letterPressed = '\0';
         var letter = charCodeToString(key);

         if (isCommandPressed && key == 91) {
            isCommandPressed = false;
            return;
         }

         // Special handling for when in text mode.

         if (isTextMode) {
            if (this.isPortValueTextMode !== undefined) {
               var val = "" + outSketch.defaultValue[outPort];
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
            else
               this.handleTextChar(letter);
            return;
         }

         for (var i = 0 ; i < sketchTypes.length ; i++)
            if (letter == sketchTypes[i].substring(0, 1)) {
               addSketchOfType(i);
               sk().setSelection(0);
               return;
            }

         switch (letter) {
         case '!':
            this.clear();
            break;
         case '#':
	    this.toggleLinedBackground();
            break;
         case PAGE_UP:
            break;
         case PAGE_DN:
            var handle = window[_g.canvas.id];
            if (! isFakeMouseDown) {
               handle.mouseX = mouseMoveEvent.clientX;
               handle.mouseY = mouseMoveEvent.clientY;
               handle.mousePressedAtX = handle.mouseX;
               handle.mousePressedAtY = handle.mouseY;
               handle.mousePressedAtTime = time;
               handle.mousePressed = true;
               handle.mouseDown(handle.mouseX, handle.mouseY);
            }
            else {
               if (sketchAction != null) {
                  if (sketchAction == "linking")
                     this.figureOutLink();
                  sketchAction = null;
               }
               else {
                  handle.mouseX = mouseMoveEvent.clientX;
                  handle.mouseY = mouseMoveEvent.clientY;
                  handle.mousePressed = false;
                  handle.mouseUp(handle.mouseX, handle.mouseY);
               }
            }
            isFakeMouseDown = ! isFakeMouseDown;
            break;
         case L_ARROW:
            if (isk())
               sk().offsetSelection(-1);
            break;
         case U_ARROW:
            setPage(pageIndex - 1);
            break;
         case R_ARROW:
            if (isk())
               sk().offsetSelection(1);
            break;
         case D_ARROW:
            setPage(pageIndex + 1);
            break;
         case 'esc':
            break;
         case 'del':
            if (isk())
               if (isShiftPressed)
                  sk().removeLastStroke();
               else {
                  sketchAction = null;
                  sk().fadeAway = 1.0;
                  fadeArrowsIntoSketch(sk());
                  setTextMode(false);
               }
               else
                  setTextMode(false);
            break;
         case 'spc':
            isSpacePressed = false;
            break;
         case 'alt':
            if (isAltKeyCopySketchEnabled)
               copySketch(sk());
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
         case 'a':
            isShowingPresenterView = false;
            if (! isAudiencePopup())
               createAudiencePopup();
            else
               removeAudiencePopup();
            break;
         case 'c':
            if (isk())
               sk().isCard = ! sk().isCard;
            break;
         case 'd':
            showingLiveDataMode = (showingLiveDataMode + 1) % 3;
            break;
         case 'e':
            toggleCodeWidget();
            break;
         case 'g':
            this.toggleGroup();
            break;
         case 'h':
            if (this.hintTrace === undefined)
               this.hintTrace = [];
            else
               delete this.hintTrace;
            break;
         case 'i':
            toggleTextMode();
            break;
         case 'k':
            if (isk() && sk() instanceof GeometrySketch) {
               var type = sk().glyph.indexName;
               var name = type + "_s";

               // CREATE AN OUTLINE DRAWING FOR THIS 3D OBJECT.

               var strokes = sk().mesh.toStrokes();

               // COMPUTE PIXEL COORDS OF MATRIX ORIGIN.

               var m = sk().mesh.matrixWorld.elements;
               var x0 = width()/2 + pixelsPerUnit * m[12];
               var y0 = height()/2 - pixelsPerUnit * m[13];

               // COMPUTE THE PIXEL WIDTH.

               var xlo = 10000, xhi = -xlo;
               for (var i = 1 ; i < sk().sp0.length ; i++) {
                  xlo = min(xlo, sk().sp0[i][0]);
                  xhi = max(xhi, sk().sp0[i][0]);
               }

               registerGlyph("sg('StrokesSketch','" + name + "')", strokes, name);
               var index = glyphIndex(glyphs, name);
               glyphs[index].info = { type: type, x0: x0, y0: y0, rX: sk().rX, rY: sk().rY, sw: xhi - xlo };
            }
            break;
         case 'l':
            isShowingMeshEdges = ! isShowingMeshEdges;
            break;
         case 'm':
            menuType = (menuType + 1) % 2;
            break;
         case 'n':
            if (isk())
               sk().isNegated = ! sk().isNegated;
            break;
         case 'o':
            isCreatingGlyphData = ! isCreatingGlyphData;
            break;
         case 'p':
            isPanning = false;
            break;
         case 'q':
            _g.query = 0;
            break;
         case 'b':
         case 'r':
         case 't':
            break;
         case 's':
            sketchAction = null;
            isManualScaling = false;
            break;
         case 'w':
            this.isWhiteboard = ! this.isWhiteboard;
            break;
         case 'x':
            isExpertMode = ! isExpertMode;
            break;
         case 'y':
            isShowingScribbleGlyphs = ! isShowingScribbleGlyphs;
            break;
         case 'z':
            break;
         case '/':
            isVerticalPan = ! isVerticalPan;
            break;
         case '-':
            this.toggleColorScheme();
            break;
         case '\\':
            isVerticalPan = ! isVerticalPan;
            this.toggleColorScheme();
            this.toggleLinedBackground();
            break;
         case '^':
	    if (videoLayer !== null)
	       videoLayer.Scale_X = 3.1 - videoLayer.Scale_X;
	    break;
         case 'v':
            if (videoLayer == null) {
               // INIT VIDEO LAYER
               videoLayer = new ChromaKeyedVideo();
               videoLayer.init(video_canvas);
            }
            else {
               videoLayer.toggle();
            }
            break;
         case 'V':
            videoLayer.toggleControls();
            break;
         case 'Z':
	    if (isk() && isDef(sk().typeName)) {
	       if (! isDef(sk().isShowingScript)) {
	          sk().isShowingScript = true;
	          codeSketch = sk();
	       }
               toggleCodeWidget();
            }
	    break;
         }
      }

      this.toggleLinedBackground = function() {
         if (this.isLinedPaper === undefined)
            this.isLinedPaper = true;
         else
            delete this.isLinedPaper;
      }

      this.toggleColorScheme = function() {
         if (backgroundColor === 'white') {
            backgroundColor = 'black';
            defaultPenColor = 'white';
	    paletteRGB[0][0] =
	    paletteRGB[0][1] =
	    paletteRGB[0][2] = 255;
	    palette[0] = 'rgb(255,255,255)';
         }
         else {
            backgroundColor = 'white';
            defaultPenColor = 'black';
	    paletteRGB[0][0] =
	    paletteRGB[0][1] =
	    paletteRGB[0][2] = 0;
	    palette[0] = 'rgb(0,0,0)';
         }

         document.getElementsByTagName('body')[0].style.backgroundColor = backgroundColor;

         background.color = backgroundColor;
         background.style.backgroundColor = backgroundColor;
         palette[0] = defaultPenColor;
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
      }

      this.figureOutLink = function() {

         // END ON A LINK: DELETE THE LINK.

         if (outSketch == null && linkAtCursor != null)
            deleteLinkAtCursor();

         // END ON ANOTHER SKETCH: CREATE A NEW LINK.

         else if (outSketch != null && inSketch != outSketch && inPort >= 0)
            this.createLink();

         // DOUBLE CLICK ON AN OUT-PORT TOGGLES WHETHER TO SHOW LIVE DATA FOR THIS SKETCH.

         else if (outSketch != null && isHover() && sk() == outSketch && findOutPortAtCursor(sk()) == outPort) {
            sk().isShowingLiveData = ! sk().isShowingLiveData;
            return;
         }

         // END ON BACKGROUND: CREATE A NEW LINK TO A NEW OUTPUT VALUE SKETCH.

         else if (outSketch != null && isMouseOverBackground) {
            inSketch = this.createTextSketch("   ");
            inPort = 0;
            this.createLink();
         }

         outSketch = inSketch = null;
         outPort = inPort = -1;
      }

      this.scaleSelectedSketch = function() {
         if (isk() && ! isManualScaling) {
            if (sketchAction == "scaling") {
               if (this.scaleRate < 1)
                  this.scaleRate = lerp(0.1, this.scaleRate, 1);
            }
            else if (this.scaleRate > 0) {
               if ((this.scaleRate = lerp(0.1, this.scaleRate, 0)) < .01)
                  this.scaleRate = 0;
            }
            if (this.scaleRate > 0) {
               var dy = this.yDown - this.moveY;
               sk().scale(pow(dy > 0 ? 1.015 : 1/1.015, this.scaleRate * abs(dy) / 100));
            }
         }
      }

      this.isOnPanStrip = false;

      this.animate = function(elapsed) {

         var w = width();
         var h = height();

         if (sketchToDelete != null) {
            deleteSketch(sketchToDelete);
            sketchToDelete = null;
         }

         if (nsk() == 0)
            outPort = -1;

         if (this.fadeAway > 0)
            this.doFadeAway(elapsed);

         noisy = 1;

         // WHILE BEING DRAWN, EACH SKETCH TEMPORARILY BECOMES, IN TURN, THE CURRENT SKETCH.
         // WE CAN LOOK AT sketchPage.trueIndex TO FIND OUT WHAT THE REAL CURRENT SKETCH IS.

         this.trueIndex = this.index;
         var skTrue = sk();

         function xOnPanStrip(x) { return x * margin / (isVerticalPan ? w : h) + (isVerticalPan ? w - margin : 0) - _g.panX; }
         function yOnPanStrip(y) { return y * margin / (isVerticalPan ? w : h) + (isVerticalPan ? 0 : h - margin) - _g.panY; }

         this.isOnPanStrip = isVerticalPan ? isRightGesture  || this.x + _g.panX >= w - margin
                                           : isBottomGesture || this.y + _g.panY >= h - margin;

         if (this.isLinedPaper !== undefined) {
            annotateStart();
/*
// GRAPH PAPER

            var r = w / 32;
            color(defaultPenColor);
            lineWidth(backgroundColor == 'white' ? 0.1 : 0.15);
            var x0 = r * floor(-_g.panX / r);
            var x1 = x0 + w + r;
            var y1 = this.y >= h - margin ? h - margin : h;
            for (var x = x0 ; x < x1 ; x += r)
               line(x, 0, x, y1);
            for (var y = r ; y < y1 ; y += r)
               line(x0, y, x1, y);
*/
// LINED PAPER

            var r = 45;
            color('rgb(128,192,255)');
            lineWidth(2);
            //var x0 = r * floor(-_g.panX / r);
            var x0 = 0;
            var x1 = x0 + w - (this.x >= w - margin || isRightGesture ? margin + 1 : 0);
            var y0 = 0;
            var y1 = (this.y + _g.panY >= h - margin ? h - margin : h) - _g.panY;
            for (var y = y0 ; y < y1 ; y += r)
               line(x0, y, x1, y);

            color('rgb(255,128,192)');
            lineWidth(1);
            line(x0 + 3 * r, 0, x0 + 3 * r, y1);
            line(x0 + 3 * r + 5, 0, x0 + 3 * r + 5, y1);

            annotateEnd();
         }

         for (var I = 0 ; I < nsk() ; I++) {

            // DO NOT RENDER ANY GEOMETRY SKETCH THAT IS PANNED OFF THE SCREEN.

            if ( sk(I) instanceof GeometrySketch &&
                 sk(I).xlo !== undefined && (sk(I).xhi + _g.panX < 0 || sk(I).xlo + _g.panX > w)
                                         && (sk(I).yhi + _g.panY < 0 || sk(I).ylo + _g.panY > h) )
               continue;

            if (sk() == null)
               break;

            _g_sketchStart();

            var PUSHED_sketchPage_index = this.index;

            this.index = I;

            sk().updateSelectionWeights(elapsed);

            color(sk().color);

            lineWidth(sketchLineWidth * lerp(sk().styleTransition, 1, .6)
                                      * this.zoom / sk().zoom);

            _g.save();

            // FADE AWAY THIS SKETCH BEFORE DELETING IT.

            if (sk().fadeAway > 0) {
               sk().fadeAway = max(0, sk().fadeAway - elapsed / 0.25);
               if (sk().fadeAway == 0) {
                  deleteSketch(sk());
                  _g.restore();
                  _g.globalAlpha = 1;
                  bgClickCount = 0;
                  I--;
                  continue;
               }
               _g.globalAlpha = sk().fade();
            }

            if (sk().sketchTrace != null && sk().sketchState != 'finished') {
               sk().trace = [];
            }

            if (sk() instanceof Sketch2D) {
               isDrawingSketch2D = true;
               if (sk().x2D == 0) {
                  sk().x2D = This().mouseX;
                  sk().y2D = This().mouseY;
               }
               sk().renderWrapper(elapsed);
               isDrawingSketch2D = false;
            }
            else {
               m.save();
	          computeStandardView();
                  sk().renderWrapper(elapsed);
               m.restore();
            }

            if (sk().sketchTrace != null && sk().sketchState != 'finished') {
	       if (sk().createMesh !== undefined) {
	          var alpha = 1 - sk().glyphTransition;
		  if (alpha > 0) {
		     _g.globalAlpha = alpha * alpha;
                     morphSketchToGlyphSketch();
		  }
               }
	       else
                  morphSketchToGlyphSketch();

               var rate = sk().glyphTransition < 0.5 ? 1 : 1.5;
               sk().glyphTransition = min(1, sk().glyphTransition + rate * elapsed);

               if (sk().glyphTransition == 1) {
                  finishDrawingUnfinishedSketch();
                  sk().sketchTrace = null;
               }
            }

            _g.restore();
            _g.globalAlpha = 1;

            _g_sketchEnd();

            if (sk().hasMotionPath() && skTrue.hasMotionPath() && sk().colorId == skTrue.colorId) {
               var X = sk().motionPath[0];
               var Y = sk().motionPath[1];
               _g.strokeStyle = 'rgba(' + paletteRGB[sk().colorId][0] + ',' +
                                          paletteRGB[sk().colorId][1] + ',' +
                                          paletteRGB[sk().colorId][2] + ', 0.5)';

               // DRAW MOTION PATH

               _g.lineWidth = 5;
               _g.beginPath();
               _g.moveTo(X[0], Y[0]);
               for (var i = 1 ; i < X.length ; i++)
                  _g.lineTo(X[i], Y[i]);

               // DRAW ARROWHEAD AT END OF MOTION PATH

               var n = X.length;
               for (var i = n - 1 ; i >= 0 ; i--) {
                  var dx = X[n-1] - X[i];
                  var dy = Y[n-1] - Y[i];
                  var d = len(dx, dy);
                  if (d > clickSize) {
                     d *= 50 / width();
                     _g.moveTo(X[n-1] - (dx+dy) / d, Y[n-1] - (dy-dx) / d);
                     _g.lineTo(X[n-1], Y[n-1]);
                     _g.lineTo(X[n-1] - (dx-dy) / d, Y[n-1] - (dy+dx) / d);
                     break;
                  }
               }

               _g.stroke();
            }

            // ADD SKETCH TO THE PAN STRIP.

            if (this.isOnPanStrip) {
               lineWidth(_g.lineWidth * margin / (isVerticalPan ? w : h));
               if (sk() instanceof GeometrySketch) {
                  var x0 = xOnPanStrip(min(sk().sp[0][0], sk().sp[1][0]));
                  var y0 = yOnPanStrip(min(sk().sp[0][1], sk().sp[1][1]));
                  var x1 = xOnPanStrip(max(sk().sp[0][0], sk().sp[1][0]));
                  var y1 = yOnPanStrip(max(sk().sp[0][1], sk().sp[1][1]));
                  color(scrimColor(.2));
                  _g.beginPath();
                  _g.moveTo(x0, y0);
                  _g.lineTo(x1, y0);
                  _g.lineTo(x1, y1);
                  _g.lineTo(x0, y1);
                  _g.fill();
               }
               else {
                  _g.beginPath();
                  for (var i = 0 ; i < sk().sp.length ; i++) {
                     var x = xOnPanStrip(sk().sp[i][0]);
                     var y = yOnPanStrip(sk().sp[i][1]);
                     if (sk().sp[i][2] == 0)
                        _g.moveTo(x, y);
                     else
                        _g.lineTo(x, y);
                  }
                  _g.stroke();
               }
            }

            this.index = PUSHED_sketchPage_index;
         }

         // IF THERE IS A STROKES SKETCH, CREATE ITS CORRESPONDING SHAPE.

         var shapeInfo = null;
         for (var I = 0 ; I < nsk() ; I++)
            if (sk(I) instanceof StrokesSketch && sk(I).shapeInfo !== undefined) {
               shapeInfo = sk(I).shapeInfo;
               delete sk(I).shapeInfo;
               break;
            }
         if (shapeInfo != null) {

            glyphSketch = null;
            eval(shapeInfo.type + "Sketch()");

            sk().isOutline = true;
            sk().mesh.setMaterial(bgMaterial());
            sk().mesh.setMaterial(backgroundColor == 'white' ? new THREE.LineBasicMaterial() : blackMaterial);
            sk().rX = shapeInfo.rX;
            sk().rY = shapeInfo.rY;
            sk().bounds = shapeInfo.bounds;
            sk().sw = shapeInfo.sw;
         }

         noisy = 0;

         // HIGHLIGHT THIS SCREEN RECTANGLE IN THE PAN STRIP.

         if (this.isOnPanStrip) {
            var dx = isVerticalPan ? 0 : -_g.panX;
            var dy = isVerticalPan ? -_g.panY : 0;
            var x0 = xOnPanStrip(dx    ), y0 = yOnPanStrip(dy    );
            var x1 = xOnPanStrip(dx + w), y1 = yOnPanStrip(dy + h) - 2;
            this.panViewBounds = [x0, y0, x1, y1];

            color(scrimColor(0.06));
            fillRect(x0, y0, x1 - x0, y1 - y0);
            color(scrimColor(1));
            lineWidth(0.5);
            drawRect(x0, y0, x1 - x0, y1 - y0);
         }

         if (isExpertMode) {
            if (letterPressed == 'g' || this.isCreatingGroup)
               drawGroupPath(groupPath);
            if (this.paletteColorDragXY != null ||
                This().mouseX < margin - _g.panX && ! isBottomGesture && ! isShowingGlyphs)
               drawPalette();
            if (isSpacePressed)
               helpMenuDraw();
            if (isTextMode && isShorthandMode) {
               color(defaultPenColor);
               lineWidth(1);
               drawOval(This().mousePressedAtX - 4,
                        This().mousePressedAtY - 4, 8, 8);
            }
         }

         if (isTextMode)
            this.drawTextStrokes();

         if (updateScene != 0) {
            updateScene(elapsed);
            renderer.render(renderer.scene, renderer.camera);
         }

         // DRAW THE SPEECH BUBBLE FOR THE CODE WIDGET.

         if (isCodeWidget) {
            drawCodeWidget(isCodeScript() ? codeScript() : code(),
	                   codeSketch.xlo, codeSketch.ylo,
                           codeSketch.xhi, codeSketch.yhi,
                           codeElement.codeSketch != codeSketch);
            codeElement.codeSketch = codeSketch;
         }

         if (isOnScreenKeyboard())
            onScreenKeyboard.render();

         if (this.paletteColorDragXY != null) {
            color(palette[paletteColorId]);
            fillRect(this.paletteColorDragXY[0] - 12,
                     this.paletteColorDragXY[1] - 12, 24, 24);
         }

// PLACE TO PUT DIAGNOSTIC MESSAGES FOR DEBUGGING
/*
         var msg = height() + " " + _g.canvas.height;
         _g.save();
         _g.font = '20pt Calibri';
         _g.fillStyle = defaultPenColor;
         _g.fillText(msg, 70, 30);
         _g.restore();
*/
      }

      this.showShorthand = function() {
         var x0 = This().mousePressedAtX;
         var y0 = This().mousePressedAtY;
         _g.lineWidth = 1;
         var r = shRadius;
         textHeight(12);
         color('rgba(0,32,128,.4)');
         drawOval(x0 - r, y0 - r, 2 * r, 2 * r);

         for (var n = 0 ; n < 8 ; n++) {
            var angle = TAU * n / 8;
            var x = cos(angle), y = -sin(angle);

            color('rgba(0,32,128,.4)');
            line(x0 + r * x    , y0 + r * y,
                 x0 + r * x * 3, y0 + r * y * 3);

            color('rgba(0,32,128,.7)');
            var ch = lookupChar(n, 2);

            var cx = r * x * 3.6;
            var cy = r * y * 3.6;

            color('rgba(0,32,128,.5)');
            text(shift(ch), x0+cx, y0+cy, .5, .5);

            text(shift(lookupChar(n, 0)),
                 x0 + cx*.5 - r*.65 * y,
                 y0 + cy*.5 + r*.65 * x, .5, .5);
            text(shift(lookupChar(n, 4)),
                 x0 + cx*.5 + r*.65 * y,
                 y0 + cy*.5 - r*.65 * x, .5, .5);

            text(shift(lookupChar(n, 1)),
                 x0 + cx - r*.65 * x - r*.60 * y,
                 y0 + cy - r*.65 * y + r*.60 * x, .5, .5);
            text(shift(lookupChar(n, 3)),
                 x0 + cx - r*.65 * x + r*.60 * y,
                 y0 + cy - r*.65 * y - r*.60 * x, .5, .5);
         }
      }

      var glyphsPerCol = 10;

      this.glyphBounds = function(i) {
         var ht = height() / glyphsPerCol;
         var x = ht / glyphsPerCol / 2 + ht * floor(i / glyphsPerCol) - _g.panX;
         var y = ((i % glyphsPerCol) * height()) / glyphsPerCol + ht * .1 - _g.panY;
         return [ x, y, x + ht * .7, y + ht * .8 ];
      }

      this.glyphColor = function() { return backgroundColor == 'white' ? 'rgb(0,100,200)'       : 'rgb(128,192,255)' ; }
      this.glyphScrim = function() { return backgroundColor == 'white' ? 'rgba(128,192,255,.5)' : 'rgba(0,80,128,.5)'; }
      this.glyphT = 0;
      this.isDraggingGlyph = false;
      this.iDragged = 0;

      this.showGlyphs = function() {
         _g.save();
         _g.globalAlpha = 1.0;

         color(bgScrimColor(.5));
         fillRect(-_g.panX - 100, 0, width() + 200 - _g.panY, height());

         _g.font = '8pt Trebuchet MS';

         this.glyphT = this.isDraggingGlyph
                     ? this.iDragged + 0.99
                     : glyphsPerCol * (floor((this.mx + _g.panX) / (height()/glyphsPerCol)) +
                             max(0, _g.panY + min(.99, this.my / height())));

         for (var i = 0 ; i < glyphs.length ; i++)
            this.showGlyph(i);

         if (this.isDraggingGlyph)
            this.showGlyph(this.iDragged, This().mouseX, This().mouseY);

         _g.restore();
      }

      this.showGlyph = function(i, cx, cy) {
         var glyph = glyphs[i];
         var b = this.glyphBounds(i);
         var gX = b[0], gY = b[1], gW = b[2]-b[0], gH = b[3]-b[1];
         if (isDef(cx)) {
            gX += cx - (b[0] + b[2]) / 2;
            gY += cy - (b[1] + b[3]) / 2;
         }
         var x = gX + (height()/glyphsPerCol) * .1;
         var y = gY;
         var t = this.glyphT;

         var txt = glyphs[i].indexName;

         color(this.glyphScrim());
         var gR = 4;
         fillPolygon(createRoundRect(gX, gY, gW, gH, gR));

         lineWidth(0.5);
         color(this.glyphColor());
         var r2 = 0.707;
         if (backgroundColor == 'white') {
            line(gX + gW, gY + gH - gR, gX + gW, gY + gR);
            line(gX + gW - gR, gY + gH, gX + gR, gY + gH);
            var rx = gX + gW - gR + r2 * gR;
            var ry = gY + gH - gR + r2 * gR;
            line(gX + gW - gR, gY + gH, rx, ry);
            line(gX + gW, gY + gH - gR, rx, ry);
         }
         else {
            line(gX + gR, gY, gX + gW - gR, gY);
            line(gX, gY + gR, gX, gY + gH - gR);
            var rx = gX + gR - r2 * gR;
            var ry = gY + gR - r2 * gR;
            line(gX + gR, gY, rx, ry);
            line(gX, gY + gR, rx, ry);
         }

         _g.fillStyle = t >= i && t < i+1 ? defaultPenColor : this.glyphColor();

         var tw = textWidth(txt);
         _g.fillText(txt, gX + 2, y + 10.5);

         y += height() / 45 * 10 / glyphsPerCol;

         var selected = t >= i && t < i+1;
         _g.strokeStyle = selected ? defaultPenColor : this.glyphColor();
         _g.fillStyle = selected ? defaultPenColor : this.glyphColor();
         _g.lineWidth = selected ? 2 : 1;

         var nn = glyph.data.length;

         var sc = height() / 2000 * 10 / glyphsPerCol;
         for (var n = 0 ; n < nn ; n++) {

            var d = glyph.data[n];
            if (selected && lerp(n / nn, i, i+1) <= t)
               fillOval(x + d[0][0] * sc - 3, y + d[0][1] * sc - 3, 6, 6);
            _g.beginPath();
            _g.moveTo(x + d[0][0] * sc, y + d[0][1] * sc);
            for (var j = 1 ; j < d.length ; j++) {
               if (selected && lerp((n + j / d.length) / nn, i, i+1) > t)
                  break;
               _g.lineTo(x + d[j][0] * sc, y + d[j][1] * sc);
            }
            _g.stroke();
         }
      }

      this.overlay = function() {

         var w = width(), h = height();
         var dx = -_g.panX;

         isShowingTimeline = isDraggingTimeline ||
                             ! isExpertMode
                          && isDef(This().overlay)
                          && ! pullDownIsActive
                          && letterPressed == '\0'
                          && This().mouseX < w - 80
                          && This().mouseY >= h - timelineH;

         // SHOW THE GLYPH DICTIONARY

         if (isShowingGlyphs)
            this.showGlyphs();

         // SHOW THE TIMELINE
/*
         if (isShowingTimeline) {
            annotateStart();
            color('blue');
            lineWidth(2);
            drawRect(1, h-1 - timelineH, w-2, timelineH);
            annotateEnd();
            return;
         }
*/
         annotateStart();

         // SHOW THE OPTION OF WHETHER TO USE PULLDOWN OR PIE MENU

         color(overlayClearColor());
         textHeight(12);
         text("Using", dx + w - 40, h - 30, .5, 1);
         text((menuType==0 ? "PullDown" : "Pie Menu"), dx + w - 40, h - 10, .5, 1);

         // DRAW THE COLOR PALETTE

         if (! isShowingGlyphs)
            drawPalette();

         color(overlayColor);

         line(dx+w,0, dx+w,h);
         line(dx+0,h, dx+w,h);

         // LIGHTLY OUTLINE ALL SKETCHES

         _g.save();
         lineWidth(.25);
         for (var i = 0 ; i < nsk() ; i++)
            sk(i).drawBounds();
         _g.restore();

         _g.save();
         _g.font = '30pt Helvetica';
         _g.fillStyle = overlayScrim;
         _g.fillText("PAGE " + sketchBook.page, dx + 60, 40);
         _g.restore();

         if (this.isWhiteboard)
            text("WHITEBOARD", w - 20, 20, 1, 1);

         // REMIND THE PRESENTER IF CARRYING OUT A SKETCH ACTION.

         if (sketchAction != null) {
            _g.font = 'bold 60pt Calibri';
            color('rgba(0,32,128,.15)');
            _g.fillText(sketchAction, (w - textWidth(sketchAction)) / 2, 80);
         }

         // REMIND THE PRESENTER WHEN INTERFACE IS IN TEXT INSERTION MODE.

         if (isCreatingGlyphData) {
            color(overlayColor);
            _g.font = 'bold 20pt Calibri';
            var str = "outputting glyphs";
            _g.fillText(str, w - textWidth(str) - 20, 35);
         }

         if (isTextMode)
            this.drawTextModeMessage();

         // REMIND THE PRESENTER WHEN INTERFACE IS IN AUTO-SKETCHING MODE.

         if (isk() && sk().sketchProgress < 1) {
            color('rgba(0,32,128,.2)');
            fillRect(0,0,w,h);
            _g.font = 'bold 40pt Calibri';
            var msg = "Finish drawing the sketch";
            color('rgba(0,32,128,.3)');
            _g.fillText(msg, (w - textWidth(msg)) / 2, 80);
         }

         // DRAW EXTRA INFORMATION AROUND THE SELECTED SKETCH.

         if (isk()) {
            color(sk().isGroup() ? 'rgba(255,1,0,.10)' : 'rgba(0,64,255,.06)');
            fillRect(sk().xlo, sk().ylo, sk().xhi-sk().xlo, sk().yhi-sk().ylo);

            if (isHover()) {
               color(sk().isGroup() ? 'rgba(255,1,0,.6)' : 'rgba(0,64,255,.4)');
               sk().drawBounds();
            }

            if (! isHover() && ! isTextMode
                            && sk() instanceof SimpleSketch
                            && sk().text.length == 0
                            && ! sk().isGroup()
                            && sk().sp.length <= 1 )
               deleteSketch(sk());
         }

         if (letterPressed == 'g' || this.isCreatingGroup)
            drawGroupPath(groupPath);

         // SHOW PRESENTER THE AUTO-SKETCHING GUIDE PATTERN.

         if (nsk() > 0 && sk().sp.length > 0
                       && sk().sketchProgress < 1
                       && ! sk().isSimple()) {

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

         // IF NOT IN TEXT INSERTION MODE, SHOW THE AVAILABLE KEYBOARD SHORTCUTS.

         if (! isShowingGlyphs && ! isTextMode) {
            color(overlayClearColor());
            lineWidth(1);
            textHeight(11);
            var y0 = paletteY(palette.length);
            for (var j = 0 ; j < hotKeyMenu.length ; j++) {
               var y = y0 + j * 18;
               utext(hotKeyMenu[j][0], dx + 8, y, 0, 0);
               utext(hotKeyMenu[j][1], dx +38, y, 0, 0);
               if (hotKeyMenu[j][0] == letterPressed)
                  drawRect(dx + 3, y - 3, 30, 20);
            }

            if (letterPressed != '\0')
               text(letterPressed + " key pressed", dx + 5, 60, 0, 1);
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
                        drawLink(a, i, a.out[i][k], ! isAudiencePopup());
                        C = a.out[i][k].C;

                        // HIGHLIGHT LINK AT CURSOR -- IN RED IF IT IS BEING DELETED.

                        if (! this.isPressed && isMouseNearCurve(C))
                           linkAtCursor = new SketchLink(a, i, k, a.out[i][k]);

                        if ( linkAtCursor != null && a == linkAtCursor.a
                                                  && i == linkAtCursor.i
                                                  && k == linkAtCursor.k ) {
                           _g.save();
                           color(linkHighlightColor);
                           lineWidth(20);
                           _g.beginPath();
                           _g.moveTo(C[0][0], C[0][1]);
                           for (var n = 1 ; n < C.length ; n++)
                              _g.lineTo(C[n][0], C[n][1]);
                           _g.stroke();
                           _g.restore();
                        }
                     }
            }

         // WHILE A LINK IS BEING DRAWN, SHOW IT:

         if (linkAtCursor == null && isk()
                                  && sketchAction == "linking"
                                  && outSketch != null
                                  && outPort >= 0) {

            if (! isAudiencePopup())
               drawPossibleLink(outSketch, this.mx, this.my);

            // HIGHLIGHT POTENTIAL TARGET SKETCH FOR THE LINK.

            for (var i = nsk() - 1 ; i >= 0 ; i--)
               if (isLinkTargetSketch(sk(i))) {
                  if (findNearestInPort(inSketch) >= 0) {
                     _g.save();
                        color(dataColor);
                        lineWidth(1);
                        sk(i).drawBounds();
                     _g.restore();
                  }
                  break;
               }
         }

         // SHOW PORTS IN SKETCHES.

         var saveFont = _g.font;
         _g.font = '12pt Calibri';
         for (var I = 0 ; I < nsk() ; I++)
            if (sk(I).parent == null)
               for (var i = 0 ; i < sk(I).portName.length ; i++)
                  if (isDef(sk(I).portName[i])) {
                     var str = sk(I).portName[i];
                     var A = sk(I).portXY(i);
                     lineWidth(1);
                     sk(I).duringSketch(function() {
                        color(portColor);
                        fillRect(A[0] - 5, A[1] - 5, 10, 10);
                     });
                     sk(I).afterSketch(function() {
                        var tw = max(portHeight, textWidth(str) + 10);
                        this.portBounds[i] = [A[0] - tw/2, A[1] - portHeight/2,
                                              A[0] + tw/2, A[1] + portHeight/2];
                        var B = this.portBounds[i];
                        if (this == sk() && isHover() || linkAtCursor != null) {
                           color(this==outSketch && i==outPort ? portHighlightColor
                                                               : portBgColor);
                           fillRect(B[0], B[1], B[2]-B[0], B[3]-B[1]);
                           color(portColor);
                           text(str, A[0], A[1], .5, .55);
                        }
                        color(this==inSketch && i==inPort ? 'red' : portColor);
                        drawRect(B[0], B[1], B[2]-B[0], B[3]-B[1]);
                     });
                  }
         _g.font = saveFont;

         // IF IN PULLDOWN MODE, SHOW THE PULLDOWN MENU.

         if (pullDownIsActive)
            pullDownDraw();

         if (isAudiencePopup() && ! isShowingGlyphs) {
            color('rgba(0,32,128,.2)');
            var msg = "AUDIENCE POPUP IS SHOWING";
            _g.font = 'bold 40pt Calibri';
            _g.fillText(msg, (w - textWidth(msg)) / 2, h - margin);
         }

         if (pieMenuIsActive && pieMenuCursorWeight == 0)
            pieMenuDraw();

         pieMenuOverlay();

         annotateEnd();
      }

      this.computePortBounds = function() {
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
      }

      this.advanceCurrentSketch = function() {

         // AFTER SKETCHING: TRANSITION SKETCH STYLE AND RESTORE CURSOR POSITION.

         if (isk() && sk().sketchState == 'in progress')
            if (sk().sketchProgress < 1) {
               var n = sk().sp.length;
               sk().cursorX = sk().sp[n-1][0];
               sk().cursorY = sk().sp[n-1][1];
            }
            else {
               var t = sCurve(sk().cursorTransition);
               cursorX = lerp(t, sk().cursorX, This().mouseX);
               cursorY = lerp(t, sk().cursorY, This().mouseY);

               sk().styleTransition  = min(1, sk().styleTransition + 1.4 * This().elapsed);
               sk().cursorTransition = min(1, sk().cursorTransition + This().elapsed);

               if (sk().cursorTransition == 1)
                  sk().sketchState = 'finished';
            }
      }

      this.drawTextModeMessage = function() {
         var w = width(), h = height();
         color('rgba(0,32,128,.07)');
         fillRect(0,0,w,h);
         _g.font = 'bold 60pt Calibri';
         var msg = isShiftPressed ? "TAP TO EXIT TEXT MODE"
                                  : "tap to exit text mode" ;
         color('rgba(0,32,128,.2)');
         _g.fillText(msg, (w - textWidth(msg)) / 2, 80);

         if (isCreatingGlyphData) {
            var str = "outputting glyphs";
            _g.fillText(str, (w - textWidth(str)) / 2, 200);
         }
      }

      this.drawTextStrokes = function() {
         if (isCreatingGlyphData || This().mousePressed) {
            var ts = This().mousePressed ? strokes[0]
                                         : strokesGlyph == null ? []
                                         : strokesGlyph.data[0];

            var isShowingShorthand = isShorthandMode && isShorthandTimeout;

            if (isDef(ts) && ts.length > 0) {
               _g.lineWidth = isShowingShorthand ? 2 : 4;
               _g.beginPath();
               var i0 = isShowingShorthand ? iOut : 0;
               if (ts.length > i0) {
                  _g.moveTo(ts[i0][0], ts[i0][1]);
                  for (var i = i0 + 1 ; i < ts.length ; i++)
                     _g.lineTo(ts[i][0], ts[i][1]);
                  _g.stroke();
               }
            }

         if (isShowingShorthand)
            this.showShorthand();
         }
      }

      this.sketchesAt = function(x, y) {
         var sketches = [];
         for (var I = nsk() - 1 ; I >= 0 ; I--)
            if (sk(I).parent == null && sk(I).contains(x,y))
               sketches.push(sk(I));
         return sketches;
      }
   }

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
            if (bgs !== undefined)
               bgActionEnd();
            bgClickCount = 0;
            return;
         }
      }
   }

   var sketchPage = sketchBook.setPage(0);


