/*

	drawing on the screen
	how many strokes
	only check same number of strokes
	resample every strokes so there are 100 samples
	translate/scale to a box from 0,1
	point by point least squares difference
	lowest score is the match
	minimization algorithm to match the drawing closely
	do continous morph
	when the line is drawn, apply translate/rotate and render

 */

class CT(){

	var time;
	var defaults = {
		lineWidth:1,
		font:"helvetica",
	}
}

// basic object class, similar to Object3D

class CTObject extends THREE.Object3D(){

	// var matrix = mat; //let's check out mat.js
	// var sketchMatrix; //?
	var boundingBox = [[0,0],[0,1],[1,1],[1,0]];
	var drawBoundingBox = false;
	var center = vector;
	var parent = CTObject;
	var children = [CTObjects];
	var strokes = [{
			width:1,
			color:"blue",
			bezier:false,
			points:[[0,1,2],[3,4,5]]
		},{etc},{etc},...];
	var inValues = [];
	var outValue = null;
	var id = Math.random();

	function setStrokes(){}
	function getStrokes(){}
	function addStrokes(){}
	function transform(){set Matrix}
	function add(obj){children.push(obj)}
	function updateBoundingBox(strokes){}
	function setOutValue(){}	
}

class Sketch extends CTObject(){

	var glyph = [];
	var ports = [];

	//perhaps an array of objects that determine behavior?

	function init(){}
	function update(){}
	function clearPorts(){}
	function addPort(){}
	function reorderPorts(){}
	function setPortLocation(){}
	function duringSketch(callback){}
	function afterSketch(callback){}
}

class SketchGroup extends CTObject(){

	//grouped sketches return collected strokes
	
}

class Port extends CTObject(){

	function passValue(){
		try/catch/clamp/etc inValue;
		this.parent.inValue = this.outValue;
	}
}

class CodeBubble extends CTObject(){

	var code = "code";
	var style = {
		font:'ariel',
		fontSize:1em,
		background-color:'blue',
		corners:round,
		etc:etc
	}
}

class LineLink(){

	var type = [arrow,data,structure]

}


class CTCanvasRenderer(){

	//scenegraph
	var sketchBook = CTObject;

	function traverseBook(){
		for(children/*c hereafter*/ in sketchBook recursively){
			for(s in c.strokes)
				this.render(c.strokes[s] * c.strokes[s].matrix);
		}
	}

	function render(stroke){
		set lineWidth;
		set color;
		set type;
		moveTo/lineTo stroke;
	}
}

class sketchDictionary extends CTObject(){

	var sketches = [];
	var glyphs = [CTObject];

	function sketchesToGlyphs(){
		for(s in sketches){
			var thisGlyph = new Sketch();
			thisGlyph.glyph = sketches[s].getStrokes().resampleStrokes());
			thisGlyph.mouseOver = function(t){traceGlyph}
			glyphs.push(thisGlyph);
		}
	}

	function arrangeGlyphs(){
		for(g in glyphs){
			glyphs[g].translate(g); //place items in a grid
		}
	}
}

class CTEventHandler(){

	//keep track of mouse/keyboard events

}

