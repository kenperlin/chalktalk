
function ArbRevolveHandle() {

  this.labels = "can".split(' ');

  this.render = function(elapsed) {
    m.save();
    m.scale(this.size / 400);
    mCurve([ [0,1], [0,-1]]);
    mCurve([ [0,1], [-1,1], [-1,-1], [0,-1]]);
    mCurve([ [-1,1], [-1.5,1], [-1.5,0], [-1,0]]);
    m.restore();
  }

  this.onClick = function(x, y) {

    console.log(this);

    this.fadeAway = 1.0;

    glyphSketch.color = 'rgba(0,0,0,.01)';

    var tnode = new THREE.Mesh();

    var latheArray = [];
    var handleArray = [];

    if(globalStrokes!=undefined){
      latheArray = globalStrokes.returnCoord(2);
      handleArray = globalStrokes.returnPath(1,-.08);
    }

    var body = tnode.addLathe(
        latheArray
      , 32);

    var geo = body.geometry;

    var sketch = addGeometryShaderSketch(geo, defaultVertexShader, pVaseFragmentShader);

    console.log(handleArray);

    var curve = new THREE.SplineCurve3(handleArray);

    sketch.mesh.add(new THREE.Mesh(new THREE.TubeGeometry(curve),new THREE.MeshLambertMaterial()));
    console.log(sketch);

    // for(var i = 0 ; i < body.geometry.faces.length ; i++){
    //   var face = body.geometry.faces[i];
    //   var temp = face.a;
    //   var temp2 = face.c;
    //   face.a = temp2;
    //   face.c = temp;
    // }
    // sketch.mesh.geometry.computeFaceNormals();
    // sketch.mesh.geometry.computeVertexNormals();

    sketch.startTime = time;

    sketch.update = function() {
      // var scale = (this.xhi - this.xlo) / 16 + sketchPadding;
      this.mesh.getMatrix().translate(0,0,0.0).
      rotateX(PI/2).rotateZ(PI*2).scale(2);
      this.setUniform('t', (time - this.startTime) / 0.5);
    }
  }
}

ArbRevolveHandle.prototype = new Sketch;
