
   // SET WIDTH AND HEIGHT OF SKETCHPAGE TO MATCH THE WIDTH AND HEIGHT OF THE COMPUTER SCREEN.

   function width () { return isDef(_g) ? _g.canvas.width  : screen.width ; }
   function height() { return isDef(_g) ? _g.canvas.height : screen.height; }
   //function height() { return 720; }
   //function height() { return 800; }

   function scrimColor(alpha) {
      return (backgroundColor == 'white' ? 'rgba(0,0,0,' : 'rgba(255,255,255,') + alpha + ')';
   }

   function bgScrimColor(alpha) {
      return (backgroundColor != 'white' ? 'rgba(0,0,0,' : 'rgba(255,255,255,') + alpha + ')';
   }

   function clientX(event) {
      if (isDef(_g.panX)) return event.clientX - _g.panX;
      return event.clientX;
   }

// INITIALIZE HANDLING OF KEYBOARD AND MOUSE EVENTS ON A CANVAS:

   var mouseMoveEvent = null;

   function initEventHandlers(canvas) {
      function getHandle(canvas) { return window[canvas.id]; }

      var handle = getHandle(canvas);
      handle.mouseX = 1000;
      handle.mouseY = 1000;
      handle.mousePressed = false;

      canvas.onkeydown = function(event) {
         var handle = getHandle(this);
         if (isDef(handle.keyDown)) {
            event = event || window.event;

            // PREVENT BROWSER FROM SCROLLING IN RESPONSE TO CERTAIN KEYS.

            switch (event.keyCode) {
            case 32: // ASCII SPACE
            case 33: // ASCII PAGE UP
            case 34: // ASCII PAGE DOWN
            case 37: // ASCII LEFT ARROW
            case 38: // ASCII UP ARROW
            case 39: // ASCII RIGHT ARROW
            case 40: // ASCII DOWN ARROW
               event.preventDefault();
               break;
            }

            handle.keyDown(event.keyCode);
         }
      }

      canvas.onkeyup = function(event) {
         var handle = getHandle(this);
         if (isDef(handle.keyUp)) {
            event = event || window.event;
            handle.keyUp(event.keyCode);
         }
      }

      canvas.onkeypress = function(event) {
         switch (event.keyCode) {
         // PREVENT DEFAULT WINDOW ACTION ON BACKSPACE.
         case 8:
             event.preventDefault();
             break;
         }
         var handle = getHandle(this);
         if (isDef(handle.keyPress)) {
            event = event || window.event;
            handle.keyPress(event.keyCode);
         }
      }

      // MOUSE PRESSED.

      canvas.onmousedown = function(event) {



         // RESPOND DIFFERENTLY TO LEFT AND RIGHT MOUSE BUTTONS

         if ((event.which && event.which !== 1) ||
             (event.button && event.button !== 1))
            return;

         if (sketchAction != null)
            return;

         if (pullDownIsActive)
            return;

         var handle = getHandle(this);
         var r = event.target.getBoundingClientRect();
         handle.mouseX = clientX(event) - r.left;
         handle.mouseY = event.clientY - r.top;
         handle.mousePressedAtX = handle.mouseX;
         handle.mousePressedAtY = handle.mouseY;
         handle.mousePressedAtTime = time;
         handle.mousePressed = true;


         if (isDef(handle.mouseDown))
            handle.mouseDown(handle.mouseX, handle.mouseY);

         _g.lastX = event.clientX;
      };

      // MAKE SURE BROWSER CATCHES RIGHT CLICK.

      canvas.oncontextmenu = function(event) {
         setTextMode(false);
         try {
            if (isMouseOverBackground)
               pullDownLabels = pagePullDownLabels;
            pullDownStart(handle.mouseX, handle.mouseY);
         } catch (e) {}
         return false;
      };

      // MOUSE RELEASED.

      canvas.onmouseup = function(event) {

         // RESPOND ONLY TO LEFT MOUSE UP, NOT TO RIGHT MOUSE UP.

         if ((event.which && event.which !== 1) ||
             (event.button && event.button !== 1))
            return;

         if (sketchAction != null) {
            switch (sketchAction) {
            case "linking":
               sketchPage.figureOutLink();
               break;
            case "translating":

               // AFTER DONE TRANSLATING A SKETCH, DO CALLBACKS IF IT DROPS ONTO OTHER SKETCHES.

               var s = sk().intersectingSketches();
               for (var i = 0 ; i < s.length ; i++) {
                  if (isDef(sk().over))
                     sk().over(s[i]);
                  if (isDef(s[i].under))
                     s[i].under(sk());
               }

               // STIll NEED TO IMPLEMENT EFFECTS OF DROPPING ONE SKETCH ONTO ANOTHER.

               if (s.length > 0) {
                  console.log(sk().glyphName + " -> " + s[0].glyphName);
                  deleteSketch(sk());
               }

               break;
            }
            sketchAction = null;
            return;
         }

         var handle = getHandle(this);
         var r = event.target.getBoundingClientRect();
         handle.mouseX = clientX(event) - r.left;
         handle.mouseY = event.clientY - r.top;
         handle.mousePressed = false;

         // UPDATE PULLDOWN MENU SELECTION ACTION.

         if (pullDownIsActive) {
            pullDownUpdate();
            return;
         }

         if (isDef(handle.mouseUp))
            handle.mouseUp(handle.mouseX, handle.mouseY);

         _g.lastX = event.clientX;
      }

      // MOUSE IS MOVED.

      canvas.onmousemove = function(event) {
         mouseMoveEvent = event;

         var handle = getHandle(this);
         var r = event.target.getBoundingClientRect();
         handle.mouseX = clientX(event) - r.left;
         handle.mouseY = event.clientY - r.top;

         //start Lobser\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

         if (handle.mousePressed) {
            globalStrokes.filler(handle.mousePressed,handle.mouseX,handle.mouseY);
            // console.log(globalStrokes.strokes);
         }
         else{
            globalStrokes.filler(handle.mousePressed,handle.mouseX,handle.mouseY);
            // console.log(globalStrokes.strokes);
         }

         //end Lobser\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_


         if (pullDownIsActive)
            return;

         // MOUSE IS BEING DRAGGED.

         if (handle.mousePressed) {
            if (sketchAction != null)
               return;

            if (isDef(handle.mouseDrag)) {
                if (len(handle.mouseX - handle.mousePressedAtX,
                        handle.mouseY - handle.mousePressedAtY) >= 1)
                   handle.mouseIsDragging = true;

                if (handle.mouseIsDragging)
                   handle.mouseDrag(handle.mouseX, handle.mouseY);
            }
         }

         // MOUSE IS BEING MOVED WITHOUT BUTTONS PRESSED.

         else if (isDef(handle.mouseMove))
            handle.mouseMove(handle.mouseX, handle.mouseY);

         // WHILE PSEUDO-SKETCHING: ADVANCE SKETCH AT SAME RATE AS MOUSE MOVEMENT.

         if (isk() && sk().sketchState == 'in progress' && sk().isDrawingEnabled
                                                        && sk().sketchProgress < 1) {
            var dx = handle.mouseX - sk().advanceX;
            var dy = handle.mouseY - sk().advanceY;
            var t = sqrt(dx*dx + dy*dy) / sk().sketchLength;
            sk().sketchProgress = min(1, sk().sketchProgress + t);
            sk().advanceX = handle.mouseX;
            sk().advanceY = handle.mouseY;
         }

         // HANDLE PANNING OF THE ENTIRE SKETCH PAGE.

         if (isPanning)
            _g.panX = min(0, _g.panX + event.clientX - _g.lastX);
         _g.lastX = event.clientX;
      }
   }

////////////////////////////////////////////////////////////////////////////////////
//////////////////////// LOGIC TO SUPPORT PSEUDO-SKETCHING /////////////////////////
////////////////////////////////////////////////////////////////////////////////////

   var noisy = 1, _nF = 0.03, _nA = 3;

   function _noise(x,y) { return noise2(x,y) + noise2(x/2,y/2) / 2; }
   function noiseX(x,y) { return _nA * _noise(_nF*x, _nF*y); }
   function noiseY(x,y) { return _nA * _noise(_nF*x, _nF*(y+128)); }

   function snx(sketch,x,y) {
      var dx = 0, dy = 0, amp = 1, seed = 0;
      if (isk() && sketch != null) {
         amp = 1 - sketch.styleTransition;
         seed = 100 * sketch.index;
         dx = sketch.tx();
         dy = sketch.ty();
         if (sketch instanceof Sketch2D) {
            dx = sketch.x2D;
            dy = sketch.y2D;
         }
      }
      return x + amp * noiseX(x - dx, y - dy + seed);
   }
   function sny(sketch,x,y) {
      var dx = 0, dy = 0, amp = 1, seed = 0;
      if (isk() && sketch != null) {
         amp = 1 - sketch.styleTransition;
         seed = 100 * sketch.index;
         dx = sketch.tx();
         dy = sketch.ty();
         if (sketch instanceof Sketch2D) {
            dx = sketch.x2D;
            dy = sketch.y2D;
         }
      }
      return y + amp * noiseY(x - dx, y - dy + seed);
   }

   function lineWidth(w) {
      if (isDef(w))
         _g.lineWidth = w;
      return _g.lineWidth;
   }

   var prev_x = 0, prev_y = 0;

   function _g_moveTo(x,y) {
      if (isDrawingSketch2D) {
         var xx = x, yy = y;
         x = sk().transformX2D(xx, yy);
         y = sk().transformY2D(xx, yy);
      }
      if (noisy <= 0) {
         _g.moveTo(x, y);
         prev_x = x;
         prev_y = y;
      }
      else
         _g_sketchTo(x, y, 0);
   }

   function _g_lineTo(x,y) {
      if (isDrawingSketch2D) {
         var xx = x, yy = y;
         x = sk().transformX2D(xx, yy);
         y = sk().transformY2D(xx, yy);
      }
      if (noisy == 0)
         _g.lineTo(x, y);
      else
         _g_sketchTo(x, y, 1);
   }

   function _g_sketchStart() {
      _g.xp1 = sk().xStart;
      _g.yp1 = sk().yStart;
      _g.inSketch = true;
   }

   function _g_sketchEnd() {
      _g.inSketch = false;
   }

   function _g_sketchTo(x, y, isLine) {

      if (! isk())
         return;

      if (isMakingGlyph) {
         if (! (sk() instanceof Sketch2D))
            y = -y;
         buildTrace(glyphInfo, x, y, isLine);
         return;
      }

      x = sk().adjustX(x);
      y = sk().adjustY(y);

      if (sk().sketchTrace != null) {
         if (sk().sketchState != 'finished' && sk().glyphTransition < 0.5)
            buildTrace(sk().trace, x, y, isLine);
         else {
            _g.lineWidth = sketchLineWidth * 0.6;
            if (! isLine)
               _g.moveTo(x, y);
            else
               _g.lineTo(x, y);
         }
         return;
      }

      var cx = x;
      var cy = y;
      var isPreview = sk().sketchState == 'in progress';

      if (_g.inSketch && _g.suppressSketching <= 0)
         sk().sp.push([x, y, isLine]);

      var xPrev = _g.suppressSketching > 0 ? _g.xp0 : _g.xp1;
      var yPrev = _g.suppressSketching > 0 ? _g.yp0 : _g.yp1;

      var dx = x - xPrev;
      var dy = y - yPrev;
      var d = sqrt(dx*dx + dy*dy);

      if (_g.inSketch && sk().sketchState == 'in progress'
                      && _g.suppressSketching <= 0) {
         sk().dSum += d;
         var t = sk().sketchProgress;
         if (t < sk().dSum / sk().sketchLength) {
            var dSave = d;
            d = t * sk().sketchLength - (sk().dSum - dSave);
            cx = xPrev + dx * d / dSave;
            cy = yPrev + dy * d / dSave;
            if (d > 0) {
               cursorX = cx;
               cursorY = cy;
            }
         }
      }

      if (! isLine) {
         var sx = snx(sk(), cx, cy);
         var sy = sny(sk(), cx, cy);
         _g.moveTo(sx, sy);
      }

      else if (d > 0) {
         for (var i = 20 ; i < d ; i += 20) {
            var xx = lerp(i/d, xPrev, cx);
            var yy = lerp(i/d, yPrev, cy);
            var sx = snx(sk(), xx, yy);
            var sy = sny(sk(), xx, yy);
            _g.lineTo(sx, sy);
         }
         var sx = snx(sk(), cx, cy);
         var sy = sny(sk(), cx, cy);
         _g.lineTo(sx, sy);
      }

      xPrev = x;
      yPrev = y;

      if (_g.suppressSketching > 0) {
         _g.xp0 = xPrev;
         _g.yp0 = yPrev;
      }
      else {
         _g.xp1 = xPrev;
         _g.yp1 = yPrev;
      }
   }

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

   function sketchToTrace(sketch) {
      var src = sketch.sp;
      var dst = [];
      for (var i = 0 ; i < src.length ; i++)
         buildTrace(dst, src[i][0], src[i][1], src[i][2]);
      return dst;
   }

   function traceComputeBounds(trace) {
      var bounds = [];
      for (var n = 0 ; n < trace.length ; n++)
         bounds.push(computeCurveBounds(trace[n]));
      return bounds;
   }

   function resampleTrace(src) {
      var dst = [];
      for (var n = 0 ; n < src.length ; n++)
         if (src[n].length > 1)
            dst.push(resampleCurve(src[n]));
      return dst;
   }

   function morphSketchToGlyphSketch(suppressTransition) {
      function drawTrace(tr) {
         _g.beginPath();
         for (var n = 0 ; n < tr.length ; n++)
            for (var i = 0 ; i < tr[n].length ; i++) {
               var x = tr[n][i][0];
               var y = tr[n][i][1];
               if (i == 0)
                  _g.moveTo(x, y);
               else
                  _g.lineTo(x, y);
            }
         _g.stroke();
      }

      var t = min(1, 2 * sk().glyphTransition);

      if (isDef(suppressTransition))
         t = 0;

      if (t == 0) {
         drawTrace(sk().sketchTrace);
         return;
      }

      if (t == 1)
         return;

      var A = sk().sketchTrace;
      var B = resampleTrace(sk().trace);

      // ADJUST FINAL SKETCH TO CREATE BEST FIT.

      if (sk().xyz.length == 0) {
         var x = 0, y = 0, z = 0, w = 0;
         for (var n = 0 ; n < B.length ; n++) {
            var xyz = bestFit(B[n], A[n]);
            var t = computeCurveLength(A[n]);
            x += t * xyz[0];
            y += t * xyz[1];
            z += t * xyz[2];
            w += t;
         }
         sk().xyz = [x / w, y / w, z / w];
      }

      var s = sCurve(t);
      var C = [];
      for (var n = 0 ; n < A.length ; n++) {
         C.push([]);
         for (var i = 0 ; i < A[n].length ; i++) {
            C[C.length-1].push([ lerp(s, A[n][i][0], B[n][i][0]),
                                 lerp(s, A[n][i][1], B[n][i][1]) ]);
         }
      }

      _g.lineWidth = sketchLineWidth * lerp(t, 1, .6);
      drawTrace(C);
   }

   function buildTrace(trace, x, y, isLine) {
      if (! isLine && (trace.length == 0 ||
                       trace[trace.length-1].length > 0))
         trace.push([]);

      trace[trace.length-1].push([x,y]);

      prev_x = x;
      prev_y = y;
   }

// GLOBAL VARIABLES.

   var PMA = 8; // PIE MENU NUMBER OF ANGLES
   var backgroundColor = 'black';
   var bgClickCount = 0;
   var bgClickX = 0;
   var bgClickY = 0;
   var defaultPenColor = backgroundColor == 'white' ? 'black' : 'white';
   var glyphInfo = [];
   var glyphSketch = null;
   var isAltKeyCopySketchEnabled = true;
   var isAltPressed = false;
   var isBottomGesture = false;
   var isExpertMode = true;
   var isMakingGlyph = false;
   var isMouseOverBackground = true;
   var isShowingMeshEdges = false;
   var isShowingPresenterView = false;
   var isShowingScribbleGlyphs = false;
   var isTextMode = false;
   var margin = 50;
   var scribbleColor = 'rgb(128, 224, 255)';
   var scribbleScale = margin;
   var sketchPadding = 10;
   var sketchTypes = [];
   var sketchAction = null;

   function gStart() {

      // PREVENT DOUBLE CLICK FROM SELECTING THE CANVAS:

      var noSelectHTML = ""
      + " <style type='text/css'>"
      + " canvas {"
      + " -webkit-touch-callout: none;"
      + " -webkit-user-select: none;"
      + " -khtml-user-select: none;"
      + " -moz-user-select: none;"
      + " -ms-user-select: none;"
      + " user-select: none;"
      + " outline: none;"
      + " -webkit-tap-highlight-color: rgba(255, 255, 255, 0);"
      + " }"
      + " </style>"
      ;
      var headElement = document.getElementsByTagName('head')[0];
      headElement.innerHTML = noSelectHTML + headElement.innerHTML;

      // ADD VIEWER ELEMENTS TO DOCUMENT

      var viewerHTML = ""
      + " <div id='slide' tabindex=1"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </div>"
      + " <div id='scene_div' tabindex=1"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </div>"
      + " <canvas id='sketch_canvas' tabindex=1"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </canvas>"
      + " <hr id='background' size=1024 color='" + backgroundColor + "'>"
      + " <div id='code'"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </div>"
      ;
      var bodyElement = document.getElementsByTagName('body')[0];
      bodyElement.innerHTML = viewerHTML + bodyElement.innerHTML;

      // SET ALL THE SCREEN-FILLING ELEMENTS TO THE SIZE OF THE SCREEN.

      slide.width = width();
      scene_div.width = width();
      sketch_canvas.width = width();

      slide.height = height();
      scene_div.height = height();
      sketch_canvas.height = height();

      background.style.backgroundColor = backgroundColor;

      // INITIALIZE THE SKETCH CANVAS

      sketch_canvas.animate = function(elapsed) { sketchPage.animate(elapsed); }
      sketch_canvas.keyDown = function(key) { sketchPage.keyDown(key); }
      sketch_canvas.keyUp = function(key) { sketchPage.keyUp(key); }
      sketch_canvas.mouseDown = function(x, y) { sketchPage.mouseDown(x, y); }
      sketch_canvas.mouseDrag = function(x, y) { sketchPage.mouseDrag(x, y); }
      sketch_canvas.mouseMove = function(x, y) { sketchPage.mouseMove(x, y); }
      sketch_canvas.mouseUp = function(x, y) { sketchPage.mouseUp(x, y); }
      sketch_canvas.overlay = function() { sketchPage.overlay(); }
      sketch_canvas.setup = function() {
         window.onbeforeunload = function(e) { sketchBook.onbeforeunload(e); }
         setPage(0);
      }

      fourStart();

      var sceneElement = document.getElementById('scene_div');
      sceneElement.appendChild(renderer.domElement);

      // START ALL CANVASES RUNNING

      var c = document.getElementsByTagName("canvas");
      for (var i = 0 ; i < c.length ; i++)
          if (c[i].getAttribute("data-render") != "gl")
             startCanvas(c[i].id);
   }

   var updateScene = 0, pixelsPerUnit = 97;

   function This() { return window[_g.name]; }

   function startCanvas(name) {
      if (name.length == 0)
         return;

      window.requestAnimFrame = (function(callback) {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function(callback) { window.setTimeout(callback, 1000 / 60); }; })();
      var _canvas = document.getElementById(name);
      var g = _canvas.getContext('2d');
      g.textHeight = 12;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.canvas = _canvas;
      g.name = name;
      sketchPage.clear();

      initEventHandlers(_canvas);

      if (isDef(window[g.name].setup)) {
         _g = g;
         _g.clearRect(0, 0, _g.canvas.width, _g.canvas.height);
         This().setup();
      }

      pixelsPerUnit = 5.8 * height() / cameraFOV;

      // LOAD ALL THE SCRIBBLE GLYPHS.

      for (var n = 0 ; n < 26 ; n++) {
         // NEED TO ADD INDIVIDUAL CHARACTERS
      }

      function nameToGlyph(name) {
         var scribble = new Scribble(name);
	 var glyph = new Glyph(name, [scribble]);
	 glyph.scribbleLength = computeCurveLength(scribble);
	 return glyph;
      }

      for (var n = 0 ; n < glyphs.length ; n++) {
         var name = glyphs[n].indexName;
         scribbleGlyphs.push(nameToGlyph(name));
      }

      for (var n = 0 ; n < scribbleNames.length ; n++) {
         var name = scribbleNames[n];
         if (glyphIndex(scribbleGlyphs, name) == -1)
            addGlyph(scribbleGlyphs, nameToGlyph(name));
      }

      tick(g);
   }

   var sketchType = 0;
   var pageIndex = 0;

   function colorToRGB(colorName) {
      var R = 0, G = 0, B = 0;
      switch (colorName) {
      case 'white'  : R = 0.9; G = 0.9; B = 0.9; break;
      case 'black'  : R = 0.7; G = 0.7; B = 0.7; break;
      case 'red'    : R = 1.0; G = 0.0; B = 0.0; break;
      case 'orange' : R = 1.0; G = 0.5; B = 0.0; break;
      case 'green'  : R = 0.0; G = 0.6; B = 0.0; break;
      case 'blue'   : R = 0.0; G = 0.0; B = 1.0; break;
      case 'magenta': R = 1.0; G = 0.0; B = 1.0; break;
      default       : R = 0.5; G = 0.2; B = 0.1; break;
      }
      return [R, G, B];
   }

   function drawPalette(context) {
      if (context == undefined)
         context = _g;

      var w = width(), h = height(), nc = palette.length;

      annotateStart(context);
      for (var n = 0 ; n < nc ; n++) {
         var x = paletteX(n);
         var y = paletteY(n);
         var r = paletteR(n);

         context.fillStyle = palette[n];
         context.beginPath();
         context.moveTo(x - r, y - r);
         context.lineTo(x + r, y - r);
         context.lineTo(x + r, y + r);
         context.lineTo(x - r, y + r);
         context.fill();
      }
      annotateEnd(context);
   }

   var hotKeyMenu = [
      ['a'  , "toggle audience"],
      ['b'  , "bend line"],
      ['c'  , "toggle card"],
      ['d'  , "show/hide data"],
      ['e'  , "edit code"],
      ['g'  , "group/ungroup"],
      ['h'  , "home"],
      ['i'  , "insert text"],
      ['k'  , "toggle 3d box"],
      ['m'  , "toggle menu type"],
      ['n'  , "negate card color"],
      ['o'  , "output glyphs"],
      ['p'  , "pan"],
      ['r'  , "rotating"],
      ['s'  , "scaling"],
      ['t'  , "translating"],
      ['w'  , "toggle whiteboard"],
      ['x'  , "toggle expert mode"],
      ['y'  , "toggle scribble glyphs"],
      ['z'  , "zoom"],
      ['-'  , "b/w <-> w/b"],
      ['='  , "show glyphs"],
      ['spc', "quick help menu"],
      ['alt', "clone"],
      ['del', "remove last stroke"],
      [U_ARROW, "previous page"],
      [D_ARROW, "next page"],

   ];

   var cloneObject = null;
   var dataColor = 'rgb(128,128,128)'
   var dataLineWidth = 2.4;
   var globalSketchId = 0;
   var group = {};
   var groupLineWidth = 8;
   var groupPath = [];
   var linkDeleteColor = 'rgba(255,0,0,.1)';
   var linkHighlightColor = 'rgba(0,192,96,.2)';
   var liveDataColor = 'rgb(128,192,255)'
   var overlayColor = 'rgb(0,64,255)';
   var overlayScrim = 'rgba(0,64,255,.25)';
   var portColor = 'rgb(0,192,96)';
   var portBgColor = backgroundColor;
   var portHeight = 24;
   var portHighlightColor = 'rgb(192,255,224)';
   var sketchLineWidth = 4;

   function addSketchOfType(i) {
      eval("addSketch(new " + sketchTypes[i] + "())");
   }

   function sketchTypeToCode(type, selection) {
      return "sg('" + type + "','" + selection + "')";
   }

   function registerSketch(type) {

      var names = [];

      // CREATE A TEMPORARY INSTANCE OF THIS SKETCH TYPE.

      eval("addSketch(new " + type + "())");
      sketchTypeLabels.push(sk().labels);

      // RENDER EACH OF ITS SELECTIONS ONCE TO CREATE GLYPH INFO.

      for (var n = 0 ; n < sk().labels.length ; n++) {
         sk().setSelection(sk().labels[n]);

         // CREATE GLYPH SHAPE INFO.

         glyphInfo = [];
         isMakingGlyph = true;
         sk().render(0.02);
         isMakingGlyph = false;

         // REGISTER THE GLYPH.

         var code = sketchTypeToCode(type, sk().labels[n]);
	 names.push(registerGlyph(code, glyphInfo, sk().labels[n]));
      }

      // FINALLY, DELETE THE SKETCH.

      deleteSketch(sk());

      return names;
   }

   // CREATE AN INSTANCE OF A REGISTERED SKETCH TYPE.

   function sg(type, selection) {
      var bounds = computeGlyphSketchBounds();
      This().mouseX = (bounds[0] + bounds[2]) / 2;
      This().mouseY = (bounds[1] + bounds[3]) / 2;

      eval("addSketch(new " + type + "())");

      sk().width = bounds[2] - bounds[0];
      sk().height = bounds[3] - bounds[1];
      sk().setSelection(selection);
      if (glyphSketch != null) {
         sk().sketchTrace = resampleTrace(sketchToTrace(glyphSketch));
         sk().glyphTransition = 0;
         sk().trace = [];
      }
      else
         sk().glyphTransition = 1;

      sk().size = 2 * max(sk().width, sk().height);

      if (sk().computeStatistics != null)
         sk().computeStatistics();
   }

   function drawGroupPath(groupPath) {
      if (groupPath == null)
         return;
      color('rgba(255,1,0,.3)');
      lineWidth(groupLineWidth);
      _g.beginPath();
      for (var i = 0 ; i < groupPath.length ; i++) {
         var x = groupPath[i][0];
         var y = groupPath[i][1];
         if (i == 0)
            _g.moveTo(x,y);
         else
            _g.lineTo(x,y);
      }
      _g.stroke();
   }

/////////////////////////////////////////////////////////////////////
/////////////////////// LINKS AND DATA PORTS ////////////////////////
/////////////////////////////////////////////////////////////////////

   function computeLinkCurvature(link, C) {
      var a = link[0];
      var i = link[1];
      var b = link[3][0];
      var j = link[3][1];
      link[3][2] = computeCurvature(a.portXY(i), C, b.portXY(j));
      link[3][3] = undefined;
   }

   var portDataValues = [], outSketchPrev = null, outPortPrev = -1;

   function drawPortData(sketch, port, dataValues, isAlwaysDrawing) {
      if (isAlwaysDrawing === undefined || ! isAlwaysDrawing) {
         var lo = 100000, hi = -100000;
         for (var i = 0 ; i < dataValues.length ; i++) {
            lo = min(lo, dataValues[i]);
            hi = max(hi, dataValues[i]);
         }
         if (hi - lo < 0.1)
            return;
      }

      var xy = sketch.portXY(port);

      lineWidth(1);
      _g.beginPath();
      for (var i = 0 ; i < dataValues.length ; i++) {
         var x = xy[0] + 2 * i;
         var y = xy[1] - 2 * 30 * dataValues[i];
         if (i == 0)
            _g.moveTo(x, y);
         else
            _g.lineTo(x, y);
      }
      _g.stroke();
   }

   function drawLink(a, i, linkData, isVisible) {
      var b = linkData[0];
      var j = linkData[1];
      var s = linkData[2];

      var A = a.portXY(i), ax = A[0], ay = A[1];
      var B = b.portXY(j), bx = B[0], by = B[1];

      var aR = a.portName.length > 0 ? a.portBounds[i] : [a.xlo,a.ylo,a.xhi,a.yhi];
      var bR = b.portName.length > 0 ? b.portBounds[j] : [b.xlo,b.ylo,b.xhi,b.yhi];

      // ONLY RECOMPUTE LINK SHAPE WHEN NECESSARY.

      var status = [ax,ay,bx,by,s, aR[0],aR[1],aR[2],aR[3], bR[0],bR[1],bR[2],bR[3]];
      if (! isEqualArray(status, linkData[3])) {
         linkData[3] = status;

         linkData[4] = createCurve(A, B, s);

         function clipCurveAgainstRect(src, R) {
            if (src[0] == undefined) return [];
            var dst = [];
            var x1 = src[0][0];
            var y1 = src[0][1];
            if (! isInRect(x1,y1, R))
               dst.push([x1,y1]);
            for (var n = 1 ; n < src.length ; n++) {
               var x0 = x1, y0 = y1;
               x1 = src[n][0];
               y1 = src[n][1];
               var draw0 = ! isInRect(x0,y0, R);
               var draw1 = ! isInRect(x1,y1, R);
               if (draw0 || draw1) {
                  if (! draw0)
                     dst.push(clipLineToRect(x0,y0, x1,y1, R));
                  if (! draw1)
                     dst.push(clipLineToRect(x1,y1, x0,y0, R));
                  else
                     dst.push([x1,y1]);
               }
            }
            return dst;
         }

         linkData[4] = clipCurveAgainstRect(linkData[4], aR);
         linkData[4] = clipCurveAgainstRect(linkData[4], bR);
      }

      if (isVisible) {
         lineWidth(dataLineWidth);
         color(dataColor);
         var C = linkData[4];
         for (var n = 0 ; n < C.length-1 ; n++)
            if (n < C.length-2)
               line(C[n][0], C[n][1], C[n+1][0], C[n+1][1]);
            else
               arrow(C[n][0], C[n][1], C[n+1][0], C[n+1][1]);

         if (b.portName.length == 0 && (! b.isNullText() || b.code != null)) {
            var cx = (ax + bx) / 2 + (ay - by) * s;
            var cy = (ay + by) / 2 + (bx - ax) * s;
            color(backgroundColor);
            fillOval(cx - 13, cy - 13, 26, 26);
            color(dataColor);
            textHeight(16);
            text(j==0 ? "x" : j==1 ? "y" : "z", cx, cy - (j==1?3:1), .5, .6, 'Arial');
            lineWidth(1);
            drawOval(cx - 13, cy - 13, 26, 26);
         }
      }
   }

   function drawPossibleLink(s, x, y) {
      lineWidth(dataLineWidth);
      color(dataColor);
      var xy = s.portXY(outPort);
      arrow(xy[0], xy[1], x, y);
   }

   function findOutSketchAndPort() {
      outSketch = isHover() ? sk() : null;
      outPort = -1;
      if (outSketch != null) {
         outPort = findPortAtCursor(outSketch);
         inSketch = null;
         inPort = -1;
      }
   }

   function findInSketchAndPort() {
      inSketch = null;
      inPort = -1;
      for (var I = nsk() - 1 ; I >= 0 ; I--)
         if (isLinkTargetSketch(sk(I))) {
            if ((inPort = findNearestInPort(sk(I))) >= 0)
               inSketch = sk(I);
            break;
         }
   }

   function isLinkTargetSketch(s) {
      return s != outSketch && s.parent == null
                            && s.contains(sketchPage.mx, sketchPage.my);
   }

   var linkAtCursor = null;
   var outSketch = null, inSketch = null;
   var outPort = -1, inPort = -1;

   function findNearestInPort(sketch) {
      return sketch == null ? -1 :
             sketch.portName.length > 0 ? findNearestPortAtCursor(sketch, sketch.in)
                                        : findEmptySlot(sketch.in);
   }

   function findNearestOutPort(sketch) {
      return sketch.portName.length > 0 ? findNearestPortAtCursor(sketch) : 0;
   }

   function findNearestPortAtCursor(sketch, slots) {
      var x = This().mouseX;
      var y = This().mouseY;
      var n = -1, ddMin = 10000;
      for (var i = 0 ; i < sketch.portName.length ; i++)
         if ((slots === undefined) || slots[i] == null) {
            var xy = sketch.portXY(i);
            var dd = (xy[0]-x)*(xy[0]-x) + (xy[1]-y)*(xy[1]-y);
            if (dd < ddMin) {
               n = i;
               ddMin = dd;
            }
         }
      return n;
   }

   function findPortAtCursor(sketch, slots) {
      if (sketch instanceof NumericSketch ||
          sketch instanceof SimpleSketch &&
                 (! sketch.isNullText() || isDef(sketch.inValue[0])))
         return sketch.isMouseOver ? 0 : -1;
      var x = This().mouseX;
      var y = This().mouseY;
      for (var i = 0 ; i < sketch.portName.length ; i++)
         if ((slots === undefined) || slots[i] == null) {
            var xy = sketch.portXY(i);
            if ( x >= xy[0] - portHeight/2 && x < xy[0] + portHeight/2 &&
                 y >= xy[1] - portHeight/2 && y < xy[1] + portHeight/2 )
               return i;
         }
      return -1;
   }

   function deleteLinkAtCursor() {
      var a = linkAtCursor[0];
      var i = linkAtCursor[1];
      var k = linkAtCursor[2];
      var b = linkAtCursor[3][0];
      var j = linkAtCursor[3][1];

      deleteOutLink(a, i, k);
      deleteInLink(b, j);
   }

   function deleteOutLink(s, i, k) {
      s.out[i].splice(k, 1);
      if (s.out[i].length == 0)
         s.outValue[i] = undefined;
   }

   function deleteInLink(s, j) {
      s.in[j] = undefined;
      s.inValue[j] = undefined;
      if (s instanceof SimpleSketch && s.isNullText() && s.sp0.length <= 1)
         deleteSketch(s);
   }

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

   function finishDrawingUnfinishedSketch() {
      if (! pullDownIsActive && isk()
                           && ! isHover()
                           && sk().sketchState != 'finished') {
         finishSketch();
      }
   }

   function finishSketch() {
      sk().sketchProgress = 1;
      sk().cursorTransition = 1;
      sk().styleTransition = 1;
      sk().sketchState = 'finished';
   }

   function isFinishedDrawing() {
      return isk() && sk().sketchState == 'finished';
   }

   function isMouseNearCurve(c) {
      return dsqFromCurve(This().mouseX, This().mouseY, c) < 10 * 10;
   }

   function moveChildren(children, dx, dy) {
      for (var i = 0 ; i < children.length ; i++) {
         children[i].tX += dx;
         children[i].tY += dy;
         children[i].textX += dx;
         children[i].textY += dy;
         if (children[i] instanceof Sketch2D) {
            children[i].x2D += dx;
            children[i].y2D += dy;
         }
      }
   }

   function setTextMode(state) {
      isTextMode = state;
      return isTextMode;
   }

   function toggleTextMode(sketch) {
      if (setTextMode(! isTextMode)) {
         isShiftPressed = false;
         if (sketch === undefined) {
            addSketch(new SimpleSketch());
            sk().sketchProgress = 1;
            sk().sketchState = 'finished';
            sk().textX = sk().tX = This().mouseX;
            sk().textY = sk().tY = This().mouseY;
         }
         else if (sk().text.length == 0) {
            sketch.textX = sk().tx();
            sketch.textY = sk().ty();
         }
      }
   }

   var strokes = [];
   var strokesStartTime = 0;
   var strokesGlyph = null;

   function findGlyph(strokes, glyphs) {
      if (strokes.length == 0 || strokes[0].length < 2)
         return null;

      strokesGlyph = new Glyph("", strokes);

      if (isCreatingGlyphData)
         console.log(strokesGlyph.toString());

      var bestMatch = 0;
      var bestScore = 10000000;
      for (var i = 0 ; i < glyphs.length ; i++) {

         if (glyphs[i].scribbleLength !== undefined && strokesGlyph.scribbleLength === undefined)
	    strokesGlyph.scribbleLength = computeCurveLength(strokes[0]) / scribbleScale;

         var score = strokesGlyph.compare(glyphs[i]);
         if (score < bestScore) {
            bestScore = score;
            bestMatch = i;
         }
      }
      return glyphs[bestMatch];
   }

   function strokesComputeBounds(src, i0) {
      if (i0 === undefined) i0 = 0;
      var xlo = 10000, ylo = xlo, xhi = -xlo, yhi = -ylo;
      for (var n = 0 ; n < src.length ; n++)
         for (var i = i0 ; i < src[n].length ; i++) {
            xlo = min(xlo, src[n][i][0]);
            ylo = min(ylo, src[n][i][1]);
            xhi = max(xhi, src[n][i][0]);
            yhi = max(yhi, src[n][i][1]);
         }
      return [xlo,ylo,xhi,yhi];
   }

   function strokesNormalize(src) {
      var B = strokesComputeBounds(src);
      var cx = (B[0] + B[2]) / 2;
      var cy = (B[1] + B[3]) / 2;
      var scale = 1 / max(B[2] - B[0], B[3] - B[1]);
      var dst = [];
      for (var n = 0 ; n < src.length ; n++) {
         dst.push([]);
         for (var i = 0 ; i < src[n].length ; i++)
            dst[n].push([ (src[n][i][0] - cx) * scale,
                          (src[n][i][1] - cy) * scale ]);
      }
      return dst;
   }

   function unregisterGlyph(indexName) {
       for (var i = 0 ; i < glyphs.length ; i++)
          if (indexName == glyphs[i].indexName)
             glyphs.splice(i--, 0);
   }

   function registerGlyph(name, strokes, indexName) {
       if (indexName === undefined) {
          indexName = name;

          var j = indexName.indexOf('Sketch');
          if (j > 0)
             indexName = indexName.substring(0, j);

          var j = indexName.indexOf('(');
          if (j > 0)
             indexName = indexName.substring(0, j);
       }

       for (var i = 0 ; i < glyphs.length ; i++)
          if (indexName == glyphs[i].indexName)
             return;

if (name.indexOf("sg(") < 0 && typeof(strokes[0]) != 'string') {
   console.log(name);
   for (var n = 0 ; n < strokes.length ; n++)
      for (var i = 0 ; i < strokes[n].length ; i++)
         strokes[n][i][1] *= -1;
}

       var glyph = new Glyph(name, strokes);
       glyph.indexName = indexName;

       for (var i = 0 ; i < glyphs.length ; i++)
          if (indexName < glyphs[i].indexName) {
             glyphs.splice(i, 0, glyph);
             return glyph.indexName;
          }

       glyphs.push(glyph);
       return glyph.indexName;
   }

   function Glyph(name, src) {

      this.toString = function() {
         var str = '"' + this.name + '",\n';
         str += '[';
         for (var n = 0 ; n < this.data.length ; n++) {
            str += '"';
            for (var i = 0 ; i < this.data[n].length ; i++)
               str += ef.encode(this.data[n][i][0] / 100)
                    + ef.encode(this.data[n][i][1] / 100);
            str += '",';
         }
         str += '],';
         return str;
      }

      this.compare = function(other) {
         if (this.data.length != other.data.length)
            return 1000000;
         var score = 0;
         for (var n = 0 ; n < this.data.length ; n++) {
            for (var i = 0 ; i < this.data[n].length ; i++) {
               var dx = this.data[n][i][0] - other.data[n][i][0];
               var dy = this.data[n][i][1] - other.data[n][i][1];
               score += dx * dx + dy * dy;
            }

	    // IF GLYPHS ARE SCRIBBLES, THEY NEED TO BE OF SIMILAR LENGTH.

	    if ( this.scribbleLength  !== undefined && this.scribbleLength  > 0 &&
	         other.scribbleLength !== undefined && other.scribbleLength > 0 ) {
	       var ratio = other.scribbleLength / this.scribbleLength;
	       score *= max(ratio, 1 / ratio);
	    }
         }
         return score;
      }

      this.toSimpleSketch = function(tx, ty, sc) {
         var s = new SimpleSketch();
         for (var n = 0 ; n < this.data.length ; n++)
            for (var i = 0 ; i < this.data[n].length ; i++) {
               var x1 = sc * this.data[n][i][0] - 50;
               var y1 = sc * this.data[n][i][1] - 50;
               var x = x1 + 2*sc * noise2(x1 / 30, y1 / 30);
               var y = y1 + 2*sc * noise2(x1 / 30, y1 / 30 + 100);
               s.sp0.push([x,y]);
               s.sp.push([x,y,i>0]);
            }
         sketchPage.add(s);
         finishSketch();
         s.setColorId(sketchPage.colorId);
         s.tX = tx;
         s.tY = ty;
      }

      this.toSketch = function() {

         // IF A '(' IS FOUND, CALL A FUNCTION.

         if (this.name.indexOf('(') > 0) {
            eval(this.name);
         }

         // IF GLYPH IS A DIGIT, CREATE A NUMBER OBJECT.

         else if (isNumber(parseInt(this.name))) {
            var s = new NumericSketch();
            addSketch(s);
            s.init(this.name, sketchPage.x, sketchPage.y);
            s.textCursor = s.text.length;
            setTextMode(true);
         }

         // DEFAULT: CREATE A TEXT OBJECT.

         else if (this.name != 'del') {
            sketchPage.createTextSketch(this.name);
            setTextMode(true);
         }

         // USE THE TYPE OF THIS GLYPH TO DEFINE A GLYPH NAME FOR THE SKETCH.

         sk().glyph = this;
         sk().glyphName = this.indexName;
      }

      this.name = name;
      this.data = [];

      if (src.length > 0 && typeof(src[0]) == 'string') {
         for (var n = 0 ; n < src.length ; n++) {
            this.data.push([]);
            for (var i = 0 ; i < src[n].length ; i += 2)
               this.data[n].push([ 100 * ef.decode(src[n].substring(i,i+1)),
                                   100 * ef.decode(src[n].substring(i+1,i+2)) ]);
         }
         return;
      }

      var N = 100;

      // MOVE AND SCALE STROKES TO FIT WITHIN A UNIT SQUARE.

      var strokes = strokesNormalize(src);

      for (var n = 0 ; n < strokes.length ; n++) {

         // RESCALE EACH STROKE TO FIT WITHIN A 100x100 PIXEL SQUARE.

         var stroke = strokes[n];
         for (var i = 0 ; i < stroke.length ; i++) {
            stroke[i][0] = 50 + 100 * stroke[i][0];
            stroke[i][1] = 50 + 100 * stroke[i][1];
         }

         // COMPUTE FRACTIONAL LENGTHS ALONG STROKE.

         var ns = stroke.length;

         var f = [0], sum = 0;
         for (var i = 1 ; i < ns ; i++)
             f.push(sum += len(stroke[i][0] - stroke[i-1][0],
                               stroke[i][1] - stroke[i-1][1]));
         for (var i = 0 ; i < ns ; i++)
             f[i] /= sum;

         // RESAMPLE TO 100 EQUAL-LENGTH SAMPLES.

         this.data.push([]);
         var i = 0;
         for (var j = 0 ; j < N ; j++) {
            var t = j / (N-1);
            while (i < ns && f[i] <= t)
               i++;
            if (i == ns) {
               this.data[n].push([stroke[ns-1][0], stroke[ns-1][1]]);
               break;
            }
            var u = (t - f[i-1]) / (f[i] - f[i-1]);
            if (i == 0)
               this.data[n].push([stroke[i][0], stroke[i][1]]);
            else
               this.data[n].push([lerp(u, stroke[i-1][0], stroke[i][0]),
                                  lerp(u, stroke[i-1][1], stroke[i][1])]);
         }
      }
   }

   var isCreatingGlyphData = false;

   function shift(textChar) {
      if (isShiftPressed && textChar.length == 1) {
         var ch = textChar.charCodeAt(0);
         textChar = String.fromCharCode(ch - 32);
      }
      else if (isNumericShorthandMode && textChar.length == 1) {
         var ch = textChar.charCodeAt(0);
         textChar = String.fromCharCode(ch - 64);
      }
      return textChar;
   }

   var isBgActionEnabled = false;
   var isSketchDragEnabled = false;
   var sketchDragMode = 0;
   var sketchDragActionXY = [0,0];
   var sketchDragActionSize = [0,0];

/////////////////////// HANDLE BACKGROUND SCRIBBLES /////////////////////////

   //var scribbleNames = "a b c d e f g h i j k l m n o p q r s t u v w x y z now is the time for all good men to come aid of their party C D N P".split(' ');
   var scribbleNames = "a b c d e f g h i j k l m n o p q r s t u v w x y z C D N P".split(' ');
   var scribbleGlyphs = [];

//        3stu4
//   5vCw6     1_r_2
//
// 7xDy8         mnopq
//
//   9zab0     jhilk
//        cdefg

   function Scribble(str) {
      var charIndex = "9zab0 cdefg jhilk mnopq 1ArB2 3stu4 5vCw6 7xDy8";
      var charDir   = "55555 66666 77777 00000 11111 22222 33333 44444";
      var charShape = "<(|)> <(|)> <(|)> <(|)> <(|)> <(|)> <(|)> <(|)>";
      var s = [[0,0]];
      for (var i = 0 ; i < str.length ; i++) {
         var ch = str.substring(i, i+1);
         var n = charIndex.indexOf(ch);
         var dir = -charDir.substring(n, n+1);
         var shape = charShape.substring(n, n+1);
         var C = cos(TAU * dir / 8);
         var S = sin(TAU * dir / 8);
         function xf(pts, xy) {
            for (var k = 0 ; k < pts.length ; k++) {
               var x = pts[k][0], y = pts[k][1];
               pts[k][0] = xy[0] + C * x - S * y;
               pts[k][1] = xy[1] + S * x + C * y;
            }
            return pts;
         }
         function arced(c) {
            var p = [];
            for (var k = 1 ; k <= 10 ; k++) {
               var t = k / 10;
               p.push([t, c * t * (1 - t) * 1.3]);
            }
            return p;
         }
         function curly(c) {
            var p = [];
            for (var k = 1 ; k <= 10 ; k++) {
               var t = k / 10;
               var x = t + sin(TAU * t) / 2.5;
               var y = c * (1 - cos(TAU * t)) / 4;
               p.push([x, y]);
            }
            return p;
         }
         var ep = s[s.length - 1];
         switch (shape) {
         case "<": s = s.concat(xf(curly( 1), ep)); break;
         case "(": s = s.concat(xf(arced( 1), ep)); break;
         case "|": s = s.concat(xf(arced( 0), ep)); break;
         case ")": s = s.concat(xf(arced(-1), ep)); break;
         case ">": s = s.concat(xf(curly(-1), ep)); break;
         }
      }
      return s;
   }

   function glyphIndex(glyphs, name) {
      for (var i = 0 ; i < glyphs.length ; i++)
         if (glyphs[i].name == name)
	    return i;
      return -1;
   }

   function addGlyph(glyphs, glyph) {
      for (var i = 0 ; i < glyphs.length ; i++)
         if (glyph.name < glyphs[i].name) {
            glyphs.splice(i, 0, glyph);
            return;
         }
      glyphs.push(glyph);
   }

   function BgScribble(x, y) {
      this.path = [[x,y]];
      this.index = 0;
      this.draw = function() {
         color(scribbleColor);

         lineWidth(1);
         var r = margin / 5;
         drawOval(this.path[0][0] - r, this.path[0][1] - r, 2 * r, 2 * r);

         lineWidth(0.5);
         drawCurve(this.path);
      }
      this.drag = function(x, y) {
         this.path.push([x, y]);
      }
      this.interpret = function() {
         var glyph = findGlyph([this.path], scribbleGlyphs);
	 scribbleScale = lerp(0.1, scribbleScale, computeCurveLength(this.path) / glyph.pathLength);
         return glyph == null ? "" : glyph.name;
      }
   }
   var bgs, bgsText = "", bgsTextUndo = [];
   var isBgsDelete = false, isBgsShift = false, isBgsNumeric = false;

   function bgActionDown(x, y) {

      // IF ALREADY IN SCRIBBLE-TEXT MODE, START NEXT WORD.

      if (bgs !== undefined)
         bgs.path[0] = [x, y];

      // ELSE IF LINE STARTS AT CLICK, ENTER SCRIBBLE-TEXT MODE.

      else if (len(x - bgClickX, y - bgClickY) < clickSize) {
         bgs = new BgScribble(x, y);
         bgsText = "";
         bgsTextUndo = [];
	 sketchPage.beginTextSketch();
      }
   }

   function bgActionDrag(x, y) {

      // ADD NEXT POINT TO SCRIBBLE-TEXT STROKE.

      if (bgs !== undefined)
         bgs.drag(x, y);
   }

   function bgActionUp(x, y) {

      // HANDLE A SCRIBBLE-TEXT STROKE.

      if (bgs !== undefined) {
         var str = bgs.interpret();
	 switch (str) {
	 case "C":
	    isBgsShift = true;
	    break;
	 case "D":
            if (bgsTextUndo.length > 0) {
	       bgsText = bgsTextUndo.splice(bgsTextUndo.length - 1, 1)[0];
               sk().setText(bgsText);
               sk().textCursor = bgsText.length;
            }
	    break;
	 default:
	    bgsTextUndo.push(bgsText);
	    if (bgsText.length > 0 && str.length > 1)
	       bgsText += " ";
            if (isBgsShift) {
	       str = str.substring(0, 1).toUpperCase() + str.substring(1, str.length);
	       isBgsShift = false;
	    }

            if (bgsText.length == 0)
	       for (var n = 0 ; n < glyphs.length ; n++)
	          if (str == glyphs[n].indexName) {
                     sk().setText(str);
		     convertTextSketchToGlyphSketch(sk(), bgClickX, bgClickY);
		     bgActionEnd();
		     return;
	          }

            bgsText += str;
            sk().setText(bgsText);
            sk().textCursor = bgsText.length;
	    break;
         }
         bgs = new BgScribble(x, y);
         return;
      }

      var x0 = bgClickX;
      var y0 = bgClickY;
      var x1 = sketchPage.xDown;
      var y1 = sketchPage.yDown;

      var n1 = pieMenuIndex(x0 - x1, y0 - y1, 8);

      // n1 = POSITION OF THE FIRST CLICK WRT THE SECOND CLICK.

      if (len(x - x1, y - y1) < clickSize) {
         bgGesture(n1);
         return;
      }

      var sketches = sketchPage.sketchesAt(x, y);
      if (sketches.length == 0)

         // POSITION OF START OF SWIPE WRT END OF SWIPE.

         bgGesture(n1, pieMenuIndex(x1 - x, y1 - y, 8));

      else {

         // POSITION OF START OF SWIPE WRT CENTER OF THE SKETCH.

         var s = sketches[0];
         bgGesture(n1, pieMenuIndex(x1 - s.cx(), y1 - s.cy(), 8), s);
      }
   }

   function bgActionEnd(x, y) {

      // ACT ON SCRIBBLE-TEXT, THEN EXIT SCRIBBLE-TEXT MODE.

      bgsText = bgsText.trim();
      bgs = undefined;
      bgsText = "";
      bgsTextUndo = [];
      setTextMode(false);
   }

/////////////////////////////////////////////////////////////////////////////

   function directionsToPage(n1, n2) { return 8 * n1 + n2; }
   function pageToDirections(page) { return [ floor(page / 8), page % 8 ]; }

   // THIS NEEDS TO BE BUILD OUT INTO A FLEXIBLE PROGRAMMER DEFINED MAPPING.

   function bgGesture(n1, n2, s) {
      if (n2 === undefined) {
         console.log(n1);
         switch (n1) {
         case 2: setPage(pageIndex - 1); break;
         case 6: setPage(pageIndex + 1); break;
         }
      }
      else if (s === undefined)
         setPage(directionsToPage(n1, n2));
      else
         console.log("BG SWIPE TO SKETCH " + n1 + " " + n2 + " [" + s.glyphName + "]");
   }

   function startSketchDragAction(x, y) {
      sketchDragMode = pieMenuIndex(bgClickX - x, bgClickY - y, 8);
      switch (sketchDragMode) {
      case 2:
         sk().motionPath = [[x],[y]];
         sketchPage.definingMotion = sk().colorId;
         break;
      case 3:
         sketchDragActionXY = [x,y];
         sketchDragActionSize = [sk().xhi - sk().xlo, sk().yhi - sk().ylo];
         break;
      }
   }

   function doSketchDragAction(x, y) {
      switch (sketchDragMode) {
      case 2:
         sk().motionPath[0].push(x);
         sk().motionPath[1].push(y);
         break;
      case 3:
         var dx = x - sketchDragActionXY[0];
         var dy = y - sketchDragActionXY[1];
         if ( abs(dx) > sketchDragActionSize[0] ||
              abs(dy) > sketchDragActionSize[1] ) {
            copySketch(sk());
            sketchDragActionXY[0] = x;
            sketchDragActionXY[1] = y;
         }
         break;
      }
   }

   function endSketchDragAction(x, y) {
      switch (sketchDragMode) {
      case 2:
         delete sketchPage.definingMotion;
         break;
      }
   }

   function doSketchClickAction(x, y) {
      if (bgClickCount != 1 || ! isHover())
         return false;

      // CLICK ON A SKETCH AFTER CLICK OVER THE BACKGROUND: DO SPECIAL ACTIONS.

      bgClickCount = 0;

      var index = pieMenuIndex(bgClickX - x, bgClickY - y, 8);
      switch (index) {
      case 0:
         sk().fadeAway = 1;             // E -- FADE TO DELETE
         break;
      case 1:
         if (sk() instanceof SimpleSketch && ! (sk() instanceof GeometrySketch)
                                          && ! (sk() instanceof NumericSketch ))
            sk().isGlyphable = ! sk().isGlyphable;
         else if (sk().glyph !== undefined) {
            sk().fadeAway = 1;
            sk().glyph.toSimpleSketch(sk().cx(), sk().cy(), sk().size / 200 * sk().size / (sk().size - 2 * sketchPadding));
         }
         break;
      case 2:
         sketchAction = "translating";  // N -- TRANSLATE
         break;
      case 3:
         copySketch(sk());              // NW -- CLONE
         sketchAction = "translating";
         break;
      case 4:
         sketchAction = "scaling";      // W -- SCALE
         break;
      case 5:
         toggleTextMode();              // SW -- TOGGLE TEXT MODE
         break;
      case 6:
         sketchAction = "rotating";     // S -- ROTATE
         break;
      case 7:
         sketchAction = "undrawing";    // SE -- "UNDRAW" A SIMPLE SKETCH
         sketchPage.tUndraw = 0;
         break;
      }

      return true;
   }

   function findPaletteColorIndex(x, y) {
      for (var n = 0 ; n < palette.length ; n++) {
         var dx = x - paletteX(n);
         var dy = y - paletteY(n);
            if (dx * dx + dy * dy < 20 * 20)
               return n;
      }
      return -1;
   }

   function isHover() { return isk() && sk().isMouseOver; }
   function isk() { return isDef(sk()) && sk() != null; }
   function nsk() { return sketchPage.sketches.length; }
   function sk(i) { return nsk() == 0 ? null : sketchPage.sketches[i === undefined ? sketchPage.index : i]; }

   function clear() { sketchPage.clear(); }

   function image(name, scale) {
      if (scale === undefined)
         scale = 1;
      addSketch(new Picture('imgs/' + name));
      sk().sketchState = 'in progress';
      sk().styleTransition = 0;
      sk().sketchProgress = 1;
      sk().sc = scale * (glyphSketch.xhi - glyphSketch.xlo) / 250;
   }

   var saveNoisy;

   function annotateStart(context) {
      if (context === undefined)
         context = _g;
      saveNoisy = noisy;
      noisy = 0;
      context.save();
      context.lineWidth = 1;
   }

   function annotateEnd(context) {
      if (context === undefined)
         context = _g;
      noisy = saveNoisy;
      context.restore();
   }

   var visible_sp = null;

   var ttForce = newZeroArray(1024);

   function ttTick() {
      if (tt !== undefined && tt.myState === undefined)
         tt.waitForDomReady(document, function() {
            tt.load(function(error) {
               tt.myState = new tt.State();
            });
         });
      if (tt.myState !== undefined) {
         tt.pollState(tt.myState);
         for (var i = 0 ; i < 1024 ; i++)
            ttForce[i] = tt.myState.hmd.forces[i] / 4096;
      }
   }

   var tick = function(g) {
      var w = width(), h = height();

      // HANDLE THE TACTONIC SENSOR, IF ANY.

      //ttTick();

      // TURN OFF ALL DOCUMENT SCROLLING.

      document.body.scrollTop = 0;

      // DON'T DO ANYTHING UNTIL THE ANIMATE FUNCTION IS DEFINED.

      if (isDef(window[g.name].animate)) {

         // SET THE CURSOR STYLE.

         document.body.style.cursor =
            (isVideoPlaying && ! isBottomGesture && ! isRightHover) ||
            isExpertMode && (pieMenuIsActive || isSketchInProgress())
                                                ? 'none'
            : bgClickCount == 1                 ? 'cell'
            : isRightHover && ! isBottomGesture ? 'pointer'
            : isBottomGesture                   ? '-webkit-grabbing'
            : isBottomHover                     ? '-webkit-grab'
            :                                     'crosshair'
            ;

         onScreenKeyboard.x = w / 2;
         onScreenKeyboard.y = h * 3 / 4;

         var prevTime = time;
         time = ((new Date()).getTime() - _startTime) / 1000.0;
         This().elapsed = time - prevTime;

         pieMenuUpdate(This().mouseX, This().mouseY);

         _g = g;

         if (! isDef(_g.panX))
            _g.panX = 0;

         // CLEAR THE CANVAS

         _g.clearRect(-_g.panX - 100, 0, w + 200, h);
         _g.inSketch = false;

         // DO ACTUAL CANVAS PANNING

         _g.setTransform(1,0,0,1,0,0);
         _g.translate(_g.panX, 0, 0);

         // PAN 3D OBJECTS TOO

         //root.position.x = _g.panX / 305.5;
         root.position.x = _g.panX / (0.382 * height());

         if (sketchPage.isWhiteboard) {
            color(backgroundColor);
            fillRect(-_g.panX - 100, 0, w + 200, h);
         }

         // START OFF CURRENT PSEUDO-SKETCH, IF NECESSARY

         if (isk() && sk().sketchState != 'finished') {
            if (sk().sketchState == 'start') {
               sk().cursorTransition = 0;
               sk().styleTransition = 0;
               sk().sketchLength = 1;
               sk().sketchProgress = 0;
               sk().tX = This().mouseX - width()/2;
               sk().tY = This().mouseY - height()/2;
               sk().xStart = cursorX = sk().advanceX = This().mouseX;
               sk().yStart = cursorY = sk().advanceY = This().mouseY;
               sk().sketchState = 'in progress';
            }

            if (sk().sketchState == 'in progress' && sk().isDrawingEnabled && sk().sketchProgress == 0) {
               sk().advanceX = This().mouseX;
               sk().advanceY = This().mouseY;
            }
         }

         // ANIMATE AND DRAW ALL THE STROKES

         for (var I = 0 ; I < nsk() ; I++)
            if (! sk(I).isSimple()) {
               sk(I).sp = [[sk(I).xStart, sk(I).yStart, 0]];
               sk(I).dSum = 0;
            }

         This().animate(This().elapsed);

         for (var I = 0 ; I < nsk() ; I++)
            if (! sk(I).isSimple())
               sk(I).sketchLength = sk(I).dSum;

         // COMPUTE SKETCH BOUNDING BOXES.

         if (! pullDownIsActive) {
            isMouseOverBackground = true;
            for (var I = 0 ; I < nsk() ; I++) {
               if (! sk(I).isGroup() && sk(I).parent == null) {

                  var xlo = 10000;
                  var ylo = 10000;
                  var xhi = -10000;
                  var yhi = -10000;
                  for (var i = 1 ; i < sk(I).sp.length ; i++) {
                     xlo = min(xlo, sk(I).sp[i][0]);
                     xhi = max(xhi, sk(I).sp[i][0]);
                     ylo = min(ylo, sk(I).sp[i][1]);
                     yhi = max(yhi, sk(I).sp[i][1]);
                  }

                  // PORTS EXTEND THE BOUNDING BOX OF A SKETCH.

                  for (var i = 0 ; i < sk(I).portName.length ; i++) {
                     if (sk(I).portBounds[i] === undefined)
                        continue;
                     xlo = min(xlo, sk(I).portBounds[i][0]);
                     ylo = min(ylo, sk(I).portBounds[i][1]);
                     xhi = max(xhi, sk(I).portBounds[i][2]);
                     yhi = max(yhi, sk(I).portBounds[i][3]);
                  }

                  // TEXT EXTENDS THE BOUNDING BOX OF A SKETCH.

                  if (sk(I).text.length > 0) {
                     var rx = sk(I).scale() * sk(I).textWidth / 2;
                     var ry = sk(I).scale() * sk(I).textHeight / 2;
                     var x1 = lerp(sk(I).scale(), sk(I).tx(), sk(I).textX);
                     var y1 = lerp(sk(I).scale(), sk(I).ty(), sk(I).textY);
                     xlo = min(xlo, x1 - rx);
                     ylo = min(ylo, y1 - ry);
                     xhi = max(xhi, x1 + rx);
                     yhi = max(yhi, y1 + ry);
                  }
                  else if (sk(I).sp.length <= 1) {
                     xlo = xhi = sk(I).cx();
                     ylo = yhi = sk(I).cy();
                  }

                  sk(I).xlo = xlo - sketchPadding;
                  sk(I).ylo = ylo - sketchPadding;
                  sk(I).xhi = xhi + sketchPadding;
                  sk(I).yhi = yhi + sketchPadding;
               }

               sk(I).isMouseOver = sk(I).parent == null &&
                                   This().mouseX >= sk(I).xlo &&
                                   This().mouseX <  sk(I).xhi &&
                                   This().mouseY >= sk(I).ylo &&
                                   This().mouseY <  sk(I).yhi ;

               // IF MOUSE IS OVER ANY SKETCH, THEN IT IS NOT OVER BACKGROUND.

               if (sk(I).isMouseOver)
                  isMouseOverBackground = false;
            }
         }

         // SELECT FRONTMOST SKETCH AT THE CURSOR.

         if (! pullDownIsActive && isFinishedDrawing()
                                && letterPressed == '\0'
                                && (! sketchPage.isPressed || sketchPage.paletteColorDragXY != null)
                                && sketchAction == null)
            for (var I = nsk() - 1 ; I >= 0 ; I--)
               if (sk(I).isMouseOver && sk(I).sketchState == 'finished') {
                  selectSketch(I);
                  break;
               }

         // HANDLE TEXT SHORTHAND MODE TIMEOUT

         if (isTextMode && time - strokesStartTime >= 0.5)
            isShorthandTimeout = true;

         // DRAW LINKS.

         if (isAudiencePopup() || ! isShowingOverlay()) {

            annotateStart();

            // START DRAWING A POSSIBLE NEW LINK.

            if ( linkAtCursor == null
                 && isk()
                 && sketchAction == "linking"
                 && outSketch != null
                 && outPort >= 0 )
               drawPossibleLink(outSketch, sketchPage.mx, sketchPage.my);

            // DRAW ALL EXISTING LINKS.

            if (! sketchPage.isPressed)
               linkAtCursor = null;

            for (var I = 0 ; I < nsk() ; I++)
               if (sk(I).parent == null) {
                  var a = sk(I);
                  for (var i = 0 ; i < a.out.length ; i++)
                     if (isDef(a.out[i]))
                        for (var k = 0 ; k < a.out[i].length ; k++) {
                           drawLink(a, i, a.out[i][k], true);
                           if (! this.isPressed && isMouseNearCurve(a.out[i][k][4]))
                              linkAtCursor = [a, i, k, a.out[i][k]];
                        }
               }

            annotateEnd();
         }

         if (isExpertMode) {
            if (pieMenuIsActive)
               drawCrosshair(pieMenuX, pieMenuY);
            else if (isSketchInProgress())
               drawCrosshair(cursorX, cursorY);
         }

         if (isShowingScribbleGlyphs && bgs !== undefined && bgs != null)
            bgs.draw();

         if (isAudiencePopup()) {

            // MAKE SURE AUDIENCE VIEW HAS THE RIGHT BACKGROUND COLOR.

            audienceCanvas.style.backgroundColor = backgroundColor;

            // DRAW A CURSOR WHERE AUDIENCE SHOULD SEE IT.

            if (pullDownIsActive)
               drawCrosshair(pullDownX, pullDownY);
            else if (isSketchInProgress())
               drawCrosshair(cursorX, cursorY);
            else
               drawCrosshair(This().mouseX, This().mouseY);

            // SHOW AUDIENCE VIEW.

            if (! isShowingPresenterView) {
               audienceContext.clearRect(0, 0, width(), height());
               if (sketchPage.isWhiteboard) {
                  audienceContext.fillStyle = backgroundColor;
                  audienceContext.fillRect(0, 0, width(), height());
               }
               audienceContext.drawImage(_g.canvas, 0, 0);
            }
         }

         // EVALUATE AND PROPAGATE EXPRESSIONS AND LINKS BETWEEN PORTS.

         for (var I = 0 ; I < nsk() ; I++) {
            var S = sk(I);

            // IF NO TEXT: JUST PASS INPUT TO OUTPUT.

            if (S.isNullText()) {
               if (S instanceof SimpleSketch) {
                  if (isDef(S.out[0]))
                     S.outValue[0] = S.inValue[0];
               }
               else {
                 for (var i = 0 ; i < S.in.length ; i++)
                    S.outValue[i] = S.inValue[i];
               }
            }

            // IF SKETCH HAS TEXT: EVALUATE IT.  IF THERE IS ANY RESULT, PASS IT TO OUTPUT.

            else {
               S.evalResult = S.evalCode(S.text);
               if (S.evalResult != null && isDef(S.out[0]))
                  S.outValue[0] = S.evalResult;
            }

            // VALUES PROPAGATE ALONG LINKS.

            for (var i = 0 ; i < S.out.length ; i++)
               if (isDef(S.out[i])) {
                  var outValue = value(S.outValue[i]);
                  for (var k = 0 ; k < S.out[i].length ; k++) {
                     var b = S.out[i][k][0];
                     var j = S.out[i][k][1];
                     b.inValue[j] = outValue;
                  }
               }
         }

         // IF SHOWING LIVE DATA

	 var isShowingLiveDataAtPort = outSketch != null && outSketch.isShowingLiveData;

         if (showingLiveDataMode > 0 || isShowingLiveDataAtPort) {

            if (showingLiveDataMode >= 1 || isShowingLiveDataAtPort) {

               // DRAW ANY TIME-VARYING LIVE DATA FROM THE OUT-PORT AT THE CURSOR.

               if (outSketch != outSketchPrev || outPort != outPortPrev)
                  portDataValues = [];
               outSketchPrev = outSketch;
               outPortPrev = outPort;

               if (outSketch != null && outPort >= 0 && ! (outSketch instanceof NumericSketch)) {
                  var val = outSketch.outValue[outPort];
                  portDataValues.push(val == false ? 0 : val == true ? 1 : val);
                  color(liveDataColor);
                  drawPortData(outSketch, outPort, portDataValues, isShowingLiveDataAtPort);
               }
            }

            if (showingLiveDataMode >= 2)
               for (var I = 0 ; I < sketchPage.sketches.length ; I++) {
                  var s = sketchPage.sketches[I];
                  for (var i = 0 ; i < s.portName.length ; i++)
                     if (s.outValue[i] !== undefined && s.inValue[i] === undefined) {
                        var xy = s.portXY(i);
                        var str = roundedString(s.outValue[i]);

                        textHeight(20);
                        color(backgroundColor);
                        var _sw = textWidth(str);
                        var _sh = textHeight();
                        _g.beginPath();
                        _g.moveTo(xy[0] - _sw/2, xy[1] - _sh/2);
                        _g.lineTo(xy[0] + _sw/2, xy[1] - _sh/2);
                        _g.lineTo(xy[0] + _sw/2, xy[1] + _sh/2);
                        _g.lineTo(xy[0] - _sw/2, xy[1] + _sh/2);
                        _g.fill();

                        color(liveDataColor);
                        text(str, xy[0], xy[1], .5, .5);
                     }
               }
         }

         sketchPage.computePortBounds();

         if (isShowingOverlay())
            This().overlay();

         sketchPage.advanceCurrentSketch();

         if (isAudiencePopup() && isShowingPresenterView) {
            audienceContext.fillStyle = backgroundColor;
            audienceContext.fillRect(0, 0, width(), height());
            audienceContext.drawImage(_g.canvas, 0, 0);
         }

         // ADJUST X POSITIONS ACCORDING TO PAN VALUE

         var leftX = 0 - _g.panX;
         var rightX = w - _g.panX;

         // DRAW PAGE NUMBER AND BACKGROUND IF QUICK SWITCHING PAGES

         if (isRightHover && ! isBottomGesture) {
            annotateStart();
            _g.save();
            _g.globalAlpha = 1.0;
            lineWidth(1);

            // FILL GREY BOXES AS PAGE NUMBER BACKGROUNDS

            var numberSpacing = (h - margin) / sketchPages.length;
            for (var i = 0; i < h - margin; i += numberSpacing * 2) {
               _g.beginPath();
               _g.moveTo(rightX - margin, i);
               _g.lineTo(rightX - margin, i + numberSpacing);
               _g.lineTo(rightX, i + numberSpacing);
               _g.lineTo(rightX, i);
               _g.fillStyle = scrimColor(.2);
               _g.fill();
            }

            // DRAW OUTLINE AROUND CURRENT PAGE NUMBER

            var currentPageY = pageIndex * numberSpacing;
            lineWidth(0.75);
            _g.globalAlpha = 1.0;
            _g.beginPath();
            _g.moveTo(rightX - margin, currentPageY);
            _g.lineTo(rightX - margin, currentPageY + numberSpacing);
            _g.lineTo(rightX, currentPageY + numberSpacing);
            _g.lineTo(rightX, currentPageY);
            _g.lineTo(rightX - margin, currentPageY);
            _g.strokeStyle = "rgb(255, 255, 255)";
            _g.stroke();

            // DRAW PAGE NUMBERS IN SLIDE SWITCHER

            _g.font = "14px Arial";
            var pageNumber = floor((This().mouseY / (h - margin)) * sketchPages.length);
            for (var pn = 0; pn < sketchPages.length; pn++) {
               var alpha = pageNumber == pn ? 0.8 : 0.35;
               _g.fillStyle = "rgba(255, 255, 255, " + alpha + ")";

               // MAKE SURE BOTH ONE AND TWO DIGIT NUMBERS ARE CENTERED

               var centerRatio = pn < 10 ? 0.57 : 0.65;
               var numberX = w - _g.panX - margin * centerRatio;
               _g.fillText(pn, numberX, (pn + 0.75) * numberSpacing);
            }

            if (! isExpertMode) {
               var d = h / 10;
               var nn = pageToDirections(pageNumber), n1 = nn[0], n2 = nn[1];
               var x1 = w/2 - d * cos(n1 * TAU / 8);
               var y1 = h/2 + d * sin(n1 * TAU / 8);
               var x2 = x1  - d * cos(n2 * TAU / 8);
               var y2 = y1  + d * sin(n2 * TAU / 8);

               // OUTLINE OF A DOT TO REPRESENT INITIAL CLICK.

               lineWidth(d/12);
               color(defaultPenColor);
               fillOval(w/2 - d/12, h/2 - d/12, d/6, d/6);

               lineWidth(d/15);
               color(backgroundColor);
               fillOval(w/2 - d/20, h/2 - d/20, d/10, d/10);

               // OUTLINE OF AN ARROW TO REPRESENT FOLLOWING DRAG.

               lineWidth(d/12);
               color(defaultPenColor);
               arrow(x1, y1, x2, y2, d/8);

               lineWidth(d/20);
               color(backgroundColor);
               arrow(x1, y1, x2, y2, d/8);
            }

            _g.restore();
            annotateEnd();
         }

         if (visible_sp != null) {
            annotateStart();
            for (var i = 0 ; i < visible_sp.length ; i++) {
               color(i == 0 ? 'green' : visible_sp[i][2] == 0 ? 'blue' : 'red');
               fillOval(visible_sp[i][0] - 4, visible_sp[i][1] - 4, 8, 8);
            }
            annotateEnd();
         }

         if (isShowingNLParse)
            showNLParse();

         // DRAW STRIP ALONG BOTTOM OF THE SCREEN.

         _g.save();
         _g.globalAlpha = 1.0;

         if (this.mouseY >= h - margin || isBottomGesture) {
            color(scrimColor(0.06));
            fillRect(-_g.panX, h - margin, w, margin - 2);

            color(scrimColor(0.03));
            var dx = margin / 2;
            for (var x = _g.panX % dx - _g.panX ; x < w - _g.panX ; x += dx)
               fillRect(x, h - margin, dx/2, margin - 2);
         }

         // FAINTLY OUTLINE ENTIRE SCREEN, FOR CASES WHEN PROJECTED IMAGE SHOWS UP SMALL ON NOTEBOOK COMPUTER.

         lineWidth(0.25);
         color(defaultPenColor);
         drawRect(-_g.panX, 0, w-1, h-1);

         _g.restore();

         if (isShowingGlyphs && isExpertMode)
            sketchPage.showGlyphs();

         // MAKE SURE ALT-CMD-J (TO BRING UP CONSOLE) DOES NOT ACCIDENTALLY DO A SKETCH COPY.

         if (isAltPressed && isCommandPressed)
            isAltKeyCopySketchEnabled = false;
         else if (!isAltPressed && ! isCommandPressed)
            isAltKeyCopySketchEnabled = true;

      // GLOW AT OUTPUT PORT (NOT CURRENTLY BEING USED -KP)
/*
         if (outPort >= 0) {
            color(scrimColor(.05));
            for (var n = 0 ; n < 10 ; n++) {
               var r = 30 - 3 * n;
               fillOval(This().mouseX - r, This().mouseY - r, 2 * r, 2 * r);
            }
         }
*/
      }

      if (isShowingScribbleGlyphs) {
         var ncols = 25;
	 var cw = w / ncols;

         color(scribbleColor);
         lineWidth(cw / 70);

         var fs = floor(0.2 * w / ncols);
         _g.font = (2*fs) + "px Arial";
	 _g.fillText(bgsText, 7, 28);

         _g.font = fs + "px Arial";
         for (var ns = 0 ; ns < scribbleGlyphs.length ; ns++) {
            function xfx(x) { return x0 + x / 2; }
            function xfy(y) { return y0 + y / 2; }
            var col = ns % ncols;
            var row = floor(ns / ncols);
            var x0 = (col + 0.3) * cw;
            var y0 = (row + 0.8) * cw * 1.5;
            var s = scribbleGlyphs[ns].data;

            var x = xfx(s[0][0][0] * cw / 70);
	    var y = xfy(s[0][0][1] * cw / 70);
	    var dr = 3 * cw / 70;
            _g.beginPath();
            _g.moveTo(x - dr, y - dr);
            _g.lineTo(x + dr, y - dr);
            _g.lineTo(x + dr, y + dr);
            _g.lineTo(x - dr, y + dr);
            _g.fill();

	    _g.fillText(scribbleGlyphs[ns].name, x0, y0 - 10);

            for (var n = 0 ; n < s.length ; n++) {
               _g.beginPath();
               for (var i = 0 ; i < s[n].length ; i++) {
                  var x = xfx(s[n][i][0] * cw / 70);
                  var y = xfy(s[n][i][1] * cw / 70);
                  if (i == 0)
                     _g.moveTo(x, y);
                  else
                     _g.lineTo(x, y);
               }
               _g.stroke();
            }
         }
      }

      // THIS NEEDS TO BE THE LAST LINE OF FUNCTION tick().

      requestAnimFrame(function() { tick(g); });
   }

   var ef = new EncodedFraction();

   function isSketchInProgress() {
      return isk() && sk().sketchState == 'in progress';
   }

   function isShowingOverlay() {
      return ! isExpertMode &&
             ( isShowingGlyphs || isDef(This().overlay) );
   }

   var timelineH = 80;
   var isShowingTimeline = false;
   var isDraggingTimeline = false;

   function fillPath(sp, i0, i1, context) {
      if (context === undefined)
         context = _g;
      context.beginPath();
      var offset = context.lineWidth * 0.35;
      context.moveTo(sp[i0][0] - offset, sp[i0][1] - offset);
      for (var i = i0 + 1 ; i <= i1 ; i++)
         context.lineTo(sp[i][0] - offset, sp[i][1] - offset);
      context.fill();
   }

   var letterPressed = '\0';

   var audiencePopup = null, audienceCanvas, audienceContext;
   var cursorX = 0, cursorY = 0;

   function deleteSketch(sketch) {
      if (sketch === undefined)
         return;

      // WHENEVER SELECTED SKETCH IS DELETED, MAKE SURE WE DON'T STAY IN TEXT MODE.

      if (sketch == sk())
         setTextMode(false);

      for (var j = 0 ; j < sketch.children.length ; j++) {
         var k = sketchPage.findIndex(sketch.children[j]);
         sketchPage.sketches.splice(k, 1);
      }
      deleteSketchOnly(sketch);
   }

   function deleteSketchOnly(sketch) {

      var i = sketchPage.findIndex(sketch);
      if (i >= 0) {
         if (sketch.cleanup != null)
            sketch.cleanup();

         sketchPage.sketches.splice(i, 1);

         var s, j, k;

         //--------- DELETE OUT LINKS TO THIS SKETCH WITHIN OTHER SKETCHES:

         // FOR EACH ACTIVE IN-PORT OF sketch:

         for (var inPort = 0 ; inPort < sketch.in.length ; inPort++)
            if (isDef(sketch.in[inPort])) {

               // LOOP THROUGH ACTIVE OUT-PORTS OF SKETCH s LINKING TO IT.

               var s = sketch.in[inPort][0];
               for (var outPort = 0 ; outPort < s.out.length ; outPort++)

                  // FOR EACH ACTIVE OUT-PORT OF s, LOOP THROUGH THE SKETCHES s LINKS TO.

                  if (isDef(s.out[outPort]))
                     for (var k = s.out[outPort].length - 1 ; k >= 0 ; k--)

                        // WHERE s LINKS TO sketch, REMOVE THAT OUT-LINK.

                        if (s.out[outPort][k][0] == sketch)
                           deleteOutLink(s, outPort, k);
            }

         //--------- DELETE IN LINKS FROM THIS SKETCH WITHIN OTHER SKETCHES:

         for (var outPort = 0 ; outPort < sketch.out.length ; outPort++)
            if (isDef(sketch.out[outPort]))
               for (k = sketch.out[outPort].length - 1 ; k >= 0 ; k--) {
                  var inSketch = sketch.out[outPort][k][0];
                  var inPort   = sketch.out[outPort][k][1];
                  deleteInLink(inSketch, inPort);
               }
      }

      if (isCodeWidget && sketch == codeSketch)
         toggleCodeWidget();

      if (sketchPage.index >= nsk())
         selectSketch(nsk() - 1);
   }

   function selectSketch(n) {
      if (n == sketchPage.index)
         return;
      sketchPage.index = n;
      if (n >= 0)
         pullDownLabels = sketchActionLabels.concat(sk().labels);
   }

   function copySketch(s) {
      if (s === undefined || s == null)
         return;

      var children = null, groupPath = [];

      if (s.isGroup()) {
         children = [];
         for (var i = 0 ; i < s.children.length ; i++) {
            copySketch(s.children[i]);
            children.push(sk());
            sk().tX = s.children[i].tX;
            sk().tY = s.children[i].tY;
         }

         groupPath = cloneArray(s.groupPath);
      }

      else if (s instanceof GeometrySketch) {

         var sketch = new GeometrySketch();

         var x = This().mouseX, y = This().mouseY;
         var xr = (s.xhi - s.xlo) / 2 - sketchPadding;
         var yr = (s.yhi - s.ylo) / 2 - sketchPadding;
         sketch.sp0 = [[0,0],[x-xr,y-yr],[x+xr,y-yr],[x+xr,y+yr]];
         sketch.sp = [[0,0,0],[x-xr,y-yr,0],[x+xr,y-yr,1],[x+xr,y+yr,1]];

         var mesh = new THREE.Mesh(s.mesh.geometry.clone(), s.mesh.material.clone());
         root.add(mesh);
         mesh.sketch = sketch;
         mesh.update = s.mesh.update;

         sketch.fragmentShader = s.fragmentShader;
         sketch.glyphName = s.glyphName;
         sketch.mesh = mesh;
         sketch.onClick = s.onClick;
         sketch.onSwipe = s.onSwipe;
         sketch.rX = s.rX;
         sketch.rY = s.rY;
         sketch.shaderCount = 0;
         sketch.sketchProgress = 1;
         sketch.sketchState = 'finished';
         sketch.sx = s.sx;
         sketch.sy = s.sy;
         sketch.update = s.update;

         addSketch(sketch);
         finishDrawingUnfinishedSketch();
         return;
      }

      addSketch(s.clone());
      sk().sketchProgress = 1;
      sk().sketchState = 'finished';

      var dx = This().mouseX - (s.isGroup() ? s.cx() : s.tx());
      var dy = This().mouseY - (s.isGroup() ? s.cy() : s.ty());

      if (s.isGroup()) {
         sk().xlo += dx;
         sk().ylo += dy;
         sk().xhi += dx;
         sk().yhi += dy;

         sk().children = [];
         for (var i = 0 ; i < children.length ; i++) {
            sk().children.push(children[i]);
            sk().children[i].parent = sk();
         }
         moveChildren(sk().children, dx, dy);

         for (var i = 0 ; i < groupPath.length ; i++) {
            groupPath[i][0] += dx;
            groupPath[i][1] += dy;
         }
         sk().groupPath = groupPath;
      }
      else {
         sk().tX += dx;
         sk().tY += dy;
         if (! sk().isSimple()) {
            sk().tX -= width() / 2;
            sk().tY -= height() / 2;
         }
         sk().textX += dx;
         sk().textY += dy;
      }
   }

   function addSketch(sketch) {
      sketchPage.add(sketch);
      sk().id = globalSketchId++;
      sk().setColorId(sketchPage.colorId);
      sk().sketchState = 'start';
      sk().children = [];
      sk().in = [];
      sk().out = [];
      sk().inValue = [];
      sk().outValue = [];
      sk().defaultValue = [];
      sk().portBounds = [];
      sk().portLocation = [];
      sk().zoom = sketchPage.zoom;
      sk().isDrawingEnabled = false;
      if (sk() instanceof Sketch2D) {
         sk().x2D = This().mouseX;
         sk().y2D = This().mouseY;
      }
   }

   function computeCentroid(parent, sk, pts) {
      var xlo = sk.xlo;
      var ylo = sk.ylo;
      var xhi = sk.xhi;
      var yhi = sk.yhi;

      var x = 0, y = 0, sum = 0;
      for (var i = 0 ; i < pts.length ; i++)
         if ( pts[i][0] >= xlo && pts[i][0] < xhi &&
              pts[i][1] >= ylo && pts[i][1] < yhi ) {
            x += pts[i][0];
            y += pts[i][1];
            sum++;
         }

      if (sum == 0) {
         x = (xlo + xhi) / 2;
         y = (ylo + yhi) / 2;
      }
      else {
         x /= sum;
         y /= sum;
      }
      return [parent.m2x(x), parent.m2y(y)];
   }

// HANDLE FAKE CROSSHAIR CURSOR.

   function drawCrosshair(x, y, context) {
      if (context === undefined)
         context = _g;

      var r = 6.5 * window.innerWidth / window.outerWidth;

      x = floor(x);
      y = floor(y);

      for (var n = 0 ; n < 2 ; n++) {
         context.strokeStyle = n == 0 ? backgroundColor : defaultPenColor;
         context.lineWidth = (n == 0 ? .3 : .1) * r;
         context.beginPath();
         context.moveTo(x - r, y);
         context.lineTo(x + r, y);
         context.moveTo(x, y - r);
         context.lineTo(x, y + r);
         context.stroke();
      }
   }

////////////////////////////////////////////////////////////
/////// SKETCHES THAT MAKE USE OF WEBGL AND SHADERS ////////
////////////////////////////////////////////////////////////

   function GeometrySketch() {
      this.sx = 1;
      this.sy = 1;
      this.dragx = 0;
      this.dragy = 0;
      this.downx = 0;
      this.downy = 0;
      this.cleanup = function() {
         root.remove(this.mesh);
      }
      this.mouseDown = function(x,y) {
         this.downx = this.dragx = x;
         this.downy = this.dragy = y;
      }
      this.mouseDrag = function(x,y) {
         this.sx *= (400 + x - this.dragx) / 400;
         this.sy *= (400 - y + this.dragy) / 400;
         this.dragx = x;
         this.dragy = y;
      }
      this.mouseUp = function(x,y) {
      }
      this.render = function(elapsed) {

         // TURN OFF ROTATION TO COMPUTE 2D BOUNDING BOX.

         var save_rX = this.rX;
         this.rX = 0;
         this.makeXform();
         this.rX = save_rX;

         for (var i = 0 ; i < min(this.sp.length, this.sp0.length) ; i++) {
            var xy = this.xform(this.sp0[i]);
            this.sp[i][0] = xy[0];
            this.sp[i][1] = xy[1];
         }

         var b = [ this.xlo, this.ylo, this.xhi, this.yhi ];
         var x = ( b[0] + b[2] - width()     ) / 2 / pixelsPerUnit;
         var y = ( b[1] + b[3] - height()    ) / 2 / pixelsPerUnit;
         var s = len(b[2] - b[0] + 2 * sketchPadding,
                     b[3] - b[1] + 2 * sketchPadding) / 4 / pixelsPerUnit;
         this.mesh.getMatrix()
             .identity()
             .translate(x, -y, 0)
             .rotateX(-PI*this.rY)
             .rotateY( PI*this.rX)
             .scale(s * this.sx, s * this.sy, s);

         if (this.inValue[0] !== undefined) this.setUniform("x", this.inValue[0]);
         if (this.inValue[1] !== undefined) this.setUniform("y", this.inValue[1]);
         if (this.inValue[2] !== undefined) this.setUniform("z", this.inValue[2]);

         if (isDef(this.mesh.update))
            this.mesh.update(elapsed);

         if (isDef(this.update))
            this.update(elapsed);

         if (this.fadeAway > 0 || sketchPage.fadeAway > 0
                               || this.glyphSketch != null) {
            var alpha = this.fadeAway > 0 ? this.fadeAway :
                        this.glyphSketch != null ? 1.0 - this.glyphSketch.fadeAway :
                        sketchPage.fadeAway;
            this.mesh.material.opacity = sCurve(alpha);
            this.mesh.material.transparent = true;

            if (this.glyphSketch != null && this.glyphSketch.fadeAway == 0)
               this.glyphSketch = null;
         }

         if (isShowingMeshEdges) {
            this.visibleEdges = this.mesh.geometry.visibleEdges(this.mesh.matrix);

	    var s = this.size * 0.765;
	    _g.beginPath();
	    for (var n = 0 ; n < this.visibleEdges.length ; n++) {
	       var edge = this.visibleEdges[n];
	       var a = this.mesh.geometry.vertices[edge[0]];
	       var b = this.mesh.geometry.vertices[edge[1]];
	       var A = this.mesh.getMatrix().transform([a.x,a.y,a.z]);
	       var B = this.mesh.getMatrix().transform([b.x,b.y,b.z]);
	       _g.moveTo(width()/2 + s * A[0], height()/2 - s * A[1]);
	       _g.lineTo(width()/2 + s * B[0], height()/2 - s * B[1]);
	    }
	    _g.stroke();
         }
      }
      this.setUniform = function(name, value) {
         if (isDef(this.mesh.material.uniforms[name]))
            this.mesh.material.uniforms[name].value = value;
      }
      this.mesh = null;
   }
   GeometrySketch.prototype = new SimpleSketch;

   function addPlaneShaderSketch(vertexShader, fragmentShader, n) {
      return addGeometryShaderSketch(new THREE.PlaneGeometry(2,2,n,n), vertexShader, fragmentShader);
   }

   function addSphereShaderSketch(vertexShader, fragmentShader) {
       return addGeometryShaderSketch(new THREE.SphereGeometry(1.0, 21.0, 21.0), vertexShader, fragmentShader);
   }

   function createMesh(geometry, vertexShader, fragmentShader) {
      return new THREE.Mesh(geometry, shaderMaterial(vertexShader, fragmentShader));
   }

   function addGeometryShaderSketch(geometry, vertexShader, fragmentShader) {
      sk().fadeAway = 1.0;
      var mesh = createMesh(geometry, vertexShader, fragmentShader);
      root.add(mesh);
      mesh.sketch = geometrySketch(mesh);
      mesh.sketch.fragmentShader = fragmentShader;
      setMeshUpdateFunction(mesh);
      return mesh.sketch;
   }

   function computeGlyphSketchBounds() {
      if (glyphSketch != null)
         return computeCurveBounds(glyphSketch.sp, 1);
      else
         return [sketchPage.x-50, sketchPage.y-50, sketchPage.x+50, sketchPage.y+50];
   }

   function geometrySketch(mesh, xf) {

      var sketch = new GeometrySketch();

      var b = computeGlyphSketchBounds();

      if (glyphSketch != null) {
         sketchPage.add(glyphSketch);
         glyphSketch.fadeAway = 1.0;
         sketch.glyphSketch = glyphSketch;
      }

      if (isDef(xf)) {
         var w = b[2] - b[0];
         var x = (b[0] + b[2]) / 2;
         var y = (b[1] + b[3]) / 2;
         var dx = xf[0] * w;
         var dy = xf[1] * w;
         var sc = xf[4];
         b[0] = x + dx - (x - b[0]) * sc;
         b[1] = y + dy - (y - b[1]) * sc;
         b[2] = x + dx + (b[2] - x) * sc;
         b[3] = y + dy + (b[3] - y) * sc;
         sketch.rX = xf[2];
         sketch.rY = xf[3];
      }

      var x = (b[0] + b[2]) / 2;
      var y = (b[1] + b[3]) / 2;

      // FORCE THE BOUNDING RECTANGLE TO BE A SQUARE.

      var r = (b[2] - b[0] + b[3] - b[1]) / 3.0;
      b[0] = x - r + sketchPadding;
      b[1] = y - r + sketchPadding;
      b[2] = x + r - sketchPadding;
      b[3] = y + r - sketchPadding;

      sketch.sp0 = [ [0,0  ] , [b[0]-x,b[1]-y  ] , [b[2]-x,b[3]-y  ] ];
      sketch.sp  = [ [0,0,0] , [b[0]  ,b[1]  ,1] , [b[2]  ,b[3]  ,1] ];

      sketch.tX = x;
      sketch.tY = y;
      sketch.mesh = mesh;
      mesh.sketch = sketch;
      setMeshUpdateFunction(mesh);

      if (mesh.material == blackMaterial)
         setMeshMaterialToRGB(mesh, paletteRGB[sketchPage.colorId]);

      addSketch(sketch);

      finishDrawingUnfinishedSketch();
      return sketch;
   }

   function setMeshUpdateFunction(mesh) {
      mesh.update = function() {
         if (this.material.uniforms === undefined)
            return;

         var S = this.sketch;

         // TELL THE MATERIAL ABOUT THE CURRENT TIME.

         S.setUniform('time', time);

         // TELL THE MATERIAL WHAT THE CURRENT SKETCH LOCATION IS IN PIXELS.

         if (S.x == 0) {
            S.x = (S.xlo + S.xhi)/2;
            S.y = (S.ylo + S.yhi)/2;
         }

         // TELL THE MATERIAL WHAT THE CURRENT MOUSE LOCATION IS ON THE SKETCH, ON A RANGE FROM FROM -1 TO +1.

         if (! S.isClick) {
            S.setUniform('mx', (S.x - (S.xlo + S.xhi)/2) / ((S.xhi - S.xlo)/2));
            S.setUniform('my',-(S.y - (S.ylo + S.yhi)/2) / ((S.yhi - S.ylo)/2));
         }

         // TELL THE MATERIAL ABOUT ALPHA AND THE FADEAWAY BEFORE THE SKETCH IS DELETED.

         S.setUniform('alpha', (S.fadeAway == 0 ? 1 : S.fadeAway) * (isDef(S.alpha) ? S.alpha : 1));

         // TELL THE MATERIAL WHICH INDEX IS SELECTED IN THE SKETCH'S CODE TEXT BUBBLE.

         S.setUniform('selectedIndex', isDef(S.selectedIndex) ? S.selectedIndex : 0);

         // TELL THE MATERIAL THE SIZE OF ONE PIXEL, IN TEXTURE SPACE.

         S.setUniform('pixelSize', 3 / (S.xhi - S.xlo));
      }
   }

   function setMeshMaterialToRGB(mesh, rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      mesh.setMaterial(new phongMaterial().setAmbient(.3*r,.3*g,.3*b)
                                          .setDiffuse(.5*r,.5*g,.5*b)
                                          .setSpecular(0,0,0,1));
   }

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

   var _g, time = 0, _startTime = (new Date()).getTime();

   var motion = [];
   for (var i = 0 ; i < palette.length ; i++)
      motion.push(1);

   var glyphCountBeforePage = 0;

   function setPage(index) {
      if (index < 0 || index >= sketchPages.length)
         return;

      // SAVE PAN VALUE FOR PREVIOUS PAGE

      sketchPages[pageIndex].pan = _g.panX;

      // RESTORE PAN VALUE FOR NEXT PAGE

      _g.panX = sketchPages[index].pan;

      // MAKE SURE SKETCH ACTION, BG-CLICK ACTION, CODE WIDGET, ETC ARE TURNED OFF.

      sketchAction = null;
      bgClickCount = 0;
      if (isCodeWidget)
         toggleCodeWidget();

      // REMOVE ALL GLYPHS DEFINED FROM PREVIOUS PAGE, IF ANY (THIS IS WRONG).
/*
      if (glyphCountBeforePage > 0)
         glyphs.splice(glyphCountBeforePage, glyphs.length - glyphCountBeforePage);
      glyphCountBeforePage = glyphs.length;
*/
      if (index === undefined)
         index = pageIndex;

      pageIndex = (index + sketchPages.length) % sketchPages.length;

      sketchPage = sketchBook.setPage(pageIndex);
      var slide = document.getElementById('slide');

      // SET PAGE CONTENT FROM TEMPLATE OR STRAIGHT FROM HTML

      pageObject = sketchPages[pageIndex];
      if (isDef(pageObject.innerHTML))
         slide.innerHTML = pageObject.innerHTML;
      else if (isDef(pageObject.template))
         insertTemplate(pageObject.template, slide);

      // IF THERE IS A VIDEO ON THE NEW PAGE, START PLAYING IT.

      vidElements = slide.getElementsByClassName("vid");
      if (isVideoPlaying = vidElements.length > 0) {
         vidElements[0].play();
      }

      // IF THERE IS AN AUDIENCE POP-UP, SET IT TO THE RIGHT PAGE.

      if (isAudiencePopup())
         audiencePopup.document.getElementById('slide').innerHTML =
            document.getElementById(pageName).innerHTML;

      // SET SKETCH TYPES FOR THIS PAGE.

      sketchTypes = sketchPages[pageIndex].availableSketches;
      pagePullDownLabels = pageActionLabels.concat(sketchTypes);
      pullDownLabels = pagePullDownLabels;

      sketchTypeLabels = [];

      for (var n = 0 ; n < sketchTypes.length ; n++)
         registerSketch(sketchTypes[n]);

      // SWAP IN THE 3D RENDERED SCENE FOR THIS PAGE.

      if (sketchPage.scene == null) {
         sketchPage.scene = new THREE.Scene();
         sketchPage.scene.add(ambientLight(0x333333));
         sketchPage.scene.add(directionalLight(1,1,1, 0xffffff));
         sketchPage.scene.root = new node();
         sketchPage.scene.add(sketchPage.scene.root);
      }
      renderer.scene = sketchPage.scene;
      root = renderer.scene.root;
   }

   function insertTemplate(template, slide) {
      var parent = document.createElement('parent');
      var table = document.createElement('table');
      var tablePaddingRow = document.createElement('tr');
      tablePaddingRow.className = 'padding';

      parent.appendChild(table);
      table.appendChild(tablePaddingRow);
      table.setAttribute('width', width());

      if (template instanceof Array)
         if (template[0] instanceof Array)
            for (var i = 0; i < template.length; i++) {
               table.appendChild(row(template[i]));
               if (i != template.length - 1) {
                  var spacerRow = document.createElement('tr');
                  spacerRow.setAttribute('height', '50');
                  table.appendChild(spacerRow);
               }
            }
         else
            table.appendChild(row(template));
      else
         table.appendChild(row(template));

      slide.innerHTML = parent.innerHTML;
   }

   function resizePadding() {
      var paddingHeight = (height() - slide.clientHeight) / 2;
      slide.getElementsByClassName('padding')[0].setAttribute('height', paddingHeight);
   }

   function row(template) {
      var rowElement = document.createElement('tr');
      if (template instanceof Array)
         for (var i = 0; i < template.length; i++)
            rowElement.appendChild(column(template[i]));
      else
         rowElement.appendChild(content(template));
      return rowElement;
   }

   function column(template) {
      var columnElement = document.createElement('td');
      columnElement.appendChild(content(template));
      return columnElement;
   }

   function content(template) {
      if (template.indexOf('.mp4') > -1) {
         var th = document.createElement('th');
         th.appendChild(videoElement(template));
         return th;
      } else if (template.indexOf('.jpg') > -1 || template.indexOf('.png') > -1) {
         var th = document.createElement('th');
         th.appendChild(imageElement(template));
         return th;
      } else {
         var center = document.createElement('center');
         center.appendChild(textElement(template));
         return center;
      }
   }

   function textElement(text) {
      var font = document.createElement('font');
      font.setAttribute('color', 'white');
      font.setAttribute('size', '10');
      font.innerHTML = text;
      return font;
   }

   function imageElement(imageName) {
      var img = document.createElement('img');
      img.setAttribute('src', imageName);
      img.setAttribute('width', '700');
      return img;
   }

   function videoElement(videoName) {
      var video = document.createElement('video');
      video.className = 'vid';
      video.setAttribute('width', '60%');
      video.setAttribute('height', 'auto');
      var source = document.createElement('source');
      source.setAttribute('src', videoName);
      video.appendChild(source);
      return video;
   }

   function loadGlyphArray(a) {
      for (var i = 0 ; i < a.length ; i += 2)
         registerGlyph(a[i], a[i+1]);
   }

   function unloadGlyphArray(a) {
      for (var i = 0 ; i < a.length ; i += 2)
         for (var j = 0 ; j < glyphs.length ; j++)
            if (a[i] == glyphs[j].name)
                glyphs.splice(j--, 1);
   }

var glyphs = [];
loadGlyphArray(glyphData);


