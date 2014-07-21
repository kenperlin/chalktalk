
registerGlyph("lathe()", [
   [[0,-.5],[ 0, .5]],
   [[0, .5],[-1, .5]],
   [[0, .5],[ 1, .5]],
   [[0,-.5],[-1,-.5],[-1,.5],[0,.5]]
]);

function lathe() {

    // PROFILE IS THE SECOND OF THE TWO STROKES, SCALED FROM SCREEN SPACE TO 3D SPACE.

    var trace = sketchToTrace(sk());
    var profile = [];
    for (var i = 0 ; i < trace[4].length ; i++)
       profile.push([ trace[4][i][0], 0, trace[4][i][1] ]);

    // SMOOTH OUT THE PROFILE CURVE.

    for (var n = 0 ; n < 3 ; n++)
       for (var i = 1 ; i < profile.length - 1 ; i++)
          for (var j = 0 ; j <= 2 ; j += 2)
             profile[i][j] = (profile[i-1][j] + profile[i+1][j]) / 2;

    // MOVE AND SCALE TO MATCH SCREEN POSITION OF DRAWN LINE.

    var xLo = 10000, xHi = -10000;
    var yLo = 10000, yHi = -10000;
    for (var i = 0 ; i < trace[1].length ; i++) {
       xLo = min(xLo, trace[1][i][0]);
       xHi = max(xHi, trace[1][i][0]);
       yLo = min(yLo, trace[1][i][1]);
       yHi = max(yHi, trace[1][i][1]);
    }
    var x = (xLo + xHi) / 2;
    var y = (yLo + yHi) / 2;
    var scale = 2 / (yHi - yLo + 2 * sketchPadding);

    for(var i = 0 ; i < profile.length ; i++){
       profile[i][0] = scale * (profile[i][0] - x);
       profile[i][2] = scale * (profile[i][2] - y);
    }
    profile[0][0] = profile[profile.length-1][0] = 0;

    // MAKE A LATHE OBJECT WITH A PRETTY MARBLE TEXTURE.

    var sketch = geometrySketch(root.addLathe(profile, 32));
    sketch.mesh.setMaterial(shaderMaterial(defaultVertexShader, pVaseFragmentShader2));

    sketch.update = function() {
      this.mesh.getMatrix().rotateX(PI/2);
    }

    sketch.onClick = function() {
       if (this.shaderCount === undefined)
          this.shaderCount = 0;
       var fragmentShader = this.shaderCount++ % 2 == 0 ? flameFragmentShader : pVaseFragmentShader2;
       this.mesh.setMaterial(shaderMaterial(defaultVertexShader, fragmentShader));
    }
}
lathe.prototype = new Sketch;
