
   var sketchPalette = [
      'white',
      'rgb(128,50,25)',
      'red',
      'orange',
      'green',
      'blue',
      'magenta',
   ];

   function sketchColor() { return sketchPalette[sketchPage.colorIndex]; }

   function Sketch() {
      this.transformX2D = function(x, y) {
         var angle = 2 * this.rX;
         return this.x2D + this.scale() * (cos(angle)*x + sin(angle)*y);
      }
      this.transformY2D = function(x, y) {
         var angle = 2 * this.rX;
         return this.y2D + this.scale() * (cos(angle)*y - sin(angle)*x);
      }
      this.untransformX2D = function(x, y) {
         return (x - this.x2D) / this.scale();
      }
      this.untransformY2D = function(x, y) {
         return (y - this.y2D) / this.scale();
      }
      this.duringSketch = function(callbackFunction) {
         if (this.sketchProgress < 1) {
            _g.save();
            _g.globalAlpha = 1 - this.styleTransition;
            this.duringSketchCallbackFunction = callbackFunction;
            this.duringSketchCallbackFunction();
            _g.restore();
         }
      }
      this.afterSketch = function(callbackFunction) {
         var isg = this.glyphTrace != null && this.glyphTransition >= 0.5;
         if (isg || this.sketchProgress == 1) {
            var fade = this.fadeAway == 0 ? 1 : this.fadeAway;
            _g.save();
            _g.globalAlpha = (isg ? 2 * this.glyphTransition - 1
                                  : this.styleTransition) * fade;
            if (isg)
               _g.lineWidth = sketchLineWidth * .6;
            this.afterSketchCallbackFunction = callbackFunction;
            this.afterSketchCallbackFunction();
            _g.restore();
         }
      }
      this.clearPorts = function() {
         this.nPorts = 0;
         this.portName = [];
         this.portLocation = [];
         this.portBounds = [];
         this.inValue = [];
         this.outValue = [];
         this.defaultValue = [];
      }
      this.addPort = function(name, x, y) {
         this.portName[this.nPorts] = name;
         this.portLocation[this.nPorts] = [x, y];
         this.nPorts++;
      }
      this.setPortLocation = function(name, x, y) {
         var index = getIndex(this.portName, name);
         if (index >= 0 && index < this.portLocation.length) {
            this.portLocation[index][0] = x;
            this.portLocation[index][1] = y;
         }
      }
      this.children = [];
      this.cleanup = null;
      this.clone = function() {
         var dst = Object.create(this);
         for (var prop in this) {
            if (this[prop] instanceof Array)
               dst[prop] = cloneArray(this[prop]);
            else if (this[prop] instanceof Clonable)
               dst[prop] = Object.create(this[prop]);
            else
               dst[prop] = this[prop];
         }
         return dst;
      }
      this.code = null;
      this.color = sketchColor();
      this.colorIndex = [];
      this.computeGroupBounds = function() {
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
      }
      this.computeStatistics = null;
      this.contains = function(x, y) {
         return this.xlo <= x && this.ylo <= y && this.xhi > x && this.yhi > y;
      }
      this.cx = function() {
         return (this.xlo + this.xhi) / 2;
      }
      this.cy = function() {
         return (this.ylo + this.yhi) / 2;
      }
      this.dSum = 0;
      this.defaultValue = [];
      this.deleteChar = function() {
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
      }
      this.drawBounds = function() {
         if (this.parent == null)
            drawRect(this.xlo, this.ylo, this.xhi - this.xlo, this.yhi - this.ylo);
      }
      this.drawCursor = function(x, y, dy, context) {
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
      }
      this.drawFirstLine = false;
      this.drawText = function(context) {
         var fontSize = floor(24 * this.scale());

         if (this instanceof SimpleSketch && this.isNullText()) {
            if (isDef(this.inValue[0])) {

               context.save();
                  context.strokeStyle = backgroundColor;
                  context.fillStyle = dataColor;
                  context.font = fontSize + 'pt Comic Sans MS';
                  var str = roundedString(this.inValue[0]);

                  // JUSTIFY THE NUMBER CONSISTENTLY (WHETHER INT OR FLOAT)

                  var i = str.indexOf('.');
                  if (i >= 0)
                     this.isFloat = true;
                  if (this.isFloat && i < 0) {
                     str += ".00";
                     i = str.indexOf('.');
                  }
                  var dx = this.isFloat ? textWidth(str.substring(0, i))
                                        : textWidth(str) / 2;

                  context.fillText(str, this.cx() - dx, this.cy() + .5 * fontSize);
               context.restore();
            }
            return;
         }

         context.save();
         context.strokeStyle = this.isNegated ? this.color : backgroundColor;
         context.fillStyle = this.isNegated ? backgroundColor : this.color;

         var fontHeight = this.isParsed() ? floor(0.7 * fontSize) : fontSize;

         context.font = fontHeight + 'pt ' + (this.isParsed() ? 'Consolas'
                                                              : 'Comic Sans MS');

         var isCursor = isTextMode && context == _g
                                   && this == sk(sketchPage.textInputIndex);
         if (! isCursor && this.text.length == 0)
            return;

         if (this.text.length == 0) {
            this.drawCursor(this.tx(), this.ty(), fontHeight, context);
            return;
         }

         var x1 = this instanceof Sketch2D ? this.x2D : lerp(this.scale(), this.tx(), this.textX);
         var y1 = this instanceof Sketch2D ? this.y2D : lerp(this.scale(), this.ty(), this.textY);

         var j = 0;
         for (var n = 0 ; n < this.textStrs.length ; n++) {
            var str = this.textStrs[n];
            var tw = textWidth(str, context);
            var x = x1;
            var y = y1 + 1.3 * fontHeight * (n - 0.5 * (this.textStrs.length-1));
            var tx = x - .5 * tw;
            if (this.fadeAway > 0)
               context.globalAlpha = this.fadeAway;
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
      }
      this.evalCode = function(code, x, y, z) {

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

         // EVAL THE CODE, REFERRING TO THE SKETCH AS "me".

         var result = null;
         try {
	    result = Function("me","x","y","z", code)(this, x, y, z);
         } catch (e) { }

         // ANY ERROR RESULTS IN A RETURN VALUE OF null.

         return result;
      }
      this.setTextCursor = function(x, y) { this.textCursorXY = [x, y]; }
      this.fadeAway = 0;
      this.getDefaultFloat = function(name) {
         return parseFloat(this.getDefaultValue(name));
      }
      this.getDefaultValue = function(name) {
         var j = this.getPortIndex(name);
         if (j < 0) return 0;
         var value = this.defaultValue[j];
         return ! isDef(value) || value == null ? "0" : value;
      }
      this.getInFloat = function(name) {
         return parseFloat(this.getInValue(name));
      }
      this.getInIndex = function(s) { return getIndex(this.in, s); }
      this.getInValue = function(name) {
         var j = getIndex(this.portName, name);
         if (j < 0) return 0;
         var value = this.inValue[j];
         return ! isDef(value) || value == null ? "0" : value;
      }
      this.getPortIndex = function(name) { return getIndex(this.portName, name); }
      this.glyphTrace = null;
      this.trace = [];
      this.glyphTransition = 0;
      this.groupPath = [];
      this.groupPathLen = 1;
      this.id;
      this.in = []; // array of Sketch
      this.inValue = []; // array of values
      this.insertText = function(str) {
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
      }
      this.intersectingSketches = function() {
         var sketches = [];
         for (var I = 0 ; I < nsk() ; I++)
            if (sk(I) != this && sk(I).parent == null && this.intersects(sk(I)))
               sketches.push(sk(I));
         return sketches;
      }
      this.intersects = function(s) {
         return this.xhi > s.xlo && this.xlo < s.xhi &&
                this.yhi > s.ylo && this.ylo < s.yhi ;
      }
      this.is3D = false;
      this.isCard = false;
      this.isGroup = function() { return this.children.length > 0; }
      this.isDefaultValue = function(name) {
         var j = getIndex(this.portName, name);
         return j >= 0 ? isDef(this.DefaultValue[j]) : false;
      }
      this.isInValue = function(name) {
         var j = getIndex(this.portName, name);
         return j >= 0 ? isDef(this.inValue[j]) : false;
      }
      this.isMouseOver = false;
      this.isNegated = false;
      this.isNullText = function() { return this.text.replace(/ /g, '').length == 0; }
      this.isParsed = function() { return false; }
      this.isSimple = function() { return this instanceof SimpleSketch; }
      this.keyDown = function(key) {}
      this.keyUp = function(key) {}
      this.labels = [];
      this.m2s = function(p) { return [ this.m2x(p[0]), this.m2y(p[1]) ]; }
      this.m2x = function(x) { return (x - this.tx()) / this.scale(); }
      this.m2y = function(y) { return (y - this.ty()) / this.scale(); }
      this.mouseDown = function(x, y) {}
      this.mouseDrag = function(x, y) {}
      this.mouseMove = function(x, y) {}
      this.mouseUp = function(x, y) {}
      this.moveCursor = function(incr) {
         if (this.code != null && isCodeWidget) {
            var newPos = max(0, min(codeTextArea.value.length, codeTextArea.selectionStart + incr));
            codeTextArea.selectionStart = newPos;
            codeTextArea.selectionEnd = newPos;
         } else {
            this.textCursor = max(0, min(this.text.length, this.textCursor + incr));
        }
      }
      this.moveLine = function(incr) {
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
      }
      this.nPorts = 0;
      this.offsetSelection = function(d) { this.selection += d; }
      this.out = []; // array of array of Sketch
      this.outValue = []; // array of values
      this.parent = null;
      this.parse = function() { }
      this.portName = [];
      this.portLocation = [];
      this.portBounds = [];
      this.portXY = function(i) {
         if (isDef(this.portLocation[i])) {
            if (this instanceof Sketch2D) {
               var p = this.portLocation[i];
               return [ this.transformX2D(p[0],p[1]), this.transformY2D(p[0],p[1]) ];
            }
            else {
               m.save();
               this.standardView();
               var xy = m.transform(this.portLocation[i]);
               m.restore();
               return xy;
            }
         }
         return [this.cx(),this.cy()];
      }
      this.rX = 0;
      this.rY = 0;
      this.lastStrokeSize = function() {
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
      }
      this.removeLastStroke = function() {
         if (this.sp.length > 1) {
            var i = this.sp.length;
            while (--i > 0 && this.sp[i][2] == 1) ;
            this.sp0.splice(i, this.sp.length-i);
            this.sp.splice(i, this.sp.length-i);
         }
      }
      this.render = function() {}
      this.sc = 1;
      this.scale = function(value) {
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
      }
      this.scene = null;
      this.selection = 0;
      this.setDefaultValue = function(name, value) {
         var j = getIndex(this.portName, name);
         if (j >= 0)
            this.defaultValue[j] = value;
      }
      this.setOutValue = function(name, value) {
         var j = getIndex(this.portName, name);
         if (j >= 0)
            this.outValue[j] = value;
      }
      this.setSelection = function(s) {
         if (typeof(s) == 'string')
            s = getIndex(this.labels, s);
         this.selection = s;
         this.updateSelectionWeights(0);
      }
      this.selectionWeight = function(i) {
         return sCurve(this.selectionWeights[i]);
      }
      this.size = 400;
      this.suppressLineTo = false;
      this.updateSelectionWeights = function(delta) {
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
      }
      this.setText = function(text) {

         if (! this.isSimple() && ! (this instanceof Sketch2D))
            return;

         if (this instanceof NumericSketch)
            this.value = text;

         this.text = text;
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
         _g.font = '24pt Comic Sans MS';
         for (var n = 0 ; n < this.textStrs.length ; n++)
            this.textWidth = max(this.textWidth, textWidth(this.textStrs[n]));

         _g.restore();
      }
      this.sketchLength = 1;
      this.cursorTransition = 0;
      this.sketchProgress = 0;
      this.sketchState = 'finished';
      this.styleTransition = 0;
      this.sp = [];
      this.standardView = function(p) {
         var rx = this.rX, ry = this.rY, yy = min(1, 4 * ry * ry);
         standardView(
            .5 + this.tx() / width(),
            .5 - this.ty() / height(),
            this.is3D ? PI * ry          : 0,
            this.is3D ? PI * rx * (1-yy) : 0,
            this.is3D ? PI * rx * yy     : -TAU * rx,
            .25 * this.scale());
      }
      this.standardViewInverse = function() {
         var rx = this.rX, ry = this.rY, yy = min(1, 4 * ry * ry);
         standardViewInverse(
            .5 + this.tx() / width(),
            .5 - this.ty() / height(),
            this.is3D ? PI * ry          : 0,
            this.is3D ? PI * rx * (1-yy) : 0,
            this.is3D ? PI * rx * yy     : -TAU * rx,
            .25 * this.scale());
      }
      this.tX = 0;
      this.tY = 0;
      this.text = "";
      this.textCursor = 0;
      this.textHeight = -1;
      this.textStrs = [];
      this.textX = 0;
      this.textY = 0;
      this.translate = function(dx, dy) {
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
      }
      this.tx = function() {
         var x = this.tX;
         if (this.parent != null) {
            var cx = this.parent.cx();
            if (! this.isSimple())
               cx -= width() / 2;
            x -= cx;
            x = this.parent.tx() + this.parent.scale() * x;
            x += cx;
         }
         return x;
      }
      this.ty = function() {
         var y = this.tY;
         if (this.parent != null) {
            var cy = this.parent.cy();
            if (! this.isSimple())
               cy -= height() / 2;
            y -= cy;
            y = this.parent.ty() + this.parent.scale() * y;
            y += cy;
         }
         return y;
      }
      this.value = null;
      this.x = 0;
      this.xStart = 0;
      this.xf = [0,0,1,0,1];
      this.y = 0;
      this.yStart = 0;
      this.zoom = 1;
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
            if (this.fadeAway > 0)
               _g.globalAlpha = this.fadeAway;
            _g.drawImage(this.imageObj, this.x2D - this.width * s / 2,
                                        this.y2D - this.height * s / 2,
                                        this.width * s, this.height * s);
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

      this.isParsed = function() {
         return this.parsedStrokes != null;
      }

      this.mouseDown = function(x, y) {
         if (this.isGroup())
            return;

         var p = this.m2s([x,y]);
         this.sp0.push(p);
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
         if (this.isGroup())
            return;

         if (isTextMode)
            return;

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
            var action = null, I = 0;
            for ( ; I < nsk() ; I++)
               if (sk(I) != sk() && sk(I).parent == null) {
                  var n = sk().sp0.length;

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

            if (action == "joining" && isk() && isDef(sk(I))) {
               sk(I).makeXform();
               for (var i = 1 ; i < sk().sp0.length ; i++) {
                  var xy = sk().sp0[i];
                  xy = [ xy[0], xy[1] ];
                  xy = sk(I).xformInverse(xy);
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
               break;
            }
         }

         // CLICK

         if (len(xhi - xlo, yhi - ylo) <= clickSize) {

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

         // CLICK TO REINTERPRET SKETCH AS A TEXT CHARACTER.

         if (this.isClick) {
            this.removeLastStroke();

            strokes = this.getStrokes();

            var glyph = interpretStrokes();
            if (glyph != null) {

               // IF GLYPH IS A DIGIT, CREATE A NUMBER OBJECT.

               if (isNumber(parseInt(glyph.name))) {
                  deleteSketch(this);
                  var s = new NumericSketch();
                  addSketch(s);
                  s.init(glyph.name, this.tX, this.tY);
                  s.textCursor = s.text.length;
                  setTextMode(true);
               }

               // IF A '(' IS FOUND, CALL A FUNCTION.

               else if (glyph.name.indexOf('(') > 0) {
                  glyphSketch = sk();
                  eval(glyph.name);
                  deleteSketch(glyphSketch);
                  return;
               }

               // DEFAULT: CREATE A TEXT OBJECT.

               else {
                  deleteSketch(this);
                  if (glyph.name != 'del') {
                     sketchPage.createTextSketch(glyph.name);
                     setTextMode(true);
                  }
               }

            }
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

      this.xform = function(xy) {
         return [ this.xf[0] + this.xf[4] * ( this.xf[2] * xy[0] + this.xf[3] * xy[1]),
                  this.xf[1] + this.xf[4] * (-this.xf[3] * xy[0] + this.xf[2] * xy[1]) ];
      }

      this.xformInverse = function(xy) {
         var x = (xy[0] - this.xf[0]) / this.xf[4];
         var y = (xy[1] - this.xf[1]) / this.xf[4];
         return [ this.xf[2] * x - this.xf[3] * y, this.xf[3] * x + this.xf[2] * y ];
      }

      this.makeXform = function() {
         this.xf = [ this.tx(),
                     this.ty(),
                     cos(PI * this.rX),
                     sin(PI * this.rX),
                     this.scale() ];
      }

      // DRAW THE PARSED STROKES.

      this.drawParsed = function() {
         this.parsedTransition = min(1, this.parsedTransition + 0.05);
         var transition = sCurve(this.parsedTransition);

         annotateStart();

         lineWidth(sketchLineWidth * lerp(transition, 1, .6) * sketchPage.zoom / this.zoom);
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

         annotateStart();
         lineWidth(sketchLineWidth * sketchPage.zoom / this.zoom);
         _g.strokeStyle = this.color;
         drawSimpleSketch(this);
         annotateEnd();
      }
   }
   SimpleSketch.prototype = new Sketch;

   function NumericSketch() {
      this.init = function(str, x, y) {
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
         if (isDef(this.inValue[0])) {
            this.setText(roundedString(this.inValue[0]));
            this.value = this.text;
         }
      }
   }
   NumericSketch.prototype = new SimpleSketch;

