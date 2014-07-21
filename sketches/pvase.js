
var pVaseFragmentShader2 = ["\
   void main(void) {\
        vec3 point = 30. * vPosition;\
        float a = -atan(point.x,point.y);\
        float sweep = a > .1 && a < 0. || 4. > 3.14159 ? 1. : 0.;\
        sweep = 0. > 1. ? 1. :0.;\
        float ma = mx-1.;\
        vec3 normal = normalize(vNormal);\
        float s = .3 + max(0.,dot(vec3(.3), normal));\
        float tu = turbulence(point) ;\
        float c = pow(.5 + .5 * sin(7. * point.y + 4. * tu), .1);\
        vec3 color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
        if (vNormal.x > 0.) {\
            float h = .2 * pow(dot(vec3(.67,.67,.48), normal), 20.);\
            color += vec3(h*.4, h*.7, h);\
        }\
        else {\
            float h = .2 * pow(dot(vec3(.707,.707,0.), normal), 7.);\
            color += vec3(h, h*.8, h*.6);\
        }\
      gl_FragColor = vec4(color,alpha);\
   }\
"].join("\n");

var pVaseFragmentShader = ["\
   uniform float t;\
   void main(void) {\
        vec3 point = 200. * vPosition;\
        float a = -atan(point.x,point.y);\
        float sweep = a > .1 && a < t || t > 3.14159 ? 1. : 0.;\
        sweep = t > 1. ? 1. :0.;\
        float ma = mx-1.;\
        vec3 normal = normalize(vNormal);\
        float s = .3 + max(0.,dot(vec3(.3), normal));\
        float tu = turbulence(point) ;\
        float c = pow(.5 + .5 * sin(7. * point.y + 4. * tu), .1);\
        vec3 color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
        if (vNormal.x > 0.) {\
            float h = .2 * pow(dot(vec3(.67,.67,.48), normal), 20.);\
            color += vec3(h*.4, h*.7, h);\
        }\
        else {\
            float h = .2 * pow(dot(vec3(.707,.707,0.), normal), 7.);\
            color += vec3(h, h*.8, h*.6);\
        }\
      gl_FragColor = vec4(color*sweep,alpha);\
   }\
"].join("\n");

function PVase() {

  this.labels = "can".split(' ');

  this.render = function(elapsed) {
    m.save();
    m.scale(this.size / 400);
    mCurve([ [-1,1], [0,-1], [1,1]]);
    m.restore();
  }

  this.onClick = function(x, y) {

    this.fadeAway = 1.0;

    glyphSketch.color = 'rgba(0,0,0,.01)';

    var tnode = new THREE.Mesh();

    var body = tnode.addLathe( [
      [-1.491413,0,13.880116],[-1.607697,0,14.306492],[-2.089839,0,14.531703],[-2.50689,0,14.640397],[-2.962928,0,14.636961],[-3.401649,0,14.481519],[-3.553996,0,14.045668],[-3.323561,0,13.653563],[-2.928067,0,13.421634],[-2.688131,0,13.034384],[-2.518976,0,12.617439],[-2.39687,0,12.182876],[-2.328739,0,11.73666],[-2.349396,0,11.285434],[-2.469646,0,10.849821],[-2.698869,0,10.458542],[-3.038561,0,10.160478],[-3.457801,0,9.988686],[-3.891258,0,9.866547],[-4.326921,0,9.750155],[-4.757331,0,9.61657],[-5.184,0,9.470156],[-5.609247,0,9.324032],[-6.035222,0,9.16605],[-6.366066,0,8.857471],[-6.588955,0,8.462668],[-6.747993,0,8.040961],[-6.872433,0,7.607528],[-6.95826,0,7.16479],[-7.006721,0,6.716524],[-7.018176,0,6.265835],[-6.992012,0,5.815731],[-6.927592,0,5.369472],[-6.825437,0,4.930154],[-6.684001,0,4.501926],[-6.508907,0,4.086509],[-6.304791,0,3.684494],[-6.078497,0,3.294573],[-5.836168,0,2.914455],[-5.581665,0,2.542393],[-5.318061,0,2.176736],[-5.047787,0,1.815988],[-4.77297,0,1.458693],[-4.495586,0,1.103391],[-4.217786,0,0.748413],[-3.941841,0,0.391994],[-3.670623,0,0.031944],[-3.409929,0,-0.335818],[-3.166947,0,-0.715582],[-2.951152,0,-1.111428],[-2.77114,0,-1.525359],[-2.641419,0,-1.956159],[-2.57598,0,-2.406934],[-2.599825,0,-2.846015],[-2.638638,0,-3.336436],[-3.047851,0,-3.466827],[-3.468786,0,-3.635845],[-3.752984,0,-3.998514],[-3.888522,0,-4.417527],[-3.916535,0,-4.899075],[0.213201,0,-4.936954],[0.203555,0,-4.593784],[-1.936806,0,-3.570133],[-2.169454,0,-2.686071],[-2.402102,0,-1.476302],[-2.960457,0,-0.59224],[-3.891049,0,0.664059],[-4.914699,0,2.199535],[-6.217528,0,4.898251],[-6.264057,0,7.550438],[-5.845291,0,8.387971],[-4.588992,0,9.132444],[-3.193105,0,9.59774],[-2.495161,0,10.202624],[-2.076395,0,11.179746],[-1.611099,0,12.529104],[-1.47151,0,13.227048],[-1.491413,0,13.880116]      ], 32);

    var geo = body.geometry;

    var sketch = addGeometryShaderSketch(geo, defaultVertexShader, pVaseFragmentShader);

    // console.log(this);

    for(var i = 0 ; i < body.geometry.faces.length ; i++){
      var face = body.geometry.faces[i];
      var temp = face.a;
      var temp2 = face.c;
      face.a = temp2;
      face.c = temp;
    }
    sketch.mesh.geometry.computeFaceNormals();
    sketch.mesh.geometry.computeVertexNormals();

    sketch.startTime = time;

    sketch.update = function() {
      var scale = (this.xhi - this.xlo) / 16 + sketchPadding;
      this.mesh.getMatrix().translate(-2,-12,0.0).
      rotateX(-PI/2).rotateZ(PI/2).scale(scale/7);
      this.setUniform('t', (time - this.startTime) / 0.5);
    }
  }
}

PVase.prototype = new Sketch;
