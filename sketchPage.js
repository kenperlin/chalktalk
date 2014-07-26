
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
var menuType = 0;
var needToStartSketchDragAction = false;
var paletteColorId = 0;
var sketchToDelete = null;

// POSITION AND SIZE OF THE COLOR PALETTE ON THE UPPER LEFT OF THE SKETCH PAGE.

   function paletteX(i) { return 30 - _g.panX; }
   function paletteY(i) { return 30 + i * 30; }
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

   var sketchBook = new SketchBook();

// MOST USER INTERACTION IS MEDIATED BY THE CURRENT SKETCH PAGE.

   function SketchPage() {
      this.fadeAway = 0;
      this.paletteColorDragXY = null;
      this.sketches = [];
      this.scaleRate = 0;

      this.clear = function() { this.fadeAway = 1; }

      this.doFadeAway = function(elapsed) {
         this.fadeAway = max(0.0, this.fadeAway - elapsed / 0.25);
         _g.globalAlpha = this.fadeAway * this.fadeAway;
         if (this.fadeAway == 0.0) {
            this.clearAfterFadeAway();
            _g.sketchProgress = 1;
            _g.suppressSketching = 0;
            _g.xp0 = _g.yp0 = _g.xp1 = _g.yp1 = 0;
            _g.globalAlpha = 1.0;
         }
      }

      this.createTextSketch = function(text) {
         this.keyDown(64 + 9);            // enter text insertion mode
         this.keyUp(64 + 9);
         for (var i = 0 ; i < text.length ; i++) {
            var charCode = text.charCodeAt(i);
            this.keyDown(charCode);
            this.keyUp(charCode);
         }
         this.keyDown(27);                // exit text insertion mode
         this.keyUp(27);
         return sk();
      }
      this.createLink = function() {

         // AVOID CREATING DUPLICATE LINKS.

         if (inPort < inSketch.in.length && inSketch.in[inPort] != undefined
                                         && inSketch.in[inPort][0] == outSketch
                                         && inSketch.in[inPort][1] == outPort )
             return;

         // IF NO OUTPUT SLOTS YET, CREATE EMPTY ARRAY OF OUTPUT SLOTS.

         if (outPort >= outSketch.out.length || outSketch.out[outPort] === undefined)
            outSketch.out[outPort] = [];

         outSketch.out[outPort].push([inSketch,inPort,0]);
         inSketch.in[inPort] = [outSketch,outPort];
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

         this.isPressed = true;
         this.isClick = true;
         this.isPossibleClickOverBackground = ! isHover();
         this.travel = 0;
         this.xDown = x;
         this.yDown = y;
         this.x = x;
         this.y = y;

         if (isOnScreenKeyboard() && onScreenKeyboard.mouseDown(x,y)) {
            return;
         }

         isSketchDragActionEnabled = false;
         isBgActionEnabled = false;
         if (bgClickCount == 1) {
            if (isSketchDragActionEnabled = isHover())
               needToStartSketchDragAction = true;
            else {
               isBgActionEnabled = true;
               startBgAction(x, y);
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

         if (y >= height() - margin) {
            isBottomGesture = true;
            this.xDown = x;
            return;
         }

         if (x >= width() - margin && y >= height() - margin) {
            isTogglingMenuType = true;
            return;
         }

         if (isRightHover)
            isRightGesture = true;

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
               sk().mouseDown(x, y);
            }
         }

         // START TO DRAW A NEW SIMPLE SKETCH.

         else {
            addSketch(new SimpleSketch());
            sk().sketchProgress = 1;
            sk().sketchState = 'finished';
            sk().mouseDown(x, y);
         }
      }

      // HANDLE MOUSE DRAG FOR THE SKETCH PAGE.

      this.mouseDrag = function(x, y) {

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

         if (isSketchDragActionEnabled) {
	    if (needToStartSketchDragAction) {
	       startSketchDragAction(this.xDown, this.yDown);
	       needToStartSketchDragAction = false;
	    }
            doSketchDragAction(x, y);
            return;
         }

         if (isBgActionEnabled) {
            doBgAction(x, y);
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

         if (isBottomGesture) {
            _g.panX += x - this.xDown;
            return;
         }

         if (isRightHover && isRightGesture && ! isBottomGesture) {
            // DRAGGING TO QUICK SWITCH PAGES
            pageNumber = floor((y / (height() - margin)) * sketchPages.length);
            if (pageNumber != pageIndex)
               setPage(pageNumber);
            return;
         }

         if (isTogglingMenuType)
            return;

         if (outPort >= 0 && isDef(outSketch.defaultValue[outPort])) {
            outSketch.defaultValue[outPort] -= floor(y/10) - floor((y-dy)/10);
            this.isClick = false;
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
            if (sk().sketchProgress == 1) {
               sk().travel += len(x - sk().x, y - sk().y);
               if (sk().travel > clickSize)
                  sk().isClick = false;
               sk().x = x;
               sk().y = y;
            }
            if (outPort == -1 || sk() instanceof NumericSketch) {
               sk().mouseDrag(x, y);
            }
         }
      }

      // HANDLE MOUSE UP FOR THE SKETCH PAGE.

      this.mouseUp = function(x, y) {

         this.isPressed = false;

	 if (this.isDraggingGlyph) {
	    glyphs[this.iDragged].toSimpleSketch(This().mouseX, This().mouseY);
	    this.isDraggingGlyph = false;
	    return;
	 }

         if (isSketchDragActionEnabled) {
            endSketchDragAction(x, y);
            isSketchDragActionEnabled = false;
         }

         if (isBgActionEnabled) {
            endBgAction(x, y);
            isBgActionEnabled = false;
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

         if (isBottomGesture) {
            if (y < height() - 100)
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

         isRightGesture = false;

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
            var n = stroke.length;

            if (! isShorthandTimeout &&
                len(stroke[n-1][0] - stroke[0][0],
                    stroke[n-1][1] - stroke[0][1]) < shRadius) {

               // CLICK ON STROKE SETS THE TEXT CURSOR.

               if (isHover())
                  sk().setTextCursor(x, y);

               // CLICK NOT ON STROKE TURNS OFF TEXT MODE.

               else
                  toggleTextMode();

               strokes = [];
               return;
            }

            if (this.isClick)
               toggleTextMode();

            else if (! isShorthandMode) {
               var glyph = interpretStrokes();
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
	       var i = linkAtCursor[3][1];
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

         if (this.isClick && outPort >= 0 && bgClickCount != 1) {
            sketchAction = "linking";
            return;
         }

         // NON-EXPERT MODE: CLICK ON A SKETCH TO BRING UP ITS PULLDOWN MENU.

         if (! isExpertMode) {
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

            if (bgClickCount == 0 && sk().code != null) {
               if (isCodeWidget && codeSketch != sk())
                  toggleCodeWidget();
               codeSketch = sk();
               toggleCodeWidget();
               return;
            }

            // CLICK ON A SKETCH AFTER CLICKING ON BACKGROUND TO DO A SKETCH ACTION.

            else {
	       if (doSketchClickAction(x, y)) {
                  return;
               }
            }
         }

	 // IN ALL OTHER CASES, IGNORE PREVIOUS CLICK ON THE BACKGROUND.

         else if (bgClickCount == 1) {
            bgClickCount = 0;
            return;
         }

         // SEND UP EVENT TO THE SKETCH AT THE MOUSE.

         if (isk()) {

            if (sk().sketchProgress == 1)
               sk().isPressed = false;
            sk().isDrawingEnabled = true;
            sk().mouseUp(x, y);

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
               sk().onClick(x, y);
               return;
            }

            if (! this.isClick && isk() && isDef(sk().onSwipe)) {
               sk().onSwipe(x - this.xDown, y - this.yDown);
               return;
            }
         }

         // CLICK OVER BACKGROUND

         if (this.isClick && this.isPossibleClickOverBackground) {

            // EXPERT MODE: TWO CLICKS AT THE SAME PLACE TO BRING UP THE PIE MENU.

            if (isExpertMode || menuType == 1) {
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
            sk().translate(x - this.mx, y - this.my);
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

      this.panX = 0;
      this.panY = 0;
      this.zoom = 1;

      this.doPan = function(x, y) {
         this.panX = this.panX + (x - this.mx);
         this.panY = this.panY + (y - this.my);
      }

      // ZOOM THE SKETCH PAGE

      this.doZoom = function(x, y) {
         this.zoom *= 1 - (y - this.my) / height();
      }

      this.doHome = function() {
         this.panX = 0;
         this.panY = 0;
         this.zoom = 1;
      }

      // RESPONSE TO MOUSE MOVE WHILE IN CREATING GROUP PATH MODE.

      this.groupMouseMove = function(x, y) {
         for (var I = 0 ; I < nsk() ; I++)
            if (sk(I).parent == null && sk(I).contains(this.mx, this.my))
               group[I] = true;
         if (isk())
            sk().mouseMove(x, y);
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

         this.x = x;
         this.y = y;

         if (y >= height() - margin && ! isShowingGlyphs) {
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
         case 'p':
            //this.doPan(x, y);
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
               sk().mouseMove(x, y);
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
         case 'h':
            this.doHome();
            break;
         case 'l':
            loadGlyphArray(characterGlyphData);
            break;
         case 'u':
            unloadGlyphArray(characterGlyphData);
            break;
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
                  sk().fadeAway = 1.0;
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
         case 'e':
            toggleCodeWidget();
            break;
         case 'f':
            isAudioSignal = ! isAudioSignal;
            setAudioSignal(isAudioSignal ? function(t) { return cos(125 * TAU * t) > 0 ? 1 : -1; }
                                         : function(t) { return 0; });
            break;
         case 'g':
            this.toggleGroup();
            break;
         case 'i':
            toggleTextMode();
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
            if (! isk() || sk().sp == visible_sp)
               visible_sp = null;
            else if (isk()) {
               visible_sp = sk().sp;
               for (var i = 0 ; i < visible_sp.length ; i++)
                  console.log((i==0 ? "DISGARD " : visible_sp[i][0]==0 ? "MOVE_TO" : "LINE_TO ") + visible_sp[i]);
            }
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
         case 'z':
            break;
         case '-':
            if (backgroundColor === 'white') {
               backgroundColor = 'black';
               defaultPenColor = 'white';
            }
            else {
               backgroundColor = 'white';
               defaultPenColor = 'black';
            }

            document.getElementsByTagName('body')[0].style.backgroundColor = backgroundColor;

            background.color = backgroundColor;
            background.style.backgroundColor = backgroundColor;
            palette[0] = defaultPenColor;
            for (var i = 0 ; i < this.sketches.length ; i++)
               if (this.sketches[i].color == backgroundColor)
                  this.sketches[i].setColorId(0);

            if (codeText != null) {
               codeText.style.backgroundColor = codeTextBgColor();
               codeText.style.color = codeTextFgColor();
            }

            if (codeSelector != null) {
               codeSelector.style.backgroundColor = codeSelectorBgColor();
               codeSelector.style.color = codeSelectorFgColor();
            }

            break;
         }
      }

      this.figureOutLink = function() {

         // END ON A LINK: DELETE THE LINK.

         if (outSketch == null && linkAtCursor != null)
            deleteLinkAtCursor();

         // END ON ANOTHER SKETCH: CREATE A NEW LINK.

         else if (outSketch != null && inSketch != outSketch && inPort >= 0)
            this.createLink();

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

         for (var I = 0 ; I < nsk() ; I++) {

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

            var globalAlpha = _g.globalAlpha;
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
               _g.globalAlpha = sk().fadeAway;
            }

            if (sk().glyphTrace != null && sk().sketchState != 'finished') {
               sk().trace = [];
            }

            if (sk() instanceof Sketch2D) {
               isDrawingSketch2D = true;
               if (sk().x2D == 0) {
                  sk().x2D = This().mouseX;
                  sk().y2D = This().mouseY;
               }
               sk().render(elapsed);
               isDrawingSketch2D = false;
            }
            else {
               m.save();
                  sk().standardView();
                  sk().render(elapsed);
               m.restore();
            }

            if (sk().glyphTrace != null && sk().sketchState != 'finished') {
               morphGlyphToSketch();

               var rate = sk().glyphTransition < 0.5 ? 1 : 1.5;
               sk().glyphTransition = min(1, sk().glyphTransition + rate * elapsed);

               if (sk().glyphTransition == 1) {
                  finishDrawingUnfinishedSketch();
                  sk().glyphTrace = null;
               }
            }

            _g.restore();

            _g_sketchEnd();

	    if (sk().hasMotionPath() && skTrue.hasMotionPath() && sk().colorId == skTrue.colorId) {
	       var X = sk().motionPath[0];
	       var Y = sk().motionPath[1];
	       _g.strokeStyle = 'rgba(' + paletteRGB[sk().colorId][0] + ',' +
	                                  paletteRGB[sk().colorId][1] + ',' +
	                                  paletteRGB[sk().colorId][2] + ', 0.5)';
	       _g.lineWidth = 5;
               _g.beginPath();
	       _g.moveTo(X[0], Y[0]);
	       for (var i = 1 ; i < X.length ; i++)
	          _g.lineTo(X[i], Y[i]);
               _g.stroke();
	    }

            this.index = PUSHED_sketchPage_index;
         }

         noisy = 0;

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
            drawCodeWidget(code(), codeSketch.xlo, codeSketch.ylo,
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

      this.glyphBounds = function(i) {
         var ht = height() / 10;
         var x = ht / 20 + ht * floor(i / 10) - _g.panX;
         var y = ((i % 10) * height()) / 10 + ht / 10;
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
         fillRect(-_g.panX - 100, 0, width() + 200, height());

         _g.font = '8pt Trebuchet MS';

         this.glyphT = this.isDraggingGlyph
	             ? this.iDragged + 0.99
	             : 10 * (floor((this.mx + _g.panX) / (height()/10)) +
                             max(0, min(.99, this.my / height())));

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
	 var x = gX + (height()/10) * .1;
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

         y += height() / 45;

         var selected = t >= i && t < i+1;
         _g.strokeStyle = selected ? defaultPenColor : this.glyphColor();
         _g.fillStyle = selected ? defaultPenColor : this.glyphColor();
         _g.lineWidth = selected ? 2 : 1;

         var nn = glyph.data.length;

         var sc = height() / 2000;
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

         isShowingTimeline = isDraggingTimeline ||
                             ! isExpertMode
                          && isDef(This().overlay)
                          && ! pullDownIsActive
                          && letterPressed == '\0'
                          && This().mouseX < w - 80
                          && This().mouseY >= h - timelineH;

         // SHOW THE GLYPH DICTIONARY

         if (isShowingGlyphs) {
            this.showGlyphs();
            return;
         }

         // SHOW THE TIMELINE

         if (isShowingTimeline) {
            annotateStart();
            color('blue');
            lineWidth(2);
            drawRect(1, h-1 - timelineH, w-2, timelineH);
            annotateEnd();
            return;
         }

         annotateStart();

         // SHOW THE OPTION OF WHETHER TO USE PULLDOWN OR PIE MENU

         color('blue');
         textHeight(12);
         text("Using", w - 40, h - 30, .5, 1);
         text((menuType==0 ? "PullDown" : "Pie Menu"), w - 40, h - 10, .5, 1);

         // DRAW THE COLOR PALETTE

         drawPalette();

         color(overlayColor);

         line(w,0,w,h);
         line(0,h,w,h);

         // LIGHTLY OUTLINE ALL SKETCHES

         _g.save();
         lineWidth(.25);
         for (var i = 0 ; i < nsk() ; i++)
            sk(i).drawBounds();
         _g.restore();

         _g.save();
         _g.font = '30pt Calibri';
         _g.fillStyle = overlayScrim;
         _g.fillText("PAGE " + sketchBook.page, 60, 40);
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

         if (! isTextMode) {
            color(overlayColor);
            lineWidth(1);
            textHeight(12);
            var y0 = paletteY(palette.length);
            for (var j = 0 ; j < hotKeyMenu.length ; j++) {
               var y = y0 + j * 20;
               text(hotKeyMenu[j][0],  8, y, 0, 0);
               text(hotKeyMenu[j][1], 38, y, 0, 0);
               if (hotKeyMenu[j][0] == letterPressed)
                  drawRect(3, y - 3, 30, 20);
            }

            if (letterPressed != '\0')
               text(letterPressed + " key pressed", 5, 60, 0, 1);
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
                        var b = a.out[i][k][0];
                        var j = a.out[i][k][1];
                        var s = a.out[i][k][2];
                        drawLink(a, i, a.out[i][k], ! isAudiencePopup());
                        C = a.out[i][k][4];

                        // HIGHLIGHT LINK AT CURSOR -- IN RED IF IT IS BEING DELETED.

                        if (! this.isPressed && isMouseNearCurve(C))
                           linkAtCursor = [a, i, k, a.out[i][k]];

                        if ( linkAtCursor != null && a == linkAtCursor[0]
                                                  && i == linkAtCursor[1]
                                                  && k == linkAtCursor[2] ) {
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

   var sketchPage = sketchBook.setPage(0);

