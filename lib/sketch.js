"use strict";

// THE BASIC SKETCH CLASS, FROM WHICH ALL SKETCHES ARE EXTENDED.

var _sketch_id_count_ = 0;

function Sketch() {
   this.children = [];
   this.onDelete = null;
   this.code = null;
   this.colorIndex = [];
   this.cursorTransition = 0;
   this.dSum = 0;
   this.defaultValue = [];
   this.defaultValueIncr = [];
   this.fadeAway = 0;
   this.fadeUp = 1;
   this._faders = new Faders();
   this.sketchTexts = [];
   this.sketchTrace = [];
   this.trace = [];
   this.glyphTransition = 0;
   this.id = _sketch_id_count_++;
   this.in = []; // array of Sketch
   this.inLabel = []; // array of incoming link labels
   this.inValue = []; // array of incoming link values
   this.inValues = []; // flattened array of inValue
   this.is3D = false;
   this.isCard = false;
   this.isMouseOver = false;
   this.isNegated = false;
   this.isShowingLiveData = false;
   this.labels = [];
   this.keyDown = function(key) {};
   this.keyUp = function(key) {};
   this.mouseDown = function(x, y) {};
   this.mouseDrag = function(x, y) {};
   this.mouseMove = function(x, y) {};
   this.mouseUp = function(x, y) {};
   this.nPorts = 0;
   this.out = []; // array of array of Sketch
   this.outValue = []; // array of values
   this.parent = null;
   this.parse = function() {};
   this.portName = [];
   this.portLocation = [];
   this.portBounds = [];
   this.rX = 0;
   this.rY = 0;
   this.render = function() {};
   this.sc = 1;
   this.scene = null;
   this.selection = 0;
   this.setup = function() {};
   this.size = 400;
   this.sketchLength = 1;
   this.sketchProgress = 0;
   this.sketchState = 'finished';
   this.sp = [];
   this.styleTransition = 0;
   this.suppressLineTo = false;
   this.suppressSwipe = false;
   this.onCmdSwipe = [];
   this.onSwipe = [];
   this.tX = 0;
   this.tY = 0;
   this.text = "";
   this.textCursor = 0;
   this.textHeight = -1;
   this.textStrs = [];
   this.textX = 0;
   this.textY = 0;
   this.value = null;
   this.viewForwardMat = new M4();
   this.viewInverseMat = new M4();
   this.x = 0;
   this.xyz = [];
   this.xStart = 0;
   this.xf = [0,0,1,0,1];
   this.y = 0;
   this.yStart = 0;
   this.zoom = 1;
}

Sketch.prototype = {
   xyzS : function() { return this.xyz.length < 3 ? 1 : this.xyz[2]; },

   adjustD : function(d) { return this.xyz.length == 0 ? d : this.xyz[2] * d; },
   adjustX : function(x) { return this.xyz.length == 0 ? x : this.xyz[2] * x + this.xyz[0]; },
   adjustY : function(y) { return this.xyz.length == 0 ? y : this.xyz[2] * y + this.xyz[1]; },
   adjustXY : function(xy) { return [ this.adjustX(xy[0]), this.adjustY(xy[1]) ]; },

   unadjustD : function(d) { return this.xyz.length == 0 ? d : d / this.xyz[2]; },
   unadjustX : function(x) { return this.xyz.length == 0 ? x : (x - this.xyz[0]) / this.xyz[2]; },
   unadjustY : function(y) { return this.xyz.length == 0 ? y : (y - this.xyz[1]) / this.xyz[2]; },
   unadjustXY : function(xy) { return [ this.unadjustX(xy[0]), this.unadjustY(xy[1]) ]; },

   centerParams : function(a, b, c) {
      var p = this.params;
      var t = (p[b] - p[a]) / 2;
      p[a] = p[c] - t;
      p[b] = p[c] + t;
   },         
   
   adjustParamCurves : function() {
      var P, a, c, i, iterate, n, points, strokes;
      var bs, bc, p, pcurves, pts, s, stroke;

      if (! this._adjustedParamCurves && this.params && this.curves &&
          this.sketchTrace && this.sketchTrace.length == this.curves.length) {

         strokes = cloneArray(this.sketchTrace);
         for (n = 0 ; n < strokes.length ; n++)
            for (i = 0 ; i < strokes[n].length ; i++)
               strokes[n][i][1] *= -1;

         P = [];
         for (n = 0 ; n < this.curves.length ; n++) {
            P.push([]);
            for (i = 0 ; i < this.curves[n].length ; i++)
               if (this.curves[n][i] instanceof Array)
                  P[n].push(this.curves[n][i]);
         }

         pcurves = buildParamCurves(this.params, this.curves);
         bs = computeCurvesBounds(strokes);
         bc = computeCurvesBounds(pcurves);
         s = sqrt((bc.width / bs.width) * (bc.height / bs.height));

         points = [];
         for (n = 0 ; n < strokes.length ; n++) {
            stroke = [];
            for (i = 0 ; i < strokes[n].length ; i++)
               stroke.push([ s * (strokes[n][i][0] - bs.x) + bc.x ,
                             s * (strokes[n][i][1] - bs.y) + bc.y ]);

            pts = [];
            indices = matchParamCurve(stroke, this.params, this.curves[n]);
            for (i = 0 ; i < indices.length ; i++)
               pts.push(stroke[indices[i]]);

            points.push(pts);
         }

         for (iterate = 0 ; iterate < 10 ; iterate++) {

            for (n = 0 ; n < P.length ; n++)
               if (points[n].length == P[n].length)
                  for (i = 0 ; i < P[n].length ; i++)
                     for (a = 0 ; a < 2 ; a++)
                        this.params[P[n][i][a]] = mix(this.params[P[n][i][a]], points[n][i][a], 0.1);

            if (this.constraints)
               for (n = 0 ; n < this.constraints.length ; n++) {
                  c = this.constraints[n];
                  switch (c[0]) {
                  case 'center':
                     this.centerParams(c[1], c[2], c[3]);
                     break;
                  }
               }
         }

         pcurves = buildParamCurves(this.params, this.curves);
         for (n = 0 ; n < pcurves.length ; n++)
            for (i = 0 ; i < pcurves[n].length ; i++) {
               x = pcurves[n][i][0];
               y = pcurves[n][i][1];
               p = mTransform([x, y, _g_z]);
               pcurves[n][i][0] = p[0];
               pcurves[n][i][1] = p[1];
            }
         bs = computeCurvesBounds(this.sketchTrace);
         bc = computeCurvesBounds(pcurves);

         this._adjustedParamCurves = true;
      }
   },

   arrows : [],

   arrowBegin : function(x, y) {
      this.arrows.push( [ [[x,y]], null ] );
   },

   arrowDrag : function(x, y) {
      var n = this.arrows.length - 1;
      if (this.arrows[n] !== undefined)
         this.arrows[n][0].push([x,y]);
   },

   arrowEnd : function(x, y) {
      var n = this.arrows.length - 1;
      var sketches = sketchPage.sketchesAt(x, y);
      if (sketches.length == 0 || sketches[0] == this) {
         this.arrows.splice(n, 1); // If this is an arrow to nowhere, just delete it.
      }
      else {
         var s = this.arrows[n][0];
         this.arrows[n][0] = computeCurvature(s[0], s[floor(s.length/2)], s[s.length-1]);
         this.arrows[n][1] = sketches[0];
      }
   },

   arrowFade : function(sketch) {
      for (var n = 0 ; n < this.arrows.length ; n++)
         if (this.arrows[n][1] == sketch)
            this.arrows[n][2] = 1;
   },

   arrowRemove : function(sketch) {
      for (var n = 0 ; n < this.arrows.length ; n++)
         if (this.arrows[n][1] == sketch)
            this.arrows.splice(n--, 1);
   },
   fade : function() {
      if (this.fadeAway == 0)
         this.fadeAway = 1;
   },
   fadeAlpha : function() {
      return (this.fadeAway == 0 ? 1 : this.fadeAway) * this.fadeUp;
   },
   upload : function(contents) {
      var fileData = sketchFileData[this.typeName];
      if (contents !== undefined)
         fileData[1] = contents;
      server.upload(fileData[0], fileData[1]);
   },
   computeStrokesBounds : function() {
      this._S = [];
      for (var i = 0 ; i < this.sketchTrace.length ; i++) {
         var b = computeCurveBounds(this.sketchTrace[i]);
         b.scale(1 / this.size);
         this._S.push(b);
      }
   },
   drawStretchValues : function() {

      var sr = 50, dy = sr / 2, font = floor(.55 * dy) + 'pt Arial';
      var _saveFont, prop, i, x, y, isSelected, propValue, value;

      function valueToPixels(value) {
         var t = value;
         t = sqrt(t);
         t = t - 1;
         t = t * sr;
         t = max(-sr, min(sr, t));
         return t;
      }
      function pixelsToValue(pixels) {
         var t = pixels;
         t = max(-sr, min(sr, t));
         t = t / sr;
         t = t + 1;
         t = t * t;
         return t;
      }

      if (! this.stretchValues || (sketchDragMode != 7 && sketchPage.stretchIndex === undefined))
         return;

      if (sketchDragMode == 7) {

         if (sketchPage.stretchIndex === undefined && abs(sketchPage.y - sketchDragY) < sr)
            return;

         this.stretchCount = 0;
         for (prop in this.stretchValues)
            this.stretchCount++;

         sketchPage.stretchIndex = this.stretchCount == 1 ? 0 :
                                   floor(max(0, min(this.stretchCount-1, (sketchPage.y - this.cy()) / dy + 1.5)));
         this.stretch_cx = this.cx();
         this.stretch_cy = this.cy();
         this.stretchTravel = 0;
      }

      this.stretchTravel = max(this.stretchTravel, abs(sketchPage.y - sketchDragY));

      annotateStart();
      _saveFont = _g.font;

      x = this.stretch_cx;

      i = 0;
      for (prop in this.stretchValues) {
         isSelected = i == sketchPage.stretchIndex;

         propValue = sk().stretchValues[prop];

         value = typeof propValue == 'object' ? propValue.value : propValue;

         if (sketchDragMode != 7 && isSelected) {
            value = pixelsToValue(sketchPage.x - x);
            sk().stretchValues[prop] = { value : value };
         }

         y = this.stretch_cy + dy * (i - (this.stretchCount-1)/2);

         color(fadedColor(isSelected ? .25 : .125));
         fillRect(x - sr, y - dy/2, sr + valueToPixels(value), dy);

         color(fadedColor(.5));
         lineWidth(isSelected ? 4 : 1);
         drawRect(x - sr, y - dy/2, 2 * sr, dy);

         color(fadedColor(isSelected ? 1 : .5));
         utext(prop, x, y, .5, .5, font);

         i++;
      }

      _g.font = _saveFont;
      annotateEnd();
   },

   findLinkedSketches : function() {                             // FIND SKETCHES MUTUALLY
      var C = [ this ], nC = 0, n, s, i, port, outLinks, inLink; // CONNECTED VIA ARROWS OR LINKS,
      while (C.length > nC) {                                    // STARTING WITH THIS SKETCH.
         nC = C.length;
         for (n = 0 ; n < C.length ; n++) {
            s = C[n];
            for (port = 0 ; port < s.out.length ; port++)
               if (isDef(outLinks = s.out[port]))
                  for (i = 0 ; i < outLinks.length ; i++)
                     if (C.indexOf(outLinks[i].b) < 0)
                        C.push(outLinks[i].b);
            for (port = 0 ; port < s.in.length ; port++)
               if (isDef(inLink = s.in[port]))
                  if (C.indexOf(inLink.a) < 0)
                     C.push(inLink.a);
         }
      }
      return C;
   },
   getStrokeStatistics : function(i) {
      return this._S && this._S[i] ? this._S[i] : emptyBounds;
   },
   is3DSketch : function() {
      return this.is3D || this._isModel;
   },
   isGlyph : function() {
      return this._S === undefined;
   },
   isOnScreen : function() {
      if (! isNumeric(this.xlo))
         return true;
      var xlo = -_g.panX, ylo = -_g.panY, xhi = xlo + width(), yhi = ylo + height();
      return this.xhi >= xlo && this.xlo < xhi && this.yhi >= ylo && this.ylo < yhi;
   },
   model : function() {
      if (window.ctScene && ! this._model) {
         this._model = CT.drawModelCreate(ctScene);
         this._model._sketch = this;
	 this.fadeUp = 0;
      }
      return this._model;
   },
   modelBeginFrame : function() {
      if (this._isModel) {
         this.model()._beginFrame();
         this._called_beginFrame = true;
	 let b = backgroundRGB();
	 let c = palette.rgb[def(this.colorId)];
         this.model().color(mix([b[0]/255, b[1]/255, b[2]/255],
	                        [c[0]/255, c[1]/255, c[2]/255], this.getAlpha()));

         if (this._custom_model_xform) {
            this.model().xform(this._custom_model_xform);
	    return;
         }

         let rx = this.rX, ry = this.rY, yy = min(1, 4 * ry * ry), w2 = width() / 2,
	                                                           h2 = height() / 2;

         this.model().xform(
	    CT.matrixMultiply(CT.matrixTranslated( (this.cx() - w2 + _g.panX) / w2,
                                                  -(this.cy() - h2 + _g.panY) / w2,
                                                                     _g.panZ  / w2 ),
            CT.matrixMultiply(CT.matrixRotatedX  (-PI * ry           ),
            CT.matrixMultiply(CT.matrixRotatedY  ( PI * rx * (1 - yy)),
            CT.matrixMultiply(CT.matrixRotatedZ  (-PI * rx *      yy ),
            CT.matrixMultiply(CT.matrixScaled    (this.scale() * this.xyzS() / 7),
                              CT.matrixInverse   (m._m())
         ))))));
      }
   },
   unitCubeCorners : [[-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],[-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1]],
   modelEndFrame : function() {
      if (this._called_beginFrame) {
         if (this.inValue[0] instanceof Array && this.inValue[0].length == 3)
            this.model().applyRecursively('color', this.inValue[0]);
         var c = this.unitCubeCorners;
         this.extendBounds([c[0],c[1],c[3],c[2]]);
         this.extendBounds([c[4],c[0],c[2],c[6]]);
         this.extendBounds([c[5],c[4],c[6],c[7]]);
         this.extendBounds([c[1],c[5],c[7],c[3]]);
         this.model()._endFrame();
         this.model().draw();
      }
   },
   setColorId : function(id) {
      this.colorId = id;
      this.color = palette.color[id];
      if (this._gl !== undefined)
         this.renderStrokeSetColor();
   },
   setRenderMatrix : function(mat) {
      var D = norm(vecDiff(m.transform([0,0,0]), m.transform([1,0,0]))) * this.xyzS();
      var s = .381872 * height();
      var p = this.toPixel([0,0,0]);

      mat.identity();

      mat.translate((p[0] - width()/2) / s, (height()/2 - p[1]) / s, 0);

      var yy = min(1, 4 * this.rY * this.rY);
      mat.rotateX(PI * -this.rY);
      mat.rotateY(PI *  this.rX * (1 - yy));
      mat.rotateZ(PI * -this.rX * yy);

      mat.scale(D / s);
   },
   copyStretchValues : function(src) {
      var name, value;

      if (src.stretchValues) {
         this.stretchValues = {};
         for (name in src.stretchValues) {
            value = src.stretchValues[name];
            this.stretchValues[name] = typeof value == 'object' ? { value : value.value } : value;
         }
      }
   },
   stretch : function(name, value) {
      value = this._S ? value : 1;

      if (this.stretchValues === undefined)
         this.stretchValues = {};

      if (typeof this.stretchValues[name] === 'object')
         value = this.stretchValues[name].value;
      else
         this.stretchValues[name] = value;

      return value;
   },
   toFreehandSketch : function() {
      this.fade();
      this.glyph.toFreehandSketch((this.xhi + this.xlo) / 2,
                                  (this.yhi + this.ylo) / 2,
                                  max(this.xhi - this.xlo, this.yhi - this.ylo) - 2 * sketchPadding,
                                  this);
   },
   transformX2D : function(x, y) {
      var angle = 2 * this.rX;
      return this.x2D + this.scale() * (cos(angle)*x + sin(angle)*y);
   },
   transformY2D : function(x, y) {
      var angle = 2 * this.rX;
      return this.y2D + this.scale() * (cos(angle)*y - sin(angle)*x);
   },
   untransformX2D : function(x, y) {
      return (x - this.x2D) / this.scale();
   },
   untransformY2D : function(x, y) {
      return (y - this.y2D) / this.scale();
   },
   duringSketch : function(callbackFunction) {
      if (this.createMesh !== undefined ? this.glyphTransition < 0.5 : this.sketchProgress < 1) {
         _g.save();
         _g.globalAlpha = 1 - this.styleTransition;
         this.duringSketchCallbackFunction = callbackFunction;
         this.duringSketchCallbackFunction();
         _g.restore();
      }
   },
   afterSketch : function(callbackFunction) {
      if (this.isAfterSketch()) {
         window._inAfterSketch = true;
         _g.save();
         var t = 2 * this.glyphTransition - 1;
         _g.globalAlpha = this.fadeAlpha() * t;
         _g.lineWidth = sketchLineWidth * mix(1, .6, t);

         if (this._mInverse === undefined)
            this._mInverse = new M4();
         this._mInverse.copy(m).invert();

         this._afterSketchCallbackFunction = callbackFunction;
         this._afterSketchCallbackFunction();
         _g.restore();
         window._inAfterSketch = undefined;
      }
   },
   computeCursorPoint : function(x, y, z) {
      if (this._cursorPoint === undefined || this._cursorPoint.set === undefined)
         this._cursorPoint = newVec3();
      if (x === undefined)
         this._cursorPoint.set(wand.x,wand.y,wand.z);
      else {
         if (z === undefined) z = 0;
         this.pixelToPoint(this._cursorPoint.set(x,y,z));
      }
   },
   doCmdSwipe : function(i) {
      return this._doSwipeFunction(i, this.onCmdSwipe[i]);
   },
   doSwipe : function(i) {
      return this._doSwipeFunction(i, this.onSwipe[i]);
   },
   _doSwipeFunction : function(i, swipe) {
      if (swipe) {
         m.save();
         computeStandardViewInverse();
         this.computeCursorPoint(this.unadjustX(sketchPage.xDown),
	                         this.unadjustY(sketchPage.yDown));
         this._callbackFunction = swipe[1];
         this._callbackFunction(this._cursorPoint);
         m.restore();
         return true;
      }
      return false;
   },
   extendBounds : function(points) {
      if (points.length == 0)
         return;
      this.afterSketch(function() {
         window._isExtendBounds = true;

         var save_xmlWriteEnabled = xmlWriteEnabled;
         xmlWriteEnabled = false;

         var saveStrokeStyle = _g.strokeStyle;
         color(bgScrimColor(.01));
         if (points.length == 2) {
            var ax = points[0][0], ay = points[0][1], bx = points[1][0], by = points[1][1];
            mCurve([[ax,ay],[ax,by],[bx,by],[bx,ay],[ax,ay]]);
         }
         else
            mCurve(points);
         _g.strokeStyle = saveStrokeStyle;
         xmlWriteEnabled = save_xmlWriteEnabled;

         window._isExtendBounds = false;
      });
   },
   clearPorts : function() {
      this.nPorts = 0;
      this.portName = [];
      this.portLocation = [];
      this.portBounds = [];
      this.inValue = [];
      this.inValues = [];
      this.outValue = [];
      this.defaultValue = [];
   },
   inSketch : function(port) {
      var link = this.in[port];
      return link ? link.a : null;
   },
   outSketch : function(port) {
      var links = this.out[port];
      return ! links || ! links[0] ? null : links[0].b;
   },
   addPort : function(name, x, y) {
      this.portName[this.nPorts] = name;
      this.portLocation[this.nPorts] = [x, y];
      this.nPorts++;
   },
   setPortLocation : function(name, x, y) {
      var index = getIndex(this.portName, name);
      if (index >= 0 && index < this.portLocation.length) {
         this.portLocation[index][0] = x;
         this.portLocation[index][1] = y;
      }
   },
   clone : function() {
      var dst = Object.create(this);
      for (var prop in this) {
         if (this[prop] instanceof Array)
            dst[prop] = cloneArray(this[prop]);
         else if (this[prop] instanceof Clonable)
            dst[prop] = Object.create(this[prop]);
         else if (this[prop] instanceof Object &&
	          ! (this[prop] instanceof Function))
            dst[prop] = Object.create(this[prop]);
         else
            dst[prop] = this[prop];
      }
      return dst;
   },
   computePixelSize : function() {
      return this.scale() * this.xyzS();
   },
   contains : function(x, y) {
      return this.xlo <= x && this.ylo <= y && this.xhi > x && this.yhi > y;
   },
   containsTextAssignment : function(x, y) {
      if (! this.isFreehandSketch())
         return false;
      var s = this.text;
      var i = s.indexOf('=');
      if (i == -1)
         return false;
      return i < s.length - 1 && s.charAt(i+1) != '=';
   },
   cx : function() {
      return (this.xlo + this.xhi) / 2;
   },
   cy : function() {
      return (this.ylo + this.yhi) / 2;
   },

   delete : function() {

      // WHENEVER SELECTED SKETCH IS DELETED, MAKE SURE TO EXIT TEXT EDIT MODE.

      if (this == sk())
         setTextMode(false);

      // IF A GROUP, DELETE ALL OF ITS CHILDREN.

      for (var j = 0 ; j < this.children.length ; j++) {
         var k = sketchPage.findIndex(this.children[j]);
         sketchPage.sketches.splice(k, 1);
      }

      if (this.mesh !== undefined)
         root.remove(this.mesh);

      if (this._isModel)
         ctScene.remove(this.model());

      if (this == currentTextSketch)
         currentTextSketch = null;

      var i = sketchPage.findIndex(this);
      if (i >= 0) {
         if (this.onDelete != null)
            this.onDelete();

         sketchPage.sketches.splice(i, 1);

         // SEE IF THERE WILL BE A WAY TO LINK DELETED SKETCH'S INPUT TO ITS OUTPUT.

         var inLink = null, outLink = null;
         if (this.in.length > 0 && isDef(this.in[0])) {
            inLink = this.in[0];
            var outPortIndex = this.outPortIndex();
            if (outPortIndex >= 0) {
               var outLinks = this.out[outPortIndex];
               if (isDef(outLinks) && outLinks.length > 0 && isDef(outLinks[0]))
                  outLink = outLinks[0];
            }
         }

         // DELETE LINKS TO THIS SKETCH FROM OTHER SKETCHES:
         //
         //    FOR EACH ACTIVE IN-PORT OF sketch:
         //    LOOP THROUGH ACTIVE OUT-PORTS OF THE SKETCH a THAT LINKS TO IT.
         //    FOR EACH ACTIVE OUT-PORT OF a, LOOP THROUGH THE SKETCHES a LINKS TO.
         //    WHEREVER a LINKS TO sketch, REMOVE THAT OUT-LINK FROM a.

         for (var inPort = 0 ; inPort < this.in.length ; inPort++)
            if (isDef(this.in[inPort])) {
               var a = this.in[inPort].a;
               for (var outPort = 0 ; outPort < a.out.length ; outPort++)
                  if (isDef(a.out[outPort]))
                     for (var k = a.out[outPort].length - 1 ; k >= 0 ; k--) {
                        var link = a.out[outPort][k];
                        if (link.b == this)
                           link.removeFromOutSketch();
                     }
            }

         // DELETE LINKS FROM THIS SKETCH TO OTHER SKETCHES:

         for (var outPort = 0 ; outPort < this.out.length ; outPort++)
            if (isDef(this.out[outPort]))
               for (var k = this.out[outPort].length - 1 ; k >= 0 ; k--) {
                  var link = this.out[outPort][k];
                  link.removeFromInSketch();
               }

         // IF POSSIBLE, LINK DELETED SKETCH'S INPUT TO ITS OUTPUT.

         if (inLink != null && outLink != null) {
            var ca = inLink.C, cb = outLink.C;
            var p0 = ca[0];
            var p1 = mix(ca[ca.length-1], cb[0], .5);
            var p2 = cb[cb.length-1];
            new SketchLink(inLink.a, inLink.i, outLink.b, outLink.j,
               2 * computeCurvature(ca[0], mix(ca[ca.length-1], cb[0], .5), cb[cb.length-1]));
         }
      }

      // IF THERE WAS AN OPEN CODE WIDGET FOR DELETED SKETCH, MAKE SURE TO TOGGLE IT OFF.

      if (isCodeWidget && this == codeSketch)
         toggleCodeWidget();

      // IF DELETED SKETCH WAS SELECTED, AND ALSO LAST SKETCH ON PAGE, SELECT NEW LAST SKETCH ON PAGE.

      if (sketchPage.index >= nsk())
         selectSketch(nsk() - 1);
   },

   deleteChar : function() {
      var hasCodeBubble = this.code != null && isCodeWidget;
      var cursorPos = hasCodeBubble ? codeTextArea.selectionStart : this.textCursor;

      if (cursorPos > 0) {
         if (hasCodeBubble) {
             codeTextArea.value = codeTextArea.value.substring(0, cursorPos-1) +
                                  codeTextArea.value.substring(cursorPos, codeTextArea.value.length);
             this.code[codeSelector.selectedIndex][1] = codeTextArea.value;

             if (cursorPos < codeTextArea.value.length) {
                codeTextArea.selectionStart--;
                codeTextArea.selectionEnd--;
             } else {
                // DO NOT DECREMENT IF DELETING LAST CHARACTER
                // BROWSER DOES THIS AUTOMATICALLY

                codeTextArea.selectionStart = cursorPos;
                codeTextArea.selestionStart = cursorPos;
             }
         } else {
             this.setText(this.text.substring(0, this.textCursor-1) +
                          this.text.substring(this.textCursor, this.text.length));
             this.textCursor--;
         }
      }
   },
   drawBounds : function() {
      if (this.parent == null) {
         lineWidth(this == sk() ? this.isMouseOver ? 4 : 2 : 0.5);
         drawRoundRect(this.xlo, this.ylo, this.xhi - this.xlo, this.yhi - this.ylo, sketchPadding);
      }
   },
   drawLabel : function(label, xy, ax, ay, scale) {
      var P = this.adjustXY(xy);
      utext(label, P[0], P[1], ax, ay);
   },
   drawValue : function(value, xy, ax, ay, scale) {
      var P = this.adjustXY(xy);
      utext(isNumeric(value) ? roundedString(value) : value, P[0], P[1], ax, ay);
   },
   drawText : function(context) {
      var fontHeight = floor(24 * this.scale());

      if (this instanceof FreehandSketch && this.isNullText() && isDef(this.inValue[0])) {
         var str = valueToString(valueOf(this.inValue[0], time));

         if (typeof str == 'string') {
            context.save();
            context.strokeStyle = backgroundColor;
            context.fillStyle = fadedColor(0.5);
            context.font = fontHeight + 'pt ' + defaultFont;

            var dx = textWidth(str) / 2;
            if (str.indexOf('[') < 0) {
               var i = str.indexOf('.');
               if (i >= 0)
                  dx = textWidth(str.substring(0, i));
            }

            _g_text(str, [ this.cx() - dx, this.cy() + .5 * fontHeight ], m);
            context.restore();
         }
         return;
      }

      context.save();
      context.strokeStyle = this.isNegated ? this.color : backgroundColor;
      context.fillStyle = this.isNegated ? backgroundColor : this.color;

      if (this.isParsed())
         fontHeight = floor(0.7 * fontHeight);

      context.font = fontHeight + 'pt ' + (this.isParsed() ? 'Consolas' : defaultFont);

      var isCursor = isTextMode && context == _g && this == sk(sketchPage.trueIndex)
                     || window.isWritingToTextSketch && this == currentTextSketch;
      if (! isCursor && this.text.length == 0) {
         context.restore();
         return;
      }

      var x1 = (this.xlo + this.xhi) / 2;
      var y1 = (this.ylo + this.yhi) / 2;
      if (this.sp.length > 1) {
         var xlo = Number.MAX_VALUE, ylo = xlo, xhi = -xlo, yhi = -ylo;
         for (var i = 1 ; i < this.sp.length ; i++) {
            xlo = min(xlo, this.sp[i][0]);
            xhi = max(xhi, this.sp[i][0]);
            ylo = min(ylo, this.sp[i][1]);
            yhi = max(yhi, this.sp[i][1]);
         }
         x1 = (xlo + xhi) / 2;
         y1 = (ylo + yhi) / 2;
      }

      if (this.text.length == 0) {
         drawTextCursor(x1, y1, fontHeight, context);
         context.restore();
         return;
      }

      var j = 0;
      for (var n = 0 ; n < this.textStrs.length ; n++) {
         var str = this.textStrs[n];
         var tw = textWidth(str, context);
         var x = x1;
         var y = y1 + fontHeight * (n - 0.5 * (this.textStrs.length-1));
         var tx = x - .5 * tw;
         context.globalAlpha = this.fadeAlpha();
         _g_text(str, [ tx, y + .35 * fontHeight ], m);

         // IF A TEXT CURSOR X,Y HAS BEEN SPECIFIED, RESET THE TEXT CURSOR.

         if (this.textCursorXY != null) {
            var _x = this.textCursorXY[0];
            var _y = this.textCursorXY[1];
            if ( _x >= tx      - sketchPadding && _y >= y - 0.65 * fontHeight &&
                 _x <  tx + tw + sketchPadding && _y <  y + 0.35 * fontHeight ) {
               var i = 0;
               for ( ; i < str.length ; i++) {
                  var tw0 = textWidth(str.substring(0, i  ));
                  var tw1 = textWidth(str.substring(0, i+1));
                  if (_x < tx + (tw0 + tw1) / 2)
                     break;
               }
               this.textCursor = j + i;
               this.textCursorXY = null;
            }
         }

         if (isCursor) {
            if (this.textCursor >= j && this.textCursor <= j + str.length) {
               var cx = tx + textWidth(str.substring(0,this.textCursor - j));
               drawTextCursor(cx, y, fontHeight, context);
            }
            j += str.length;
         }
         j++;
      }
      context.restore();
   },
   evalCode : function(code, x, y, z) {

      // FIRST CHECK FOR A NATURAL LANGUAGE COMMAND.

      if (nlParse(code))
         return;

      if (code.charAt(0) == '\'')
         return code.substring(1, code.length);

      // IF NO ARGS ARE SUPPLIED, USE VALUES FROM THE SKETCH'S INPUT PORTS.

      x = def(x, def(this.inValue[0]));
      y = def(y, def(this.inValue[1]));
      z = def(z, def(this.inValue[2]));

      // IF ARGS HAVE NUMERIC VALUES, MAKE SURE THEY ARE SEEN AS NUMBERS BY THE FUNCTION.

      if (typeof x === "string" && isNumeric(x)) x = parseFloat(x);
      if (typeof y === "string" && isNumeric(y)) y = parseFloat(y);
      if (typeof z === "string" && isNumeric(z)) z = parseFloat(z);

      // IF NO RETURN STATEMENT, SUPPLY ONE.

      if (code.indexOf('return') == -1)
         code = "return " + code;

      // EVAL THE CODE IN THE SCOPE OF THIS SKETCH.

      var result = null;

      try {
         if (x instanceof Array)
	    code = 'return x.map(function(x,y,z) {' + code + '});'
         this._tmpFunction = Function("x","y","z", code);
         result = this._tmpFunction(x, y, z);
      } catch (e) {
         console.log('evalCode error: ' + e);
      }

      // ANY ERROR RESULTS IN A RETURN VALUE OF null.

      return result;
   },
   faded : function(t) {
      color(fadedColor(t, this.colorId));
   },
   findInLink : function(inPort) {
      if (this.in.length > inPort && isDef(this.in[inPort])) {
         var a = this.in[inPort].a;
         for (var outPort = 0 ; outPort < a.out.length ; outPort++)
            if (isDef(a.out[outPort]))
               for (var k = a.out[outPort].length - 1 ; k >= 0 ; k--)
                  return a.out[outPort][k];
      }
      return undefined;
   },
   getAlpha : function() {
      return max(0, this.glyphTransition) *
                    (this.fadeAway == 0 ? 1 : this.fadeAway) * this.fadeUp *
                    (isDef(this.alpha) ? this.alpha : 1);
   },
   getInValue : function(j, dflt) {
      return this.inValues[j] !== undefined ? valueOf(this.inValues[j], time) : dflt;
   },
   getLabel : function(name) {
      return this.labels[this.selection];
   },
   hasBounds : function() {
      return this.xlo !== undefined && this.xhi !== undefined && this.xlo <= this.xhi &&
             this.ylo !== undefined && this.yhi !== undefined && this.ylo <= this.yhi ;
   },
   hasPortBounds : function(i) {
      return this.portBounds[i] !== undefined && isNumeric(this.portBounds[i][0]);
   },
   insertText : function(str) {
      if (this.code != null && isCodeWidget) {
         var cursorPos = codeTextArea.selectionStart;
         codeTextArea.value = codeTextArea.value.substring(0, cursorPos) +
                              str +
                              codeTextArea.value.substring(cursorPos, codeTextArea.value.length);
         codeTextArea.selectionStart += str.length;
         this.code[codeSelector.selectedIndex][1] = codeTextArea.value;
      } else {
         this.setText(this.text.substring(0, this.textCursor) +
                      str +
                      this.text.substring(this.textCursor, this.text.length));
         this.textCursor += str.length;
      }
   },
   intersectingSketches : function() {
      var sketches = [];
      for (var I = nsk() - 1 ; I >= 0 ; I--)
         if (sk(I) != this && sk(I).parent == null && this.intersects(sk(I)))
            sketches.push(sk(I));
      return sketches;
   },
   intersects : function(s) {
      return this.xhi > s.xlo && this.xlo < s.xhi &&
             this.yhi > s.ylo && this.ylo < s.yhi ;
   },
   isAfterSketch : function() {
      return this.sketchTrace != null && this.glyphTransition >= 0.5 || this.sketchProgress == 1;
   },
   isDefaultValue : function(name) {
      var j = getIndex(this.portName, name);
      return j >= 0 ? isDef(this.defaultValue[j]) : false;
   },
   isInValue : function(name) {
      return this.isInValueAt(getIndex(this.portName, name));
   },
   isInValueAt : function(j) {
      return j >= 0 ? isDef(this.inValue[j]) : false;
   },
   isNullText : function() {
      return this.text.replace(/ /g, '').length == 0;
   },
   isParsed : function() {
      return false;
   },
   isFreehandSketch : function() {
      return this instanceof FreehandSketch;
   },
   m2s : function(p) {
      return [ this.m2x(p[0]), this.m2y(p[1]) ];
   },
   m2x : function(x) {
      return (x - this.tx()) / this.scale();
   },
   m2y : function(y) {
      return (y - this.ty()) / this.scale();
   },
   mScale : function(t) {
      if (t === undefined)
         t = 1;
      return norm(m.transform([t,0,0,0])) * this.xyzS();
   },
   moveCursor : function(incr) {
      if (this.code != null && isCodeWidget) {
         var newPos = max(0, min(codeTextArea.value.length, codeTextArea.selectionStart + incr));
         codeTextArea.selectionStart = newPos;
         codeTextArea.selectionEnd = newPos;
      } else {
         this.textCursor = max(0, min(this.text.length, this.textCursor + incr));
     }
   },
   moveLine : function(incr) {
      if (this.code != null && isCodeWidget) {
         var currentPos = codeTextArea.selectionStart;
         var lines = codeTextArea.value.split(/\r?\n/);

         // find which line the cursor is in
         var charCount = 0, currentLine = 0;
         for ( ; currentLine < lines.length; currentLine++) {
            var currentLineLength = lines[currentLine].length + 1;
            if (currentPos < charCount + currentLineLength) {
               break;
            }
            charCount += currentLineLength;
         }

         var nextLine = currentLine + incr;
         if (nextLine >= 0 && nextLine < lines.length) {
            var posOnLine = currentPos - charCount;

            // move to the beginning of the next line
            if (incr < 0) {
               codeTextArea.selectionStart -= posOnLine + lines[nextLine].length + 1;
               codeTextArea.selectionEnd = codeTextArea.selectionStart;
            } else if (incr > 0) {
               codeTextArea.selectionStart += lines[currentLine].length - posOnLine + 1;
               codeTextArea.selectionEnd = codeTextArea.selectionStart;
            }

            // move cursor to same spot in line as before
            if (posOnLine <= lines[nextLine].length) {
               codeTextArea.selectionStart += posOnLine;
               codeTextArea.selectionEnd = codeTextArea.selectionStart;
            } else {
               codeTextArea.selectionStart += lines[nextLine].length;
               codeTextArea.selectionEnd = codeTextArea.selectionStart;
            }
         } else {
            // this keeps the cursor from losing focus
            codeTextArea.selectionStart = codeTextArea.selectionStart;
            codeTextArea.selectionEnd = codeTextArea.selectionStart;
         }
      } else {
         // move cursor in normal text area
      }
   },
   offsetSelection : function(ds) {
      var ns = this.labels.length;
      this.setSelection((this.selection + ds + ns) % ns);
   },

   prop : function(name) {
      if (typeof this.props !== 'object')
         return 0;

      function getValue(props, name) {
         let value = props[name];
	 if (typeof value !== 'string')
	    return value;
         let j = value.indexOf(':');

	 return j < 0 ? 0 : parseInt(value.substring(j+1, value.length));
      }

      let j = name.indexOf('.');
      if (j < 0)
         return getValue(this.props, name);

      let subname = name.substring(j + 1, name.length);
      name = name.substring(0, j);
      return getValue(this.props[name], subname);
   },

   setProp : function(name, newValue) {
      if (typeof this.props !== 'object')
         return;

      function setValue(props, name) {
         let value = props[name], j;
	 if (newValue === undefined)
	    delete props[name];
         else
            props[name] = typeof value !== 'string'
	       ? newValue
	       : (j = value.indexOf(':')) < 0
                  ? props[name] + ':' + newValue
                  : value.substring(0, j+1) + newValue;
      }

      let j = name.indexOf('.');
      if (j < 0)
         setValue(this.props, name);
      else {
         let subname = name.substring(j+1,name.length);
	 name = name.substring(0,j);
         if (this.props[name] === undefined)
	    this.props[name] = {};
         setValue(this.props[name], subname);
      }
   },

   portXY : function(i) {
      if (isDef(this.portLocation[i])) {
         if (this instanceof FreehandSketch)
            return [this.cx(), this.cy()];
         else {
            m.save();
            this.standardView();
            var p = this.portLocation[i];
            var xy = m.transform(p);
            m.restore();
            return this.adjustXY(xy);
         }
      }
      return this.adjustXY([this.cx(),this.cy()]);
   },
   lastStrokeSize : function() {
      if (this.sp.length > 1) {
         var i = this.sp.length;
         var x0 = 10000, y0 = 10000, x1 = -x0, y1 = -y0;
         while (--i > 0 && this.sp[i][2] == 1) {
            x0 = min(x0, this.sp[i][0]);
            y0 = min(y0, this.sp[i][1]);
            x1 = max(x1, this.sp[i][0]);
            y1 = max(y1, this.sp[i][1]);
         }
         return max(x1 - x0, y1 - y0);
      }
      return 0;
   },
   indexOfLastStroke : function() {
      var i = this.sp.length;
      while (--i > 0 && this.sp[i][2] == 1)
         ;
      return i;
   },
   pixelToPoint : function(src, dst) {
      if (! this.pixelToPointMatrix) {
         m.save();
         computeStandardViewInverse();
         m.restore();
      }
      if (dst)
         dst.copy(src).applyMatrix4(this.pixelToPointMatrix);
      else
         src.applyMatrix4(this.pixelToPointMatrix);
   },
   inverseTransform : function(p) {
      return this._mInverse.transform(p);
   },
   pointToPixel : function(src, dst) {
      if (! this.pointToPixelMatrix) {
         m.save();
         computeStandardView();
         m.restore();
      }
      if (dst) {
         dst.copy(src).applyMatrix4(this.pointToPixelMatrix);
         dst.z = 0;
      }
      else {
         src.applyMatrix4(this.pointToPixelMatrix);
         src.z = 0;
      }
   },
   removeLastStroke : function() {
      if (this.sp.length > 1) {
         var i = this.indexOfLastStroke();
         if (this.sp0 !== undefined)
            this.sp0.splice(i, this.sp.length-i);
         this.sp.splice(i, this.sp.length-i);
      }
   },
   fader : function(id) {
      return this._faders.fader(id);
   },
   renderWrapper : function(elapsed) {
      this._elapsed = elapsed;

      var status = 0;

      this.afterSketchTransition = this.glyphTransition < 1 ? 0 :
                                   min(1, this.afterSketchTransition + 2 * elapsed);

      _g.save();

      m.save();

      this.stringId = 0;

      if (this.glyphTransition < 1 && this.drawing !== undefined)
         this.drawing.update();

      this._faders.update(elapsed);

      this.modelBeginFrame();
      if (window.isCatchingRenderExceptions)
         try {
            this.adjustParamCurves();
            this.render(elapsed);
         } catch(e) {
            console.log(e);
            status = -1;
         }
      else
         this.render(elapsed);
      this.modelEndFrame();

      m.restore();

      if (this.sketchTexts.length > 0) {
         var isg = this.sketchTrace != null && this.glyphTransition >= 0.5;
         if (isg || this.sketchProgress == 1) {
            _g.globalAlpha = (isg ? 2 * this.glyphTransition - 1 : this.styleTransition) * this.fadeAlpha();
            m.save();
            for (var n = 0 ; n < this.sketchTexts.length ; n++)
               this.sketchTexts[n].update(this);
            m.restore();
         }
      }

      _g.restore();

      if (this.isMakingGlyph === undefined && this.createMesh !== undefined) {
         this._updateMesh();
      }

      return status;
   },
   scale : function(value) {
      if (value === undefined) {
         var s = this.sc;
         if (this.parent != null)
            s *= this.parent.scale();
         return s * sketchPage.zoom;
      }
      this.sc *= value;
   },
   outPortIndex : function(forceCreation) {
      var i = getIndex(this.portName, 'out');
      if (i == -1 && forceCreation !== undefined) {
         this.addPort('out', 0, 0);
         i = getIndex(this.portName, 'out');
      }
      return i;
   },
   recenter3DSketch : function(p, q) {
      if (this._recenter_p === undefined) {
         this._recenter_p = newVec3();
         this._recenter_q = newVec3();
         this._recenter_r = newVec4();
      }
      var _p = this._recenter_p,
          _q = this._recenter_q,
          _r = this._recenter_r;

      _p.copy(p);
      if (q === undefined)
         _q.set(0,0,0);
      else
         _q.copy(q);

      this.pointToPixel(_p);
      this.pointToPixel(_q);
      var dx = (_p.x - _q.x) * .1;
      var dy = (_p.y - _q.y) * .1;
      this.tX += dx;
      this.tY += dy;
      this.pixelToPoint(_r.set(dx, dy, 0, 0));
      return _r;
   },
   setOutPortValue : function(value) {
      this.outPortIndex(true);
      this.setOutValue('out', value);
   },
   setOutValue : function(name, value) {
      var j = getIndex(this.portName, name);
      if (j >= 0)
         this.outValue[j] = value;
   },
   setSelection : function(s) {
      if (typeof(s) == 'string') {
         this.selectionName = s;
         s = getIndex(this.labels, s);
      }
      this.selection = s;
      this.updateSelectionWeights(0);
      this.setup();
   },
   selectionWeight : function(i) {
      return sCurve(this.selectionWeights[i]);
   },
   setDefaultValue : function(name, value) {
      var j = getIndex(this.portName, name);
      if (j >= 0) {
         this.defaultValue[j] = value;
         if (this.defaultValueIncr[j] === undefined)
            this.defaultValueIncr[j] = 1;
      }
   },
   setSketchText : function(index, value, position, scale) {
      this.sketchTexts[index] = new SketchText(value, position, scale);
   },
   setTextCursor : function(x, y) {
      this.textCursorXY = [x, y];
   },
   sketchTextsMouseDown : function(x, y) {
      this.sketchTextAtMouse = undefined;
      var p = m.transform([x,y,0]);
      for (var n = this.sketchTexts.length - 1 ; n >= 0 ; n--) {
         var sketchText = this.sketchTexts[n];
         if (sketchText.contains(p) && sketchText.mouseDown(x, y)) {
            this.sketchTextAtMouse = sketchText;
            return true;
         }
      }
      return false;
   },
   sketchTextsMouseDrag : function(x, y) {
      if (this.sketchTextAtMouse === undefined)
         return false;
      this.sketchTextAtMouse.mouseDrag(x, y);
      return true;
   },
   sketchTextsMouseUp : function(x, y) {
      if (this.sketchTextAtMouse === undefined)
         return false;
      this.sketchTextAtMouse.mouseUp(x, y);
      return true;
   },
   unrotate : function() {
      this.rX = this.rY = 0;
   },
   updateSelectionWeights : function(delta) {
      if (this.labels.length == 0)
         return;
      if (this.selectionWeights === undefined) {
         this.selectionWeights = [];
         for (var i = 0 ; i < this.labels.length ; i++)
            this.selectionWeights.push(this.selection == i ? 1 : 0);
      }
      for (var i = 0 ; i < this.labels.length ; i++)
         if (i == this.selection)
            this.selectionWeights[i] = min(1, this.selectionWeights[i] + 2 * delta);
         else
            this.selectionWeights[i] = max(0, this.selectionWeights[i] - delta);
   },
   setText : function(text) {

      if (! this.isFreehandSketch())
         return;

      if (this instanceof NumericSketch)
         this.value = text;

      this.text = text;

      if (this instanceof NumericSketch && isNumeric(text))
         this.text = roundedString(text);

      if (this.textX == 0) {
         this.textX = (this.xlo + this.xhi) / 2;
         this.textY = (this.ylo + this.yhi) / 2;

         var xx = 0;
         for (var i = 1 ; i < this.sp.length ; i++)
            xx += this.sp[i][0];
         this.textX = (this.textX + xx / (this.sp.length-1)) / 2;
      }

      _g.save();

      this.textStrs = this.text.split("\n");
      this.textHeight = this.textStrs.length * 1.3 * 24;

      this.textWidth = 0;
      _g.font = '24pt ' + defaultFont;
      for (var n = 0 ; n < this.textStrs.length ; n++)
         this.textWidth = max(this.textWidth, textWidth(this.textStrs[n]));

      _g.restore();
   },
   setUniform : function(name, val) {
      if (this.mesh !== undefined)
         this.mesh.material.setUniform(name, val);
   },

   spliceRender : function(start, deleteCount, code) {
      var len = ('' + this.render).length;

      this.render = spliceFunction(this.render, 2, 0, code);

      var sd = sketchFileData[this.label + '_sketch'], s = sd[1];
      var i = s.indexOf('function', s.indexOf('this.render'));
      sd[1] = s.substring(0, i) + this.render + '\n' + s.substring(i + len, s.length);
   },

   editRenderPress : function(p) {
      this._erp = { x: p.x, y: p.y };
   },

   editRenderDrag : function(p) {
   },

   editRenderRelease : function(p) {
      console.log(pieMenuIndex(p.x - this._erp.x, this._erp.y - p.y, 8));
   },

   flyThrough : function(callback) {

      if (this._p === undefined)
         this._p = { _x : 0, _y : 0, _z : 0, roll : 0, pitch : 0, yaw : 0, speed : 0 };
      var p = this._p; 

      var travel = p.speed * this._elapsed;

      callback(p);
      p._y += travel * sin(p.pitch);
      p._z += travel * cos(p.pitch) * cos(p.yaw);
      p._x -= travel * cos(p.pitch) * sin(p.yaw);

      var m = CT.matrixTranslated(0, -.25, ctScene.getFL());
      m = CT.rotateZ  (m, p.roll);
      m = CT.rotateX  (m, p.pitch);
      m = CT.rotateY  (m, p.yaw);
      m = CT.translate(m, p._x - .5, p._y, p._z);
      m = CT.scale    (m, 1 / width());
      m = CT.rotateZ  (m, PI);
      this._custom_model_xform = m;
   },

   standardView : function(matrix) {
      var rx = this.rX, ry = this.rY, yy = min(1, 4 * ry * ry);
      standardView(
         .5 + this.tx() / width(),
         .5 - this.ty() / height(),
         this.is3DSketch() ? PI * ry          : 0,
         this.is3DSketch() ? PI * rx * (1-yy) : 0,
         this.is3DSketch() ? PI * rx * yy     : -TAU * rx,
         this.scale() / 14, matrix);
   },
   standardViewInverse : function(matrix) {
      var rx = this.rX, ry = this.rY, yy = min(1, 4 * ry * ry);
      standardViewInverse(
         .5 + this.tx() / width(),
         .5 - this.ty() / height(),
         this.is3DSketch() ? PI * ry          : 0,
         this.is3DSketch() ? PI * rx * (1-yy) : 0,
         this.is3DSketch() ? PI * rx * yy     : -TAU * rx,
         this.scale() / 14, matrix);
   },
   toPixel : function(point) {
      return this.adjustXY(m.transform(point));
   },
   toTrace : function(i0) {
      if (i0 === undefined)
         i0 = 0;
      var src = this.sp;
      var dst = [];
      for (var i = i0 ; i < src.length ; i++)
         buildTrace(dst, src[i][0], src[i][1], src[i][2]);
      return dst;
   },
   translate : function(dx, dy) {
      var keyIndex, strokeIndex, i;

      this.tX += dx;
      this.tY += dy;
      this.textX += dx;
      this.textY += dy;

      if (this.keys)
         for (keyIndex = 0 ; keyIndex < this.keys.length ; keyIndex++)
         for (strokeIndex = 0 ; strokeIndex < this.keys[keyIndex].length ; strokeIndex++)
         for (i = 0 ; i < this.keys[keyIndex][strokeIndex].length ; i++) {
            this.keys[keyIndex][strokeIndex][i][0] += dx;
            this.keys[keyIndex][strokeIndex][i][1] += dy;
         }
      if (this.keysMotionPath)
         for (i = 0 ; i < this.keysMotionPath.length ; i++) {
            this.keysMotionPath[i][0] += dx;
            this.keysMotionPath[i][1] += dy;
         }
   },
   tx : function() {
      var x = this.tX;
      if (this.parent != null) {
         var cx = this.parent.cx();
         if (! this.isFreehandSketch())
            cx -= width() / 2;
         x -= cx;
         x = this.parent.tx() + this.parent.scale() * x;
         x += cx;
      }
      return x;
   },
   ty : function() {
      var y = this.tY;
      if (this.parent != null) {
         var cy = this.parent.cy();
         if (! this.isFreehandSketch())
            cy -= height() / 2;
         y -= cy;
         y = this.parent.ty() + this.parent.scale() * y;
         y += cy;
      }
      return y;
   },
   useInputColors : function() {
      this.afterSketch(function() {
         if (this.inValue[0] !== undefined) {
            this.inLabel[0] = 'color';
            this.ambient = this.diffuse = this.inValue[0];
            if (this.inValue[1] !== undefined) {
               this.inLabel[0] = 'ambient';
               this.inLabel[1] = 'diffuse';
               this.diffuse = this.inValue[1];
               if (this.inValue[2] !== undefined) {
                  this.inLabel[2] = 'specular';
                  this.specular = this.inValue[2].concat([30]);
               }
            }
         }
      });
   },
   xform : function(src, dst) {
      if (dst === undefined)
         dst = [0,0,0];
      dst[0] = this.xf[0] + this.xf[4] * ( this.xf[2] * src[0] + this.xf[3] * src[1]);
      dst[1] = this.xf[1] + this.xf[4] * (-this.xf[3] * src[0] + this.xf[2] * src[1]);
      return dst;
   },
   xformInverse : function(xy) {
      var x = (xy[0] - this.xf[0]) / this.xf[4];
      var y = (xy[1] - this.xf[1]) / this.xf[4];
      return [ this.xf[2] * x - this.xf[3] * y, this.xf[3] * x + this.xf[2] * y ];
   },
   makeXform : function() {
      this.xf = [ this.tx(),
                  this.ty(),
                  cos(PI * this.rX),
                  sin(PI * this.rX),
                  this.scale() ];
   },
   enableFragmentShaderEditing : function() {
      if (this.code === undefined)
         this.code = [["", this.fragmentShader]];
      this.update = function() {
         if (isCodeWidget && this.fragmentShader != codeTextArea.value
                          && isValidFragmentShader(formFragmentShader(codeTextArea.value)))
            this.mesh.material = shaderMaterial(this.vertexShader === undefined ? defaultVertexShader : this.vertexShader,
                                                this.fragmentShader = codeTextArea.value);
      }
   },
   _updateMesh : function() {

      if (this.createMesh !== undefined && this.mesh === undefined) {

         if (this.vertexShader === undefined)
            this.vertexShader = defaultVertexShader;

         if (this.fragmentShaders !== undefined)
            this.fragmentShader = this.fragmentShaders[0];
         else if (this.fragmentShader === undefined)
            this.fragmentShader = defaultFragmentShader;

         this.shaderMaterial = function(r, g, b) {
            var material = shaderMaterial(this.vertexShader, this.fragmentShader);
            material.setUniform('Ldir', [[ 0.5, 0.5, 0.5], [-1.0,-0.5,-1.0]]);
            material.setUniform('Lrgb', [[ 1.0, 1.0, 1.0], [ 0.1, 0.1, 0.1]]);
            if (r === undefined)
               r = g = b = 1;
            if (Array.isArray(r)) {
               material.setUniform('ambient' , r);
               material.setUniform('diffuse' , g);
               material.setUniform('specular', b);
            }
            else {
               material.setUniform('ambient' , [r*.02,g*.02,b*.02]);
               material.setUniform('diffuse' , [r*.10,g*.10,b*.10]);
               material.setUniform('specular', [.5,.5,.5,15]);
            }
            return material;
         }

         this.updateVertexShader = function() {
            if (this.vertexShader != codeTextArea.value) {
               var isValid = isValidVertexShader(formSyntaxCheckVertexShader(codeTextArea.value));
               if (isValid) {
                  this.vertexShader = codeTextArea.value;
                  this.mesh.material = this.shaderMaterial();
               }
            }
         }

         this.updateFragmentShader = function() {
            if (this.fragmentShader != codeTextArea.value) {
               var isValid = isValidFragmentShader(formFragmentShader(codeTextArea.value));
               if (isValid) {
                  this.fragmentShader = codeTextArea.value;
// THIS IS WHERE TO PUT $1 CONSTRUCT.
                  this.mesh.material = this.shaderMaterial();
               }
            }
         }

         if (this.code == null)
            this.code = [];
         this.code.push(["vertexShader", this.vertexShader, this.updateVertexShader]);

         if (this.fragmentShaders !== undefined)
            for (var i = 0 ; i < this.fragmentShaders.length ; i++)
                this.code.push(["fragmentShader " + (i+1), this.fragmentShaders[i], this.updateFragmentShader]);
         else
            this.code.push(["fragmentShader", this.fragmentShader, this.updateFragmentShader]);

         if (! isCodeWidget) {
            if (this.fragmentShader === undefined)
               this.fragmentShader = this.fragmentShaders[0];
         }
         else if (codeSelector.selectedIndex >= 0 && this.fragmentShaders !== undefined)
            this.fragmentShader = this.fragmentShaders[codeSelector.selectedIndex];

         if (this.meshBounds === undefined)
            this.meshBounds = [ [-1, -1] , [1, 1] ];
         this.mesh = this.createMesh();
         root.add(this.mesh);
         this.is3D = true;

         // DEFAULT VALUES FOR PHONG COEFFICIENTS.

         this.meshColorId = this.colorId;
      }
      if (this.mesh !== undefined) {

         var A = .025, D = .7, S = .9, P = 30;

         // UPDATE MESH COLOR IF NEEDED.

         var rgb = palette.rgb[this.colorId];
         var ambient  = [A * rgb[0] / 255, A * rgb[1] / 255, A * rgb[2] / 255];
         var diffuse  = [D * rgb[0] / 255, D * rgb[1] / 255, D * rgb[2] / 255];
         var specular = [S, S, S, P];

         if (this.ambient  !== undefined) ambient  = this.ambient;
         if (this.diffuse  !== undefined) diffuse  = this.diffuse;
         if (this.specular !== undefined) specular = this.specular;

         this.mesh.material.setUniform('ambient' , ambient);
         this.mesh.material.setUniform('diffuse' , diffuse);
         this.mesh.material.setUniform('specular', specular);

         // SET MESH MATRIX TO MATCH SKETCH'S POSITION/ROTATION/SCALE.

         this.setRenderMatrix(this.mesh.getMatrix());

         // SET OPACITY.

         var alpha = this.getAlpha();

         // MAKE SURE TO SET THE OPACITY OF ALL THIS MESH'S CHILDREN, RECURSIVELY.

         if (alpha < 1) {
            function setAlpha(mesh) {
               if (mesh.material !== undefined) {
                  mesh.material.transparent = true;
                  mesh.material.opacity = alpha;
                  mesh.material.setUniform('alpha', alpha);
                  mesh.material.setUniform('uAlpha', alpha);
                  for (var i = 0 ; i < mesh.children.length ; i++)
                     setAlpha(mesh.children[i]);
               }
            }
            setAlpha(this.mesh);
         }

         // SET VARIOUS UNIFORMS IN THE FRAGMENT SHADER.

         if (this.mesh.material.uniforms !== undefined) {

            // SET TIME.

            this.setUniform('uTime', time);

            // SET MOUSE CURSOR.

            var a = this.toPixel([0,0]);
            var b = this.toPixel([1,1]);

            var x = (sketchPage.mx - a[0]) / (b[0] - a[0]);
            var y = (sketchPage.my - a[1]) / (b[1] - a[1]);
            var z = sketchPage.isPressed ? 1 : 0;


            this.setUniform('mx', x);
            this.setUniform('my', y);
            this.setUniform('mz', z);

            this.setUniform('uCursor', [x, y, z]);

            this.setUniform('alpha', alpha);
            this.setUniform('uAlpha', alpha);
         }

         if (this.updateMesh !== undefined)
            this.updateMesh();

         // FORCE BOUNDING BOX OF SKETCH EVEN IF IT HAS NO STROKES.

         this.extendBounds(this.meshBounds);
      }
   },

   //---------------- HANDLE STROKES DRAWN WITH WEBGL -------------------

   renderStrokeInit : function() {
      this.vertexShader = [
      ,'uniform vec3  uData[1000];'
      ,'uniform float uNpts;'
      ,'vec4 place(float f) {'
      ,'   float t = max(0., min(.999, f)) * (uNpts - 1.);'
      ,'   int n = int(t);'
      ,'   return vec4(mix(uData[n], uData[n+1], t - float(n)), 1.);'
      ,'}'
      ,'void main() {'
      ,'   vec4 p0 = projectionMatrix * modelViewMatrix * place(position.y + .5 );'
      ,'   vec4 p1 = projectionMatrix * modelViewMatrix * place(position.y + .51);'
      ,'   gl_Position = p1 + normalize(vec4(p1.y-p0.y, p0.x-p1.x, 0., 0.)) * position.x * 1.5;'
      ,'}'
      ].join('\n');

      this.fragmentShader = [
      ,'uniform vec3 uColor;'
      ,'void main() {'
      ,'   gl_FragColor = vec4(uColor, alpha);'
      ,'}'
      ].join('\n');

      this.createMesh = function() {
         return new THREE.Mesh(new THREE.PlaneBufferGeometry(1,1,2,1000), this.shaderMaterial());
      }
   },
   renderStrokeSetColor : function() {
      var rgb = palette.rgb[this.colorId];
      this.setUniform('uColor', [rgb[0]/255,rgb[1]/255,rgb[2]/255]);
   },
   renderStroke : function(curve) {
      if (this._gl === undefined) {
         this._renderStrokeData = new Float32Array(16);
         this.renderStrokeSetColor();
         this._gl = renderer.context;
         this._glProgram = this.mesh.material.program.program;
         this._uData = this._gl.getUniformLocation(this._glProgram, 'uData');
         this._uNpts = this._gl.getUniformLocation(this._glProgram, 'uNpts');
      }

      if (this._renderStrokeData.length < 3 * curve.length)
         this._renderStrokeData = new Float32Array(3 * curve.length);

      var data = this._renderStrokeData;
      for (var i = 0 ; i < curve.length ; i++)
         for (var j = 0 ; j < 3 ; j++)
            data[3 * i + j] = curve[i][j];

      this._gl.useProgram(this._glProgram);
      this._gl.uniform3fv(this._uData, data);
      this._gl.uniform1f (this._uNpts, curve.length);
   },

   drawTransformed : function(transformX, transformY) {
      if (this.mesh !== undefined) {
         var x0 = transformX(this.xlo);
         var y0 = transformY(this.ylo);
         var x1 = transformX(this.xhi);
         var y1 = transformY(this.yhi);
         _g_beginPath();
         _g_moveTo(x0, y0);
         _g_lineTo(x1, y0);
         _g_lineTo(x1, y1);
         _g_lineTo(x0, y1);
         _g_lineTo(x0, y0);
         _g_stroke();
      }
      else {
         for (var i = 0 ; i < this.sp.length ; i++) {
            var x = transformX(this.sp[i][0]);
            var y = transformY(this.sp[i][1]);
            if (this.sp[i][2] == 0) {
               if (i > 0)
                  _g_stroke();
               _g_beginPath();
               _g_moveTo(x, y);
            }
            else
               _g_lineTo(x, y);
         }
         _g_stroke();
      }
   },


   morphToGlyphSketch : function() {
      function drawTrace(tr) {
         annotateStart();
         for (var n = 0 ; n < tr.length ; n++) {
            lineWidth(sketchLineWidth * mix(1, .6, t));
            _g_beginPath();
            for (var i = 0 ; i < tr[n].length ; i++) {
               var x = tr[n][i][0];
               var y = tr[n][i][1];
               if (i == 0)
                  _g_moveTo(x, y);
               else
                  _g_lineTo(x, y);
            }
            _g_stroke();
         }
         annotateEnd();
      }

      let t = min(1, 2 * this.glyphTransition);
      if (t >= 1)
         return;

      if (t == 0) {
         drawTrace(this.sketchTrace);
         return;
      }

      var A = this.sketchTrace;
      var B = resampleTrace(this.trace);

      // ADJUST FINAL SKETCH TO CREATE BEST FIT.

      if (this.xyz.length == 0)
         this.xyz = bestCurvesFit(B, A);

      var s = sCurve(t);
      var C = [];
      for (var n = 0 ; n < A.length ; n++) {
         C.push([]);
         for (var i = 0 ; i < A[n].length ; i++)
            C[C.length-1].push(mix(A[n][i], B[n][i], s));
      }

      _g.lineWidth = sketchLineWidth * mix(1, .6, t);
      drawTrace(C);
   }

   //--------------------------------------------------------------------
}

function FreehandSketch() {
   this.sp0 = [[0,0]];
   this.sp = [[0,0,0]];
   this.parsedStrokes = null;
   this.parsedTransition = 0;
   this.glyphName = 'simple sketch';
   this._isLocked = false;
   this._S = [];

   // ABSORB ANY

   this.absorb = function() {
      var B = computeCurveBounds(this.sp, 1);
      for (var I = 0 ; I < nsk() ; I++)
         if ( sk(I) != this && sk(I).isFreehandSketch() &&
              B.xlo <= sk(I).xhi && B.xhi >= sk(I).xlo &&
              B.ylo <= sk(I).yhi && B.yhi >= sk(I).ylo )
           this.absorbSketch(sk(I--));
      this.glyph = findGlyph(this.getStrokes(), glyphs);
   }

   // ABSORB ANOTHER FREEHAND SKETCH

   this.absorbSketch = function(sketch) {

      var i, dn, xy, iLastStroke = this.id < sketch.id ? this.indexOfLastStroke() : 1;

      this.makeXform();
      sketch.makeXform();

      var sp  = this.sp;
      var sp0 = this.sp0;

      this.sp  = [sp[0]];
      this.sp0 = [sp0[0]];

      for (i = 1 ; i < iLastStroke ; i++) {
         this.sp0.push(sp0[i]);
         this.sp.push(sp[i]);
      }

      for (i = 1 ; i < sketch.sp0.length ; i++) {
         xy = sketch.sp0[i];
         xy = sketch.xform(xy);
         xy = this.xformInverse(xy);
         this.sp0.push(xy);
         this.sp.push(sketch.sp[i]);
      }

      for (i = iLastStroke ; i < sp0.length ; i++) {
         this.sp0.push(sp0[i]);
         this.sp.push(sp[i]);
      }

      deleteSketch(sketch);
   }

   this.isLocked = function() {
      return this._isLocked || sketchPage.isLocked;
   }

   this.isParsed = function() {
      return this.parsedStrokes != null;
   }

   this.mouseDown = function(x, y) {
      this.xDown = x;
      this.yDown = y;
      this.travel = 0;

      // DO NOT TRY TO DRAW OVER A TEXT SKETCH.

      if (this.text.length > 0 && ! isDef(this.inValue[0]))
         return;

      // DO NOT TRY TO DRAW OVER A KEY FRAMES SKETCH.

      if (this.keys) {
         this._keysMotionPath = [];
         this._keysMotionPath.push([x,y]);
         return;
      }

      var p = this.m2s([x,y]);
      this.sp0.push(p);
      if (this.joinNextStroke !== undefined) {
         this.sp.push([p[0],p[1],1]);
         this.joinNextStroke = undefined;
      }
      else
         this.sp.push([p[0],p[1],0]);
   }
   this.mouseDrag = function(x, y) {

      this.travel = max(this.travel, len(x - this.xDown, y - this.yDown));

      // DO NOT TRY TO DRAW OVER A TEXT SKETCH.

      if (this.text.length > 0 && ! isDef(this.inValue[0]))
         return;

      // DO NOT TRY TO DRAW OVER A KEY FRAMES SKETCH.

      if (this.keys) {
         this._keysMotionPath.push([x,y]);
         return;
      }

      // WHEN THE STROKE'S LAST POINT LANDS ON ANOTHER SKETCH:

      var p = this.m2s([x,y]);
      this.sp0.push(p);
      this.sp.push([p[0],p[1],1]);
   }

   this.mouseUp = function(x, y) {

      if (isTextMode)
         return;

      // IF IN LOCKED MODE, THEN EVERYTHING IS INTERPRETED AS A DRAWING.

      if (bgClickCount == 0 && this.isLocked()) {
         this.isClick = false;

         // AND MAKE SURE A CLICK WILL BE INTERPRETED AS A TINY STROKE.

         if (this.travel <= clickSize())
            for (var n = 0 ; n < 3 ; n++)
               this.mouseDrag(x, y + n/3);
         return;
      }

      this.isClick = this.travel <= clickSize();

      // SWIPING ON A TEXT WITH DIGITS CHANGES ITS NUMERIC VALUE.

      if (! this.isClick) {
         var dlo = this.text.search(/-?\d/), dhi = dlo;
         if (dlo >= 0) {
            while (++dhi < this.text.length && this.text.substring(dhi, dhi+1).search(/[0-9\.]/) == 0)
               ;
            var tail = this.text.substring(dhi, this.text.length);
            var value = parseFloat(this.text.substring(dlo, dhi));
            switch (pieMenuIndex(x - this.xDown, y - this.yDown)) {
            case 0: value *= 10; break;
            case 1: value++    ; break;
            case 2: value /= 10; break;
            case 3: value--    ; break;
            }
            var valueStr = '' + value;
            if (valueStr.length > 10) {
               var j = valueStr.indexOf('00000');
               if (j >= 0)
                  value = parseFloat(valueStr.substring(0, j));
               var j = valueStr.indexOf('99999');
               if (j >= 0)
                  value = parseFloat(valueStr.substring(0, j)) + 1;
            }
            if (('' + value).indexOf('.') == -1 && this.text.charAt(dhi-1) == '.')
               tail = '.' + tail;
            this.setText(this.text.substring(0, dlo) + value + tail);
            return;
         }
      }

      // CLICKING ON A TEXT SKETCH ENTERS TEXT MODE AND SETS CURSOR POSITION.

      if (this.text.length > 0) {
         setTextMode(true);
         this.setTextCursor(x, y);
         return;
      }

      // CLICK ON THE SKETCH TO CONVERT IT TO A GLYPH SKETCH.

      if (this.isClick) {
         this.removeLastStroke();
         this.convertToGlyphSketch();
         return;
      }

      // NEED TO ABSORB ANY OTHER FREEHAND SKETCH THAT THE SKETCH INTERSECTS.

      window.checkForAbsorb = true;

      // ADJUST TO BEST CENTER POINT TO ROTATE AND SCALE ABOUT.

      if (this.sc == 1 || this.tX == 0 && this.tY == 0) {
         var B = computeCurveBounds(this.sp, 1);
         var dx = ((B.xlo + B.xhi) / 2 - this.tX) / this.sc;
         var dy = ((B.ylo + B.yhi) / 2 - this.tY) / this.sc;
         this.tX += dx * this.sc;
         this.tY += dy * this.sc;
         for (var i = 1 ; i < this.sp0.length ; i++) {
            this.sp0[i][0] -= dx;
            this.sp0[i][1] -= dy;
         }
      }

      this.len = computeCurveLength(this.sp0, 1);
   }

   this.useStrokes = function(strokes) {
      var xx = 0, yy = 0, kk = 0;
      for (var n = 0 ; n < strokes.length ; n++)
         for (var i = 0 ; i < strokes[n].length ; i++) {
            xx += strokes[n][i][0];
            yy += strokes[n][i][1];
            kk++;
         }
      this.tX = xx / kk;
      this.tY = yy / kk;

      for (var n = 0 ; n < strokes.length ; n++)
         for (var i = 0 ; i < strokes[n].length ; i++) {
            var x = strokes[n][i][0] - this.tX;
            var y = strokes[n][i][1] - this.tY;
            this.sp0.push([x,y]);
            this.sp.push([x,y,i>0]);
         }
   }

   this.convertToGlyphSketch = function() {
      var glyph = findGlyph(this.getStrokes(), glyphs);
      if (glyph == null)
         return;
      preglyphSketch = this;
      if (glyph != null)
         glyph.toSketch();
      sk().glyph = glyph;
      sk().setColorId(preglyphSketch.colorId);
      if (glyph.name.indexOf('loadPage(') >= 0)
         preglyphSketch.fade();
      else
         deleteSketch(preglyphSketch);
   }

   this.getStrokes = function() {
      strokes = [];
      var n = -1;
      for (var i = 1 ; i < this.sp.length ; i++) {
         if (this.sp[i][2] == 0) {
            strokes.push([]);
            n++;
         }
         if (n >= 0)
            strokes[n].push([ this.sp[i][0], this.sp[i][1] ]);
      }
      return strokes;
   }

   this.parse = function() {
      this.parsedStrokes = parseStrokes(this.getStrokes(), this.tX, this.tY);
   }

   // DRAW THE PARSED STROKES.

   this.drawParsed = function() {
      this.parsedTransition = min(1, this.parsedTransition + 0.05);
      var transition = sCurve(this.parsedTransition);

      annotateStart();

      lineWidth(sketchLineWidth * mix(1, .6, transition) * sketchPage.zoom / this.zoom);
      this.makeXform();

      var curves = parsedStrokesToCurves(this.parsedStrokes, transition);
      for (var n = 0 ; n < curves.length ; n++) {
         var c = [];
         for (var i = 0 ; i < curves[n].length ; i++)
            c.push(this.xform(curves[n][i]));
         drawCurve(c);
      }

      annotateEnd();
   }

   this._p = newVec3();

   this.render = function() {
      this.makeXform();

      var sp = this.sp;

      if (this.keysStartTime) {
         var pt;

         var p = [0, 0, 0];
         var q = [0, 0, 0];
         var t = (this.keys.length * (time - this.keysStartTime) / this.keysCycleDuration) % this.keys.length;

         var keyIndex0 = floor(t),
             keyIndex1 = (keyIndex0 + 1) % this.keys.length;

         var dx = -this.tX;
         var dy = -this.tY;
         if (this.keysMotionPath) {
            pt = sample(this.keysMotionPath, ((time - this.keysStartTime) / this.keysMotionPathDuration) % 1);
            dx += pt[0] - this.keysMotionPath[0][0];
            dy += pt[1] - this.keysMotionPath[0][1];
         }

         sp = [];
         var i = 0;
         sp[i++] = [ 0, 0, 0 ];
         for (var strokeIndex = 0 ; strokeIndex < this.keys[0].length ; strokeIndex++) {
            for (var f = 0 ; f < 1 ; f += 1 / 100) {

               pt = sample(this.keys[keyIndex0][strokeIndex], f);
               pt[0] += dx;
               pt[1] += dy;
               this.xform(pt, p);

               pt = sample(this.keys[keyIndex1][strokeIndex], f);
               pt[0] += dx;
               pt[1] += dy;
               this.xform(pt, q);

               sp[i++] = [ mix(p[0], q[0], t % 1), mix(p[1], q[1], t % 1), f > 0 ];
            }
         }
      }
      else {
         var p = [0, 0, 0];
         for (var i = 0 ; i < sp.length ; i++) {
            this.xform(this.sp0[i], p);
            sp[i][0] = p[0];
            sp[i][1] = p[1];
         }
      }

      var isUndrawing = sketchAction == 'undrawing' &&
                        this == sketchPage.sketches[sketchPage.trueIndex];

      var isCreatingKeys = sketchAction == 'creatingKeys' &&
                           this == sketchPage.sketches[sketchPage.trueIndex];

      if (isCreatingKeys) {
         annotateStart();
         this.showKeys();
         annotateEnd();
         return;
      }

      annotateStart();
      lineWidth(isUndrawing ? 2 : sketchLineWidth * sketchPage.zoom / this.zoom);
      _g.strokeStyle = this.color;

      if (this.isParsed())
         this.drawParsed();
      else {
         var isCard = this.isCard;

         var strokeIndex = -1;

         // IF UNDRAWING, DRAW ONLY PART OF THE SKETCH.

         var n = sp.length;
         if (isUndrawing)
            n = max(2, floor(n * sketchPage.tUndraw));

         // IF IN XML-STROKES MODE, WRITE THE STROKES OF THIS SKETCH.

         if (xmlWriteEnabled) {
            var curve = [];
            for (var i = 1 ; i < n ; i++) {
               if (sp[i][2] == 0) {
                  if (curve.length > 0)
                     xmlWriteCurve(curve);
                  curve = [];
               }
               curve.push([sp[i][0], sp[i][1]]);
            }
            if (curve.length > 0)
               xmlWriteCurve(curve);
         }

         // LOOP THROUGH THE sp ARRAY.

         var startedAnyStrokes = false;
         for (var i = 1 ; i < n ; i++) {

            var p = [sp[i][0], sp[i][1], 0];
            viewForwardMat.transform(p, p);

            // START DRAWING A STROKE.

            if (sp[i][2] == 0) {
               if (startedAnyStrokes)
                  _g_stroke();
               startedAnyStrokes = true;

               _g_beginPath();
               _g_moveTo(p[0], p[1]);

               strokeIndex++;
               if (strokeIndex < this.colorIndex.length)
                  _g.strokeStyle = palette.color[this.colorIndex[strokeIndex]];
            }

            // CONTINUE DRAWING A STROKE.

            else {

               _g_lineTo(p[0], p[1]);

               strokeIndex++;

               // HANDLE CARD-STYLE RENDERING.

               if (isCard && (i == sp.length - 1 || sp[i+1][2] == 0)) {
                  _g_stroke();
                  var i0 = i - 1;
                  while (i0 > 1 || sp[i0][2] == 1)
                     i0--;
                  _g.fillStyle = this.isNegated ? this.color : backgroundColor;
                  fillPath(sp, i0, i, _g);
                  if (this.isNegated)
                     _g.strokeStyle = backgroundColor;
                  isCard = false;
                  _g_beginPath();
               }
            }
         }

         if (startedAnyStrokes)
            _g_stroke();

         // IF UNDRAWING OR SHOWING TOOL TIPS

         if (isUndrawing || isShowingHelp) {

            // DRAW AN ARROW HEAD FOR EACH STROKE.

            for (i = 1 ; i < n ; i++)
               if (n >= 4 && (i == n-1 || sp[i+1][2] == 0))
                  this.drawStrokeArrowhead(sp, i);

            // NUMBER THE STROKES.

            var strokeIndex = 1;
            for (i = 1 ; i < n ; i++)
               if (sp[i][2] == 0)
                  textDot(strokeIndex++, sp[i][0], sp[i][1], sfs(8));
         }
      }

      this.drawText(_g);

      annotateEnd();
   }
   this.drawStrokeArrowhead = function(sp, i) {
      var j = max(0, i - 4);
      var ax = sp[j][0], ay = sp[j][1];
      var bx = sp[i][0], by = sp[i][1];
      var dx = (bx - ax), dy = (by - ay), d = len(dx, dy);
      dx *= 6 / d;
      dy *= 6 / d;
      line(bx, by, bx - dx - dy, by - dy + dx);
      line(bx, by, bx - dx + dy, by - dy - dx);
   }


   /////////////////////////////////////////////////////////////////////

   this.creatingKeysStart = function() {
      sketchAction = 'creatingKeys';
      if (! this.keys) {
         this.keys = [ this.toTrace(1), [] ];
         this.keyIndex = 1;
         this.keyStrokeIndex = 0;
         this.keysCycleDuration = 1;
         this.keysMotionPathDuration = 5;
      }
      else {
      }
   }

   this.creatingKeysMouseMove = function(x, y, z) {
   }

   this.creatingKeysMouseDown = function(x, y, z) {
      var position = [x,y,z];

      this.creatingKeys_position = position;
      this.creatingKeys_travel = 0;

      this.keys[this.keyIndex].push([]);
      this.keyStrokeIndex = this.keys[this.keyIndex].length - 1;

      this.keys[this.keyIndex][this.keyStrokeIndex].push(position);
   }

   this.creatingKeysMouseDrag = function(x, y, z) {
      var position = [x,y,z];

      this.creatingKeys_travel += distance(this.creatingKeys_position, position);
      this.creatingKeys_position = position;

      this.keys[this.keyIndex][this.keyStrokeIndex].push(position);
   }

   this.creatingKeysMouseUp = function(x, y, z) {
      if (this.creatingKeys_travel <= clickSize()) {
         this.keys.pop();
         sketchActionEnd();
         return;
      }
      if (++this.keyStrokeIndex == this.keys[0].length) {
         this.keys.push([]);
         ++this.keyIndex;
         this.keyStrokeIndex = 0;
      }
   }

   this.showKeys = function() {
      var key = this.keys[this.keyIndex - 1], index, n, isGuideStroke
      for (index = 0 ; index < this.keyIndex ; index++) {
         key = this.keys[index];
         for (n = 0 ; n < key.length ; n++) {
            isGuideStroke = index == this.keyIndex - 1 && n == this.keyStrokeIndex;
            lineWidth(isGuideStroke ? 2 : 1);
            color(fadedColor(isGuideStroke ? 0.5 : 0.25));
            drawCurve(key[n]);
            if (isGuideStroke) {
               this.drawStrokeArrowhead(key[n], key[n].length - 1);
               textDot(n+1, key[n][0][0], key[n][0][1], sfs(8));
            }
         }
      }

      key = this.keys[this.keyIndex];
      lineWidth(4);
      color(defaultPenColor);
      for (n = 0 ; n < key.length ; n++)
         drawCurve(key[n]);
   }

   /////////////////////////////////////////////////////////////////////
}
FreehandSketch.prototype = new Sketch;

function NumericSketch() {

   this.initNumeric = function(str, x, y) {

      this.sp0 = [[0,0]];
      this.sp = [[0,0,0]];
      this.value = str;
      this.isClick = true;
      this.yTravel = 0;
      this.xPrevious = 0
      this.yPrevious = 0
      this.increment = 1;
      this.setText(str);
      this.sketchProgress = 1;
      this.sketchState = 'finished';
      this.textX = this.tX = x;
      this.textY = this.tY = y;
   }

   this.mouseDown = function(x, y) {
      this.yTravel = 0;
      this.xPrevious = x;
      this.yPrevious = y;
      this.xVary = 0;
      this.yVary = 0;
   }

   this.ppi = 20; // PIXELS PER INCREMENT, WHEN DRAGGING TO CHANGE VALUE.

   this.mouseDrag = function(x, y) {

      this.yTravel += y - this.yPrevious;
      if (this.yTravel < -this.ppi) {
         var incr = min(1, this.increment);
         this.value = "" + (parseFloat(this.value) + incr);
         this.setText(this.value);
         if (this.text.length > 10)
            this.setText(roundedString(this.value));
         this.yTravel = 0;
      }
      else if (this.yTravel > this.ppi) {
         var incr = min(1, this.increment);
         this.value = "" + (parseFloat(this.value) - incr);
         this.setText(this.value);
         if (this.text.length > 10)
            this.setText(roundedString(this.value));
         this.yTravel = 0;
      }
      this.xPrevious = x;
      this.yPrevious = y;

      this.xVary = max(this.xVary, abs(x - this.xDown));
      this.yVary = max(this.yVary, abs(y - this.yDown));
   }

   this.mouseUp = function(x, y) {
      if (this.isClick) {
         outSketch = this;
         outPort = 0;
         inSketch = null;
         inPort = -1;
      }
      else if (this.xVary > this.yVary) {
         if (x > this.xDown) {
            this.value = "" + (parseFloat(this.value) / 10);
            this.increment /= 10;
            if (this.increment >= 1)
               this.value = "" + floor(parseFloat(this.value));
         }
         else {
            this.value = "" + (parseFloat(this.value) * 10);
            this.increment *= 10;
         }
         this.setText(roundedString(this.value));
         this.value = this.text;
      }
   }

   this.insertText = function(textChar) {
      NumericSketch.prototype.insertText.call(this, textChar);
      this.increment = 1;
      var i = this.text.indexOf('.');
      if (i >= 0)
         while (++i < this.text.length)
            this.increment /= 10;
   }

   this.render = function() {
      NumericSketch.prototype.render.call(this);
      var value = this.inValue[0];
      if (isDef(value)) {
         var text = isNumeric(value) ? roundedString(value) : value;
         this.setText(value);
         this.value = this.text;
      }
   }
}
NumericSketch.prototype = new FreehandSketch;

