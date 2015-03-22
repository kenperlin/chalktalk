
   // ALL THE POSSIBLE DRAWING COLORS FOR A SKETCH.

   var paletteRGB = [
      [255,255,255],        // CHANGES BETWEEN WHITE AND BLACK, WHENEVER USER TOGGLES WITH '-' KEY.
      [255,  0,  0],        // RED
      [255,128,  0],        // ORANGE
      [255,255,  0],        // YELLOW
      [  0,255,  0],        // GREEN
      [  0,  0,255],        // BLUE
      [255,  0,255],        // MAGENTA
   ];

   var palette = [];
   for (var i = 0 ; i < paletteRGB.length ; i++)
      palette.push('rgb(' + paletteRGB[i][0] + ',' +
                            paletteRGB[i][1] + ',' +
                            paletteRGB[i][2] + ')' );

   function sketchColor() { return palette[sketchPage.colorId]; }

   // THE BASIC SKETCH CLASS, FROM WHICH ALL SKETCHES ARE EXTENDED.

   function Sketch() {
      this.children = [];
      this.cleanup = null;
      this.code = null;
      this.setColorId(sketchPage.colorindex);
      this.colorIndex = [];
      this.computeStatistics = null;
      this.dSum = 0;
      this.defaultValue = [];
      this.defaultValueIncr = [];
      this.drawFirstLine = false;
      this.fadeAway = 0;
      this.sketchTexts = [];
      this.sketchTrace = null;
      this.trace = [];
      this.glyphTransition = 0;
      this.groupPath = [];
      this.groupPathLen = 1;
      this.id;
      this.in = []; // array of Sketch
      this.inValue = []; // array of values
      this.inValues = []; // flattened array of values
      this.is3D = false;
      this.isCard = false;
      this.isMouseOver = false;
      this.isNegated = false;
      this.isShowingLiveData = false;
      this.labels = [];
      this.motionPath = [];
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
      this.suppressLineTo = false;
      this.sketchLength = 1;
      this.cursorTransition = 0;
      this.sketchProgress = 0;
      this.sketchState = 'finished';
      this.styleTransition = 0;
      this.sp = [];
      this.tX = 0;
      this.tY = 0;
      this.text = "";
      this.textCursor = 0;
      this.textHeight = -1;
      this.textStrs = [];
      this.textX = 0;
      this.textY = 0;
      this.value = null;
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
         return this.fadeAway == 0 ? 1 : this.fadeAway;
      },
      setColorId : function(i) {
         this.colorId = i;
         this.color = palette[i];
      },
      setRenderMatrix : function(mat) {
         var D = norm(vecDiff(m.transform([0,0,0]), m.transform([1,0,0]))) * this.xyzS();
         var s = .381872 * height();
         var p = this.toPixel([0,0,0]);

         mat.identity();

         mat.translate((p[0] - width()/2) / s, (height()/2 - p[1]) / s, 0);

         //mat.perspective(0, 0, -7 * height() / s);

         var yy = min(1, 4 * this.rY * this.rY);
         mat.rotateX(PI * -this.rY);
         mat.rotateY(PI *  this.rX * (1 - yy));
         mat.rotateZ(PI * -this.rX * yy);

         mat.scale(D / s);
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
         var isg = this.sketchTrace != null && this.glyphTransition >= 0.5;
         if (isg || this.sketchProgress == 1) {
            _g.save();
            _g.globalAlpha = (isg ? 2 * this.glyphTransition - 1
                                  : this.styleTransition) * this.fade();
            if (isg)
               _g.lineWidth = sketchLineWidth * .6;
            this.afterSketchCallbackFunction = callbackFunction;
            this.afterSketchCallbackFunction();
            _g.restore();
         }
      },
      extendBounds : function(points) {
         this.afterSketch(function() {
            var saveStrokeStyle = _g.strokeStyle;
            color('rgba(0,0,0,.01)');
            mCurve(points);
            _g.strokeStyle = saveStrokeStyle;
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
            else
               dst[prop] = this[prop];
         }
         if (dst.initCopy !== undefined)
            dst.initCopy();
         return dst;
      },
      computeGroupBounds : function() {
         this.xlo = this.ylo =  10000;
         this.xhi = this.yhi = -10000;
         for (var j = 0 ; j < this.children.length ; j++) {
            var child = this.children[j];
            child.parent = this;
            this.xlo = min(this.xlo, child.xlo);
            this.ylo = min(this.ylo, child.ylo);
            this.xhi = max(this.xhi, child.xhi);
            this.yhi = max(this.yhi, child.yhi);
         }
      },
      computePixelSize : function() {
         return this.scale() * this.xyzS();
      },
      contains : function(x, y) {
         return this.xlo <= x && this.ylo <= y && this.xhi > x && this.yhi > y;
      },
      cx : function() {
         return (this.xlo + this.xhi) / 2;
      },
      cy : function() {
         return (this.ylo + this.yhi) / 2;
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
         if (this.parent == null)
            drawRect(this.xlo, this.ylo, this.xhi - this.xlo, this.yhi - this.ylo);
      },
      drawCursor : function(x, y, dy, context) {
         y += 0.35 * dy;

         context.save();

         context.lineWidth = .07 * dy;
         context.strokeStyle = defaultPenColor;
         context.beginPath();

         var x0 = x - dy * 4/16;
         var x1 = x + dy * 4/16;

         var y0 = y - dy * 19/16;
         var y1 = y - dy * 18/16;
         var y2 = y + dy *  3/16;
         var y3 = y + dy *  4/16;

         context.moveTo(x, y1);
         context.lineTo(x, y2);

         context.moveTo(x0, y0);
         context.lineTo(x , y1);
         context.lineTo(x1, y0);

         context.moveTo(x0, y3);
         context.lineTo(x , y2);
         context.lineTo(x1, y3);

         context.stroke();

         context.restore();
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

         var fontSize = floor(24 * this.scale());

         if (this instanceof SimpleSketch && this.isNullText() && isDef(this.inValue[0])) {
            var val = valueOf(this.inValue[0], time);
            context.save();
               context.strokeStyle = backgroundColor;
               context.fillStyle = dataColor;
               context.font = fontSize + 'pt ' + defaultFont;
               var str = val;
               if (isNumeric(val)) {
                  str = roundedString(val);

                  // JUSTIFY THE NUMBER CONSISTENTLY (WHETHER INT OR FLOAT)

                  var i = str.indexOf('.');
                  if (i >= 0)
                     this.isFloat = true;
                  if (this.isFloat && i < 0) {
                     str += ".00";
                     i = str.indexOf('.');
                  }
               }
               else if (Array.isArray(val)) {
                  str = "";
                  for (var i = 0 ; i < val.length ; i++)
                     str += roundedString(val[i]) + (i < val.length-1 ? "," : "");
               }
               var dx = this.isFloat ? textWidth(str.substring(0, i))
                                     : textWidth(str) / 2;

               context.fillText(str, this.cx() - dx, this.cy() + .5 * fontSize);
            context.restore();
            return;
         }

         context.save();
         context.strokeStyle = this.isNegated ? this.color : backgroundColor;
         context.fillStyle = this.isNegated ? backgroundColor : this.color;

         var fontHeight = this.isParsed() ? floor(0.7 * fontSize) : fontSize;

         context.font = fontHeight + 'pt ' + (this.isParsed() ? 'Consolas' : defaultFont);

         var isCursor = isTextMode && context == _g && this == sk(sketchPage.trueIndex);
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
            this.drawCursor(x1, y1, fontHeight, context);
            context.restore();
            return;
         }

         var j = 0;
         for (var n = 0 ; n < this.textStrs.length ; n++) {
            var str = this.textStrs[n];
            var tw = textWidth(str, context);
            var x = x1;
            var y = y1 + 1.3 * fontHeight * (n - 0.5 * (this.textStrs.length-1));
            var tx = x - .5 * tw;
            context.globalAlpha = this.fade();
            context.fillText(str, tx, y + .35 * fontHeight);

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
                  this.drawCursor(cx, y, fontHeight, context);
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

         // IF NO ARGS ARE SUPPLIED, USE VALUES FROM THE SKETCH'S INPUT PORTS.

         function defaultToZero(arg) { return arg===undefined ? 0 : arg; }

         if (x === undefined) x = defaultToZero(this.inValue[0]);
         if (y === undefined) y = defaultToZero(this.inValue[1]);
         if (z === undefined) z = defaultToZero(this.inValue[2]);

         // IF NO RETURN STATEMENT, SUPPLY ONE.

         if (code.indexOf('return') == -1)
            code = "return " + code;

         // EVAL THE CODE IN THE SCOPE OF THIS SKETCH.

         var result = null;

         try {
            this._tmpFunction = Function("x","y","z", code);
            result = this._tmpFunction(x, y, z);
         } catch (e) {
            console.log('evalCode: ' + e);
         }

         // ANY ERROR RESULTS IN A RETURN VALUE OF null.

         return result;
      },
      setTextCursor : function(x, y) { this.textCursorXY = [x, y]; },
      getDefaultFloat : function(name) {
         return parseFloat(this.getDefaultValue(name));
      },
      getDefaultValue : function(name) {
         var j = this.getPortIndex(name);
         if (j < 0) return 0;
         var value = this.defaultValue[j];
         return ! isDef(value) || value == null ? "0" : value;
      },
      getInFloat : function(name) {
         return parseFloat(this.getInValueOf(name));
      },
      getInIndex : function(s) { return getIndex(this.in, s); },
      getInValue : function(j, dflt) {
         return this.inValues[j] !== undefined ? valueOf(this.inValues[j], time) : dflt;
      },
      getInValueOf : function(name) {
         var j = getIndex(this.portName, name);
         if (j < 0) return 0;
         var value = this.inValue[j];
         return ! isDef(value) || value == null ? "0" : value;
      },
      getPortIndex : function(name) {
         return getIndex(this.portName, name);
      },
      hasBounds : function() {
         return this.xlo !== undefined && this.xhi !== undefined && this.xlo <= this.xhi &&
                this.ylo !== undefined && this.yhi !== undefined && this.ylo <= this.yhi ;
      },
      hasMotionPath : function() {
         return this.motionPath.length > 0 && this.motionPath[0].length > 1;
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
      isGroup : function() {
         return this.children.length > 0;
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
      isSimple : function() {
         return this instanceof SimpleSketch;
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
      portXY : function(i) {
         if (isDef(this.portLocation[i])) {
            if (this instanceof Sketch2D) {
               var p = this.portLocation[i];
               p = [ this.transformX2D(p[0],p[1]), this.transformY2D(p[0],p[1]) ];
               return this.adjustXY(p);
            }
            else if (this instanceof SimpleSketch)
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
      removeLastStroke : function() {
         if (this.sp.length > 1) {
            var i = this.sp.length;
            while (--i > 0 && this.sp[i][2] == 1) ;
            if (this.sp0 !== undefined)
               this.sp0.splice(i, this.sp.length-i);
            this.sp.splice(i, this.sp.length-i);
         }
      },
      renderWrapper : function(elapsed) {
         this.afterSketchTransition = this.glyphTransition < 1 ? 0 :
                                      min(1, this.afterSketchTransition + 2 * elapsed);

         _g.save();

         m.save();

         if (this.glyphTransition < 1 && this.drawing !== undefined)
            this.drawing.update();

         if (window.isCatchingRenderExceptions !== undefined)
            try {
               this.render(elapsed);
            } catch(e) { console.log(e); }
	 else
            this.render(elapsed);

         m.restore();

         if (this.sketchTexts.length > 0) {
            m.save();
	    for (var n = 0 ; n < this.sketchTexts.length ; n++)
	       this.sketchTexts[n].update(this);
            m.restore();
         }

         _g.restore();

         if (this.isMakingGlyph === undefined && this.createMesh !== undefined) {
            this._updateMesh();
         }
      },
      scale : function(value) {
         if (value === undefined) {
            var s = this.sc;
            if (this.parent != null)
               s *= this.parent.scale();
            return s * sketchPage.zoom;
         }
         this.sc *= value;
         if (this.isGroup()) {
            function sx(x) { return cx + (x - cx) * value; }
            function sy(y) { return cy + (y - cy) * value; }
            var cx = this.cx();
            var cy = this.cy();
            for (var i = 0 ; i < this.groupPath.length ; i++) {
               this.groupPath[i][0] = sx(this.groupPath[i][0]);
               this.groupPath[i][1] = sy(this.groupPath[i][1]);
            }
            this.xlo = sx(this.xlo);
            this.ylo = sy(this.ylo);
            this.xhi = sx(this.xhi);
            this.yhi = sy(this.yhi);

            for (var i = 0 ; i < this.children.length ; i++) {
               this.children[i].textX = sx(this.children[i].textX);
               this.children[i].textY = sy(this.children[i].textY);
               if (this.children[i] instanceof Sketch2D) {
                  this.children[i].x2D = sx(this.children[i].x2D);
                  this.children[i].y2D = sy(this.children[i].y2D);
               }
            }
         }
      },
      setDefaultValue : function(name, value) {
         var j = getIndex(this.portName, name);
         if (j >= 0) {
            this.defaultValue[j] = value;
            if (this.defaultValueIncr[j] === undefined)
               this.defaultValueIncr[j] = 1;
         }
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

         _p.applyMatrix4(pointToPixelMatrix);
         _q.applyMatrix4(pointToPixelMatrix);
         var dx = (_p.x - _q.x) * .1;
         var dy = (_p.y - _q.y) * .1;
         this.tX += dx;
         this.tY += dy;
         _r.set(dx, dy, 0, 0).applyMatrix4(pixelToPointMatrix);
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
      setSketchText : function(index, value, position, scale) {
         this.sketchTexts[index] = new SketchText(value, position, scale);
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

         if (! this.isSimple() && ! (this instanceof Sketch2D))
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
         this.drewFirstLine = true;
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
      standardView : function(matrix) {
         var rx = this.rX, ry = this.rY, yy = min(1, 4 * ry * ry);
         standardView(
            .5 + this.tx() / width(),
            .5 - this.ty() / height(),
            this.is3D ? PI * ry          : 0,
            this.is3D ? PI * rx * (1-yy) : 0,
            this.is3D ? PI * rx * yy     : -TAU * rx,
            this.scale() / 14, matrix);
      },
      standardViewInverse : function(matrix) {
         var rx = this.rX, ry = this.rY, yy = min(1, 4 * ry * ry);
         standardViewInverse(
            .5 + this.tx() / width(),
            .5 - this.ty() / height(),
            this.is3D ? PI * ry          : 0,
            this.is3D ? PI * rx * (1-yy) : 0,
            this.is3D ? PI * rx * yy     : -TAU * rx,
            this.scale() / 14, matrix);
      },
      toPixel : function(point) {
         return this.adjustXY(m.transform(point));
      },
      toTrace : function() {
         var src = this.sp;
         var dst = [];
         for (var i = 0 ; i < src.length ; i++)
            buildTrace(dst, src[i][0], src[i][1], src[i][2]);
         return dst;
      },
      translate : function(dx, dy) {
         if (this.isGroup()) {
            this.xlo += dx;
            this.ylo += dy;
            this.xhi += dx;
            this.yhi += dy;
            for (var i = 0 ; i < this.groupPath.length ; i++) {
               this.groupPath[i][0] += dx;
               this.groupPath[i][1] += dy;
            }
            moveChildren(this.children, dx, dy);
         }
         else if (this instanceof Sketch2D) {
            this.x2D += dx;
            this.y2D += dy;
         }
         else {
            this.tX += dx;
            this.tY += dy;
            this.textX += dx;
            this.textY += dy;
         }
      },
      tx : function() {
         var x = this.tX;
         if (this.parent != null) {
            var cx = this.parent.cx();
            if (! this.isSimple())
               cx -= width() / 2;
            x -= cx;
            x = this.parent.tx() + this.parent.scale() * x;
            x += cx;
         }
         if (this.hasMotionPath())
            x += sample(this.motionPath[0], motion[this.colorId]) - this.motionPath[0][0];
         return x;
      },
      ty : function() {
         var y = this.tY;
         if (this.parent != null) {
            var cy = this.parent.cy();
            if (! this.isSimple())
               cy -= height() / 2;
            y -= cy;
            y = this.parent.ty() + this.parent.scale() * y;
            y += cy;
         }
         if (this.hasMotionPath())
            y += sample(this.motionPath[1], motion[this.colorId]) - this.motionPath[1][0];
         return y;
      },
      xform : function(xy) {
         return [ this.xf[0] + this.xf[4] * ( this.xf[2] * xy[0] + this.xf[3] * xy[1]),
                  this.xf[1] + this.xf[4] * (-this.xf[3] * xy[0] + this.xf[2] * xy[1]) ];
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
               //material.setUniform('Ldir', [[ 1.0, 1.0, 0.5], [-1.0,-0.5,-1.0], [ 0.0,-1.0,-1.2]]);
               //material.setUniform('Lrgb', [[ 1.0, 1.0, 1.0], [ 0.1, 0.1, 0.1], [ 0.1, 0.1, 0.1]]);
               material.setUniform('Ldir', [[ 1.0, 1.0, 1.0], [-1.0,-0.5,-1.0]]);
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
            else if (codeSelector.selectedIndex >= 0)
               this.fragmentShader = this.fragmentShaders[codeSelector.selectedIndex];

            if (this.meshBounds == undefined)
               this.meshBounds = [ [-1, -1] , [1, 1] ];
            this.mesh = this.createMesh();
            root.add(this.mesh);
            this.is3D = true;

            // DEFAULT VALUES FOR PHONG COEFFICIENTS.

            this.meshColorId = this.colorId;
         }
         if (this.mesh !== undefined) {

            // UPDATE MESH COLOR IF NEEDED.

            var ambient  = this.ambient !==undefined ? this.ambient  : [.025,.025,.025];
            var diffuse  = this.diffuse !==undefined ? this.diffuse  : [.200,.200,.200];
            var specular = this.specular!==undefined ? this.specular : [.500,.500,.500, 10];

            if (this.meshColorId !== this.colorId) {
               var rgb = paletteRGB[this.colorId];
               this.ambient = [0.025 * rgb[0] / 255, 0.025 * rgb[1] / 255, 0.025 * rgb[2] / 255];
               this.diffuse = [0.2   * rgb[0] / 255, 0.2   * rgb[1] / 255, 0.2   * rgb[2] / 255];
               this.meshColorId = this.colorId;
            }

            this.mesh.material.setUniform('ambient' , ambient);
            this.mesh.material.setUniform('diffuse' , diffuse);
            this.mesh.material.setUniform('specular', specular);

            // SET MESH MATRIX TO MATCH SKETCH'S POSITION/ROTATION/SCALE.

            this.setRenderMatrix(this.mesh.getMatrix());

            // SET OPACITY.

            var alpha = max(0, this.glyphTransition) *
                        (this.fadeAway == 0 ? 1 : this.fadeAway) *
                        (isDef(this.alpha) ? this.alpha : 1);

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
         ,'uniform vec3  uData[256];'
         ,'uniform float uNpts;'
         ,'vec3 place(float f) {'
         ,'   float t = max(0., min(.999, f)) * (uNpts - 1.);'
         ,'   int n = int(t);'
         ,'   return mix(uData[n], uData[n+1], t - float(n));'
         ,'}'
         ,'void main() {'
         ,'   float t = position.y + .505;'
         ,'   vec3 p1 = place(t);'
         ,'   vec3 p0 = place(t - .01);'
         ,'   vec2 d = p1.xy - p0.xy;'
         ,'   p1 += normalize(vec3(d.y, -d.x, 0.)) * position.x * p1.z;'
         ,'   gl_Position = projectionMatrix * modelViewMatrix * vec4(p1.xy, 0., 1.);'
         ,'}'
         ].join('\n');

         this.fragmentShader = [
         ,'uniform vec3 uColor;'
         ,'void main() {'
         ,'   gl_FragColor = vec4(uColor, alpha);'
         ,'}'
         ].join('\n');

         this.createMesh = function() {
            var material = this.shaderMaterial();
	    console.log(material);
            var mesh = new THREE.Mesh(new THREE.Geometry(), material);
            var geometry = new THREE.CylinderGeometry(.5, .5, 1, 3, 256);
            var cylinder = new THREE.Mesh(geometry, mesh.material);
            mesh.add(cylinder);
            return mesh;
         }
      },
      renderStrokeSetColor : function() {
         var rgb = paletteRGB[this.colorId];
         this.setUniform('uColor', [rgb[0]/255,rgb[1]/255,rgb[2]/255]);
      },
      renderStroke : function(curve) {
         if (this._gl === undefined) {
            this._renderStrokeData = new Float32Array(16); 
            this.renderStrokeSetColor();
            this._gl = renderer.context;
            this._glProgram = this.mesh.material.program.program;
            this._uData      = this._gl.getUniformLocation(this._glProgram, 'uData');
            this._uNpts      = this._gl.getUniformLocation(this._glProgram, 'uNpts');
         }

         if (this._renderStrokeData.length < 3 * curve.length)
            this._renderStrokeData = new Float32Array(3 * curve.length); 

         var thickness = isNumeric(this.xlo) ? 10 / (this.xhi - this.xlo) : 1 / 15;

         var data = this._renderStrokeData;
         for (var i = 0 ; i < curve.length ; i++) {
            data[3*i  ] = curve[i][0];
            data[3*i+1] = curve[i][1];
            data[3*i+2] = thickness * (curve[i][2] === undefined ? 1 : curve[i][2]);
         }

         this._gl.useProgram(this._glProgram);
         this._gl.uniform3fv(this._uData     , data);
         this._gl.uniform1f (this._uNpts     , curve.length);
      },

      //--------------------------------------------------------------------
   }

   function Sketch2D() {
      this.width = 400;
      this.height = 400;
      this.x2D = 0;
      this.y2D = 0;
      this.mouseX = -1000;
      this.mouseY = -1000;
      this.mousePressed = false;

      this.mouseDown = function(x, y) {
         if (this.sketchProgress == 1) {
            this.mousePressed = true;
            this.mouseX = this.untransformX2D(x, y);
            this.mouseY = this.untransformY2D(x, y);
            this.x = this.mouseX;
            this.y = this.mouseY;
         }
      }

      this.mouseDrag = function(x, y) {
         if (this.sketchProgress == 1) {
            this.mouseX = this.untransformX2D(x, y);
            this.mouseY = this.untransformY2D(x, y);
            this.x = this.mouseX;
            this.y = this.mouseY;
         }
      }

      this.mouseUp = function(x, y) {
         if (this.sketchProgress == 1) {
            this.mousePressed = false;
         }
      }
   }
   Sketch2D.prototype = new Sketch;

   function Picture(imageFile) {
      this.width = 400;
      this.height = 300;
      if (isDef(imageFile)) {
         this.imageObj = new Image();
         this.imageObj.src = imageFile;
      }
      this.render = function() {
         if (isDef(this.imageObj)) {
            this.width = this.imageObj.width;
            this.height = this.imageObj.height;
         }
         color(backgroundColor);
         drawRect(-this.width/2,-this.height/2,this.width,this.height);
         this.afterSketch(function() {
            if (this.imageObj === undefined)
               return;
            var s = this.scale();
            var saveAlpha = _g.globalAlpha;
            _g.globalAlpha = this.fade() * this.styleTransition;
            _g.drawImage(this.imageObj, this.x2D - this.width * s / 2,
                                        this.y2D - this.height * s / 2,
                                        this.width * s, this.height * s);
            _g.globalAlpha = saveAlpha;
         });
      }
   }
   Picture.prototype = new Sketch2D;

   function SimpleSketch() {
      this.sp0 = [[0,0]];
      this.sp = [[0,0,0]];
      this.drewFirstLine = false;
      this.parsedStrokes = null;
      this.parsedTransition = 0;
      this.glyphName = "simple sketch";
      this.isGlyphable = true;

      this.isParsed = function() {
         return this.parsedStrokes != null;
      }

      this.mouseDown = function(x, y) {
         if (this.isGroup())
            return;

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
         if (this.isGroup())
            return;

         var p = this.m2s([x,y]);
         this.sp0.push(p);
         this.sp.push([p[0],p[1],1]);
      }

      this.mouseUp = function(x, y) {

         if (this.isGroup()) {
            sketchPage.toggleGroup();
            return;
         }

         if (isTextMode)
            return;

         // WHEN THE STROKE'S LAST POINT LANDS ON ANOTHER SKETCH:

         if (sk().drewFirstLine) {
            var xy = sk().xform(sk().sp0[sk().sp0.length-1]);
            for (var I = 0 ; I < nsk() ; I++)
               if (sk(I) != sk() && sk(I).parent == null && sk(I).contains(xy[0], xy[1])) {

                  // EVENTUALLY WE NEED TO APPLY THE CONVERTED OBJECT AS AN ACTION TO THE OTHER OBJECT.

                  var glyphName = sk(I).glyphName;
                  sk().removeLastStroke();
                  copySketch(sk());
                  sk().convertToGlyphSketch();
                  console.log(sk().glyphName + " -> " + glyphName);
                  deleteSketch(sk());
                  return;
               }
         }

         // COMPUTE BOUNDING BOX OF DRAWING.

         var xlo =  100000, ylo =  100000;
         var xhi = -100000, yhi = -100000;
         for (var i = 1 ; i < this.sp0.length ; i++) {
            xlo = min(xlo, this.sp0[i][0]);
            ylo = min(ylo, this.sp0[i][1]);
            xhi = max(xhi, this.sp0[i][0]);
            yhi = max(yhi, this.sp0[i][1]);
         }

         // PARSE FOR VARIOUS KINDS OF SWIPE ACTION UPON ANOTHER SKETCH.

         if (isk() && sk() instanceof SimpleSketch && ! sk().drewFirstLine) {
            var action = null, n = sk().sp0.length, I = 0;
            for ( ; I < nsk() ; I++)
               if (sk(I) != sk() && sk(I).parent == null) {

                  // FOR X AND Y, TEST WHETHER THIS STROKE EITHER:
                  // SPANS, MEETS OR NESTS IN THE SKETCH.

                  var xSpans = xlo < sk(I).xlo && xhi > sk(I).xhi;
                  var xMeets = xlo < sk(I).xhi && xhi > sk(I).xlo;
                  var xNests = xlo > sk(I).xlo && xhi < sk(I).xhi;

                  var ySpans = ylo < sk(I).ylo && yhi > sk(I).yhi;
                  var yMeets = ylo < sk(I).yhi && yhi > sk(I).ylo;
                  var yNests = ylo > sk(I).ylo && yhi < sk(I).yhi;

                  // FOR X AND Y, TEST WHETHER FIRST AND LAST POINT OF STROKE:
                  // IS TO THE LEFT, MIDDLE OR RIGHT OF THE SKETCH.

                  var x0 = sk().sp0[  1][0], x0L = x0 < sk(I).xlo,
                                                  x0H = x0 > sk(I).xhi,
                                                  x0M = ! x0L && ! x0H;
                  var y0 = sk().sp0[  1][1], y0L = y0 < sk(I).ylo,
                                                  y0H = y0 > sk(I).yhi,
                                                  y0M = ! y0L && ! y0H;
                  var xn = sk().sp0[n-1][0], xnL = xn < sk(I).xlo,
                                                  xnH = xn > sk(I).xhi,
                                                  xnM = ! xnL && ! xnH;
                  var yn = sk().sp0[n-1][1], ynL = yn < sk(I).ylo,
                                                  ynH = yn > sk(I).yhi,
                                                  ynM = ! ynL && ! ynH;

                  // CHECK FOR GOING IN THEN BACK OUT OF SKETCH FROM TOP,B,L OR R:

                  if (xNests && yMeets && y0L && ynL) { action = "translating"; break; }
                  if (xNests && yMeets && y0H && ynH) { action = "rotating"; break; }
                  if (xMeets && yNests && x0L && xnL) { action = "scaling"; break; }
                  if (x0L && y0M && xnM && ynL      ) { action = "parsing"; break; }
                  if (xMeets && yNests && x0H && xnH) { action = "deleting"; break; }
                  if (xMeets && yMeets              ) { action = "joining"; break; }
               }

            // JOIN: APPEND STROKE TO sk(I), INVERT sk(I) XFORM FOR EACH PT OF STROKE.

            if (action == "joining" && isk() && isDef(sk(I))
                                    && ! (sk(I) instanceof GeometrySketch)) {
               sk(I).makeXform();
               for (var i = 1 ; i < sk().sp0.length ; i++) {
                  var xy = sk().sp0[i];
                  xy = [ xy[0], xy[1] ];
                  xy = sk(I).xformInverse(xy);
                  if (isDef(sk(I).sp0))
                     sk(I).sp0.push(xy);
                  sk(I).sp.push([xy[0], xy[1], i == 1 ? 0 : 1]);
               }
            }

            // IF THIS WAS AN ACTION STROKE, DELETE IT.

            if (action != null)
               deleteSketch(sk());

            // DO THE ACTION, IF ANY.

            switch (action) {
            case "translating":
            case "rotating":
            case "scaling":
               selectSketch(I);
               sketchAction = action;
               break;
            case "parsing":
               sk(I).parse();
               break;
            case "deleting":
               deleteSketch(sk(I));
               //sk(I).fadeAway = 1;
               break;
            }
         }

         // CLICK

         if (len(xhi - xlo, yhi - ylo) <= clickSize()) {

            // SKETCH WAS JUST BYPRODUCT OF A CLICK.  DELETE IT.

            if (this.text.length == 0) {
               deleteSketch(sk());
               if (linkAtCursor != null)
                  deleteLinkAtCursor();
            }

            // CLICK WAS OVER USER TYPED TEXT.

            if (this.text.length > 0 && ! isDef(this.inValue[0])) {

               // REMOVE ANY REMNANTS OF A STROKE LEFT BY CLICK.

               if (this.sp0.length < 10) {
                  this.sp0 = [[0,0]];
                  this.sp = [[0,0,0]];
               }

               // POSITION CURSOR AND ENTER TEXT MODE.
               // (NOT YET FULLY IMPLEMENTED).

               setTextMode(true);
            }

            return;
         }

         // CLICK TO REINTERPRET SKETCH BY LOOKING UP IN GLYPH DICTIONARY.

         if (this.isClick) {
            this.removeLastStroke();
            if (sketchPage.isGlyphable && this.isGlyphable)
               this.convertToGlyphSketch();
            return;
         }

         if (! this.drewFirstLine) {
            var x0 = (xlo + xhi) / 2;
            var y0 = (ylo + yhi) / 2;
            this.tX += x0;
            this.tY += y0;
            for (var i = 1 ; i < this.sp0.length ; i++) {
               this.sp0[i][0] -= x0;
               this.sp0[i][1] -= y0;
            }
            this.drewFirstLine = true;
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
         glyphSketch = this;
         if (glyph != null)
            glyph.toSketch();
         sk().glyph = glyph;
         if (sk() instanceof Picture)
            glyphSketch.fadeAway = 1;
         else
            deleteSketch(glyphSketch);
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
         if (this.isGroup()) {
            console.log("NEED TO IMPLEMENT PARSING A GROUP");
            return;
         }
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

      this.render = function() {
         this.makeXform();
         for (var i = 0 ; i < this.sp.length ; i++) {
            var xy = this.xform(this.sp0[i]);
            this.sp[i][0] = xy[0];
            this.sp[i][1] = xy[1];
         }

         var isUndrawing = sketchAction == "undrawing" &&
                           this == sketchPage.sketches[sketchPage.trueIndex];

         annotateStart();
         lineWidth(isUndrawing ? 2 : sketchLineWidth * sketchPage.zoom / this.zoom);
         _g.strokeStyle = this.color;

         if (this.isParsed())
            this.drawParsed();
         else {
            var sp = this.sp;
            var isCard = this.isCard;

            var strokeIndex = -1;

            // IF UNDRAWING, DRAW ONLY PART OF THE SKETCH.

            var n = sp.length;
            if (isUndrawing)
               n = max(2, floor(n * sketchPage.tUndraw));

            // LOOP THROUGH THE sp ARRAY.

            var startedAnyStrokes = false;
            for (var i = 1 ; i < n ; i++) {

               // START DRAWING A STROKE.

               if (sp[i][2] == 0) {
                  if (startedAnyStrokes)
                     _g.stroke();
                  startedAnyStrokes = true;

                  if (isUndrawing)
                     fillOval(sp[i][0] - 4, sp[i][1] - 4, 8, 8);

                  _g.beginPath();
                  _g.moveTo(sp[i][0], sp[i][1]);

                  strokeIndex++;
                  if (strokeIndex < this.colorIndex.length)
                     _g.strokeStyle = palette[this.colorIndex[strokeIndex]];
               }

               // CONTINUE DRAWING A STROKE.

               else {
                  _g.lineTo(sp[i][0], sp[i][1]);

                  // HANDLE CARD-STYLE RENDERING.

                  if (isCard && (i == sp.length - 1 || sp[i+1][2] == 0)) {
                     _g.stroke();
                     var i0 = i - 1;
                     while (i0 > 1 || sp[i0][2] == 1)
                        i0--;
                     _g.fillStyle = this.isNegated ? this.color : backgroundColor;
                     fillPath(sp, i0, i, _g);
                     if (this.isNegated)
                        _g.strokeStyle = backgroundColor;
                     isCard = false;
                     _g.beginPath();
                  }
               }
            }
            if (startedAnyStrokes)
               _g.stroke();

            // IF IN UNDRAW MODE, DRAW ARROW HEAD.

            if (isUndrawing && n >= 4) {
               var ax = sp[n-3][0], ay = sp[n-3][1];
               var bx = sp[n-1][0], by = sp[n-1][1];
               var dx = (bx - ax), dy = (by - ay), d = len(dx, dy);
               dx *= 6 / d;
               dy *= 6 / d;
               line(bx, by, bx - dx - dy, by - dy + dx);
               line(bx, by, bx - dx + dy, by - dy - dx);
            }
         }

         this.drawText(_g);

         if (this.isGroup()) {
            color(scrimColor(0.2));
            fillRect(this.xlo, this.ylo, this.xhi-this.xlo, this.yhi-this.ylo);
         }

         annotateEnd();
      }
   }
   SimpleSketch.prototype = new Sketch;

   function StrokesSketch() {
      this.src = [];
      this.render = function() {

         // FIRST TIME ONLY: GET THE TARGET SHAPE FROM THE GLYPH.

         if (this.src.length == 0) {
            this.src = cloneArray(this.glyph.src);
            this.info = this.glyph.info;

            for (var n = 0 ; n < this.src.length ; n++)
               for (var i = 0 ; i < this.src[n].length ; i++) {
                  this.src[n][i][0] -= this.info.x0;
                  this.src[n][i][1] -= this.info.y0;
               }
            this.tX += this.info.x0;
            this.tY += this.info.y0;
/*
            eval(this.info.type + "Sketch()");
            sk().isOutline = true;
            sk().mesh.setMaterial(bgMaterial());
            sk().rX = this.info.rX;
            sk().rY = this.info.rY;
            this.geoSketch = sk();
*/
         }

         // REBUILD THE STROKES EVERY FRAME.

         this.sp = [[0,0]];
         this.sp0 = [[0,0,0]];

         var b = [10000,10000,-10000,-10000];

         for (var n = 0 ; n < this.src.length ; n++) {
            var C = [];
            for (var i = 0 ; i < this.src[n].length ; i++) {
               C.push(this.xform(this.src[n][i]));

               var p = C[C.length-1];
               var x = this.adjustX(p[0]);
               var y = this.adjustY(p[1]);
               b[0] = min(b[0], x);
               b[1] = min(b[1], y);
               b[2] = max(b[2], x);
               b[3] = max(b[3], y);
            }
            drawCurve(C);
         }
/*
         if (this.geoSketch !== undefined && b[0] > 0) {
            var visibleEdges = this.geoSketch.mesh.findVisibleEdges();
            var e2 = this.geoSketch.mesh.projectVisibleEdges(visibleEdges);

            var b1 = [10000,10000,-10000,-10000];
            for (var n = 0 ; n < e2.length ; n++)
            for (var i = 0 ; i < e2[n].length ; i++) {
               b1[0] = min(b1[0], e2[n][i][0]);
               b1[1] = min(b1[1], e2[n][i][1]);
               b1[2] = max(b1[2], e2[n][i][0]);
               b1[3] = max(b1[3], e2[n][i][1]);
            }

            var b2 = computeCurveBounds(this.sp, 1);

            this.geoSketch._dx = (b[0] + b[2]) / 2 - (b1[0] + b1[2]) / 2;
            this.geoSketch._dy = (b[1] + b[3]) / 2 - (b1[1] + b1[3]) / 2;
            this.geoSketch._ds = (b[2] - b[0]) / (b1[2] - b1[0]);

            delete this.geoSketch;
         }
*/

         // AFTER TRANSITION TO GLYPH, BEGIN TRANSITION TO 3D OBJECT.

         if (this.glyphTransition == 1 && this.info !== undefined) {
            this.shapeInfo = { type  : this.info.type,
                               rX    : this.info.rX,
                               rY    : this.info.rY,
                               sw    : this.info.sw,
                               bounds: b };
            this.fadeAway = 1;
            delete this.info;
         }
      }
   }
   StrokesSketch.prototype = new SimpleSketch;

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
   NumericSketch.prototype = new SimpleSketch;

