"use strict";

// TO TEST
const fn_CT_OBJ_SELECTED = "CTObjectSelected";
const fn_CT_OBJ_FWBW     = "CTObjectFWBW";

let meshMode = 1;
const cursorZOffset = {
	prev : 0
};

function CTObjectSelection() {
	this.kind = 0;
	this.obj = null;
	this.srcPageIdx = 0;
	this.beginTimestamp = -1;
	this.beginTimestampServer = -1;
	this.lockPosition = false;
	this.lockedPosition = [0, 0];
}

function FWBWSelection() {
	this.zOffset = 0;
	this.zOffsetPrev = 0;
	this.timestamp = -1;
	this.timestampServer = -1;
}
//

function grabControlFromUnity(event, prevEventButton){
	// grab the control from unity
	if(event.button == 0 && event.button != prevEventButton){
		console.log("grab control");
		var data = new Uint16Array(4), header = "CTReStyl", i;
		for (i = 0; i < 4; i += 1) {
			data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
		}
		try {
			server.socket.send(data.buffer);
		} 
		catch(e) {
			console.log("grabControlFromUnity:", e);
		}
	}
	return event.button;
}

function beginSketchActionWithSelection(userRecord, sketch, index) {
	bgClickCount = 0;
	console.log(index, sketchClickActionNames[index]);
	switch (index) {
		case 0:
			sketch.fade();             // E -- FADE TO DELETE
			fadeArrowsIntoSketch(sk());
			break;
		case 1:
			// IF A FREEHAND SKETCH, ENTER BEND CURVE MODE.

			//   if (sk().isFreehandSketch())  {
			//      if (! (sk() instanceof NumericSketch)) {
			//         sketchAction = "nudging";  // NE -- BEND
			//         nudgeCurveInit(sk().sp0, sk().m2s([This().mouseX,This().mouseY]), 1);
			//      }
			//   }

			//   // CONVERT A PROCEDURAL SKETCH INTO THE FREEHAND SKETCH THAT WOULD GENERATE IT.

			//   else if (sk().glyph !== undefined) {
			//      sk().toFreehandSketch();      // NE -- TURN TO FREEHAND SKETCH
			// sk().glyph = findGlyph(sk().getStrokes(), glyphs);
			//   }
			break;
		case 2:
			// sketchAction = "translating";    // N -- TRANSLATE
			break;
		case 3:
			var tX = sketch.tX;
			var tY = sketch.tY;
			copySketch(sketch);                // NW -- CLONE
			sketch.tX = tX;
			sketch.tY = tY;
			sketchAction = "translating";
			break;
		case 4:
			sketchAction = "scaling";        // W -- SCALE
			break;
		// case 5:
		//    if (sk() instanceof FreehandSketch)
		//       ;//toggleTextMode();          // SW -- IF SIMPLE SKETCH, TOGGLE TEXT MODE
		//    else if (isDef(sk().onCmdClick)) {     // ELSE CMD CLICK
		//       m.save();
		//       computeStandardViewInverse();
		//       sketchPage.skCallback('onCmdClick', x, y);
		//       m.restore();
		//    }
		//    break;
		case 5:
			sketchAction = "rotating";       // S -- ROTATE
			_rotate_x = events_canvas.mouseX;
			_rotate_y = events_canvas.mouseY;
			_rotate_travel = 0;
			break;
		case 7:
			// if (sk() instanceof FreehandSketch) {
			//    sketchAction = "undrawing";   // SE -- "UNDRAW" A FREEHAND SKETCH.
			//    sketchPage.tUndraw = 0;
			// }
			break;
	}
	userRecord.sketchAction = sketchAction;
	return true;
}

function sendTimeAndFPNum(hdr, fpNum) {
	console.log("sending a floating-point number");

	var data = new Uint16Array(4 + 4), header = hdr, i;
	for (i = 0; i < 4; i += 1) {
		data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
	}

	// timestamp
	const tData = _convertToFloatByte(time);
	data[4] = tData[0];
	data[5] = tData[1];

	// value
	const fpNumBytes = _convertToFloatByte(fpNum);
	data[6] = fpNumBytes[0];
	data[7] = fpNumBytes[1];

	server.socket.send(data.buffer);
}

function renderActivePage(){
	// disable large border when panning -- TODO configure this once somewhere?
	overviewShowBoundaryWhilePanning = false;
	
	// SAVE STATE FOR CURRENT PAGE LOCALLY (L for LOCAL)
	const lPanX = _g.panX;
	const lPanY = _g.panY;
	const lPanZ = _g.panZ;
	const curPageIdx = pageIndex;
	const curPage = sketchPage;

	const helpModeIsOn = isShowingHelp;
	isShowingHelp = false;
	const paletteIsVisible = palette.isVisible;
	palette.isVisible = false;
	const paletteDragXY = palette.dragXY;
	palette.dragXY = null;
	const codeWidgetIsOn = isCodeWidget;
	isCodeWidget = false;
	const textModeIsOn = isTextMode;
	isTextMode = false;

	const sketchActionSaved = sketchAction;
	const bgClickCountSaved = bgClickCount;

	// UPDATE THE PAN VALUES FOR THE CURRENT PAGE
	curPage.panX = lPanX;
	curPage.panY = lPanY;
	curPage.panZ = lPanZ;

	// RENDER EACH PAGE
	// (CHANGES STATE INTERNALLY, SO THIS STATE MUST BE RESTORED AFTERWARDS)

	// RENDER INACTIVE PAGES
	{
		let sketchPageIdx = 0;
		for (; sketchPageIdx < curPageIdx; sketchPageIdx++) {
			renderInactivePage(_g, sketchPageIdx, curPageIdx);
		} 
		// SKIP THE CURRENT PAGE
		const sketchPageCount = sketchPages.length;
		sketchPageIdx += 1;
		for (; sketchPageIdx < sketchPageCount; sketchPageIdx++) {
			renderInactivePage(_g, sketchPageIdx, curPageIdx);
		}
	}

	// RESTORE STATE FOR CURRENT PAGE

	isShowingHelp = helpModeIsOn;
	palette.isVisible = paletteIsVisible;
	palette.dragXY = paletteDragXY;
	isCodeWidget = codeWidgetIsOn;
	isTextMode = textModeIsOn;

	pageIndex = curPageIdx;
	sketchPage = curPage;
	_g.panX = lPanX;
	_g.panY = lPanY;
	_g.panZ = lPanZ;

	sketchAction = sketchActionSaved;
	bgClickCount = bgClickCountSaved;

	renderPage(_g, pageIndex);
	
	for (let uidIdx = 0; uidIdx < userIDs.length; uidIdx += 1) {
		const deferredInfo = deferredUserFunctions.uidToFunctions[userIDs[uidIdx]];
		if (deferredInfo) {
			const functions = deferredInfo.functions;
			Object.entries(functions).forEach(([fnName, fn]) => {
				if (fn) {
				   fn();
				}
			});
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

  if (window.displayListener){
		  _sendCTData();
	  }
}

// rest of tick for inactive page
function restOfTickForInactivePage(g, actualPageIdx) {
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
		if (sketchPage.wandEmulation && false) {
			var _p = sketchPage.wandEmulation;
			_p.x += 0.03 * noise((time + 100) / 3);
			_p.y += 0.03 * noise((time + 200) / 3);
			_p.z += 0.03 * noise((time + 300) / 3);
			moveWand(_p.x, _p.y, _p.z, 0, 0, 0, 1);
		}
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

		const outPortSaved = outPort;
		This().animate(This().elapsed, false);
		outPort = outPortSaved;

		for (var I = 0 ; I < nsk() ; I++)
			if (! sk(I).isFreehandSketch())
				sk(I).sketchLength = sk(I).dSum;

		// COMPUTE SKETCH BOUNDING BOXES.

		isMouseOverBackground = true;

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

	// if (! sketchPage.isPressed && isMouseNearCurve(C))
	//    arrowNearCursor = { s: sk(I), n: n };

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

		if (isAudiencePopup() || !(isShowingGlyphs && isDef(This().overlay))) {
			annotateStart();
		// START DRAWING A POSSIBLE NEW LINK.

			if (isShowingLinks)
				for (var I = 0 ; I < nsk() ; I++)
					if (sk(I).parent == null) {
						var a = sk(I);
						for (var i = 0 ; i < a.out.length ; i++)
						if (isDef(a.out[i]))
						for (var k = 0 ; k < a.out[i].length ; k++) {
							var link = a.out[i][k];
							link.draw(true);
						}
					}

			annotateEnd();
		}

	//          if (! isShowingHelp) {
	//             if (isSketchInProgress())
	//                drawCrosshair(cursorX, cursorY);
	//          }

		if (isAudiencePopup()) {
			// MAKE SURE AUDIENCE VIEW HAS THE RIGHT BACKGROUND COLOR.
			audienceCanvas.style.backgroundColor = backgroundColor;
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

		if (group.sketchPageIndex == pageIndex) {
			group.update(This().elapsed);
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
}

function deleteAllSketchesOnPage(page) {
	const pageSketches = page.sketches;
	let lastIdx = pageSketches.length - 1;
		while (lastIdx >= 0) {
			deleteSketch(pageSketches[lastIdx]);
			lastIdx -= 1;
		}
}
function deleteAllSketches() {
	const len = sketchPages.length; 
	for (let i = 0; i < len; i += 1) {
		deleteAllSketchesOnPage(sketchPages[i]);
	}
}

function consoleDeleteAllSketches() {
	for (let p = 0; p < sketchPages.length; p += 1) {
		sketchPages[p].sketches = [];
	}
}

function setPageRenderOnly(index) {
	pageIndex = (index + sketchPages.length) % sketchPages.length;

	sketchPage = sketchBook.setPage(pageIndex);

	_g.panX = sketchPage.panX;
	_g.panY = sketchPage.panY;
	_g.panZ = sketchPage.panZ;

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
   
function renderPage(g, pageIdx) {
	restOfTick(g);
}
function renderInactivePage(g, pageIdx, actualPageIdx) {
	setPageRenderOnly(pageIdx);
	restOfTickForInactivePage(g, actualPageIdx);
}

function consoleMoveContentFromPage() {
	const sketch = sk();
	console.log(sketch);
	if (sketch == null) {
		return;
	}

	moveSketchToPageAtIndex(sketch, (pageIndex + 1) % sketchPages.length);         
}

function consoleMoveGroupOrSketchFromPage() {
	if (group.isAtCursor) {
		console.log("group found, about to move sketches");
		moveGroupToPageAtIndex(group, (pageIndex + 1) % sketchPages.length);
		return;
	}
	console.log("no group found, trying to find an individual sketch to move");

	const sketch = sk();
	console.log(sketch);
	if (sketch == null) {
		console.log("nothing to move");
		return;
	}
	console.log("sketch found, about to move an individual sketch");
	moveSketchToPageAtIndex(sketch, (pageIndex + 1) % sketchPages.length);
}

function initUnityHandlers(canvas) {
	// support resolution request from other clients
	canvas.clientGetResolution = function(event) {
		 console.log("ct get resolution");
		 console.log("callback: w=" + width() + ":h=" + height());

		 const w = width();
		 const h = height();

		 var data = new Uint16Array(4 + 2), header = 'CTDspl01', i;
		 for (i = 0; i < 4; i += 1) {
			data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
		 }

		 data[4]     = w;
		 data[4 + 1] = h;
		 server.socket.send(data.buffer);
	};
	canvas.clientEnablePalette = function(event) {
		const uid = event.uid;
		const userRecord = getOrCreateUserRecord(uid);
		palette.isVisible = true;
		//palette._zOff = maxZ + 0.1;
		bgAction_xDown = This().mouseX;
		bgAction_yDown = This().mouseY;
	};
	// support create sketchPage
	canvas.clientCreateSketchPage = function(event) {
		console.log("ct create a new sketchPage");
		// not using pageIndex +1 but the length
		var prevPageID = pageIndex;
		var pageCnt = sketchPages.length;
		sketchBook.setPage(event.id);//creation
		//setPage(pageCnt);//update related info

		console.log("set immediately: " + event.setImmediately);
		if (event.setImmediately != 1) {
			sketchBook.setPage(prevPageID);
		}
		else {
			setPage(event.id);
			console.log("ct setting the page immediately");
		}

		var data = new Uint16Array(4 + 2), header = 'CTPcrt01', i;
		for (i = 0; i < 4; i += 1) {
			data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
		}

		console.log("page index:" + pageIndex);
		data[4]     = pageIndex;
		data[4 + 1] = event.setImmediately;
		server.socket.send(data.buffer);
	};
	canvas.clientSetSketchPage = function(event) {
		console.log("ct set sketchPage");
		if (event.index == sketchPages.length) {
			sketchBook.setPage(sketchPages.length);
		}
		setPage(event.index);

		var data = new Uint16Array(4 + 2), header = 'CTPset01', i;
		for (i = 0; i < 4; i += 1) {
			data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
		}

		data[4]     = pageIndex;
		server.socket.send(data.buffer);
	};

	window.resetSelections = function() {
		console.log("resetting selection logic on server and in clients");

		userMap   = new UserMap();
		deferredUserFunctions = new DeferredUserFunctions();

		var data = new Uint16Array(4), header = 'CTReSlct', i;
		for (i = 0; i < 4; i += 1) {
			data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
		}

		server.socket.send(data.buffer);
	};
	
	window.startCountDown = function(duration){
		console.log("count down for " + duration + " min");
		var data = new Uint16Array(4 + 1), header = 'CTCountD', i;
		for (i = 0; i < 4; i += 1) {
			data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
		}

		data[4]     = duration;
		server.socket.send(data.buffer);
	};
	
	canvas.clientMoveContentFromPage = function(event) {
		const sketch = sk();
		console.log(sketch);
		if (sketch == null) {
			return;
		}

		moveSketchToPageAtIndex(sketch, (pageIndex + 1) % sketchPages.length);
	};

	canvas.clientAddUserID = function(event) {
		console.log("adding uid: " + event.uid);
		let uidIdx = userIDs.indexOf(event.uid);
		if (uidIdx < 0) {
			userIDs.push(event.uid);
		}
	};

	canvas.clientRemoveUserID = function(event) {
		console.log("removing uid: " + event.uid);
		let uidIdx = userIDs.indexOf(event.uid);
		if (uidIdx < 0) {
			console.log("cannot remove nonexistent id");
			return;
		}
		userIDs.splice(uidIdx, 1);
	};
	
	canvas.disableSelectionForAllOtherClients = function(arg) {
		console.log("hit event disableSelectionForAllOtherClients", arg);
		const currentUID = arg.uid || arg;
		for (let uidIdx = 0; uidIdx < userIDs.length; uidIdx += 1) {
			const uid = userIDs[uidIdx];
			console.log("processing uid:" + uid);
			if (uid == -1) {
				console.log('server uid, ignoring');
				continue;
			}
			if (uid == currentUID) {
				console.log("same uid, ignoring");
				continue;
			}

			const userRecord = getOrCreateUserRecord(uid);
			const selectedCTObject = userRecord.selectedCTObject;
			const fwbwSelection = userRecord.fwbwSelection;

			if (userRecord.selectedCTObject.obj) {
				userRecord.selectedCTObject.obj = null;
				userRecord.selectedCTObject.kind = 0;

				fwbwSelection.zOffset = 0;

				const deferred = getOrCreateDeferredFunctionsUserRecord(uid).functions;

				deferred[fn_CT_OBJ_SELECTED] = null;
				deferred[fn_CT_OBJ_FWBW] = null;

				console.log("deactivating selection for uid=[" + uid + "]");

				userRecord.userCursor = new UserCursor();

				userRecord.sketchAction = null;
				userRecord.actionindex = -1;

				canvas.sendCmdResponse('CTBrdoff', 0, uid);
			}
		}
	};

	window.disableSelectionForAllOtherClients = canvas.disableSelectionForAllOtherClients;
	
	 // HEHE called every frame, receives host user info... copy this and modify to work with multiple user records?
	canvas.clientHandleSketchAction = function(event) {

		const uid = event.uid;

		const userRecord = getOrCreateUserRecord(uid);
		const selectedCTObject = userRecord.selectedCTObject;
		const fwbwSelection = userRecord.fwbwSelection;
		const deferred = getOrCreateDeferredFunctionsUserRecord(uid).functions;

		if (selectedCTObject.kind == 0 || 
			!deferred[fn_CT_OBJ_SELECTED]) {
			//console.log("for some reason a sketch isn't even selected!");
			return;
		}
		if (selectedCTObject.kind == 2) {
			console.log("No group actions");
			return;
		}
		if (event.timestamp <= userRecord.sketchActionClientTimestamp) {
			console.log("old command received");
			return;   
		}
		userRecord.sketchActionClientTimestamp = event.timestamp;
		userRecord.sketchActionServerTimestamp = time;

		const userCursor = userRecord.cursor;
		// [-1, +1]
		const wheelX = event.wheelX; 
		const wheelY = event.wheelY;
		const prevWheelX = userCursor.prevWheelX;
		const prevWheelY = userCursor.prevWheelY;
		const prevWheelActive = userCursor.prevWheelActive;

		const INACTIVE_THRESH = 0.1;
		const ACTIVE_THRESH   = 0.8;

		const wheelMag = sqrt((wheelX * wheelX) + (wheelY * wheelY));

		if (userCursor.wheelRecenteredCount == -1) {
			userCursor.wheelRecenteredCount = 0;
			userRecord.sketchAction = null;
			sketchActionEnd();

			selectedCTObject.lockPosition = false;

			userCursor.prevWheelX = wheelX;
			userCursor.prevWheelY = wheelY;
		}
		else if (userCursor.wheelRecenteredCount == 0) {
			selectedCTObject.lockPosition = false;
		}

		// recentered if below threshold
		if (userCursor.prevWheelActive && wheelMag <= INACTIVE_THRESH) {
			userCursor.prevWheelActive = false;

			userCursor.wheelRecenteredCount += 1;

			// released first time
			if (userCursor.wheelRecenteredCount == 1) {
				const actionIndex = userRecord.actionIndex;
				switch (actionIndex) {
					case 0: { // deletion
						beginSketchActionWithSelection(userRecord, selectedCTObject.obj, actionIndex);
						selectedCTObject.obj = null;

						const header = 'CTBrdoff';
						canvas.sendCmdResponse(header, 1, uid);
						deferred[fn_CT_OBJ_FWBW] = null;
						deferred[fn_CT_OBJ_SELECTED] = null;

						userCursor.wheelRecenteredCount = -1; // means to reset the sketch action next frame
						break;
					}
					case 1: { // none
						userCursor.wheelRecenteredCount = 0;
						break;
					}
					case 2: { // move away
						break;
					}
					case 3: { // copy
						beginSketchActionWithSelection(userRecord, selectedCTObject.obj, actionIndex);

						const clientLocalPageIdx = event.pageIdx;
						const theCopy = sk();
						theCopy.isMouseOver = true;
						selectedCTObject.obj.isMouseOver = false;

						if (selectedCTObject.srcPageIdx != event.pageIdx) {
							moveSketchToPageAtIndex(theCopy, selectedCTObject.srcPageIdx, event.pageIdx);
							theCopy._zOff = fwbwSelection.zOffset;
						}
						else {
						//repositionSketch(theCopy);
						theCopy._zOff = fwbwSelection.zOffset;
						}
						deferred[fn_CT_OBJ_FWBW] = null;
						deferred[fn_CT_OBJ_SELECTED] = null;
						selectedCTObject.obj.selectedByUID = UID_Flags.NULL;

						selectedCTObject.kind = 1;
						selectedCTObject.obj = theCopy;
						deferred[fn_CT_OBJ_SELECTED] = (function() {
							return function() {
								return selectedSketchAnimationFn(selectedCTObject.obj, selectedCTObject, fwbwSelection);
							};
						})();
						selectedCTObject.obj.selectedByUID = uid;
						selectedCTObject.srcPageIdx = event.pageIdx;
						userCursor.wheelRecenteredCount = -1;
						break;
					}
					case 4: { // scale
						selectedCTObject.lockPosition = true;
						selectedCTObject.lockedPosition[0] = event.clientX;//This().mouseX;
						selectedCTObject.lockedPosition[1] = event.clientY;//This().mouseY;
						beginSketchActionWithSelection(userRecord, selectedCTObject.obj, actionIndex);
						break;
					}
					case 5: { // rotation
						selectedCTObject.lockPosition = true;
						selectedCTObject.lockedPosition[0] = event.clientX;//This().mouseX;
						selectedCTObject.lockedPosition[1] = event.clientY;//This().mouseY;
						beginSketchActionWithSelection(userRecord, selectedCTObject.obj, actionIndex);
						break;
					}
					case 6: { // move close
						break;
					}
					case 7: { // none
						userCursor.wheelRecenteredCount = 0;
						break;
					}
				}
			}
			else { // count == 2
			// handle commands that require two releases
				userCursor.prevWheelActive = false;
				userCursor.wheelRecenteredCount = 0;

				if (userRecord.actionIndex == 2 ||
					userRecord.actionIndex == 6) {
					deferred[fn_CT_OBJ_FWBW] = null;
				}
			}
			userCursor.prevWheelX = wheelX;
			userCursor.prevWheelY = wheelY;

			/*
			userRecord.sketchAction = null;
			sketchActionEnd();*/

			// handle 1-shot commands
			return;
		}
		// reset if the wheel was recentered twice
		// if (userCursor.wheelRecenteredCount == 2) {
		//    userCursor.wheelRecenteredCount = 0;
		//    userRecord.sketchAction = null;
		//    userRecord.actionIndex = -1;
		//    sketchActionEnd();
		// }

		if (wheelMag >= ACTIVE_THRESH) {
			console.log("uid[" + event.uid + "] wants to do a sketch action");
			console.log(userRecord);
			// keep updating the action until first release
			if (userCursor.wheelRecenteredCount == 0) {
				console.log("updating future command");
				const actionIndex = pieMenuIndex(wheelX * 2, -wheelY * 2, 8);
				console.log("updating future command: " + actionIndex);

				userRecord.actionIndex = actionIndex;

				userCursor.prevWheelX = wheelX;
				userCursor.prevWheelY = wheelY;
			}
			// end the current command and start a new one, 
			// special case: away/close movement require movement after first release
			else if (userCursor.wheelRecenteredCount == 1 && 
				!userCursor.prevWheelActive) {
				// handle away/close movement here
				if (userRecord.actionIndex == 2) {
					if (deferred[fn_CT_OBJ_FWBW] == null) {
						deferred[fn_CT_OBJ_FWBW] = (function() {
							return function() {
								const dt = 1 / 60;
								fwbwSelection.zOffset += dt;
							};
						})();
					}
				}
				else if (userRecord.actionIndex == 6) {
					if (deferred[fn_CT_OBJ_FWBW] == null) {
						deferred[fn_CT_OBJ_FWBW] = (function() {
							return function() {
								const dt = 1 / 60;
								fwbwSelection.zOffset -= dt;
							};
						})();
					}
				}
				else {
					userCursor.wheelRecenteredCount = -1;
				}
				userCursor.prevWheelX = wheelX;
				userCursor.prevWheelY = wheelY;
			}

			// now the wheel is active
			userCursor.prevWheelActive = true;

			userCursor.prevWheelX = wheelX;
			userCursor.prevWheelY = wheelY;

			// else wheelRecenteredCount == 1 (command selected):

			// do user's sketch action
			// const actionIndex = userRecord.actionIndex;
			// 

		}
	};
	
	canvas.clientBeginOrFinishMovingBackwardsOrForwards = function(event) {
		// unpack user info
		const uid = event.uid;

		const userRecord = getOrCreateUserRecord(uid);
		const selectedCTObject = userRecord.selectedCTObject;
		const fwbwSelection = userRecord.fwbwSelection;
		const deferred = getOrCreateDeferredFunctionsUserRecord(uid).functions;

		if (selectedCTObject.kind == 0 || 
			!deferred[fn_CT_OBJ_SELECTED]) {
			console.log("SHOULD NOT BE POSSIBLE TO DO THIS COMMAND IF NOTHING IS SELECTED");
			return;
		}

		if (event.timestamp <= fwbwSelection.timestamp) {
			console.log("old command received");
			return;   
		}

		if (selectedCTObject.kind != 2) {
			console.log("using this function for groups only now");
			return;
		}
		fwbwSelection.timestamp = event.timestamp;
		fwbwSelection.timestampServer = time;

		switch (event.option) {
			case 0: // end
				console.log("ending");
				deferred[fn_CT_OBJ_FWBW] = null;
				break;
			case 1: // begin towards you
				console.log("towards");
				deferred[fn_CT_OBJ_FWBW] = (function() {
					return function() {
						if (getOrCreateUserRecord(selectedCTObject.obj.selectedByUID).sketchAction != null) {
							return;
						}
						const dt = 1 / 60;
						fwbwSelection.zOffset -= dt;
					};
				})();

				break;
			case -1: // begin away from you
				console.log("away");

				deferred[fn_CT_OBJ_FWBW] = (function() {
					return function() {
						if (getOrCreateUserRecord(selectedCTObject.obj.selectedByUID).sketchAction != null) {
							return;
						}
						const dt = 1 / 60;
						fwbwSelection.zOffset += dt;
					};
				})();
				break;
			default:
				console.log("warning, impossible option");
				break;
		}
	};
	canvas.sendCmdResponse = function(hdr, num, id) {
         console.log("sending [hdr: " + hdr + ", num:" + num + ", t:" + time + ", " + id + "]");
         var data = new Uint16Array(4 + 4), header = hdr, i;
         for (i = 0; i < 4; i += 1) {
            data[i] = header.charCodeAt(i<<1) << 8 | header.charCodeAt(i<<1 | 1);
         }

         const tData = _convertToFloatByte(time);
         data[4] = id; 
         data[5] = tData[0];
         data[6] = tData[1];
         data[7] = num;

         server.socket.send(data.buffer);
	}

	function drawBox(x0, x1, y0, y1, z0, z1) {
		z0 *= 10000;
		z1 *= 10000;
		const tl0 = [x0, y0, z0];
		const tl1 = [x0, y0, z1];

		const bl0 = [x0, y1, z0];
		const bl1 = [x0, y1, z1];

		const br0 = [x1, y1, z0];
		const br1 = [x1, y1, z1];

		const tr0 = [x1, y0, z0];
		const tr1 = [x1, y0, z1];

		console.log([tl0, tl1, bl0, bl1, br0, br1, tr0, tr1]);

		mLine(tl0, tl1);
		mLine(bl0, bl1);
		mLine(br0, br1);
		mLine(tr0, tr1);
	}

	/////////////////////////////////////////////////////////////
	function selectedGroupAnimationFn(selectedCTObject, fwbwSelection) {
		try {
			const srcPageIdx = selectedCTObject.srcPageIdx;

			window.PUSHED_sketch_zOffset = 0;

			_g.save();
			lineWidth(1);
			color(overlayColor);
			const xlo = group.xlo;
			const xhi = group.xhi;
			const ylo = group.ylo;
			const yhi = group.yhi;

			group.xlo -= 20;
			group.xhi += 20;
			group.ylo -= 20;
			group.yhi += 20;

			if (srcPageIdx != pageIndex) {
				// source bound
				window.PUSHED_sketch_zOffset = selectedCTObject.obj.zOffset();

				const oldPageIdx = pageIndex;
				setPage(srcPageIdx);
				drawRoundRect(group.xlo, group.ylo, group.xhi - group.xlo, group.yhi - group.ylo, sketchPadding);
				setPage(oldPageIdx);

				window.PUSHED_sketch_zOffset = fwbwSelection.zOffset;

				// destination bound
				const mx = This().mouseX;
				const my = This().mouseY;
				const cx = (group.xlo + group.xhi) / 2;
				const cy = (group.ylo + group.yhi) / 2;

				const transX = cx - mx;
				const transY = cy - my;    

				drawRoundRect(group.xlo - transX, group.ylo - transY, group.xhi - group.xlo, group.yhi - group.ylo, sketchPadding);

				//drawBox(group.xlo - transX, group.xhi - transX, group.ylo - transY, group.yhi - transY, selectedCTObject.obj.zOffset(), window.PUSHED_sketch_zOffset);
				}
			else {
				// source bound

				window.PUSHED_sketch_zOffset = selectedCTObject.obj.zOffset();

				drawRoundRect(group.xlo, group.ylo, group.xhi - group.xlo, group.yhi - group.ylo, sketchPadding);

				window.PUSHED_sketch_zOffset = fwbwSelection.zOffset;

				// destination bound
				const mx = This().mouseX;
				const my = This().mouseY;
				const cx = (group.xlo + group.xhi) / 2;
				const cy = (group.ylo + group.yhi) / 2;

				const transX = cx - mx;
				const transY = cy - my;    

				drawRoundRect(group.xlo - transX, group.ylo - transY, group.xhi - group.xlo, group.yhi - group.ylo, sketchPadding);

				//drawBox(group.xlo - transX, group.xhi - transX, group.ylo - transY, group.yhi - transY, selectedCTObject.obj.zOffset(), window.PUSHED_sketch_zOffset);
			}

			group.xlo = xlo;
			group.xhi = xhi;
			group.ylo = ylo;
			group.yhi = yhi;

			_g.restore();

			window.PUSHED_sketch_zOffset = 0;
		}
		catch (ex) {
			console.log(ex);
			console.log(selectedCTObject);
			console.log(deferred);
		}
	} /////////////////////////////////////////////////////////////

	function selectedSketchAnimationFn(sketch, selectedCTObject, fwbwSelection) {
		try {
			const srcPageIdx = selectedCTObject.srcPageIdx;

			window.PUSHED_sketch_zOffset = fwbwSelection.zOffset;

			_g.save();
			lineWidth(.5);
			color(overlayColor);
			// draw destination bounds

			if (sketch.selectedByUID != -2 && 
				getOrCreateUserRecord(sketch.selectedByUID).sketchAction == null) {

				if (srcPageIdx != pageIndex) {
					const mx = This().mouseX;
					const my = This().mouseY;
					const cx = sketch.cx();
					const cy = sketch.cy();

					const transX = cx - mx;
					const transY = cy - my;    
					sketch.drawBoundsTranslated(-transX, -transY);
				}
				else {
					const mx = This().mouseX;
					const my = This().mouseY;
					const cx = sketch.cx();
					const cy = sketch.cy();

					const transX = cx - mx;
					const transY = cy - my;    
					sketch.drawBoundsTranslatedSpecifyWidth(-transX, -transY, 0.5);
				}
			}
			window.PUSHED_sketch_zOffset = 0;

			// draw source bounds
			{
				window.PUSHED_sketch_zOffset = selectedCTObject.obj.zOffset();
				if (srcPageIdx != pageIndex) {
					const oldPageIdx = pageIndex;
					setPage(srcPageIdx);
					sketch.drawBounds();
					setPage(oldPageIdx);              
				}
				else {
					sketch.drawBounds();
				}
				window.PUSHED_sketch_zOffset = 0;
			}
			_g.restore();
		}
		catch (ex) {
			console.log(ex);
			console.log(selectedCTObject);
			console.log(deferred);
		}
	}

// HEHE MAKE A COPY: thumbstick click
	canvas.clientBeginMoveGroupOrSketchFromPage = function(event) {
		try {
			console.log("in clientBeginMoveGroupOrSketchFromPage() t=[" + time + "]");
			const header = 'CTBrdon?';

			// unpack user info
			const uid = event.uid;
			console.log("uid=[" + event.uid + "]");

			const userRecord = getOrCreateUserRecord(uid);
			console.log("userRecord", userRecord);

			const selectedCTObject = userRecord.selectedCTObject;
			const fwbwSelection = userRecord.fwbwSelection;

			//console.log("fwbwSelection=[" + userRecord.fwbwSelection + "]");
			const deferred = getOrCreateDeferredFunctionsUserRecord(uid).functions;
			//console.log("deferred=[" + userRecord.fwbwSelection + "]");

			if (event.timestamp <= selectedCTObject.beginTimestamp) {
				console.log("old begin command received t=[" + time + "]");
				return;
			}
			selectedCTObject.beginTimestamp = event.timestamp;
			selectedCTObject.beginTimestampServer = time;

			// TEMP since only one cursor exists at the moment
			// group is selected
			if (group.isAtCursor) {

				group.isAtCursor = false; // TODO better solution is probably to switch order of checks for groups and sketches
				console.log("group found, about to move sketches t=[" + time + "]");

				selectedCTObject.kind = 2; // group
				selectedCTObject.obj = group;
				selectedCTObject.srcPageIdx = pageIndex;

				canvas.sendCmdResponse(header, 2, uid);

				fwbwSelection.zOffset = selectedCTObject.obj.zOffset();

				deferred[fn_CT_OBJ_SELECTED] = (function() {
					return function() {
						return selectedGroupAnimationFn(selectedCTObject, fwbwSelection);
					};
				})();
				return;
			}
			console.log("no group found, trying to find an individual sketch to move t=[" + time + "]");

			const sketch = sk();
			console.log(sketch);
			if (sketch == null) {
				console.log("!!! nothing to move");
				selectedCTObject.kind = 0; // none
				canvas.sendCmdResponse(header, 0, uid);
				return;
			}
			// sketch selected, but is in group
			if (group.sketches.indexOf(sketch) != -1) {
				console.log("found sketch in group, selecting group t=[" + time + "]");

				selectedCTObject.kind = 2; // group
				selectedCTObject.obj = group;
				selectedCTObject.srcPageIdx = pageIndex;

				canvas.sendCmdResponse(header, 2, uid);

				fwbwSelection.zOffset = selectedCTObject.obj.zOffset();

				deferred[fn_CT_OBJ_SELECTED] = (function() {
					return function() {
						return selectedGroupAnimationFn(selectedCTObject, fwbwSelection);
					};
				})();

				return;
			}

			// individual sketch selected
			console.log("individual sketch selected t=[" + time + "]");

			selectedCTObject.kind = 1;
			selectedCTObject.obj = sketch;
			selectedCTObject.srcPageIdx = pageIndex;

			fwbwSelection.zOffset = selectedCTObject.obj.zOffset();

			deferred[fn_CT_OBJ_SELECTED] = (function() {
			return function() {
				return selectedSketchAnimationFn(sketch, selectedCTObject, fwbwSelection);
				};
			})();

			sketch.selectedByUID = uid;
			console.log("sketch found, selected an individual sketch t=[" + time + "]");
			canvas.sendCmdResponse(header, 1, uid);
		}
		catch (ex) {
			console.log(ex);
			console.log(selectedCTObject);
			console.log(deferred);

			sketch.selectedByUID = UID_Flags.NULL;
		}
		//moveSketchToPageAtIndex(sketch, (pageIndex + 1) % sketchPages.length);
	}

// HEHE DESELCTING THE OBJECT
	canvas.clientEndMoveGroupOrSketchFromPage = function(event) {
		try {
			console.log("in clientEndMoveGroupOrSketchFromPage() t=[" + time + "]");
			const header = 'CTBrdoff';

			const uid = event.uid;

			const userRecord       = getOrCreateUserRecord(uid);
			const selectedCTObject = userRecord.selectedCTObject;
			const fwbwSelection    = userRecord.fwbwSelection;
			const deferred         = getOrCreateDeferredFunctionsUserRecord(uid).functions;

			userRecord.cursor.prevWheelActive = false;

			if (selectedCTObject.obj == null || event.timestamp <= selectedCTObject.beginTimestamp) {
				console.log("!!! in DESELECT: old end command received t=[" + time + "]");
				selectedCTObject.kind = 0;
				sketchActionEnd();
				userRecord.sketchAction = null;
				return;
			}
			if (event.dstPageIdx == selectedCTObject.srcPageIdx) {
				switch (selectedCTObject.kind) {
					case 1: // sketch    
						selectedCTObject.obj._zOff = fwbwSelection.zOffset;
						//if (getOrCreateUserRecord(selectedCTObject.obj.selectedByUID).sketchAction == null) {
						if (!selectedCTObject.lockPosition) {            
							repositionSketch(selectedCTObject.obj);
						}
						else {
							selectedCTObject.lockPosition = false;
						}
						//}
						fwbwSelection.zOffset = 0;

						canvas.sendCmdResponse(header, 1, uid);
						deferred[fn_CT_OBJ_FWBW] = null;
						deferred[fn_CT_OBJ_SELECTED] = null;
						selectedCTObject.obj.selectedByUID = UID_Flags.NULL;
						break;
					case 2: // group                  
						repositionGroup(selectedCTObject.obj);
						const dz = fwbwSelection.zOffset - selectedCTObject.obj._zOff;
						selectedCTObject.obj._zOff = fwbwSelection.zOffset;

						const groupSketches = selectedCTObject.obj.sketches;
						for (let i = 0, len = groupSketches.length; i < len; i += 1) {
							groupSketches[i]._zOff += dz;
						}
						fwbwSelection.zOffset = 0;

						canvas.sendCmdResponse(header, 2, uid);
						deferred[fn_CT_OBJ_FWBW] = null;
						deferred[fn_CT_OBJ_SELECTED] = null;
						break;
					default: // none
						canvas.sendCmdResponse(header, 0, uid);
						deferred[fn_CT_OBJ_FWBW] = null;
						deferred[fn_CT_OBJ_SELECTED] = null;
					break;
				}

				selectedCTObject.kind = 0;
				selectedCTObject.obj = null;
				userRecord.sketchAction = null;
				sketchActionEnd();

				return;              
			}
			else {
				switch (selectedCTObject.kind) {
					case 1: // sketch
						//if (getOrCreateUserRecord(selectedCTObject.obj.selectedByUID).sketchAction == null) { 
						moveSketchToPageAtIndex(selectedCTObject.obj, selectedCTObject.srcPageIdx, event.dstPageIdx);
						//}

						selectedCTObject.obj._zOff = fwbwSelection.zOffset;
						fwbwSelection.zOffset = 0;

						canvas.sendCmdResponse(header, 1, uid);
						deferred[fn_CT_OBJ_FWBW] = null;
						deferred[fn_CT_OBJ_SELECTED] = null;

						selectedCTObject.obj.selectedByUID = UID_Flags.NULL;
						break;
					case 2: // group
						const dz = fwbwSelection.zOffset - selectedCTObject.obj._zOff;
						selectedCTObject.obj._zOff = fwbwSelection.zOffset;

						const groupSketches = selectedCTObject.obj.sketches;
						for (let i = 0, len = groupSketches.length; i < len; i += 1) {
						groupSketches[i]._zOff += dz;
						}
						fwbwSelection.zOffset = 0;

						moveGroupToPageAtIndex(selectedCTObject.obj, selectedCTObject.srcPageIdx, event.dstPageIdx);

						canvas.sendCmdResponse(header, 2, uid);
						deferred[fn_CT_OBJ_FWBW] = null;
						deferred[fn_CT_OBJ_SELECTED] = null;
						break;
					default: // none
						canvas.sendCmdResponse(header, 0, uid);
						deferred[fn_CT_OBJ_FWBW] = null;
						deferred[fn_CT_OBJ_SELECTED] = null;
					break;
				}
			}

			selectedCTObject.kind = 0;
			selectedCTObject.obj = null;
			selectedCTObject.lockPosition = false;
			sketchActionEnd();
			userRecord.sketchAction = null;
		}
		catch (ex) {
			console.log(ex);
			console.log(selectedCTObject);
			console.log(deferred);
			sketchActionEnd();
			userRecord.sketchAction = null;
			selectedCTObject.obj.selectedByUID = UID_Flags.NULL;
		}
	};

	canvas.RAW = function(event) {
		var buf = event.buffer;
		var info = event.info;

		console.log("IN RAW");
		var rawMsg = buf;//buf.data;
		console.log(rawMsg);
		console.log("LEAVING RAW");
	}
	
	canvas.wipe = function(event){
		//zhenyi
		console.log("receive wipe command");
		deleteAllSketches();
	}
	
	window.wipeSketches = canvas.wipe;

	const meshRequestMap = new Map();
	canvas.clientRequestMeshAsset = function(event) {
		const uid = event.uid;
		const prevTime = meshRequestMap.get(uid);
		if ((prevTime != undefined) && (event.timestamp <= prevTime)) {
			return;
		}
		meshRequestMap.set(uid, event.timestamp);

		const mid = event.mid;
		console.log("user:[" + uid + "] wants mesh:[" + mid + "]");

		const record = CT.modelInfo.get(mid);
		record.resendTo.add(uid);
	} 
}
