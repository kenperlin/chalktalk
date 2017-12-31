"use strict";

//window.displayListener = true;

// WHEN WE DON'T WANT TO RENDER A FRAME, WE CAN USE A FAKE CONTEXT.

   function FakeContext() {
      this.beginPath    = function() {};
      this.canvas       = { width : 0, height : 0 };
      this.clearRect    = function() {};
      this.drawImage    = function() {};
      this.fill         = function() {};
      this.fillText     = function() {};
      this.lineTo       = function() {};
      this.moveTo       = function() {};
      this.restore      = function() {};
      this.save         = function() {};
      this.setTransform = function() {};
      this.stroke       = function() {};
      this.translate    = function() {};
   }

   var fake_g = new FakeContext();

   var emptyBounds = new Bounds(0, 0, 0, 0);

   // CONVENIENCE FUNCTION TO GET STATISTICS OF STROKES FROM THE CURRENT SKETCH

   function S(i) { return sk().getStrokeStatistics(i); }

   // Do not load any sketches whose labels are in ignoredSketches.

   var ignoredSketches = [];

   // GLOBAL VARIABLES.

   var blackBackgroundRGB = [0,0,0];
   var whiteBackgroundRGB = [128,128,128];

   var blackBackgroundColor = 'black';
   var whiteBackgroundColor = rgbToColor(whiteBackgroundRGB);

   var _rotate_travel;
   var _rotate_x;
   var _rotate_y;
   var arrowNearCursor = null;
   var backgroundColor = blackBackgroundColor;
   var bgAction_mouseMoveClientX = 0;
   var bgAction_mouseMoveClientY = 0;
   var bgAction_mouseMoveClientZ = 0;
   var bgClickCount = 0;
   var bgClickX = 0;
   var bgClickY = 0;
   var viewForwardMat = new M4();
   var viewInverseMat = new M4();
   var defaultFont = 'Arial';
   var defaultPenColor = isWhiteBackground() ? 'black' : 'white';
   var glyphTrace = [];
   var errorMessage;
   var preglyphSketch = null;
   var isAltKeyCopySketchEnabled = true;
   var isCasualFont = false;
   var isCatchingRenderExceptions = true;
   var isDrawingSketch = true;
   var isFinishedLoadingSketches = false;
   var isFog = false;
   var isLightTracking = false;
   var isMouseOverBackground = true;
   var isOverviewMode = false;
   var isScreenView = false;
   var isShowingCameraData = false;
   var isShowingHelp = false;
   var isShowingLinks = true;
   var isShowingPresenterView = false;
   var isSpeakerNotes = false;
   var isTelegraphKeyPressed = false;
   var isTextMode = false;
   var isTouchDevice = false;
   var isTutorialMode = false;
   var meshOpacityOverVideo = 0.7;
   var overview_alpha = 0;
   var showingLiveDataMode = false;
   var sketchPadding = 10;
   var sketchTypeLabels = [];
   var sketchTypes = [];
   var sketchTypesToAdd = [];
   var speakerNotes;
   var lightTracker;
   var tracked = [ [0,0,0], [0,0,0], [0,0,0] ];
   var videoBrightness = 1;
   var xmlWriteEnabled = false;

   var _faders = new Faders();
   function fader(id) { return _faders.fader(id); }

   function sketchActionEnd() {
      sketchAction = null;
   }

   // CATCH WAND EVENTS.

   var wand = {x:0, y:0, z:0, qx:0, qy:0, qz:0, qw:0};
   var isWand = false;

   function moveWand(x, y, z, qx, qy, qz, qw) {
      isWand = true;
      wand.x = x;
      wand.y = y;
      wand.z = z;
      wand.qx = qx;
      wand.qy = qy;
      wand.qz = qz;
      wand.qw = qw;

      if (isk()) {
         if (sk()._cursorPoint === undefined)
            sk()._cursorPoint = newVec3();
         sk()._cursorPoint.set(wand.x, wand.y, wand.z);

         if (isFakeMouseDown) {
            if (sk().onDrag !== undefined) {
               sk().onDrag(sk()._cursorPoint);
            }
         }
         else {
            if (sk().onMove !== undefined) {
               sk().onMove(sk()._cursorPoint);
            }
         }
      }
   }

   // SET WIDTH AND HEIGHT OF LOCAL_WEB_CLIENT TO MATCH THE WIDTH AND HEIGHT OF THE SCREEN.

   var isPhone = function() {
      return CT && CT.imu && CT.imu.alpha != null;
   }

   function width() {
      var width = isPhone() ? 2560 : isDef(_g) ? _g.canvas.width  : screen.width ;

      if (width != window._previousWidth) {
         window._previousWidth = width;
	 resizeWindows();
      }
      return width;
   }
   function height() {
      var height = isPhone() ? 1440 : screen.height;
      if (height != window._previousHeight) {
         window._previousHeight = height;
	 resizeWindows();
      }
      return height;
   }

   // HOW SMALL IS A TINY STROKE BEFORE WE COUNT IT AS A CLICK?

   function clickSize() { return width() / 40; }

   // SCALE FONT SIZE WITH SCREEN HEIGHT.

   var _font_scale_factor = 698.5;

   function sfs(size) { return size * height() / _font_scale_factor; }
   function sfpx(size) { return floor(sfs(size)) + 'px'; }

   // SOMETIMES WE NEED TO SET A CUSTOM HEIGHT TO MAKE THINGS WORK WITH A PARTICULAR PROJECTOR.

   //function height() { return 640; }
   //function height() { return 720; }
   //function height() { return 920; }

   //function width() { return 1280 + 100; }
   //function height() { return 800; }

   // BEST RESOLUTION FOR CINTIQ

   //function width() { return 1920 - 103 * 1920 / 1080; }
   //function height() { return 1080 - 103; }

   // TRANSPARENT INK IN ONE OF THE PEN COLORS.

   function scrimColor(alpha, colorId) {
      if (colorId === undefined)
         colorId = 0;
      var p = palette.rgb[colorId];
      return 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + alpha + ')';
   }

   // FADED INK IN ONE OF THE PEN COLORS.

   function fadedColor(alpha, p) {
      if (p === undefined)
         p = 0;

      if (! (p instanceof Array))
         p = palette.rgb[p];

      return rgbToColor(mix(backgroundRGB(), p, alpha));
   }

   function isWhiteBackground() {
      return backgroundColor == whiteBackgroundColor;
   }

   function backgroundRGB() {
      return isBlackBackground() ? blackBackgroundRGB : whiteBackgroundRGB;
   }

   function isBlackBackground() {
      return backgroundColor == blackBackgroundColor;
   }

   function fadedAlpha(a) {
      return pow(a, isBlackBackground() ? 4 : .7);
   }

   // TRANSPARENT INK IN THE OVERLAY COLOR.

   function overlayScrimColor(alpha) {
      return 'rgba(0,96,255,' + alpha + ')';
   }

   // FADED INK IN THE OVERLAY COLOR.

   function overlayFadedColor(alpha) {
      return fadedColor(alpha, [0,96,255]);
   }

   // TRANSPARENT INK IN THE BACKGROUND COLOR.

   function bgScrimColor(alpha) {
      let rgb = backgroundRGB();
      return rgbaToColor([rgb[0],rgb[1],rgb[2],alpha]);
   }

   // LEFT AND TOP COORDINATES OF THE CURRENTLY VISIBLE CANVAS.

   function panX(x) {
      return isDef(_g.panX) ? x - _g.panX : x;
   }

   function panY(y) {
      return isDef(_g.panY) ? y - _g.panY : y;
   }

   function panZ(z) {
      return isDef(_g.panZ) ? z - _g.panZ : z;
   }

   // HANDLE FOG.

   function setFog(fog) {
      if (fog.length == 0) {
         clearFog();
	 return;
      }
      ctScene.setFog(fog);
      setBackgroundColor('rgb(' + floor(255 * sqrt(fog[0])) + ','
                                + floor(255 * sqrt(fog[1])) + ','
				+ floor(255 * sqrt(fog[2])) + ')');
   }

   function clearFog() {
      ctScene.setFog([0,0,0,0]);
      setBackgroundColor(defaultPenColor == 'white' ? blackBackgroundColor : whiteBackgroundColor);
   }


////////////////////////////////////////////////////////////////
// INITIALIZE HANDLING OF KEYBOARD AND MOUSE EVENTS ON A CANVAS:
////////////////////////////////////////////////////////////////

   var mouseMoveEvent = null;

   function resizeWindows() {
      events_canvas.width = width();
      events_canvas.height = height();

      if (window.renderer) {
         renderer.setSize(width(), height());
         renderer.camera.aspect = width() / height();
         renderer.camera.updateProjectionMatrix();
      }

      scene_div.width = width();
      scene_div.height = height();
      sketch_canvas.width = width();
      sketch_canvas.height = height();
      slide.width = width();
      slide.height = height();
      video_canvas.width = width();
      video_canvas.height = height();
   }

   function initEventHandlers(canvas) {
      function getHandle(canvas) { return window[canvas.id]; }

      var handle = getHandle(canvas);
      handle.mouseX = 1000;
      handle.mouseY = 1000;
      handle.mouseZ = 0;
      handle.mousePressed = false;

      function handleBroadcastEvent(event, eventType) {
         if (event.isTrusted)
            broadcastEvent(eventType, event);

         else if (isPhone()) {
	    event.clientX *= 2;
	    event.clientY *= 2;
	 }
      }

      function broadcastEvent(type, event) {
         server.broadcast(JSON.stringify({
            eventType : type,
	    event : type.indexOf('mouse') > 0
	            ? { button: event.button, clientX: event.clientX, clientY: event.clientY }
	            : { keyCode: event.keyCode }
         }));
      }

      function browserDependent(keyCode) {
         switch (keyCode) {
	 case 173:
	    keyCode -= 128;
	    break;
	 }
	 return keyCode;
      }

      canvas.onkeydown = function(event) {

         handleBroadcastEvent(event, "onkeydown");

         var handle = getHandle(this);
         if (isDef(handle.keyDown)) {
            event = event || window.event;

            // PREVENT BROWSER FROM SCROLLING IN RESPONSE TO CERTAIN KEYS.

            switch (event.keyCode) {
            case   8: // ASCII DELETE
            case  32: // ASCII SPACE
            case  33: // ASCII PAGE UP
            case  34: // ASCII PAGE DOWN
            case  37: // ASCII LEFT ARROW
            case  38: // ASCII UP ARROW
            case  39: // ASCII RIGHT ARROW
            case  40: // ASCII DOWN ARROW
            case 191: // ASCII /
            case 222: // ASCII '
               event.preventDefault();
               break;
            }

            handle.keyDown(browserDependent(event.keyCode));
         }
      }

      canvas.onkeyup = function(event) {

         handleBroadcastEvent(event, "onkeyup");

         var handle = getHandle(this);
         if (isDef(handle.keyUp)) {
            event = event || window.event;
            handle.keyUp(browserDependent(event.keyCode));
         }
      }

      canvas.onkeypress = function(event) {

         handleBroadcastEvent(event, "onkeypress");

         switch (event.keyCode) {
         // PREVENT DEFAULT WINDOW ACTION ON BACKSPACE.
         case 8:
             event.preventDefault();
             break;
         }
         var handle = getHandle(this);
         if (isDef(handle.keyPress)) {
            event = event || window.event;
            handle.keyPress(browserDependent(event.keyCode));
         }
      }

      function enableTouchEvent(event) {
         if (event.touches !== undefined) {
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
         }
      }

      // MOUSE PRESSED.

      canvas.isMouseMoveEnabled = false;

      canvas.oncontroller = function(event) {
         console.log(JSON.stringify(event));
      }

      canvas.onmousedown = function(event) {

         // Move into full-screen
         if(root_div.webkitRequestFullScreen) root_div.webkitRequestFullScreen();
         else if(root_div.mozRequestFullScreen) root_div.mozRequestFullScreen();

         handleBroadcastEvent(event, "onmousedown");

         var clientX = event.clientX,
             clientY = event.clientY,
             clientZ = def(event.clientZ);

         // RESPOND DIFFERENTLY TO LEFT AND RIGHT MOUSE BUTTONS

         if (event.button && event.button != 1)
            return;


         //////////////////////////////////////////////////////////////
         if (sketchAction == 'creatingKeys') {
            sk().creatingKeys_isMousePressed = true;
            sk().creatingKeysMouseDown(panX(clientX), panY(clientY), panZ(clientZ));
            return;
         }
         //////////////////////////////////////////////////////////////


         if (sketchAction != null)
            return;

         var handle = getHandle(this);
         handle.mouseX = panX(clientX);
         handle.mouseY = panY(clientY);
         handle.mouseZ = panZ(clientZ);

         handle.mousePressedAtX = handle.mouseX;
         handle.mousePressedAtY = handle.mouseY;
         handle.mousePressedAtZ = handle.mouseZ;
         handle.mousePressedAtTime = time;
         handle.mousePressed = true;

         if (isDef(handle.mouseDown)) {
            handle.mouseDown(handle.mouseX, handle.mouseY, handle.mouseZ);
         }

         _g.lastX = clientX;
         _g.lastY = clientY;
         _g.lastZ = clientZ;
      };

      // MAKE SURE BROWSER CATCHES RIGHT CLICK.

      canvas.oncontextmenu = function(event) {
         setTextMode(false);
         console.log("right click -- not yet used");
         return false;
      };

      // MOUSE RELEASED.

      canvas.onmouseup = function(event) {

         handleBroadcastEvent(event, "onmouseup");

         var clientX = def(window.mouseMoveClientX),
             clientY = def(window.mouseMoveClientY),
             clientZ = def(window.mouseMoveClientZ);

         //////////////////////////////////////////////////////////////
         if (sketchAction == 'creatingKeys') {
            sk().creatingKeys_isMousePressed = false;
            sk().creatingKeysMouseUp(panX(clientX), panY(clientY), panZ(clientZ));
            return;
         }
         //////////////////////////////////////////////////////////////


         //start Lobser\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_
         // RESPOND ONLY TO LEFT MOUSE UP, NOT TO RIGHT MOUSE UP.

         if (event.button && event.button != 1)
            return;

         if (sketchAction != null) {
            switch (sketchAction) {

            case 'translating':

               // AFTER DONE TRANSLATING A SKETCH, DO CALLBACKS IF IT DROPS ONTO OTHER SKETCHES.

               if (isk()) {
                  var s = sk().intersectingSketches();
                  for (var i = 0 ; i < s.length ; i++) {
                     if (isDef(sk().over))
                        sk().over(s[i]);
                     if (isDef(s[i].under))
                        s[i].under(sk());
                  }
               }

               // DRAGGING A SKETCH TO A LINK INSERTS THE SKETCH, SPLITTING THE LINK IN TWO.

               if (linkAtCursor != null)
	          linkAtCursor.split();


               // STIll NEED TO IMPLEMENT EFFECTS OF DROPPING ONE SKETCH ONTO ANOTHER.
/*
               if (s.length > 0) {
                  console.log(sk().glyphName + " -> " + s[0].glyphName);
                  //deleteSketch(sk());
               }
*/
               break;

            case 'rotating':
               if (_rotate_travel <= clickSize()) {
                  sk().unrotate();
               }
               break;
            }
            sketchActionEnd();
            return;
         }

         var handle = getHandle(this);
         handle.mouseX = panX(clientX);
         handle.mouseY = panY(clientY);
         handle.mouseZ = panZ(clientZ);
         handle.mousePressed = false;

         if (isDef(handle.mouseUp)) {
            handle.mouseUp(handle.mouseX, handle.mouseY, handle.mouseZ);
         }

         _g.lastX = clientX;
         _g.lastY = clientY;
         _g.lastZ = clientZ;
      }

      // MOUSE IS MOVED.

      canvas.onmousemove = function(event) {

         handleBroadcastEvent(event, "onmousemove");

         var clientX = event.clientX,
             clientY = event.clientY,
             clientZ = def(event.clientZ);

         mouseMoveEvent = event;

         window.mouseMoveClientX = clientX;
         window.mouseMoveClientY = clientY;
         window.mouseMoveClientZ = clientZ;

         var handle = getHandle(this);
         handle.mouseX = panX(clientX);
         handle.mouseY = panY(clientY);
         handle.mouseZ = panZ(clientZ);

         //////////////////////////////////////////////////////////////
         if (sketchAction == 'creatingKeys') {
            if (sk().creatingKeys_isMousePressed)
               sk().creatingKeysMouseDrag(panX(clientX), panY(clientY), panZ(clientZ));
            else
               sk().creatingKeysMouseMove(panX(clientX), panY(clientY), panZ(clientZ));
            return;
         }
         //////////////////////////////////////////////////////////////


         // MOUSE IS BEING DRAGGED.

         if (handle.mousePressed) {
            if (sketchAction != null)
               return;

            if (isDef(handle.mouseDrag)) {
                if (len(handle.mouseX - handle.mousePressedAtX,
                        handle.mouseY - handle.mousePressedAtY) >= 1)
                   handle.mouseIsDragging = true;

                if (handle.mouseIsDragging) {
                   handle.mouseDrag(handle.mouseX, handle.mouseY, handle.mouseZ);
                }
            }
         }

         // MOUSE IS BEING MOVED WITHOUT BUTTONS PRESSED.

         else if (isDef(handle.mouseMove)) {
            if (sketchAction == 'rotating') {
               _rotate_travel += len(handle.mouseX - _rotate_x, handle.mouseY - _rotate_y);
               _rotate_x = handle.mouseX;
               _rotate_y = handle.mouseY;
            }
            handle.mouseMove(handle.mouseX, handle.mouseY, handle.mouseZ);
         }

         // WHILE PSEUDO-SKETCHING: ADVANCE SKETCH AT SAME RATE AS MOUSE MOVEMENT.

         if (isk() && sk().sketchState == 'in progress' && sk().isDrawingEnabled
                                                        && sk().sketchProgress < 1) {
            var dx = handle.mouseX - sk().advanceX;
            var dy = handle.mouseY - sk().advanceY;
            var dz = handle.mouseZ - sk().advanceZ;
            var t = sqrt(dx*dx + dy*dy + dz*dz) / sk().sketchLength;
            sk().sketchProgress = min(1, sk().sketchProgress + t);
            sk().advanceX = handle.mouseX;
            sk().advanceY = handle.mouseY;
            sk().advanceZ = handle.mouseZ;
         }

         // HANDLE PANNING OF THE ENTIRE SKETCH PAGE.

         if (isPanning) {
            _g.panX += clientX - _g.lastX;
            _g.panY += clientY - _g.lastY;
            _g.panZ += clientZ - _g.lastZ;
         }

         _g.lastX = clientX;
         _g.lastY = clientY;
         _g.lastZ = clientZ;

         if (isFinishedDrawing() && (! sketchPage.isPressed || palette.dragXY != null)
                                 && sketchPage.keyPressed == -1
                                 && sketchAction == null)
            tryToSelectSketchAtCursor();
      }

      // MAKE TOUCH ON TABLETS AND SMARTPHONES LOOK LIKE THE EQUIVALENT MOUSE EVENTS:

      canvas.ontouchstart = function(event) {
         var touch = event.changedTouches[0];
         canvas.onmousedown({ clientX : touch.pageX, clientY : touch.pageY, isTrusted : true });
      }

      canvas.ontouchmove = function(event) {
         var touch = event.changedTouches[0];
         canvas.onmousemove({ clientX : touch.pageX, clientY : touch.pageY, isTrusted : true });
      }

      canvas.ontouchend = function(event) {
         var touch = event.changedTouches[0];
         canvas.onmouseup({ clientX : touch.pageX, clientY : touch.pageY, isTrusted : true });
      }
   }

   // SET OR GET CANVAS LINE WIDTH, DEPENDING ON WHETHER AN ARGUMENT IS SPECIFIED.

   function lineWidth(w) {
      if (isDef(w))
         _g.lineWidth = w;
      return _g.lineWidth;
   }

   // 2D MOVE_TO AND LINE_TO WRAPPERS

   var _g_z = 0;
   function _g_setZ(z)         { _g_z = z; }
   function _g_beginPath()     { displayStrokes.beginPath(); }
   function _g_fill()          { displayStrokes.fill(); }
   function _g_lineTo(x,y)     { _g_sketchTo([x, y], 1); }
   function _g_moveTo(x,y)     { _g_sketchTo([x, y], 0); }
   function _g_stroke()        { displayStrokes.stroke(); }
   function _g_text(str, p, m) { displayStrokes.text(str, p, m); }

   function _g_sketchTo(_p, isLine) {
      if (_p === undefined)
         return;

      var x = _p[0], y = _p[1], z = def(_p[2], _g_z), xx, yy, p;

      if (! isDrawingSketch) {
         p = [ x, y, z ];
         if (! isScreenView)
            viewForwardMat.transform(p, p);
         displayStrokes.pathTo(p, isLine);
         return;
      }

      var sketch;

      if (! isk())
         return;
      sketch = sk();

      if (sketch.isMakingGlyph) {
         buildTrace(glyphTrace, x, -y, isLine);
         return;
      }

      p = [ sketch.adjustX(x), sketch.adjustY(y), sketch.adjustD(z) ];

      viewForwardMat.transform(p, p);

      if (sketch.sketchTrace != null) {
         if (sketch.sketchState != 'finished' && sketch.glyphTransition < 0.5)
            buildTrace(sketch.trace, p[0], p[1], isLine);
         else {
            if (window._inAfterSketch === undefined)
               _g.lineWidth = sketch._isModel && sketch.glyphTransition > .5 ? 0.001 : sketchLineWidth * .6;
            displayStrokes.pathTo(p, isLine);
         }
         return;
      }

      if (_g.inSketch && _g.suppressSketching <= 0)
         sketch.sp.push([p[0], p[1], isLine]);

      displayStrokes.pathTo(p, isLine);
   }

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

   // RESAMPLE ALL OF THE CURVES OF A TRACE.

   function resampleTrace(src) {
      var dst = [];
      for (var n = 0 ; n < src.length ; n++)
         if (src[n].length > 1)
            dst.push(resampleCurve(src[n]));
      return dst;
   }

   function buildTrace(trace, x, y, isLine) {
      if (! isLine && (trace.length == 0 || trace[trace.length-1].length > 0))
         trace.push([]);

      trace[trace.length-1].push([x,y]);
   }

   var isVideoLayer = function() {
      return videoLayer != null && videoLayer.bRender;
   }

   var meshOpacity = function() {
      return isVideoLayer() ? meshOpacityOverVideo : 1;
   }

   var isShowingRenderer = true; // IF THIS IS false, THREE.js STUFF BECOMES INVISIBLE.

// TODO: FIGURE OUT HOW TO LOAD THE NEWLY CREATED SKETCH TYPE INTO CURRENT GLYPHS.

   function createSketchType(name, code) {
      server.writeFile('sketches/' + name + '.js', code);
   }

   function addSketchType(name) {
      sketchTypesToAdd.push(name);
   }

   // Loads all the sketch libraries in the sketchlibs/ directory.
   // The callback is called after they're all done loading.
   function loadSketchLibs(callback) {
      try {
         // Get a list of all sketch library files
         var lsRequest = new XMLHttpRequest();
         lsRequest.open("GET", "ls_sketchlibs");

         lsRequest.onloadend = function () {
            if (lsRequest.responseText != "") {
               var ls = lsRequest.responseText.trim().split("\n");
               var remainingRequests = {count: ls.length};

               for (var n = 0; n < ls.length; n++) {
                  // Load each one of them by adding a script tag to the document
                  let script = document.createElement("script");
                  script.type = "text/javascript";
                  script.src = "sketchlibs/" + ls[n];
                  script.onload = function() {
                     if (--remainingRequests.count === 0) {
                        // Once all libraries are done loading, run the callback
                        callback();
                     }
                  }
                  document.body.appendChild(script);
               }
            }
         }
         lsRequest.send();
      } catch (e) {
         console.error(e);
      }
   }

   function loadSketches() {
      try {
         var lsRequest = new XMLHttpRequest();
         lsRequest.open("GET", "ls_sketches");

         lsRequest.onloadend = function () {
            if (lsRequest.responseText != "") {
               var ls = lsRequest.responseText.trim().split("\n");
               var remainingRequests = {count: ls.length};
               for (var n = 0; n < ls.length; n++) {
                  var filename = ls[n];

                  var iDot = filename.indexOf('.');
                  // Ignore the ignoredSketches.
                  var name = filename.substring(0, iDot);
                  if (getIndex(ignoredSketches, name) >= 0) {
                     remainingRequests.count--;
                     continue;
                  }

                  importSketch(filename, remainingRequests);
               }
            }
         }
         lsRequest.send();
      } catch (e) { }
   }

   var sketchFileData = {};

   function addTypeNameToSketchCode(text, typeName) {
      var i = text.indexOf('(');
      if (text.substring(0, i).trim() == 'function') {
         text = typeName + ' = function() {\n' +
                '\'use strict\';\n' +
                'this.typeName = \'' + typeName + '\';\n' +
                'this.init = ' + text + '}\n' +
         typeName + '.prototype = new Sketch;\n' +
         'addSketchType(\'' + typeName + '\');\n';
      }
      return text;
   }

   function importSketch(filename, remainingRequests) {
      var sketchRequest = new XMLHttpRequest();
      sketchRequest.open("GET", "sketches/" + filename);
      sketchRequest.filename = filename;
      sketchRequest.onloadend = function() {

         var text = this.responseText;

         // GIVE A NAME TO THE SKETCH CLASS, IF NECESSARY.

         var typeName = filename;

         var j = typeName.indexOf('.');
         typeName = typeName.substring(0, j) + '_sketch';

         text = addTypeNameToSketchCode(text, typeName);
         // Add a comment so that we can see these sketches in the Chome/FF developer tools
         text += "\n//# sourceURL=" + filename;
         

         // IF THERE IS A SYNTAX ERROR, REPORT IT.

         var error = findSyntaxError(text);
         if (error.length > 0)
            console.log("In sketches/" + this.filename + " at line " + error[0] + ": " + error[1]);

         // OTHERWISE LOAD THE NEW SKETCH TYPE.

         else {
            eval(text);
            window.forceSetPageAtTime = time + 0.5;
            sketchFileData[typeName] = [ filename, this.responseText ];
         }

         if (--remainingRequests.count == 0)
            onRemoteSketchesFinishedLoading();
      }
      sketchRequest.send();
   }

   // CALLED WHEN ALL REMOTE SKETCHES HAVE FINISHED LOADING

   function onRemoteSketchesFinishedLoading() {
      //setInterval( function() { tick(); }, 1000 / 60);
      setInterval( function() { tick(); }, 20);
      if (window.location.pathname == "/talk") {
         var id = prompt("What session would you like to create?");
         createBroadcast(id);
      } else if (window.location.pathname == "/listen") {
         var id = prompt("What session would you like to watch?");
         joinBroadcast(id);
      }
   }

   function initCTPath() {
      if (window.ctPath)
         ctScene.remove(ctPath);
      window.ctPath = new CT.Path();
      ctPath.translate(0, 0, -ctScene.getFL());;
      ctScene.add(ctPath);
   }

   // MUST BE CALLED WHEN WEB PAGE LOADS.

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

      + " <canvas id='video_analysis_canvas' tabindex=1 width=480 height=360"
      + "    style='z-index:1;position:absolute;left:400;top:-20;'>"
      + " </canvas>"

      + " <canvas id='slide' tabindex=1"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </canvas>"
      +
      (isShowingRenderer
       ?
           " <div id='scene_div' tabindex=1"
         + "    style='z-index:1;position:absolute;left:0;top:0;'>"
         + " </div>"
       :
           " <!!div id='scene_div' tabindex=1"
         + "    style='z-index:1;position:absolute;left:0;top:0;'>"
         + " <!!/div>"
      )

      + " <canvas id='webgl_canvas' tabindex=1"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </canvas>"

      + " <canvas id='sketch_canvas' tabindex=1"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </canvas>"

      + " <canvas id='video_canvas' tabindex=1"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </canvas>"

      + " <canvas id='events_canvas' tabindex=1"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </canvas>"

      + " <canvas id='background' color='" + backgroundColor + "'></canvas>"
      + " <div id='code'"
      + "    style='z-index:1;position:absolute;left:0;top:0;'>"
      + " </div>"

//    + " <input id='soundfileinput' type='file' style='visibility:hidden' /> </input>"
      ;
      window.bodyElement = document.getElementsByTagName('body')[0];
      bodyElement.innerHTML = '<div id="root_div">' + viewerHTML + bodyElement.innerHTML + '</div>';
      bodyElement.style.color = blackBackgroundColor;

      // SET ALL THE SCREEN-FILLING ELEMENTS TO THE SIZE OF THE SCREEN.

      slide.width = width();
      sketch_canvas.width = width();
      events_canvas.width = width();

      slide.height = height();
      sketch_canvas.height = height();
      events_canvas.height = height();

      background.width = width();
      background.height = height();
      background.style.backgroundColor = backgroundColor;

      // INITIALIZE THE SKETCH CANVAS

      sketch_canvas.animate = function(elapsed) { sketchPage.animate(elapsed); }
      sketch_canvas.overlay = function() { sketchPage.overlay(); }
      sketch_canvas.setup = function() {
         window.onbeforeunload = function(e) { sketchBook.onbeforeunload(e); }
         setPage(0);
      }

      events_canvas.keyDown   = function(key)     { e2s(); sketchPage.keyDown(key); }
      events_canvas.keyUp     = function(key)     { e2s(); sketchPage.keyUp(key); }
      events_canvas.mouseDown = function(x, y, z) { e2s(); sketchPage.mouseDown(x, y, z); }
      events_canvas.mouseDrag = function(x, y, z) { e2s(); sketchPage.mouseDrag(x, y, z); }
      events_canvas.mouseMove = function(x, y, z) { e2s(); sketchPage.mouseMove(x, y, z); }
      events_canvas.mouseUp   = function(x, y, z) { e2s(); sketchPage.mouseUp  (x, y, z); }

      fourStart();

      if (window['scene_div'] !== undefined) {
         scene_div.width = width();
         scene_div.height = height();
         var sceneElement = document.getElementById('scene_div');
         sceneElement.appendChild(renderer.domElement);
      }

      // SET SIZE OF WEBGL CANVAS

      webgl_canvas.width = width();
      webgl_canvas.height = height();

      // START WEBGL MODELER

      if (isPhone()) {
         sketchPadding *= 2;
      }

      lightTracker = new LightTracker(video_analysis_canvas);

      window.ctScene = new CT.Scene(webgl_canvas);
      ctScene.setLight(0, [ 1, 1, 1]);
      //ctScene.setLight(1, [-1,-1,-1], [.1, .05, 0]);
      ctScene.setLight(1, [-1,-1,-1], [1, 1, 1]);
      ctScene.setFOV(isPhone() ? PI / 2.5 : PI / 6);

      initCTPath();

      // START ALL CANVASES RUNNING

      var c = document.getElementsByTagName("canvas");

      initEventHandlers(events_canvas);
      initSketchCanvas();

      // SET SIZE OF VIDEO CANVAS

      video_canvas.width = width();
      video_canvas.height = height();

      server = new Server();
      socket = server.connectSocket();

      midi = new Midi();

      document.title = 'Chalktalk';
   }

   function e2s() {
      sketch_canvas.mouseX = events_canvas.mouseX;
      sketch_canvas.mouseY = events_canvas.mouseY;
      sketch_canvas.mouseZ = events_canvas.mouseZ;
      sketch_canvas.mousePressedAtX = events_canvas.mousePressedAtX;
      sketch_canvas.mousePressedAtY = events_canvas.mousePressedAtY;
      sketch_canvas.mousePressedAtZ = events_canvas.mousePressedAtZ;
      sketch_canvas.mousePressedAtTime = events_canvas.mousePressedAtTime;
      sketch_canvas.mousePressed = events_canvas.mousePressed;
   }

   var pixelsPerUnit = 97;

   function This() { return window[_g.name]; }

   // INITIALIZE THE SKETCH CANVAS

   function initSketchCanvas() {
      window.requestAnimFrame = (function(callback) {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function(callback) { window.setTimeout(callback, 1000 / 60); }; })();

      var g = sketch_canvas.getContext('2d');
      g.textHeight = 12;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.name = 'sketch_canvas';
      sketchPage.clear();

      // Load all sketch libraries
      loadSketchLibs(function() {
         // And once that's done, load all sketches
         // (Has to be done in this order because sketches can depend on sketch libraries)
         loadSketches();
      });

      imageLibrary_load();

      _g = g;
      displayStrokes = new DisplayStrokes(g);

      _g.clearRect(0, 0, _g.canvas.width, _g.canvas.height);
      This().setup();

      pixelsPerUnit = 5.8635 * height() / cameraFOV;

//----- FROM SAM CLARKE (http://samclarke.com), TEST WHETHER A FONT IS AVAILABLE.

(function(c){var b,d,e,f,g,h=c.body,a=c.createElement("div");a.innerHTML='<span style="'+["position:absolute","width:auto","font-size:128px","left:-99999px"].join(" !important;")+'">'+Array(100).join("wi")+"</span>";a=a.firstChild;b=function(b){a.style.fontFamily=b;h.appendChild(a);g=a.clientWidth;h.removeChild(a);return g};d=b("monospace");e=b("serif");f=b("sans-serif");window.isFontAvailable=function(a){return d!==b(a+",monospace")||f!==b(a+",sans-serif")||e!==b(a+",serif")}})(document);

   }

   var displayStrokes;

   var speechRec;

   var OR_imageObj;

   var sketchType = 0;
   var pageIndex = 0;

   var cloneObject = null;
   var dataLineWidth = 2.4;
   var globalSketchId = 0;
   var linkDeleteColor = 'rgba(255,0,0,.1)';
   var linkHighlightColor = 'rgba(0,192,96,.2)';
   var liveDataColor = 'rgb(128,192,255)'
   var overlayColor = 'rgb(0,96,255)';
   var overlayClearColor = function() { return isBlackBackground() ? 'rgba(192,224,255,.5)' : 'rgba(0,96,255,.5)'; }
   var portColor = 'rgb(0,192,96)';
   var portBgColor = backgroundColor;
   var portHeight = 24;
   var portHighlightColor = 'rgb(192,255,224)';
   var sketchLineWidth = 4;

   function setBackgroundColor(color) {
      background.style.backgroundColor = color;
      setDocumentBackgroundColor(color);
   }

   function addSketchOfType(i) {
      eval("addSketch(new " + sketchTypes[i] + "())");
   }

   function sketchTypeToCode(type, selection) {
      return "sg('" + type + "','" + selection + "')";
   }

   function registerSketch(type) {

      var names = [], n, status, code;

      // CREATE A TEMPORARY INSTANCE OF THIS SKETCH TYPE.

      eval("addSketch(new " + type + "())");
      sketchTypeLabels.push(sk().labels);

      // RENDER EACH OF ITS SELECTIONS ONCE TO CREATE GLYPH INFO.

      for (n = 0 ; n < sk().labels.length ; n++) {

         sk().setSelection(sk().labels[n]);

         // CREATE GLYPH SHAPE INFO.

         glyphTrace = [];
         sk().isMakingGlyph = true;

         isDrawingSketch = true;
         status = sk().renderWrapper(0.02);

         sk().isMakingGlyph = undefined;

         // REGISTER THE GLYPH.

         if (status == 0) {
            code = sketchTypeToCode(type, sk().labels[n]);
            names.push(registerGlyph(code, glyphTrace, sk().labels[n]));
         }
      }

      // FINALLY, DELETE THE SKETCH.

      deleteSketch(sk());

      return names;
   }

   // CREATE AN INSTANCE OF A REGISTERED SKETCH TYPE.

   function sg(type, selection) {

      var bounds = computePreglyphSketchBounds();
      This().mouseX = bounds.x;
      This().mouseY = bounds.y;
      This().mouseZ = 0;

      eval("addSketch(new " + type + "())");

      sk().typeName = type;

      sk().width  = bounds.width;
      sk().height = bounds.height;
      sk().size   = 2 * max(sk().width, sk().height);

      sk().setSelection(selection);

      // START MORPH TRANSITION FROM FREEHAND PRE-GLYPH SKETCH TO GLYPH SKETCH.

      if (preglyphSketch != null) {
         sk().sketchTrace = resampleTrace(preglyphSketch.toTrace());
         sk().glyphTransition = 0;
         sk().trace = [];
      }
      else
         sk().glyphTransition = 1;

      sk().computeStrokesBounds();

      if (sk().computeStatistics)
         sk().computeStatistics();
   }

/////////////////////////////////////////////////////////////////////
/////////////////////// LINKS AND DATA PORTS ////////////////////////
/////////////////////////////////////////////////////////////////////

   function computeLinkCurvature(link, C) {
      link.s = computeCurvature(link.a.portXY(link.i), C, link.b.portXY(link.j));
      link.status = undefined;
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
      _g_beginPath();
      for (var i = 0 ; i < dataValues.length ; i++) {
         var x = xy[0] + 2 * i;
         var y = xy[1] - 2 * 30 * dataValues[i];
         if (i == 0)
            _g_moveTo(x, y);
         else
            _g_lineTo(x, y);
      }
      _g_stroke();
   }

   function drawPossibleLink(s, x, y) {
      lineWidth(dataLineWidth);
      color(fadedColor(0.5));
      if (s.linkCurve != null) {
         var C = s.linkCurve;
         window._debug_ = true;
         drawCurve(createCurvedLine(C[0], C[C.length-1], computeCurvature(C)));
         delete window._debug_;
      }
      else {
         var xy = s.portXY(outPort);
         arrow(xy[0], xy[1], x, y);
      }
   }

   function findOutSketchAndPort() {
      outSketch = isHover() ? sk() : null;
      outPort = -1;
      if (outSketch != null && (outPort = findOutPortAtCursor(outSketch)) != -1) {
         inSketch = null;
         inPort = -1;
      }
   }

   var linkAtCursor = null;
   var arrowAtCursor = null;
   var outSketch = null, inSketch = null;
   var outPort = -1, inPort = -1;

   function findNearestInPort(sketch) {
      var inPort = -1;

      if (sketch != null) {
         var inPortCount = 0;

         for (var i = 0 ; i < sketch.portName.length ; i++)
            if (sketch.portName[i] !== 'out')
               inPortCount++;

         if (inPortCount > 0)
            inPort = findNearestPortAtCursor(sketch, sketch.in, true);
         else
            inPort = firstUndefinedArrayIndex(sketch.in);
      }

      return inPort;
   }

   function findNearestOutPort(sketch) {
      if (sketch.portName.length == 0)
         return 0;
      var i = findNearestPortAtCursor(sketch);
      if (outValue[i] === undefined)
         return -1;
      return i;
   }

   function findNearestPortAtCursor(sketch, slots, isOnlyInPorts) {
      if (isOnlyInPorts === undefined)
         isOnlyInPorts = false;
      var x = This().mouseX;
      var y = This().mouseY;
      var n = -1, ddMin = 10000;
      for (var i = 0 ; i < sketch.portName.length ; i++) {
         if (isOnlyInPorts && sketch.portName[i] == "out")
            continue;
         if ((slots === undefined) || slots[i] == null) {
            var xy = sketch.portXY(i);
            var dd = (xy[0]-x)*(xy[0]-x) + (xy[1]-y)*(xy[1]-y);
            if (dd < ddMin) {
               n = i;
               ddMin = dd;
            }
         }
      }
      return n;
   }

   function findOutPortAtCursor(sketch) {
      if (sketch instanceof NumericSketch ||
          sketch instanceof FreehandSketch &&
                 (! sketch.isNullText() || isDef(sketch.inValue[0])))
         return -1;

      var x = This().mouseX;
      var y = This().mouseY;
      for (var i = 0 ; i < sketch.portName.length ; i++)
         if (sketch.defaultValue[i] !== undefined && sketch.outValue[i] !== undefined) {
            var xy = sketch.portXY(i);
            if ( x >= xy[0] - portHeight/2 && x < xy[0] + portHeight/2 &&
                 y >= xy[1] - portHeight/2 && y < xy[1] + portHeight/2 )
               return i;
         }
      return -1;
   }

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

   function finishDrawingUnfinishedSketch(sketch) {
      if (! sketch.isMouseOver && ! isHover() && sketch.sketchState != 'finished')
         finishSketch(sketch);
   }

   function finishSketch(sketch) {
      if (sketch === undefined)
         sketch = sk();
      sketch.sketchProgress = 1;
      sketch.cursorTransition = 1;
      sketch.styleTransition = 1;
      sketch.sketchState = 'finished';
   }

   function isFinishedDrawing() {
      return isk() && sk().sketchState == 'finished';
   }

   function isMouseNearCurve(c) {
      return dsqFromCurve(This().mouseX, This().mouseY, c) < 10 * 10;
   }

   function setTextMode(state) {
      isTextMode = state;
      if (isTextMode)
         loadGlyphArray(characterGlyphData);
      else
         unloadGlyphArray(characterGlyphData);
      delete sketchPage.isPortValueTextMode;
      return isTextMode;
   }

   function toggleTextMode() {
      if (setTextMode(! isTextMode)) {
         isShiftPressed = false;
         if (! (isk() && isHover() && sk().isFreehandSketch())) {
            addSketch(new FreehandSketch());
            sk().sketchProgress = 1;
            sk().sketchState = 'finished';
            sk().textX = sk().tX = This().mouseX;
            sk().textY = sk().tY = This().mouseY;
	    window.suppressNextTextChar = true;
         }
      }
   }

   var strokes = [];
   var strokesStartTime = 0;
   var strokesGlyph = null;

   function findGlyph(strokes, glyphs) {

      if (strokes.length == 0 || strokes[0].length < 2)
         return null;

      strokesGlyph = new SketchGlyph("", strokes);

      if (isCreatingGlyphData)
         console.log(strokesGlyph.toString());

      var bestMatch = -1;
      var bestScore = strokesGlyph.WORST_SCORE;
      for (var i = 0 ; i < glyphs.length ; i++) {

         // IN TEXT MODE, ONLY TRY TO RECOGNIZE TEXT CHARACTERS.

         if (isTextMode) {
            var name = glyphs[i].name;
            if (name.length > 1 && name.indexOf('number_sketch') < 0
                                && name != 'cap'
                                && name != 'del'
                                && name != 'ret'
                                && name != 'spc' )
               continue;
         }

         var score = strokesGlyph.compare(glyphs[i]);

         if (score < bestScore) {
            bestScore = score;
            bestMatch = i;
         }
      }

      return bestMatch == -1 ? null : glyphs[bestMatch];
   }

   function unregisterGlyph(indexName) {
      for (var i = 0 ; i < glyphs.length ; i++)
         if (indexName == glyphs[i].indexName) {
            glyphs.splice(i--, 0);
	    return;
         }
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

      if (name.indexOf("sg(") < 0 && typeof strokes[0] !== 'string')
         for (var n = 0 ; n < strokes.length ; n++)
            for (var i = 0 ; i < strokes[n].length ; i++)
               strokes[n][i][1] *= -1;

      var glyph = new SketchGlyph(name, strokes);
      glyph.indexName = indexName;

      for (var i = 0 ; i < glyphs.length ; i++)
         if (indexName < glyphs[i].indexName) {
            glyphs.splice(i, 0, glyph);
            return glyph.indexName;
         }

      glyphs.push(glyph);
      return glyph.indexName;
   }

   var isCreatingGlyphData = false;

   function shift(textChar) {
      if (isShiftPressed && textChar.length == 1) {
         var ch = textChar.charCodeAt(0);
         textChar = String.fromCharCode(ch - 32);
      }
      return textChar;
   }

   var isBgActionEnabled = false;
   var isSketchDragEnabled = false;
   var sketchDragMode = -1;
   var sketchDragActionXY = [0,0];
   var sketchDragActionSize = [0,0];

   function glyphIndex(glyphs, name) {
      for (var i = 0 ; i < glyphs.length ; i++)
         if (glyphs[i].indexName == name)
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

/////////////////////////////////////////////////////////////////////////////

   var bgAction_dir1;
   var bgAction_dir2;
   var bgAction_sketch;
   var bgAction_xDown;
   var bgAction_yDown;
   var bgAction_dx;
   var bgAction_dy;
   var bgAction_dz;
   var bgAction_isClick;

   function bgActionDown(x, y, z) {
      if (z === undefined) z = 0;
      var x0 = bgClickX;
      var y0 = bgClickY;

      bgAction_dir1 = -1;
      if (len(x0 - x, y0 - y) >= clickSize())
          bgAction_dir1 = pieMenuIndex(x0 - x, y0 - y, 8);

      bgAction_dir2 = -1;
      bgAction_sketch = undefined;
      bgAction_xDown = x;
      bgAction_yDown = y;
      bgAction_isClick = true;
   }

   function bgActionDrag(x, y, z) {
      if (z === undefined) z = 0;
      if (bgAction_isClick) {
         bgAction_isClick = false;
         bgAction_mouseMoveClientX = mouseMoveClientX;
         bgAction_mouseMoveClientY = mouseMoveClientY;
         bgAction_mouseMoveClientZ = mouseMoveClientZ;
      }

      bgAction_dx = mouseMoveClientX - bgAction_mouseMoveClientX;
      bgAction_dy = mouseMoveClientY - bgAction_mouseMoveClientY;
      bgAction_dz = mouseMoveClientZ - bgAction_mouseMoveClientZ;

      bgAction_mouseMoveClientX = mouseMoveClientX;
      bgAction_mouseMoveClientY = mouseMoveClientY;
      bgAction_mouseMoveClientZ = mouseMoveClientZ;

      bgDragGesture(x, y, z);
   }

   function bgActionUp(x, y) {

      // IF CLICK/DRAG, FIND DRAG DIRECTION, AND SEE IF USER HAS DRAGGED INTO A SKETCH.

      if (len(bgAction_xDown - x, bgAction_yDown - y) >= clickSize()) {
         bgAction_dir2 = pieMenuIndex(bgAction_xDown - x, bgAction_yDown - y, 8);
         bgAction_sketch = sketchPage.sketchesAt(x, y)[0];
         bgUpGesture(x, y);
      }
      else
         bgClickGesture(x, y);
   }

////////////////////// HANDLING BACKGROUND GESTURES /////////////////////////

////////// SUPPORT CODE

   var bgDragGestures = [];
   var bgClickGestures = [];

   function bgDragGesture(x, y, z) {
      if (z === undefined) z = 0;
      if (bgDragGestures[bgAction_dir1] !== undefined)
         if (bgDragGestures[bgAction_dir1][1] !== undefined)
            (bgDragGestures[bgAction_dir1][1])(x, y, z);
   }

   function bgUpGesture(x, y) {
      if (bgDragGestures[bgAction_dir1] !== undefined)
         if (bgDragGestures[bgAction_dir1][2] !== undefined)
            (bgDragGestures[bgAction_dir1][2])(x, y);
   }

   function bgClickGesture(x, y) {
      if (bgClickGestures[bgAction_dir1] !== undefined)
         (bgClickGestures[bgAction_dir1][1])();
   }

////////// CONTENT

   bgDragGestures[-1] = ['pan',
      function(x, y, z) {
         _g.panX += bgAction_dx;
         _g.panY += bgAction_dy;
         _g.panZ += bgAction_dz;
         group.translate(-bgAction_dx, -bgAction_dy, -bgAction_dz);
      }
   ];

   bgDragGestures[0] = ['hide images',
      ,
      function(x, y) {
         imageLibrary_isShowingImage = ! imageLibrary_isShowingImage;
      }
   ];

   bgDragGestures[1] = ['group',
      function(x, y) {
         if (! group.isDown) {
            group.isDown = true;
            group.create();
            group.mouseDown(bgAction_xDown, bgAction_yDown);
         }
         group.mouseDrag(x, y);
      },
      function(x, y) {
         group.mouseUp(x, y);
         group.isDown = false;
      }
   ];

   bgDragGestures[3] = ['appearance',
      ,
      function(x, y) {
         switch (bgAction_dir2) {
         case 4: sketchPage.toggleColorScheme(); break;
         case 2: sketchPage.isGraphPaper = !sketchPage.isGraphPaper; break;
         }
      }
   ];

   bgDragGestures[4] = ['scale font',
      function(x, y) {
         _font_scale_factor *= 1 + 0.01 * (y - bgAction_yDown);
         _font_scale_factor = min(900, _font_scale_factor);
         bgAction_yDown = y;
      }
   ];

   bgDragGestures[5] = ['draw text',
      function(x, y) {
         if (! isTextMode) {
            toggleTextMode();
            bgClickCount = 0;
            strokes = [[[bgAction_xDown,bgAction_yDown]]];
            isBgActionEnabled = false;
         }
      }
   ];

   bgDragGestures[6] = ['lock',
      ,
      function(x, y) {
         if (bgAction_dir2 == 2)
            sketchPage.isLocked = ! sketchPage.isLocked;
      }
   ];

   bgDragGestures[7] = ['prev/next',
      ,
      function(x, y) {
         console.log('bgAction_dir2 = ' + bgAction_dir2);
         switch (bgAction_dir2) {
         case 0: sketchPage.previousImage(); break;
         case 4: sketchPage.nextImage(); break;
         }
      }
   ];

   bgClickGestures[-1] = [''          , function() { sketchPage.hideScript(); }];
   bgClickGestures[ 1] = ['no group'  , function() { group.fadeAway = 1; }];
   bgClickGestures[ 2] = ['color'     , function() { palette.isVisible = true; }];
   bgClickGestures[ 3] = ['glyphs'    , function() { isShowingGlyphs = true; }];
   bgClickGestures[ 6] = ['overview'  , function() { isOverviewMode = true; }];
   bgClickGestures[ 7] = ['images'    , function() { imageLibrary_isShowingLibrary = true; }];

/////////////////////////////////////////////////////////////////////////////

var sketchDragX = 0;
var sketchDragY = 0;

   function startSketchDragAction(x, y) {
      sketchDragMode = pieMenuIndex(bgClickX - x, bgClickY - y, 8);
      switch (sketchDragMode) {
      case 0:
      case 1:
      case 6:
         sketchDragX = x;
         sketchDragY = y;
         break;
      case 2:
         sk().arrowBegin(x, y);
         break;
      case 4:
         outSketch = sk();
         outPort = findOutPortAtCursor(outSketch);
         if (outPort == -1) {
            outPort = outSketch.outPortIndex(true);
         }
         outSketch.linkCurve = [[x,y]];
         break;
      case 5:
         if (sk().isFreehandSketch()) {
            bgClickCount = 0;
            toggleTextMode();
            strokes = [[[x,y]]];
            isSketchDragActionEnabled = false;
         }
         else {
            window.xCmdDown = x;
            window.yCmdDown = y;
         }
         break;
      case 7:
         sketchDragX = x;
         sketchDragY = y;
         window.keysRateY = y;
         break;
      }
   }

   function doSketchDragAction(x, y) {
      var dir;
      switch (sketchDragMode) {
      case 0:
      case 1:
      case 6:
         break;
      case 2:
         sk().arrowDrag(x, y);
         break;
      case 4:
         if (outSketch.linkCurve !== undefined)
            outSketch.linkCurve.push([x,y]);
         break;
      case 5:
         break;
      case 7:
         dir = pieMenuIndex(x - sketchDragX, y - sketchDragY, 8);
         switch (dir) {
         case 2:
         case 6:
            sk().keysCycleDuration /= 1 + .1 * (y - window.keysRateY);
            window.keysRateY = y;
            break;
         }
         break;
      }
   }

   function endSketchDragAction(x, y) {
      var code, dir, fileData, i, name, typeName;

      switch (sketchDragMode) {
      case 0:
         dir = pieMenuIndex(x - sketchDragX, y - sketchDragY);
         if (sk().isFreehandSketch()) {
            switch (dir) {
            case 0: assignCollection(); break;
            case 3: unassignCollection(); break;
            }
         }
         else {
            switch (dir) {
            case 0:
               if (isCodeWidget)
                  sk().upload(codeTextArea.value);
               break;
            case 3:
               name = sk().glyph.indexName;
               fileData = sketchFileData[name + '__sketch'];
               if (fileData !== undefined)
                  console.log('It will be ok to remove ' + name);
               else
                  console.log('It will not be ok to remove ' + name);
               break;
            }
         }
         break;
      case 1:
         if (sk().isFreehandSketch() && sk().text.length > 0) {
            dir = pieMenuIndex(x - sketchDragX, y - sketchDragY, 8);
            switch (dir) {
            case 1:
               name = sk().text.trim();
               sketchPage.remove(sk());
               code = [
                  'function() {'
                 ,'/*'
                 ,'   This is a user created sketch.'
                 ,'   Its description should go here.'
                 ,'*/'
                 ,'   this.label = \'' + name + '\';'
                 ,'   this.render = function() {'
                 ,'      mLine([-1, 1],[ 1, 1]);'
                 ,'      mLine([-1, 1],[-1,-1]);'
                 ,'   }'
                 ,'}'
               ].join('\n');
               var typeName = name + '_sketch';
               eval(addTypeNameToSketchCode(code, typeName));
               registerSketch(typeName);
               sketchFileData[typeName] = [ name + '_.js' , code ];

               eval('addSketch(new ' + typeName + '())');
               sk().typeName = typeName;
               for (i = 0 ; glyphs[i].indexName != name ; i++)
                  ;
               sk().glyph = glyphs[i];
               sk().setSelection(name);
               finishSketch();
               sketchPage.toggleShowScript();

               break;
            }
         }
         break;
      case 2:
         sk().arrowEnd(x, y);
         break;
      case 4:
         tryToSelectSketchAtCursor();

         // DRAG ENDS ON A DIFFERENT SKETCH: CREATE LINK BETWEEN SKETCHES.

         if (sk() != outSketch && sk().isMouseOver) {
            inSketch = sk();
            inPort = findNearestInPort(inSketch);
         }

         // DRAG ENDS ON BACKGROUND: CREATE LINK TO A NEW TEXT SKETCH.

         else if (sk() == outSketch && ! sk().isMouseOver) {
            inSketch = sketchPage.createTextSketch("   ");
            sketchPage.add(inSketch);
            inPort = 0;
         }
         else
            break;

         sketchPage.createLink();
         i = outSketch.out[outPort].length - 1;
         outSketch.out[outPort][i].s = computeCurvature(outSketch.linkCurve);
         delete outSketch.linkCurve;

         break;
      case 5:
         sk().doCmdSwipe(pieMenuIndex(x - window.xCmdDown, y - window.yCmdDown, 8));
         break;
      case 6:
         if (sk().isFreehandSketch()) {
            dir = pieMenuIndex(x - sketchDragX, y - sketchDragY, 8);
            if (dir == 6)
               sk()._isLocked = ! sk()._isLocked;
         }
         break;
      case 7:
         dir = pieMenuIndex(x - sketchDragX, y - sketchDragY, 8);
         if (sk().isFreehandSketch()) {
            switch (dir) {
            case 0:
               sk().creatingKeysStart();
               break;
            }
         }
         else {
            if ( dir == 0 || dir == 4 &&
                 (sketchPage.stretchIndex === undefined || sketchPage.stretchTravel < clickSize())) {
               delete sketchPage.stretchIndex;
               sketchPage.toggleShowScript();
            }
         }
         break;
      }
      sketchDragMode = -1;
   }

   //----------------------- HANDLE COLLECTIONS OF SKETCHES -----------------------

   var collections = [];

   function assignCollection() {

      // FIND SMALLEST UNUSED ID

      var id, maxId = -1, i = collections.length;
      while (i > 0)
         maxId = max(maxId, collections[--i].id);
      for (id = 0 ; id <= maxId && i < collections.length ; id++)
         for (i = 0 ; i < collections.length && collections[i].id != id ; i++)
            ;

      // ADD THIS SKETCH'S DRAWING TO THE AVAILABLE GLYPHS.

      var sketch = sk();
      var strokes = sketch.getStrokes();
      addCollectionGlyph(id, strokes);

      // SAVE THE PAGE (WITHOUT THIS GLYPH) TO THE SERVER, ASSOCIATED WITH THIS SKETCH DRAWING.

      sketchPage.remove(sketch);
      sketchPage.savePage(id);
      sketchPage.sketches.push(sketch);
      sketch.fade();

      // UPDATE THE COLLECTIONS ON THE SERVER.

      //var stringifiedData = stringify(strokes);
      //collections.push({id : id, strokes : stringifiedData});
      collections.push({id : id, strokes : strokes});
      server.set('state/collections', collections);
   }

   function unassignCollection() {
      var glyph, name, id, i, j;
      glyph = findGlyph(sk().getStrokes(), glyphs);
      name = glyph.name;
      if (name.indexOf('sketchPage.loadPage(') == 0) {
         id = parseInt(name.substring(20, name.length));
         for (i = 0 ; i < collections.length ; i++)
            if (id == collections[i].id) {
               collections.splice(i, 1);
               server.set('state/collections', collections);
               for (j = 0 ; j < glyphs.length ; j++)
                  if (glyph == glyphs[j]) {
                     glyphs.splice(j, 1);
                     break;
                  }
               break;
            }
      }
      sk().fade();
   }

   function addCollectionGlyph(id, trace) {
      var glyph = new SketchGlyph('sketchPage.loadPage(' + id + ')', trace);
      glyph.indexName = '';
      glyphs.push(glyph);
   }

   //------------------------------------------------------------------------------

   var sketchClickActionNames = [
      'delete',
      'nudge',
      'move',
      'copy',
      'scale',
      '',
      'rotate',
      'undraw',
   ];

   function sketchClickActionName(dir, sketch) {
      var name = sketchClickActionNames[dir];
      if (sketch !== undefined)
         if (! sketch.isFreehandSketch())
            switch (dir) {
            case 1: name = 'unparse' ; break;
            case 5: name = 'cmd'     ; break;
            case 7: name = ''        ; break;
            }
      return name;
   }

   function doSketchClickAction(x, y) {

      if (bgClickCount != 1 || ! isHover())
         return false;

      // CLICK ON A SKETCH AFTER CLICK OVER THE BACKGROUND: DO SPECIAL ACTIONS.

      bgClickCount = 0;

      var index = pieMenuIndex(bgClickX - This().mouseX, bgClickY - This().mouseY, 8);
      switch (index) {
      case 0:
         sk().fade();             // E -- FADE TO DELETE
         fadeArrowsIntoSketch(sk());
         break;
      case 1:

         // IF A FREEHAND SKETCH, ENTER BEND CURVE MODE.

         if (sk().isFreehandSketch())  {
            if (! (sk() instanceof NumericSketch)) {
               sketchAction = "nudging";  // NE -- BEND
               nudgeCurveInit(sk().sp0, sk().m2s([This().mouseX,This().mouseY]), 1);
            }
         }

         // CONVERT A PROCEDURAL SKETCH INTO THE FREEHAND SKETCH THAT WOULD GENERATE IT.

         else if (sk().glyph !== undefined) {
            sk().toFreehandSketch();      // NE -- TURN TO FREEHAND SKETCH
	    sk().glyph = findGlyph(sk().getStrokes(), glyphs);
         }
         break;
      case 2:
         sketchAction = "translating";    // N -- TRANSLATE
         break;
      case 3:
         var tX = sk().tX;
         var tY = sk().tY;
         copySketch(sk());                // NW -- CLONE
         sk().tX = tX;
         sk().tY = tY;
         sketchAction = "translating";
         break;
      case 4:
         sketchAction = "scaling";        // W -- SCALE
         break;
      case 5:
         if (sk() instanceof FreehandSketch)
            ;//toggleTextMode();          // SW -- IF SIMPLE SKETCH, TOGGLE TEXT MODE
         else if (isDef(sk().onCmdClick)) {     // ELSE CMD CLICK
            m.save();
            computeStandardViewInverse();
            sketchPage.skCallback('onCmdClick', x, y);
            m.restore();
         }
         break;
      case 6:
         sketchAction = "rotating";       // S -- ROTATE
         _rotate_x = events_canvas.mouseX;
         _rotate_y = events_canvas.mouseY;
         _rotate_travel = 0;
         break;
      case 7:
         if (sk() instanceof FreehandSketch) {
            sketchAction = "undrawing";   // SE -- "UNDRAW" A FREEHAND SKETCH.
            sketchPage.tUndraw = 0;
         }
         break;
      }

      return true;
   }

   function isHover() { return isk() && sk().isMouseOver; }
   function isk() { return isDef(sk()) && sk() != null; }
   function nsk() { return sketchPage.sketches.length; }
   function sk(i) { return nsk() == 0 ? null : sketchPage.sketches[i === undefined ? sketchPage.index : i]; }
   function dsk() { return sketchPage.drawSketch; }

   function clear() { sketchPage.clear(); }

   var save_isDrawingSketch;

   function annotateStart(context) {
      if (context === undefined)
         context = _g;
      save_isDrawingSketch = isDrawingSketch;
      isDrawingSketch = false;
      context.save();
      context.lineWidth = 1;
   }

   function annotateEnd(context) {
      if (context === undefined)
         context = _g;
      isDrawingSketch = save_isDrawingSketch;
      context.restore();
   }

   var visible_sp = null;

   var ttForce = newArray(1024);

   function ttTick() {
      if (tt !== undefined && tt.myState === undefined)
         tt.waitForDomReady(document, function() {
            tt.load(function(error) {
               tt.myState = new tt.State();
               console.log('tt load error = ' + error);
            });
         });
      if (tt.myState !== undefined) {
         tt.pollState(tt.myState);
         for (var i = 0 ; i < 1024 ; i++)
            ttForce[i] = tt.myState.hmd.forces[i] / 4096;
      }
   }

   var tryToSelectSketchAtCursor = function() {
      for (var I = nsk() - 1 ; I >= 0 ; I--)
         if (sk(I).isMouseOver && sk(I).sketchState == 'finished') {
            selectSketch(I);
            break;
         }
   }

   function createArrowCurve(a, b, c) {
      var C = b == null ? c : createCurvedLine([a.cx(),a.cy()], [b.cx(),b.cy()], c);
      C = clipCurveAgainstRect(C, [a.xlo,a.ylo,a.xhi,a.yhi]);
      if (b != null)
         C = clipCurveAgainstRect(C, [b.xlo,b.ylo,b.xhi,b.yhi]);
      return C;
   }

   var displayList;
   var eventClientId = -1;
   var isClientMouseDown = [];
   var midi;
   var server;
   var socket;
   var ttData = [];

   function ttUpdate() {
      server.getTT(function(data) {
         ttData = data.split(',');
      });
   }

   var tick = function(g) {

      if (window.displayListener)
         displayList = [ 0 ];
/*
if (! isPhone() && window.imuData)
   console.log("imuData = " + JSON.stringify(imuData));
*/
      if (g === undefined)
         g = _g;

      clockTime = (new Date()).getTime() / 1000;

      if (window.startTime === undefined)
        window.startTime = clockTime;

      var prevTime = time;
      time = clockTime - startTime;
      This().elapsed = time - prevTime;

      _faders.update(This().elapsed);

      //ttUpdate();

      viewForwardMat.identity();
      viewInverseMat.copy(viewForwardMat).invert();

      if (window.forceSetPageAtTime !== undefined && forceSetPageAtTime < time) {
         forceSetPageAtTime = undefined;
         setPage(pageIndex);
         isFinishedLoadingSketches = true;

         // IF THE SERVER HAS ANY COLLECTIONS,

         var lsRequest = new XMLHttpRequest();
         lsRequest.open("GET", "ls_state");
         lsRequest.onloadend = function () {
            if (lsRequest.responseText.indexOf('collections') >= 0)

               // THEN LOAD THE COLLECTIONS INDEX.

               server.get('state/collections', function(value) {
                  collections = value;
                  for (var i = 0 ; i < collections.length ; i++)
                     addCollectionGlyph(collections[i].id, collections[i].strokes);
               });
         }
         lsRequest.send();
      }

      var w = width(), h = height();

      isShowingHelp = isShowingHelp && !isTextMode; 

      // RENDER CONTENTS OF VIDEO LAYER

      if (isVideoLayer()) {
         videoLayer.render();
      }

      // SET CONSTANTS FOR projectX() and projectY().

      pxM =  344 * w / 1440;
      pxB =  w / 2;
      pyM = -344 * w / 1440;
      pyB =  h / 2;
/*
      ttTick();     // HANDLE THE TACTONIC SENSOR, IF ANY.
*/
      // TURN OFF ALL DOCUMENT SCROLLING.

      document.body.scrollTop = 0;

      // DON'T DO ANYTHING UNTIL THE ANIMATE FUNCTION IS DEFINED.

      if (isDef(window[g.name].animate)) {

         if (sketchPage.wandEmulation) {
            var _p = sketchPage.wandEmulation;
            _p.x += 0.03 * noise((time + 100) / 3);
            _p.y += 0.03 * noise((time + 200) / 3);
            _p.z += 0.03 * noise((time + 300) / 3);
            moveWand(_p.x, _p.y, _p.z, 0, 0, 0, 1);
         }


         // SET THE CURSOR STYLE.

         document.body.style.cursor =
              window.isVideoPlaying                                 ? 'none'
            : sketchPage.hideCursor !== undefined                   ? 'none'
            : ! isShowingHelp && isSketchInProgress()           ? 'none'
            : isTextMode && ! window.isWritingToTextSketch          ? 'text'
            : overview_alpha == 1                                   ? 'zoom-in'
            : group.isCreating ? (group.xDown == group.xhi) == (group.yDown == group.ylo) ? 'nesw-resize' : 'nwse-resize'
            : bgClickCount == 1                                     ? isWhiteBackground() ? 'crosshair' : 'cell'
            :                                                         isWhiteBackground() ? 'cell' : 'crosshair'
            ;

         _g = g;

         if (window.useFakeContext !== undefined) {
            _g = fake_g;
            _g.name = g.name;
            _g.canvas.width = g.canvas.width;
            _g.canvas.height = g.canvas.height;
         }

         if (! isDef(_g.panX))
            _g.panX = 0;

         if (! isDef(_g.panY))
            _g.panY = 0;

         if (! isDef(_g.panZ))
            _g.panZ = 0;

         // CLEAR THE CANVAS

         _g.clearRect(-_g.panX - 100, -_g.panY - 100, w + 200, h + 200);
         _g.inSketch = false;

         // IF THERE IS A VIDEO LAYER, DARKEN IT.

         if (isVideoLayer() && videoBrightness < 1) {
            var scrimAlpha = max(0, 1 - videoBrightness);
            _g.fillStyle = rgbaToColor([0,0,0,scrimAlpha]);
            var x = _g.panX, y = _g.panY;
            _g.beginPath();
            _g.moveTo(-100-x,0-y);
            _g.lineTo(   w-x,0-y);
            _g.lineTo(   w-x,h-y);
            _g.lineTo(-100-x,h-y);
            _g.fill();
         }

         // DO ACTUAL CANVAS PANNING

         _g.setTransform(1,0,0,1,0,0);
         _g.translate(_g.panX, _g.panY, _g.panZ);

         // PAN 3D OBJECTS TOO

         root.position.x =  _g.panX / (0.3819 * height());
         root.position.y = -_g.panY / (0.3819 * height());
         root.position.z = -_g.panZ / (0.3819 * height());

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
               sk().zStart = cursorZ = sk().advanceZ = This().mouseZ;
               sk().sketchState = 'in progress';
            }

            if (sk().sketchState == 'in progress' && sk().isDrawingEnabled && sk().sketchProgress == 0) {
               sk().advanceX = This().mouseX;
               sk().advanceY = This().mouseY;
               sk().advanceZ = This().mouseZ;
            }
         }

         // ANIMATE AND DRAW ALL THE STROKES

         for (var I = 0 ; I < nsk() ; I++)
            if (! sk(I).isFreehandSketch()) {
               sk(I).sp = [[sk(I).xStart, sk(I).yStart, 0]];
               sk(I).dSum = 0;
            }

         This().animate(This().elapsed);

         for (var I = 0 ; I < nsk() ; I++)
            if (! sk(I).isFreehandSketch())
               sk(I).sketchLength = sk(I).dSum;

         // COMPUTE SKETCH BOUNDING BOXES.

         isMouseOverBackground = true;
         for (var I = 0 ; I < nsk() ; I++) {
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

            // TEXT EXTENDS THE BOUNDING BOX OF A SKETCH.

            if (sk(I) instanceof NumericSketch ||
               sk(I) instanceof FreehandSketch && sk(I).text.length > 0) {
               var rx = sk(I).scale() * sk(I).textWidth / 2;
               var ry = sk(I).scale() * sk(I).textHeight / 2;
               var x1 = mix(sk(I).tx(), sk(I).textX, sk(I).scale());
               var y1 = mix(sk(I).ty(), sk(I).textY, sk(I).scale());
               xlo = min(xlo, x1 - rx);
               ylo = min(ylo, y1 - ry);
               xhi = max(xhi, x1 + rx);
               yhi = max(yhi, y1 + ry);
            }
            else if (sk(I).sp.length <= 1) {
               xlo = xhi = sk(I).cx();
               ylo = yhi = sk(I).cy();
            }

            if (sk(I).keys) {
               xlo = ylo = 10000;
               xhi = yhi = -10000;
               for (var keyIndex = 0 ; keyIndex < sk(I).keys.length ; keyIndex++) {
                  var strokes = sk(I).keys[keyIndex];
                  for (var strokeIndex = 0 ; strokeIndex < strokes.length ; strokeIndex++) {
                     var stroke = strokes[strokeIndex];
                     for (var i = 0 ; i < stroke.length ; i++) {
                        var point = strokes[strokeIndex][i];
                        xlo = min(xlo, point[0]);
                        ylo = min(ylo, point[1]);
                        xhi = max(xhi, point[0]);
                        yhi = max(yhi, point[1]);
                     }
                  }
               }
            }

            sk(I).xlo = xlo - sketchPadding;
            sk(I).ylo = ylo - sketchPadding;
            sk(I).xhi = xhi + sketchPadding;
            sk(I).yhi = yhi + sketchPadding;

            sk(I).isMouseOver = sk(I).parent == null &&
                                sk(I).fadeAway == 0 &&
                                This().mouseX >= sk(I).xlo &&
                                This().mouseX <  sk(I).xhi &&
                                This().mouseY >= sk(I).ylo &&
                                This().mouseY <  sk(I).yhi ;

            // IF MOUSE IS OVER ANY SKETCH, THEN IT IS NOT OVER BACKGROUND.

            if (sk(I).isMouseOver)
               isMouseOverBackground = false;
         }

         // DRAW ARROWS.

         if (! sketchPage.isPressed)
            arrowNearCursor = null;

         annotateStart();
         for (var I = 0 ; I < nsk() ; I++)
            if (sk(I).parent == null) {
               var a = sk(I);
               for (var n = 0 ; n < a.arrows.length ; n++) {
                  var c = a.arrows[n][0];
                  var b = a.arrows[n][1];

                  var alpha = 1;
                  var fade = a.arrows[n][2];
                  if (fade !== undefined) {
                     alpha = fade;
                     alpha = max(0, a.arrows[n][2] - 3 * This().elapsed);
                     if (alpha == 0) {
                        a.arrowRemove(b);
                        continue;
                     }
                     a.arrows[n][2] = alpha;
                  }
                  alpha *= sk(I).fadeAlpha();

                  var C = createArrowCurve(a, b, c);

                  if (C[0] === undefined)
                     continue;

                  if (! sketchPage.isPressed && isMouseNearCurve(C))
                     arrowNearCursor = { s: sk(I), n: n };

                  var nc = C.length;
                  _g.strokeStyle = defaultPenColor;
                  _g.lineWidth = width() / 300;
                  _g.globalAlpha = sCurve(alpha);
                  _g_beginPath();
                  _g_moveTo(C[0][0], C[0][1]);
                  for (var k = 0 ; k < nc ; k++)
                     _g_lineTo(C[k][0], C[k][1]);
                  if (nc > 4) {
                     var dx = C[nc-1][0] - C[nc-4][0];
                     var dy = C[nc-1][1] - C[nc-4][1];
                     var d = len(dx, dy);
                     dx *= _g.lineWidth * 5 / d;
                     dy *= _g.lineWidth * 5 / d;
                     _g_lineTo(C[nc-1][0] - dx - dy, C[nc-1][1] - dy + dx);
                     _g_lineTo(C[nc-1][0], C[nc-1][1]);
                     _g_lineTo(C[nc-1][0] - dx + dy, C[nc-1][1] - dy - dx);
                  }
                  _g_stroke();
               }
            }
         annotateEnd();

         // DRAW LINKS.

        // original, remove this commented line when new if statement confirmed
        // beyond reasonable doubt not to be buggy
         // if (isAudiencePopup() || ! isShowingOverlay())
         if (isAudiencePopup() || !(isShowingGlyphs && isDef(This().overlay))) {

            annotateStart();

            // START DRAWING A POSSIBLE NEW LINK.

            if (sketchDragMode == 4)
               drawPossibleLink(outSketch, sketchPage.mx, sketchPage.my);

            // DRAW ALL EXISTING LINKS.

            if (! sketchPage.isPressed)
               linkAtCursor = null;

            if (isShowingLinks)
               for (var I = 0 ; I < nsk() ; I++)
                  if (sk(I).parent == null) {
                     var a = sk(I);
                     for (var i = 0 ; i < a.out.length ; i++)
                        if (isDef(a.out[i]))
                           for (var k = 0 ; k < a.out[i].length ; k++) {
                              var link = a.out[i][k];
                              link.draw(true);
                              if (! window.isPressed && isMouseNearCurve(link.C)) {
                                  linkAtCursor = link;
                                  link.draw(true);
                              }
                           }
                  }

            annotateEnd();
         }

         if (! isShowingHelp) {
            if (isSketchInProgress())
               drawCrosshair(cursorX, cursorY);
         }

         if (isAudiencePopup()) {

            // MAKE SURE AUDIENCE VIEW HAS THE RIGHT BACKGROUND COLOR.

            audienceCanvas.style.backgroundColor = backgroundColor;

            // DRAW A CURSOR WHERE AUDIENCE SHOULD SEE IT.

            if (isSketchInProgress())
               drawCrosshair(cursorX, cursorY);
            else
               drawCrosshair(This().mouseX, This().mouseY);

            // SHOW AUDIENCE VIEW.

            if (! isShowingPresenterView) {
               audienceContext.clearRect(0, 0, width(), height());
               audienceContext.drawImage(_g.canvas, 0, 0);
            }
         }

         // EVALUATE AND PROPAGATE EXPRESSIONS AND LINKS BETWEEN PORTS.

         for (var I = 0 ; I < nsk() ; I++) {

            // IF SKETCH HAS ANY OUT LINKS:

            if (sk(I).out.length > 0 || sk(I).containsTextAssignment()) {

               var S = sk(I);

               // IF SKETCH HAS AN OUTPUT FUNCTION, EVALUATE IT.

               if (typeof S.output == 'function')
                  S.outValue[0] = S.output();

               // ELSE IF SKETCH HAS TEXT, EVALUATE IT.  IF THERE IS ANY RESULT, PASS IT TO OUTPUT.

               else if (! S.isNullText()) {
                  S.evalResult = S.evalCode(S.text);
                  if (S.evalResult != null && isDef(S.out[0]))
                     S.outValue[0] = S.evalResult;
               }

               // PROPAGATE VALUES ALONG LINKS.

               for (var i = 0 ; i < S.out.length ; i++)
                  if (isDef(S.out[i])) {
                     var outValue = isDef(S.outValue[i]) ? S.outValue[i] : "0";
                     for (var k = 0 ; k < S.out[i].length ; k++) {
                        var link = S.out[i][k];
                        link.b.inValue[link.j] = outValue;
                     }
                  }
            }
         }

         // UPDATE FLATTENED ARRAYS OF SKETCH INPUT VALUES.

         for (var I = 0 ; I < nsk() ; I++) {
            var S = sk(I);
            S.inValues = [];
            for (var i = -1 ; i < S.in.length ; i++) {
               var val = S.inValue[i];
               if (isDef(val)) {
                  if (Array.isArray(val))
                     for (var k = 0 ; k < val.length ; k++)
                        S.inValues.push(val[k]);
                  else
                     S.inValues.push(val);
               }
            }

            // IF NOT EVALUATING TEXT, JUST PASS INPUT TO OUTPUT.

            if (S.isNullText())
               S.outValue[0] = S.inValues;
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
                        var val = s.outValue[i];
                        var str = isNumeric(val) ? roundedString(val) : val;

                        textHeight(20);
                        color(backgroundColor);
                        var _sw = textWidth(str);
                        var _sh = textHeight();
                        _g_beginPath();
                        _g_moveTo(xy[0] - _sw/2, xy[1] - _sh/2);
                        _g_lineTo(xy[0] + _sw/2, xy[1] - _sh/2);
                        _g_lineTo(xy[0] + _sw/2, xy[1] + _sh/2);
                        _g_lineTo(xy[0] - _sw/2, xy[1] + _sh/2);
                        _g_fill();

                        color(liveDataColor);
                        utext(str, xy[0], xy[1], .75, .5);
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

         var leftX   = 0 - _g.panX;
         var rightX  = w - _g.panX;
         var topY    = 0 - _g.panY;
         var bottomY = h - _g.panY;

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

         overview_update();

         group.update(This().elapsed);

         if (isShowingGlyphs && ! isShowingHelp)
            glyphChart.draw();

         // WHEN SKETCH OR SKETCHPAGE IS LOCKED, SHOW A SMALL COLORED "DRAWING" DISK AT CURSOR.

         else if (
                   ! palette.isVisible &&
                   ! group.isCreating &&
                   ! group.contains(sketchPage.x, sketchPage.y) &&
                   (sketchPage.isLocked || isk() && isHover() && sk().isFreehandSketch() && sk().isLocked()) ) {
            annotateStart();
            color(fadedColor(0.5, isk() && isHover() ? sk().colorId : sketchPage.colorId));
            var r = bgClickCount == 0 ? 10 : 8;
            fillOval(sketchPage.x - r, sketchPage.y - r, 2 * r, 2 * r);
            annotateEnd();
         }

         // MAKE SURE ALT-CMD-J (TO BRING UP CONSOLE) DOES NOT ACCIDENTALLY DO A SKETCH COPY.

         if (isAltPressed && isCommandPressed)
            isAltKeyCopySketchEnabled = false;
         else if (!isAltPressed && ! isCommandPressed)
            isAltKeyCopySketchEnabled = true;

         if (isFog) {
            var orw = width() + 1000;
            for (var i = 0 ; i < 10 ; i++) {
               var x = 500 * (noise(  .5, .1 * time, 10 * i + .5) - 1);
               var y = 500 * (noise(10.5, .1 * time, 10 * i + .5) - 1);
               if (OR_imageObj === undefined) {
                  OR_imageObj = new Image();
                  OR_imageObj.src = "images/smoke_0.png";
               }
               _g.drawImage(OR_imageObj, x, y, orw, orw);
            }
         }

         // DISPLAY DEBUG MESSAGE ON SCREEN, IF ONE IS DEFINED.

         if (window.debugMessage !== undefined) {
            annotateStart();
            _g.fillStyle = _g.strokeStyle = 'cyan';
            textHeight(50);
            text(debugMessage, w/2, h/2);
            annotateEnd();
            debugMessage = undefined;
         }

         if (speakerNotes) {
            annotateStart();
            _g_fillStyle = _g.strokeStyle = fadedColor(0.5);
            _g.font = '10pix Arial';
            _g_text(speakerNotes, 5 - _g.panX, h - 5 - _g.panY, 5 - _g.panZ);
            annotateEnd();
         }

         if (isShowingTime) {
            annotateStart();
            _g.fillStyle = _g.strokeStyle = fadedColor(0.5);
            textHeight(12);
            var date = new Date();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var timeString = (((hours + 11) % 12) + 1) + (minutes < 10 ? ':0' : ':') + minutes;
            _g.font = '12pt Arial';
            _g_text(timeString, w - textWidth(timeString) - 6 - _g.panX, h - 6 - _g.panY, -6 - _g.panZ);
            annotateEnd();
         }

         if (errorMessage) {
            annotateStart();
            var _save_g_Font = _g.font;
            _g.fillStyle = 'rgb(255,180,160)';
            _g.fillStyle = backgroundColor;
            _g.font = '13px Arial';
            _g_text(errorMessage, 5, 15);
            _g.font = _save_g_Font;
            annotateEnd();
         }
      }

      if (isPhone())
         drawCrosshair(This().mouseX, This().mouseY);

      if (server.nClients > 1)
         drawWebClientIcons();

      // CHECK FOR CURRENT FREEHAND SKETCH ABSORBING OTHER FREEHAND SKETCHES.

      if (window.checkForAbsorb) {
         sk().absorb();
         delete window.checkForAbsorb;
      }

      if (window.displayListener)
         (function() {
            var data = new Uint16Array(4 + displayList.length), header = 'CTdata01', i;
	    for (i = 0 ; i < 4 ; i++)
	       data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
	    for (i = 0 ; i < data.length ; i++)
	       data[i + 4] = displayList[i];

            server.socket.send(data.buffer);
         })();
   }

   var ef = new EncodedFraction();

   function isSketchInProgress() {
      return isk() && sk().sketchState == 'in progress';
   }

   function isShowingOverlay() {
      return isShowingHelp &&
             ( isShowingGlyphs || isDef(This().overlay) );
   }

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

   var audiencePopup = null, audienceCanvas, audienceContext;
   var cursorX = 0, cursorY = 0, cursorZ = 0;

   function fadeArrowsIntoSketch(sketch) {
      for (var I = 0 ; I < nsk() ; I++)
         if (sk(I) != sketch)
            sk(I).arrowFade(sketch);
   }

   function deleteSketch(sketch) {
      if (sketch !== undefined && sketch !== null)
         sketch.delete();
   }

   function selectSketch(n) {
      if (n == sketchPage.index)
         return;
      sketchPage.index = n;
      if (isk() && sk().isFreehandSketch() && sk().text)
         currentTextSketch = sk();
   }

   function copySketch(s) {
      if (s === undefined || s == null)
         return;

      var children = null;

      addSketch(s.clone());

      for (var prop in s)
         if (! (s[prop] instanceof Object))
            sk()[prop] = s[prop];
         else if (s[prop] instanceof Array)
            sk()[prop] = cloneArray(s[prop]);

      sk().id = _sketch_id_count_++;

      sk()._curves = cloneArray(s._curves);

      sk().portLocation = cloneArray(s.portLocation);

      if (s.code != null)
         sk().code = cloneArray(s.code);

      if (sk().initCopy !== undefined)
         sk().initCopy();

      if (sk().createMesh)
         sk().mesh = undefined;
      sk().sketchProgress = 1;
      sk().sketchState = 'finished';

      sk().copyStretchValues(s);

      sk()._faders = (new Faders()).copy(s._faders);

      var dx = This().mouseX - s.tx();
      var dy = This().mouseY - s.ty();

      sk().tX += dx;
      sk().tY += dy;
      if (! sk().isFreehandSketch()) {
         sk().tX -= width() / 2;
         sk().tY -= height() / 2;
      }
      sk().textX += dx;
      sk().textY += dy;
   }

   function addSketch(sketch) {

      sketch.drawing = new DRAWING.Drawing();
      sketch.sketchTexts = [];

      if (sketch.init)
         sketch.init();

      if (sketch.labels.length == 0)
         sketch.labels.push(sketch.label);
      sketchPage.add(sketch);
      sk().arrows = [];
      sk().children = [];
      if (sk().colorId === undefined)
         sk().setColorId(sketchPage.colorId);
      sk().defaultValue = [];
      sk()._faders.clear();
      sk().id = globalSketchId++;
      sk().in = [];
      sk().inValue = [];
      sk().isDrawingEnabled = false;
      sk().out = [];
      sk().outValue = [];
      sk().portBounds = [];
      sk().portLocation = [];
      sk().sketchState = 'start';
      sk().viewForwardMat.copy(viewForwardMat);
      sk().viewInverseMat.copy(viewInverseMat);
      sk().zoom = sketchPage.zoom;
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

   function drawCrosshair(x, y) {
      var r = 6.5 * window.innerWidth / window.outerWidth;

      x = floor(x);
      y = floor(y);

      for (var n = 0 ; n < 2 ; n++) {
         _g.strokeStyle = n == 0 ? backgroundColor : defaultPenColor;
         _g.lineWidth = bgClickCount == 1 ? 1 : 3;

         _g_beginPath();
         _g_moveTo(x - r, y);
         _g_lineTo(x + r, y);
         _g_stroke();

         _g_beginPath();
         _g_moveTo(x, y - r);
         _g_lineTo(x, y + r);
         _g_stroke();
      }
   }

////////////////////////////////////////////////////////////
/////// SKETCHES THAT MAKE USE OF WEBGL AND SHADERS ////////
////////////////////////////////////////////////////////////

   var pxM, pxB, pyM, pyB;

   function projectX(x) { return pxM * x + pxB; }
   function projectY(y) { return pyM * y + pyB; }

   function createMesh(geometry, vertexShader, fragmentShader) {
      return new THREE.Mesh(geometry, shaderMaterial(vertexShader, fragmentShader));
   }

   function computePreglyphSketchBounds() {
      if (preglyphSketch != null)
         return computeCurveBounds(preglyphSketch.sp, 1);
      else
         return new Bounds(sketchPage.x-50, sketchPage.y-50,
                           sketchPage.x+50, sketchPage.y+50);
   }

   function setMeshUpdateFunction(mesh) {
      mesh.update = function() {
         if (this.material.uniforms === undefined)
            return;

         var S = this.sketch;

         // TELL THE MATERIAL ABOUT THE CURRENT TIME.

         S.setUniform('uTime', time);

         // TELL THE MATERIAL WHAT THE CURRENT SKETCH LOCATION IS IN PIXELS.

         if (S.x == 0) {
            S.x = (S.xlo + S.xhi)/2;
            S.y = (S.ylo + S.yhi)/2;
         }

         // TELL THE MATERIAL WHAT THE CURRENT MOUSE LOCATION IS ON THE SKETCH, ON A RANGE FROM FROM -1 TO +1.

         if (! S.isClick) {
            var x =  (S.x - (S.xlo + S.xhi)/2) / ((S.xhi - S.xlo)/2);
            var y = -(S.y - (S.ylo + S.yhi)/2) / ((S.yhi - S.ylo)/2);
            S.setUniform('mx', x);
            S.setUniform('my', y);

            S.setUniform('uCursor', [x, y, S.mousePressed ? 1 : 0]);
         }

         // TELL THE MATERIAL ABOUT ALPHA AND THE FADEAWAY BEFORE THE SKETCH IS DELETED.

         var alpha = S.fadeAlpha() * (isDef(S.alpha) ? S.alpha : 1);
         mesh.material.transparent = alpha < 1;
         S.setUniform('alpha', alpha);
         S.setUniform('uAlpha', alpha);

         // TELL THE MATERIAL WHICH INDEX IS SELECTED IN THE SKETCH'S CODE TEXT BUBBLE.

         S.setUniform('selectedIndex', isDef(S.selectedIndex) ? S.selectedIndex : 0);

         // TELL THE MATERIAL THE SIZE OF ONE PIXEL, IN TEXTURE SPACE.

         S.setUniform('pixelSize', 3 / (S.xhi - S.xlo));
      }
   }

   // RENDERING MATERIALS CORRESPONDING TO BACKGROUND AND FOREGROUND COLORS.

   function bgMaterial() {
      return backgroundColor == whiteBackgroundColor ? whiteMaterial : blackMaterial;
   }

   function penMaterial() {
      return backgroundColor == whiteBackgroundColor ? blackMaterial : whiteMaterial;
   }

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

   var _g, clockTime = (new Date()).getTime() / 1000, time = 0;

   var motion = [];
   for (var i = 0 ; i < palette.color.length ; i++)
      motion.push(1);

   var glyphCountBeforePage = 0;

   function setPage(index) {

      if (index < 0 || index >= sketchPages.length)
         return;

      // SAVE PAN VALUE FOR PREVIOUS PAGE

      sketchPages[pageIndex].panX = _g.panX;
      sketchPages[pageIndex].panY = _g.panY;
      sketchPages[pageIndex].panZ = _g.panZ;

      // RESTORE PAN VALUE FOR NEXT PAGE

      _g.panX = sketchPages[index].panX;
      _g.panY = sketchPages[index].panY;
      _g.panZ = sketchPages[index].panZ;

      // MAKE SURE SKETCH ACTION, BG-CLICK ACTION, CODE WIDGET, ETC ARE TURNED OFF.

      sketchActionEnd();
      bgClickCount = 0;
      if (isCodeWidget)
         toggleCodeWidget();

      if (index === undefined)
         index = pageIndex;

      pageIndex = (index + sketchPages.length) % sketchPages.length;

      sketchPage = sketchBook.setPage(pageIndex);
      var slide = document.getElementById('slide');

      // SET PAGE CONTENT FROM TEMPLATE OR STRAIGHT FROM HTML

      var pageObject = sketchPages[pageIndex];
      if (isDef(pageObject.innerHTML))
         slide.innerHTML = pageObject.innerHTML;
      else if (isDef(pageObject.template))
         insertTemplate(pageObject.template, slide);

      // IF THERE IS A VIDEO ON THE NEW PAGE, START PLAYING IT.

      var vidElements = slide.getElementsByClassName("vid");
      if (window.isVideoPlaying = vidElements.length > 0) {
         vidElements[0].play();
      }

      // IF THERE IS AN AUDIENCE POP-UP, SET IT TO THE RIGHT PAGE.

      if (isAudiencePopup())
         audiencePopup.document.getElementById('slide').innerHTML =
            document.getElementById(pageName).innerHTML;

      // SET SKETCH TYPES FOR THIS PAGE, IF THIS IS THE FIRST TIME.

      if (! isFinishedLoadingSketches) {

         sketchTypes = sketchPages[pageIndex].availableSketches;
	 if (sketchTypes === undefined)
	    sketchTypes = [];
         sketchTypeLabels = [];

         for (var n = 0 ; n < sketchTypes.length ; n++)
            registerSketch(sketchTypes[n]);

         for (var i = 0 ; i < sketchTypesToAdd.length ; i++)
            registerSketch(sketchTypesToAdd[i]);
      }

      // IF FIRST TIME, AND THERE IS A DEFAULT IMAGE, SET IT.

      if (isDef(pageObject.defaultImage))
         for (var n = 0 ; n < imageLibrary_imageNames.length ; n++)
            if (pageObject.defaultImage == imageLibrary_imageNames[n]) {
               sketchPage.imageLibrary_index = n;
               sketchPage.imageLibrary_alpha = 1;
               pageObject.defaultImage = undefined;
               break;
            }

      // SWAP IN THE 3D RENDERED SCENE FOR THIS PAGE.

      if (sketchPage.scene == null) {
         sketchPage.scene = new THREE.Scene();
         sketchPage.scene.add(ambientLight(0x333333));
         sketchPage.scene.add(directionalLight(1,1,1, 0xffffff));
         sketchPage.scene.add(directionalLight(-1,0,-1, 0x808080));
         sketchPage.scene.root = new node();
         sketchPage.scene.add(sketchPage.scene.root);
      }
      renderer.scene = sketchPage.scene;
      window.root = renderer.scene.root;
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

