
["] ]!]#]$]%]&]'](](])]*]+],]-].^/^0^1^2^3^4^4^5^6^7^8^9^:^;_<_=_>^?^@^A^A^B^C^D^E^F^G^H^I^J^K^L^M^N^O^O^P^Q^R^S^T^U^V^W^X^Y^Z^[^]^]^^^_^`^a^b^c^d^e^f]g]h]i]j]j]k]l]m]n]o]p]q]r]s]t]u]v[w[w[x[y[z[{[|[}[~","]&[%Y&X&W&U&T&S%R%P%O%N%M%K%J%I%G%F%E&D&B&A&A&A'A)A*A+A-A.A/A0A2A3A4A5A7B8B9B;B<B=B>B@BABBBCBEBFBGBIBJBKBLBNBOBPBQBSCTCUCVCXCYCZC]C^C_C`CbCcCdCeCgChCiCkClCmCnCoEoFoGoHnJnKnLnNnOnPnQnSnTnUnVnXnYnZo[o^o"]


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

    var sketch = geometrySketch(root.addTube(profile, 32));
    sketch.mesh.setMaterial(shaderMaterial(defaultVertexShader, pVaseFragmentShader2));

    sketch.update = function() {
      this.mesh.getMatrix().rotateX(PI/2);
    }

    sketch.shaderCount = 0;
    sketch.onClick = function() {
       this.shaderCount = 0;
       (function() {
          var fragmentShader = this.shaderCount++ % 2 == 0 ? flameFragmentShader : pVaseFragmentShader2;
          this.mesh.setMaterial(shaderMaterial(defaultVertexShader, fragmentShader));
       })();
    }
}
lathe.prototype = new Sketch;


//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_



registerGlyph("tubeExtrude()", [
   [[0,.5],[ 0, -.5]],
   [[0, .5],[-1, .5]],
   [[0, .5],[ 1, .5]],
   [[0,-.5],[-1,-.5],[-1,.5],[0,.5]]
]);

function tubeExtrude() {

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

    sketch.shaderCount = 0;
    sketch.onClick = function() {
       var fragmentShader = this.shaderCount++ % 2 == 0 ? flameFragmentShader : pVaseFragmentShader2;
       this.mesh.setMaterial(shaderMaterial(defaultVertexShader, fragmentShader));
    }
}
lathe.prototype = new Sketch;

THREE.Object3D.prototype.addTube = function(p, nSegments) {
  var points = [];
  for (var i = 0 ; i < p.length ; i++)
     points.push( new THREE.Vector3( p[i][0],p[i][1],p[i][2] ) );
  var geometry = tubeGeometry( points, nSegments );
  var mesh = new THREE.Mesh(geometry, blackMaterial);
  this.add(mesh);
  return mesh;
}

function tubeGeometry(points, n) { 
  var curve = new THREE.SplineCurve3(points);
  return new THREE.TubeGeometry(curve, 100,.1); 
}


//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_


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


//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

var boringSlicedFragmentShader = ["\
    uniform float spinAngle;\
    void main(void) {\
      float rr = x*x + y*y;\
      float z = rr >= 1. ? 0. : sqrt(1. - rr);\
      float dzdx = -1.3;\
      float zp = dzdx * (x - mx * 1.3 - .2);\
      if (zp < -z)\
         rr = 1.;\
      vec3 color = vec3(0.);\
      if (rr < 1.) {\
         vec3 nn = vec3(x, y, z);\
         if (zp < z) {\
            z = zp;\
            nn = normalize(vec3(-dzdx,0.,1.));\
         }\
         float s = rr >= 1. ? 0. : .4 + max(0., dot(vec3(.2), nn)) + max(0., dot(vec3(-.1), nn));\
         float X =  x * cos(spinAngle) + z * sin(spinAngle);\
         float Y =  y;\
         float Z = -x * sin(spinAngle) + z * cos(spinAngle);\
         vec3 P = vec3(.9*X,.9*Y,.9*Z + 8.);\
         float tu = ( selectedIndex>1. ? noise(P) : turbulence(P) );\
         float c = pow(.5 + .5 * sin(7. * X + 4. * tu), .1);\
         color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
          if (selectedIndex > -1.) {\
            float checker = .5;\
            color = vec3(s);\
          }\
          if (selectedIndex > 0.) {\
            float checker = mod(floor(5.*X)+floor(5.*X)+floor(5.*X),2.);\
            color = vec3((checker+.25)*.5);\
            color *= s;\
          }\
          if (selectedIndex > 1.) {\
            float checker = mod(floor(5.*X)+floor(5.*Y)+floor(5.*Z),2.);\
            color = vec3((checker+.25)*.5);\
            color *= s;\
          }\
          if(selectedIndex > 2.){\
            float tube = .5+.5*sin(X*20.)*sin(Y*20.)*sin(Z*20.);\
            color = vec3(tube);\
            color *= s;\
          }\
          if(selectedIndex > 3.){\
            float col = sin(X*30.+sin(sin(X*30.0)*2.0+Y*9.0)*2.0);\
             color = vec3(col);\
             color *= s;\
          }\
          if(selectedIndex > 4.){\
            vec3 rand = vec3(fract(sin((sin(X*6.3)*2.1)*cos(Z*3.14))*3.33));\
            color = vec3(rand);\
            color *= s;\
          }\
          else {\
             float h = .2 * pow(dot(vec3(.67,.67,.48), nn), 20.);\
             color += vec3(h*0.4, h*.7, h);\
             color *= s;\
          }\
       }\
       gl_FragColor = vec4(color,alpha);\
   }\
"].join("\n");

registerGlyph("bSliced()",[
   makeOval(-1, -1, 2, 2, 32,  PI*0.5, PI*2.5),
   makeOval( 0, -1, 1, 1, 32,  PI*2.0, PI*0.5),
]);

function bSliced() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, boringSlicedFragmentShader);
   if(!sketch.switcher)
      sketch.switcher = 0;
   sketch.mouseDrag = function(x, y) {}
   sketch.spinRate = 0;
   sketch.spinAngle = 0;
    sketch.code = [
      ["sphere", "(X,Y,Z)"],
      ["stripes", "mod ( floor(X) , 2 )"],
      ["checker", "mod(floor(X)+floor(Y)+floor(Z), 2 )"],
      ["dots", "0.5 + 0.5 * sin(X)*sin(Y)*sin(Z)"],
      ["waves", "sin(X + sin(2 * sin(X) + 9*Y))"],
      ["cartoon wood", "fract(sin(sin(6 * X) * cos(3 * Z)))"],
   ];
   // sketch.onClick = function() {
   //    this.spinRate = -1 - this.spinRate;
   //    if(this.spinRate>=0)
   //      this.switcher++;
   //    if(this.switcher>3)
   //      this.switcher = 0;
   // }
   sketch.onSwipe = function(dx, dy) {

      switch (pieMenuIndex(dx, dy)) {
        case 1: 
          this.spinRate = -1 - this.spinRate;; 
          break;
        case 3: 
           if(this.spinRate>=0)
            this.switcher++;
          if(this.switcher>5)
            this.switcher = 0;
          break;
      }
   }
   sketch.update = function(elapsed) {
      this.setUniform('spinAngle', this.spinAngle += elapsed * this.spinRate);
   }
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

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

// var lVaseShape =  [
//   [[-1.66159,-3.68055],[-1.773634,-4.090704],[-2.232532,-4.308656],[-2.633714,-4.418088],[-3.070594,-4.419276],[-3.498048,-4.287182],[-3.678558,-3.881167],[-3.479754,-3.487502],[-3.100546,-3.264764],[-2.85367,-2.907842],[-2.68442,-2.509155],[-2.560581,-2.094476],[-2.485761,-1.668299],[-2.484919,-1.234358],[-2.588226,-0.813763],[-2.781088,-0.424502],[-3.086771,-0.114626]],
//   [[-3.086771,-0.114626],[-3.478233,0.0748838],[-3.894185,0.196225],[-4.31274,0.307776],[-4.728153,0.430589],[-5.136792,0.574557],[-5.536255,0.741828],[-5.924712,0.934189],[-6.271939,1.195092],[-6.521691,1.552186],[-6.674899,1.957623],[-6.768432,2.380217],[-6.80059,2.811987],[-6.786154,3.244341],[-6.727722,3.673189],[-6.631971,4.095047],[-6.508676,4.509886],[-6.353594,4.913861],[-6.18102,5.310594],[-5.987867,5.69781],[-5.783412,6.079129],[-5.569773,6.455417],[-5.349677,6.827965],[-5.124971,7.197759],[-4.897169,7.565658],[-4.667585,7.93245],[-4.437463,8.298906],[-4.208097,8.665833],[-3.980914,9.034117],[-3.757889,9.404912],[-3.541163,9.779471],[-3.337092,10.160972],[-3.147408,10.549996],[-2.984881,10.95097],[-2.849218,11.362228],[-2.75617,11.784122],[-2.716251,12.217886],[-2.744254,12.642155],[-2.799989,13.099298],[-3.214532,13.201209]],
//   [[-3.214532,13.201209],[-3.606484,13.383478],[-3.875476,13.734126],[-3.999723,14.138567],[-4.022671,14.60006],[-0.0741333,14.581098]]
// ];

// vaseShader = {

//     uniforms : {
//         "time": { type: "f", value: 0 },
//     },

//     vertexShader : [

//         "varying vec3 vNormal;",
//        "varying vec2 vUv; ",
//        "varying vec3 vPosition;",
//        // "varying vec3 vecNormal;",

//        " void main() {",
//        "    vUv = uv;",
//        "    vPosition = position;",
//        "     vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;",
//        // "     vecNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

//        "     gl_Position = projectionMatrix *",
//        "                   modelViewMatrix *",
//        "                   vec4(position,1.0);",
//        " }",
        
            

//     ].join("\n"),

//     fragmentShader : [
//         "\
//         vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
//         vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
//         vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }\
//         vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\
//         vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\
//         float noise(vec3 P) {\
//         vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));\
//         vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);\
//         vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);\
//         vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;\
//         vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);\
//         vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\
//         vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\
//         gx0 = fract(gx0); gx1 = fract(gx1);\
//         vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));\
//         vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));\
//         gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);\
//         gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);\
//         vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),\
//         g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),\
//         g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),\
//         g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);\
//         vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));\
//         vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));\
//         g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;\
//         g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;\
//         vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),\
//             dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),\
//             vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),\
//             dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);\
//             return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);\
//         }\
//         float noise(vec2 P) { return noise(vec3(P, 0.0)); }\
//         float turbulence(vec3 P) {\
//             float f = 0., s = 1.;\
//             for (int i = 0 ; i < 9 ; i++) {\
//                 f += abs(noise(s * P)) / s;\
//                 s *= 2.;\
//                 P = vec3(.866 * P.x + .5 * P.z, P.y, -.5 * P.x + .866 * P.z);\
//             }\
//             return f;\
//         }\
//         varying vec2 vUv;\
//         uniform float time;\
//         varying vec3 vPosition;\
//         void main(void) {\
//            gl_FragColor = vec4(   vec3(1.0,.8,.2)  *  turbulence(vPosition) ,1.0 );\
//         }"
//     ].join("\n")
// }

// var myFragmentShader = ["\
//    void main(void) {\
//         float t = mod(time,1.0);\
//         float bc = 1.;\
//         float a = 3.14 - atan(vPosition.x,vPosition.y);\
//         float ma = mx-1.;\
//         if(a > mix(0.,6.29,value))\
//             bc=0.;\
//         vec3 point = 5.*vPosition;\
//         vec3 normal = normalize(vNormal);\
//         float s =  .3 + max(0.,dot(vec3(.3), normal));\
//         float tu =  turbulence(point) ;\
//         float c = pow(.5 + .5 * sin(7. * point.y + 4. * tu), .1);\
//         vec3 color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
//         if (vNormal.x > 0.) {\
//             float h = .2 * pow(dot(vec3(.67,.67,.48), normal), 20.);\
//             color += vec3(h*.4, h*.7, h);\
//         }\
//         else {\
//             float h = .2 * pow(dot(vec3(.707,.707,0.), normal), 7.);\
//             color += vec3(h, h*.8, h*.6);\
//         }\
//       gl_FragColor = vec4(color*bc,alpha);\
//    }\
// "].join("\n");

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

barleyField = {
    
    setup:function(){

        field = new THREE.Object3D();

        tree = new TREE();
        
        tree.params.ballGeo =  new THREE.SphereGeometry(1,3,6),
        tree.params.jointGeo = new THREE.CylinderGeometry( 1,1,1,5,1),
        tree.params.mat = new THREE.MeshLambertMaterial({ color:0xffffff, shading: THREE.SmoothShading,vertexColors:THREE.FaceColors }),

        tree.generate({
            joints: [40,5],
            length: [5,2],
            width: [1,2],
            rads:[1,2],
            start:[1,30],
            angles:[0,.6]
        });
        
        tree.position.y=-10;
        tree.setScale(.1);
        tree.updateMatrixWorld();

        budsAll = tree.makeList([0,0,-1,-1,-2]);
        budsRoot = tree.makeList([0,0,-1,-1,0]);
        budsEnd =  tree.makeList([0,0,-1,-1,-3]);
        rootRoot = tree.makeList([0,0,0]);
        rootAll = tree.makeList([0,0,-2]);
        tipScale = tree.makeList([0,0,[35,39]])
        tipScaleBuds = tree.makeList([0,0,[7,9],-1,0])

        tree.makeDictionary();
        
        counter = 0;

        counter-=.5+noise(count*.05);
        
        tree.applyFunc([
            budsAll, {rz:-.05,sinScaleMult:1,sinOff:Math.PI,sinScale:0.2,sc:1.3},
            budsEnd, {scy:8,scx:.2,scz:.2},
            rootAll, {rz:0,jFreq:.1,jMult:.01+noise(count*.01)*.2,jOff:counter*.3,jFract:.01},
            tipScale, {sc:.9},
            tipScaleBuds, {rz:0,offsetter3:0.001,freq:.37,offMult:.655,off:.323*3}
        ],tree.transform)
    
        var geo = tree.mergeMeshes(tree);

        var material = new THREE.MeshLambertMaterial({color:0xffffff,skinning:true,vertexColors:THREE.FaceColors});

        geo.skinIndices = [];
        geo.skinWeights = [];

        for(var i = 0 ; i < geo.faces.length ; i++){
            geo.faces[i].color.setRGB((geo.vertices[geo.faces[i].a].y/20)+.5,(geo.vertices[geo.faces[i].a].y/20)+.35,(geo.vertices[geo.faces[i].a].y/20)+.1);
            if(i<5){
                console.log(geo.faces[i]);
            }
        }

        for(var i = 0 ; i < geo.vertices.length ; i++){

            q = (10+geo.vertices[i].y)/20;
            g = -q+1;

            geo.skinIndices.push( new THREE.Vector4(1,0,0,0 ));
            geo.skinWeights.push( new THREE.Vector4(q,g,0,0 ));

        }

        geo.bones = [];

        var bone = {};

        bone.name="whatever";
        bone.pos = [0,0,0];
        bone.rot = [0,0,0];
        bone.scl = [1,1,1];
        bone.rotq = [0,0,0,1];
        bone.parent = -1;

        geo.bones.push(bone);

        var bone = {};

        bone.name="whatever2";
        bone.pos = [0,-1,0];
        bone.rot = [0,0,0];
        bone.scl = [1,1,1];
        bone.rotq = [0,0,0,1];
        bone.parent = 0;

        geo.bones.push(bone);


        things = [];
        field.toGrow = [];



        for(var i = 0 ; i < 200 ; i++){
            var thing = new THREE.SkinnedMesh(geo,material,false);
            // thing.scale = new THREE.Vector3(5,5,5);
            thing.id=i;
            if(i>0){
              thing.position.x = 50-Math.random()*100;
              thing.position.y = (Math.random()*10);
              thing.position.z = 50+thing.position.y*-9;
              field.toGrow.push(thing);
              thing.grow = .001;
              thing.scale.set(.001,.001,.001);
            }
            thing.position.y+=20;
            
            field.add(thing);
            things.push(thing);
        }

        this.things = things;
        field.things = things;
        field.material = tree.params.mat;

        return field;

    },

    draw:function(time){
       
        offset = count*-.25*.1;
        
        for(var i = 0 ; i < things.length ; i++){
            things[i].bones[1]._rotation.z = .25*4*noise(things[i].position.x/100+offset,things[i].position.y/100,things[i].position.z/100);

        }


      
    }
}

THREE.Object3D.prototype.addNoiseFloor = function() {
  var plane = barleyField.setup();
  var noisePlane = NoisePlane.setup({x:1,y:1,z:1});
  plane.noisePlane = noisePlane;
  plane.add(noisePlane);
  this.add(plane);
  this.noisePlane = noisePlane;
  return plane;
}

function nFloor() {

  var a = root.addNoiseFloor();

  this.grow = false;
  a.switcher = 1;
  a.speeder = 0;

  var sketch = geometrySketch(a);

  // console.log(sketch);

  sketch.mouseDown = function(x, y) {
     this.downX = x;
     this.downY = y;
  }

  sketch.mouseDrag = function(x, y) {
      var change = x - this.downX;

      if(sketch.countUp==undefined){
        sketch.countUp = 0;
        sketch.countDown = 0;
      }

      if(change > 0)
        this.countUp+=change*.01;
      if(change < 0){
        this.countDown+=change*.01;
      }

      // console.log(change);
      // console.log((this.downX - x) + " " + (this.downY - y));
  }

  a.update = function() {

    var nP = sketch.mesh.noisePlane;

    if(a.switcher>1 && a.switcher<3 || a.switcher>4){
      if(!this.now)
        this.now = time;
      a.speeder+=nP.waveAmount;
      if(nP.waveAmount<.06)
        nP.waveAmount+=.002;
    }

    sketch.mesh.noisePlane.draw(time);
    // nP.position.y=10;
    nP.rotation.x=.3;

    if(a.switcher>-1 && nP.matOpac < 1 && a.switcher<4){
      nP.matOpac += .1;
    }
    // if(a.switcher>3){
      nP.noiseFreq = mouseY/50;
    // }
    // if(a.switcher > 4 && nP.matOpac > 0){
    //   nP.matOpac -= .1;
    // }

    // this.getMatrix().translate(0,-4.2,0).scale(0.2).rotateX(.2);

    // var offset = 0;

    // if(a.switcher < 3 || a.switcher>4)
    //   offset = a.speeder;//(this.now-time)*444*.002;
    // else
    nP.scale.set(.05,.05,.05);
    offset = mouseX*.01;//(this.now-time)*444*.002;

            
    for(var i = 0 ; i < this.things.length ; i++){
        this.things[i].bones[1]._rotation.z = (444*.001)*4*noise(nP.noiseFreq*things[i].position.x/10+offset,nP.noiseFreq*things[i].position.y/100,things[i].position.z/100);

    }

    if (isDef(this.fadeTime)) {
      var t = min(1, (time - this.fadeTime) / 2.0);
      this.value = t;
      _g.globalAlpha = sCurve(1 - t) * (1-t);
    }
      for(var i = 0 ; i < sketch.mesh.children.length-1 ; i++){
        var sc = .0001;
        sketch.mesh.children[i].scale.set(sc,sc,sc);
      }
    // if(this.switcher>-1){
    //   for(var i = 0 ; i < sketch.mesh.things.length ; i++){
    //     var gs = sketch.countUp;
    //     var bar = sketch.mesh.toGrow[i];

    //     if(sketch.countUp > bar.position.x && bar.position.x > 0 && bar.grow < 1)
    //       bar.grow+=.1;
    //     if(sketch.countDown < bar.position.x && bar.position.x < 0 && bar.grow < 1)
    //       bar.grow+=.1;

    //     bar.scale.set(0.0001,.0001,.0001);
    //   }
    //   // if(sketch.countUp<50)
    //   //   sketch.countUp+=1;
    // }

  }

  sketch.onClick = function(x, y) { 
    // console.log(a.switcher);

    a.switcher += 1;
    this.fadeTime = time; 
    this.grow = true;
    
  }
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

registerGlyph("barley()",
["P!P P!P#P$P%P&P'P(P)P*P*P+P,P-P.P/P0P1P2P3P4P5P6P7P8P9P:P;P<P=P>P?P@PAPBPCQDQDQEQFQGQHQIQJQKQLQMQNQOQPQQQRQSQTQUQVQWQXQYQZQ[Q]Q^Q_Q_Q`QaQbQcQdQeQfQgQhQiQjQkQlRmRnRoRpRqRrRsRtRuRvRvRwRxRySzS{S|S}S~T}S}","P#P#P$O$N$N%M%M&L&K'K'J(J)J)I*I+I+I,J-J-J.K.L.L/M/N0N0O0P0Q0Q1R1S1S2S2T3T4T4T5T6T7T8T8S9S9R:Q:Q:P:O;N;N;M;L;L;K<K<J=J>J?J@J@JAJBJCJCKDKDLELEMENENFOFPFQFQFRGSGSGTHTITITJTKTLTMTNTNTOTPSQSQSRRRRSQSQTPTPT","P$Q$R$R%R%S%S&T&T'T'T(U)U)U*U+U+U,T-T-T.S.S/R/R0R0Q0Q1P1P2P2O2O3O4N4N5N5M6M6M7M8M8N9N9O:O:O:P;Q;Q;R;R<S<S<S=T=T>T?T?T@TATBTBSCSCRDRDQEQEQFPFPGOGOGOHNHNININJMJMKMKLLLLLMLNLOLOLPLQMQMQNRNRORORPSPRPQPQOP",]
);

THREE.Object3D.prototype.addBarley = function() {
  var plane = barleyField.setup();
  var noisePlane = NoisePlane.setup();
  plane.noisePlane = noisePlane;
  plane.add(noisePlane);
  this.add(plane);
  this.noisePlane = noisePlane;
  this.plane = plane;
  return plane;
}

function barley() {

  var a = root.addBarley();

  

  this.grow = false;
  a.switcher = 1;
  a.speeder = 0;

  var sketch = geometrySketch(a);

  // console.log(sketch);

  sketch.mouseDown = function(x, y) {
     this.downX = x;
     this.downY = y;
  }

  sketch.mouseDrag = function(x, y) {
      var change = x - this.downX;

      if(sketch.countUp==undefined){
        sketch.countUp = 0;
        sketch.countDown = 0;
      }

      if(change > 0)
        this.countUp+=change*.01;
      if(change < 0){
        this.countDown+=change*.01;
      }

      // console.log(change);
      // console.log((this.downX - x) + " " + (this.downY - y));
  }

  a.update = function() {

    var nP = sketch.mesh.noisePlane;

    if(a.switcher>1 && a.switcher<3 || a.switcher>4){
      if(!this.now)
        this.now = time;
      a.speeder+=nP.waveAmount;
      if(nP.waveAmount<.06)
        nP.waveAmount+=.002;
    }

    sketch.mesh.noisePlane.draw(time);
    nP.position.y=10;

    if(a.switcher>2 && nP.matOpac < 1 && a.switcher<4){
      nP.matOpac += .1;
    }
    if(a.switcher>3){
      nP.noiseFreq = mouseY/100;
    }
    if(a.switcher > 4 && nP.matOpac > 0){
      nP.matOpac -= .1;
    }

    this.getMatrix().translate(0,-4.2,0).scale(0.2).rotateX(.2);

    var offset = 0;

    if(a.switcher < 3 || a.switcher>4)
      offset = a.speeder;//(this.now-time)*444*.002;
    else
      offset = mouseX*.01;//(this.now-time)*444*.002;

            
    for(var i = 0 ; i < this.things.length ; i++){
        this.things[i].bones[1]._rotation.z = (444*.001)*4*noise(nP.noiseFreq*things[i].position.x/100+offset,nP.noiseFreq*things[i].position.y/100,things[i].position.z/100);

    }

    if (isDef(this.fadeTime)) {
      var t = min(1, (time - this.fadeTime) / 2.0);
      this.value = t;
      _g.globalAlpha = sCurve(1 - t) * (1-t);
    }

    if(this.switcher>0){
      for(var i = 0 ; i < sketch.mesh.toGrow.length ; i++){
        var gs = sketch.countUp;
        var bar = sketch.mesh.toGrow[i];

        if(sketch.countUp > bar.position.x && bar.position.x > 0 && bar.grow < 1)
          bar.grow+=.1;
        if(sketch.countDown < bar.position.x && bar.position.x < 0 && bar.grow < 1)
          bar.grow+=.1;

        bar.scale.set(bar.grow,bar.grow,bar.grow);
      }
      // if(sketch.countUp<50)
      //   sketch.countUp+=1;
    }

  }

  sketch.onClick = function(x, y) { 
    // console.log(a.switcher);

    a.switcher += 1;
    this.fadeTime = time; 
    this.grow = true;
    
  }
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

NoisePlane = new THREE.Object3D();

    
    NoisePlane.setup=function(args){

        if(args==undefined) args = {};
        this.cX = args.x || 1;
        this.cY = args.y || .8;
        this.cZ = args.z || .3;

        
        var plane = new THREE.PlaneGeometry(100,90,80,50);
        this.matOpac = 0;
        this.waveAmount = 0;
        this.noiseFreq = 1;
        this.mater = new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:THREE.VertexColors,transparent: true, opacity: 1});
        this.plane = new THREE.Mesh(plane,this.mater);
        this.add(this.plane);
        return this;
        
    }
    
    NoisePlane.draw=function(time){


        // this.matOpac = Math.sin(time);
        this.mater.opacity = this.matOpac;

        this.plane.geometry.verticesNeedUpdate = true;
        this.plane.geometry.normalsNeedUpdate = true;
        this.plane.geometry.colorsNeedUpdate = true;

        for(var i = 0 ; i < this.plane.geometry.vertices.length ; i++){
            var v = this.plane.geometry.vertices[i];
            v.z = noise(
                (v.x*.01*this.noiseFreq)-mouseX*.01,
                (v.y*.01*this.noiseFreq)+mouseY*.01,
                1
                )*10;
        }
        
        this.plane.rotation.x = 4.81;

        
        var faceIndices = [ 'a', 'b', 'c', 'd' ];
        this.plane.geometry.computeFaceNormals();
        this.plane.geometry.computeVertexNormals();
        
         for(var i = 0 ; i < this.plane.geometry.faces.length ; i++){
            for(var j = 0 ; j < 3 ; j++){
              f = this.plane.geometry.faces[i];
              var v = this.plane.geometry.vertices[f[faceIndices[j]]];
              f.vertexColors[j] = new THREE.Color(
                20*noise(v.z*.003)+this.cX,
                20*noise(v.z*.003)+this.cY,
                20*noise(v.z*.003)+this.cZ
              );
            } 
        }
    }

fragPlane = {
    
    setup:function(){
        
        lightShader = {

            uniforms : {
                "time": { type: "f", value: 0 },
            },

            vertexShader : [

                "varying vec3 vNormal;",
               "varying vec2 vUv; ",
               // "varying vec3 vecNormal;",

               " void main() {",
               "    vUv = uv;",
               "     vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;",
               // "     vecNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

               "     gl_Position = projectionMatrix *",
               "                   modelViewMatrix *",
               "                   vec4(position,1.0);",
               " }",
                
                    

            ].join("\n"),

            fragmentShader : [
            "\
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }\
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\
    vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\
    float noise(vec3 P) {\
        vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));\
        vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);\
        vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);\
        vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;\
        vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);\
        vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\
        vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\
        gx0 = fract(gx0); gx1 = fract(gx1);\
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));\
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));\
        gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);\
        gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);\
        vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),\
             g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),\
             g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),\
             g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);\
        vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));\
        vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));\
        g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;\
        g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;\
    vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),\
                           dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),\
                      vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),\
                           dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);\
        return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);\
    }\
    float noise(vec2 P) { return noise(vec3(P, 0.0)); }\
    float turbulence(vec3 P) {\
        float f = 0., s = 1.;\
    for (int i = 0 ; i < 9 ; i++) {\
       f += abs(noise(s * P)) / s;\
       s *= 2.;\
       P = vec3(.866 * P.x + .5 * P.z, P.y, -.5 * P.x + .866 * P.z);\
    }\
        return f;\
    }\
                varying vec2 vUv;\
                uniform float time;\
               void main(void) {\
                   float x = 2.*vUv.x-1.,y = 2.*vUv.y-1.,z = sqrt(1.-x*x-y*y);\
                   float cRot = cos(.2*time), sRot = sin(.2*time);\
                   float cVar = cos(.1*time), sVar = sin(.1*time);\
                   vec3 pt = vec3(cRot*x+sRot*z+cVar, y, -sRot*x+cRot*z+sVar);\
                   float g = turbulence(pt);                     /* CLOUDS */\
                   vec2 v = 1.2 * (vUv - vec2(.5,.5));           /* SHAPE */\
                   float d = 1. - 4.1 * dot(v,v);\
                   float s = .3*x + .3*y + .9*z; s *= s; s *= s; /* LIGHT */\
                   d = d>0. ? .1+.05*g+.6*(.1+g)*s*s : d>-.1 ? d+.1 : 0.;\
                   float f = -.2 + sin(4. * pt.x + 8. * g + 4.); /* FIRE */\
                   f = f > 0. ? 1. : 1. - f * f * f;\
                   if (d <= 0.1)\
                      f *= (g + 5.) / 3.;\
                   vec4 color = vec4(d*f*f*.85, d*f, d*.7, 1);   /* COLOR */\
                   if (d <= .05) {                               /* STARS */\
                      float t = noise(vec3(80.*x-time, 80.*y+.3*time, 1));\
                      if ((t = t*t*t*t) > color.x)\
                         color = vec4(t,t,t,1);\
                   }\
                   gl_FragColor = color;\
                }"
            ].join("\n")
        }

        // shaderMaterial = new THREE.ShaderMaterial({
        //     uniforms: lightShader.uniforms,
        //     vertexShader:   lightShader.vertexShader,
        //     fragmentShader: lightShader.fragmentShader,
        // });

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    type: "f",
                    value: 0.0
                },
            },
            vertexShader:   lightShader.vertexShader,
            fragmentShader: lightShader.fragmentShader,
        });


        var sph = new THREE.Mesh(new THREE.PlaneGeometry(50,50),shaderMaterial);
        // scene.add(sph);
        sph.shaderMaterial = shaderMaterial;
        sph.material = shaderMaterial;
        // scene.add(sph);

        return sph;


    },
    
    draw:function(time){

        shaderMaterial.uniforms['time'].value = time*.5;
        
    }
}

THREE.Object3D.prototype.addFragPlane = function() {
  var plane = fragPlane.setup();
  this.add(plane);
  this.plane = plane;
  return plane;
}

function shader() {
	var a = root.addFragPlane();
	geometrySketch(a);
	a.update = function() {
		this.getMatrix().translate(0,-2,0).scale(0.08);
		this.shaderMaterial.uniforms['time'].value = time*.1;
	}
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

palmTree = {

	bob:0,
    
    setup:function(){
        
        tree = new TREE();
        
        tree.generate({joints:[10,33,7],angles:[0,1],rads:[1,3,2],length:[5,3,2],start:[1,9,1],width:[3,2,2]})
        
        // codeName="palmTree";
        // // scene.add(tree);
        
        // tree.position.y = -30;

        // // setSliders({"var1":0,"var2":0,"var3":.6,"var4":.4,"var5":.2,"var6":.4,"var7":.3})
        var sph= sphere(5);
        
        tree.passFunc(tree.makeInfo([
            [0,-1,-3],  {obj:sph},
            [0,-1,-3],  {obj:sph},

            // [0,-1,-1,1,-1],  {ob:.03},

        ]),tree.appendObj)
        
         tree.passFunc(tree.makeInfo([
            [0,-1,-3],  {obj:sph},
            // [0,-1,-1,1,-1],  {ob:.03},

        ]),function(obj,args){obj.parts[0].position.x=3,obj.parts[1].position.z=3,obj.parts[1].position.y=-1})

        // tree.geometry = {};

        tree.material = tree.params.mat;

        // tree = sphere(10);

        return tree;
        
    },
    
    draw:function(time){

        tree.passFunc(tree.makeInfo([
            [0,-1,-2],   {rz:0,sc:.98,nFreq:.1,nOff:time,nMult:.2,nObjOff:1},
            [0,-1,-1,-1,-2],  {sc:1+(-0.284*.2),rx:0.105,jOffset:0.083,jOff:count*0.3*-.1,jFreq:-0.067,jMult:-0.002,nFreq:.05,nOff:time,nMult:.6,nObjOff:0.2,nFract:.1},
            [0,-1,-1,-1,1], {ry:-1},
            [0,-1,-1,-1,-1,1,-2],  {sc:.8,rz:.15,rx:-.1},
            [0,-1,-1,-1,-1,0,-2],  {sc:.8,rz:.15,rx:.1},
            [0,-1,-1,-1,-1,-1,0],  {rz:0,off:.2,offMult:2,freq:.11},
            [0,-1,-2],{sc:.92}

        ]),tree.transform)

        
    }
}

/*
I'm commenting this out until we figure out how to get it to work again. -KP

registerGlyph("tree()",["FrFoGlHjHgIeIbJ`J]KYKWLTLRMOMMNJNGOEOBP@P=P:Q8Q5R3Q2N2K2I1F1D1A1>1<09070401///,/).'.$.!-!/%0'1*1,1/122427393<4?4A5D5F5I5L5N6Q6T6V6Y6[6_6b5d5g5i5l4o4q4t4w4y4|4}4{4x4v3s3p3n3k4i4f4c4a4^4Z4X4U5S5P5M5K5H5",]
);
*/

THREE.Object3D.prototype.addTree = function() {
  var palm = palmTree.setup();
  this.add(palm);
  this.palm = palm;
  return palm;
}

function tree() {
	var a = root.addTree();
	geometrySketch(a);
	a.update = function() {

		this.getMatrix().translate(0,-2,0).scale(0.08);
		this.shaderMaterial.uniforms['time'].value = time*.1;

	}
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

registerGlyph("explode()",["wOxRyUzXz[z_ybxdvfshqkommokqisfudwbx_y[{X{U|R}O}L~I~F~C}@}=};|8z6x4v2t0r.o,m+j)g(e'b&_%[$X#U!S!P!M!J!G#D#A$>%;&8'6)3+1-./,1*3(6&8%;$>#A#D#G!J!M!P S V Y ] `!c#f$h%k&m(o*q-s/u1w4x6z9{<|?}A}D}G}J|M{P{S{V",]
);

THREE.Object3D.prototype.addNoiseBall = function() {
  var ball = explodeBall.setup();
  this.add(ball);
  this.ball = ball;
  return ball;
}

function explode() {
	var a = root.addNoiseBall();
	geometrySketch(a);
	a.update = function() {

		this.shaderMaterial.uniforms['time'].value = time*.1;
                this.shaderMaterial.uniforms['alpha'].value = this.sketch.fadeAway == 0 ? 1 : this.sketch.fadeAway;

	}
}

explodeBall = {
    
    setup:function(){
        
      

        lightShader = {

            uniforms : {
                "time": { type: "f", value: 0 },
                "alpha": { type: "f", value: 1 },
                "weight": { type: "f", value: 1 },
                "tExplosion": { type: "t", value: null },
            },

            vertexShader : [


 				"vec3 mod289(vec3 x)\
 				{\
                  return x - floor(x * (1.0 / 289.0)) * 289.0;\
                }",


                // "vec3 mod289(vec3 x)",
                // "{",
                // "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
                // "}",

                "vec4 mod289(vec4 x)",
                "{",
                "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
                "}",

                "vec4 permute(vec4 x)",
                "{",
                "  return mod289(((x*34.0)+1.0)*x);",
                "}",

                "vec4 taylorInvSqrt(vec4 r)",
                "{",
                "  return 1.79284291400159 - 0.85373472095314 * r;",
                "}",

                "vec3 fade(vec3 t) {",
                "  return t*t*t*(t*(t*6.0-15.0)+10.0);",
                "}",

                "float cnoise(vec3 P)",
                "{",
                "  vec3 Pi0 = floor(P); // Integer part for indexing",
                "  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1",
                "  Pi0 = mod289(Pi0);",
                "  Pi1 = mod289(Pi1);",
                "  vec3 Pf0 = fract(P); // Fractional part for interpolation",
                "  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0",
                "  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                "  vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                "  vec4 iz0 = Pi0.zzzz;",
                "  vec4 iz1 = Pi1.zzzz;",

                "  vec4 ixy = permute(permute(ix) + iy);",
                "  vec4 ixy0 = permute(ixy + iz0);",
                "  vec4 ixy1 = permute(ixy + iz1);",

                "  vec4 gx0 = ixy0 * (1.0 / 7.0);",
                "  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                "  gx0 = fract(gx0);",
                "  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                "  vec4 sz0 = step(gz0, vec4(0.0));",
                "  gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                "  gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

                "  vec4 gx1 = ixy1 * (1.0 / 7.0);",
                "  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                "  gx1 = fract(gx1);",
                "  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                "  vec4 sz1 = step(gz1, vec4(0.0));",
                "  gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                "  gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

                "  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                "  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                "  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                "  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                "  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                "  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                "  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                "  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

                "  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                "  g000 *= norm0.x;",
                "  g010 *= norm0.y;",
                "  g100 *= norm0.z;",
                "  g110 *= norm0.w;",
                "  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                "  g001 *= norm1.x;",
                "  g011 *= norm1.y;",
                "  g101 *= norm1.z;",
                "  g111 *= norm1.w;",

                "  float n000 = dot(g000, Pf0);",
                "  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                "  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                "  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                "  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                "  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                "  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                "  float n111 = dot(g111, Pf1);",

                "  vec3 fade_xyz = fade(Pf0);",
                "  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                "  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                "  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ",
                "  return 2.2 * n_xyz;",
                "}",

                "float pnoise(vec3 P, vec3 rep)",
                "{",
                "  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period",
                "  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period",
                "  Pi0 = mod289(Pi0);",
                "  Pi1 = mod289(Pi1);",
                "  vec3 Pf0 = fract(P); // Fractional part for interpolation",
                "  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0",
                "  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                "  vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                "  vec4 iz0 = Pi0.zzzz;",
                "  vec4 iz1 = Pi1.zzzz;",

                "  vec4 ixy = permute(permute(ix) + iy);",
                "  vec4 ixy0 = permute(ixy + iz0);",
                "  vec4 ixy1 = permute(ixy + iz1);",

                "  vec4 gx0 = ixy0 * (1.0 / 7.0);",
                "  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                "  gx0 = fract(gx0);",
                "  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                "  vec4 sz0 = step(gz0, vec4(0.0));",
                "  gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                "  gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

                "  vec4 gx1 = ixy1 * (1.0 / 7.0);",
                "  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                "  gx1 = fract(gx1);",
                "  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                "  vec4 sz1 = step(gz1, vec4(0.0));",
                "  gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                "  gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

                "  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                "  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                "  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                "  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                "  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                "  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                "  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                "  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

                "  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                "  g000 *= norm0.x;",
                "  g010 *= norm0.y;",
                "  g100 *= norm0.z;",
                "  g110 *= norm0.w;",
                "  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                "  g001 *= norm1.x;",
                "  g011 *= norm1.y;",
                "  g101 *= norm1.z;",
                "  g111 *= norm1.w;",

                "  float n000 = dot(g000, Pf0);",
                "  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                "  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                "  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                "  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                "  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                "  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                "  float n111 = dot(g111, Pf1);",

                "  vec3 fade_xyz = fade(Pf0);",
                "  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                "  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                "  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ",
                "  return 2.2 * n_xyz;",
                "}",

                "varying vec2 vUv;",
                "varying vec3 vReflect;",
                "varying vec3 pos;",
                "varying float ao;",
                "uniform float time;",
                "uniform float alpha;",
                "uniform float weight;",
                "varying float d;",

                "float stripes( float x, float f) {",
                "    float PI = 3.14159265358979323846264;",
                "    float t = .5 + .5 * sin( f * 2.0 * PI * x);",
                "    return t * t - .5;",
                "}",
                "",
                "float turbulence( vec3 p ) {",
                "    float w = 100.0;",
                "    float t = -.5;",
                "    for (float f = 1.0 ; f <= 10.0 ; f++ ){",
                "        float power = pow( 2.0, f );",
                "        t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );",
                "    }",
                "    return t;",
                "}",

                "void main() {",

                    "vUv = uv;",
                    "vec4 mPosition = modelMatrix * vec4( position, 1.0 );",
                    "vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
                    "vReflect = normalize( reflect( normalize( mPosition.xyz - cameraPosition ), nWorld ) );",
                    "pos = position;",
                    "//float noise = .3 * pnoise( 8.0 * vec3( normal ) );",
                    "float noise = 1.0 *  -.10 *  turbulence( .25 * normal + time );",
                    "//float noise = - stripes( normal.x + 2.0 * turbulence( normal ), 1.6 );",
                    "float displacement = - weight * noise;",
                    "displacement += 1.0 ;//* pnoise( 0.01 * position + vec3( 2.0 * time ), vec3( 10.0 ) );",
                    "ao = noise;",
                    "vec3 newPosition = position + normal * vec3( displacement );",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",

                "}",
            ].join("\n"),

            fragmentShader : [
                "\
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }\
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }\
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\
            vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }\
            float noise(vec3 P) {\
                vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));\
                vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);\
                vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);\
                vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;\
                vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);\
                vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\
                vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\
                gx0 = fract(gx0); gx1 = fract(gx1);\
                vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));\
                vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));\
                gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);\
                gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);\
                vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),\
                     g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),\
                     g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),\
                     g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);\
                vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));\
                vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));\
                g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;\
                g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;\
            vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),\
                               dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),\
                          vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),\
                               dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);\
                return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);\
            }\
            float noise(vec2 P) { return noise(vec3(P, 0.0)); }\
            float turbulence(vec3 P) {\
                float f = 0., s = 1.;\
            for (int i = 0 ; i < 9 ; i++) {\
               f += abs(noise(s * P)) / s;\
               s *= 2.;\
               P = vec3(.866 * P.x + .5 * P.z, P.y, -.5 * P.x + .866 * P.z);\
            }\
                return f;\
            }\
                varying vec2 vUv;\
                uniform sampler2D tExplosion;\
                varying vec3 vReflect;\
                varying vec3 pos;\
                varying float ao;\
                varying float d;\
                uniform float time;\
                uniform float alpha;\
                float PI = 3.14159265358979323846264;\
                float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}\
                void main() {\
                  vec3 color = vec3((((ao)*-190.)*-.1));\
                  vec3 col = vec3(1.5,.3,.1);\
                  float ns = turbulence(vec3(pos.x+(time*3.),pos.y+(time*2.),pos.z+(time*4.)));\
                  gl_FragColor = vec4( color*col*vec3(ns*1.4,ns*ns*5.,ns*ns*5.), alpha );\
                }"
            ].join("\n")
        }

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tExplosion: {
                    type: "t",
                    value: 0,
                    texture: THREE.ImageUtils.loadTexture('http://www.bpsd.mb.ca/naci/nordstrom/samples/web/portfolio_lowhar/images/splosion.png')
                },
                time: {
                    type: "f",
                    value: 0.0
                },
                alpha: {
                    type: "f",
                    value: 1.0
                },
                weight: {
                    type: "f",
                    value: 10.0
                }
            },
           vertexShader:   lightShader.vertexShader,
            fragmentShader: lightShader.fragmentShader,
        });


        var sph = new THREE.Mesh(new THREE.SphereGeometry(1,200,200),shaderMaterial);
        // scene.add(sph);
        sph.shaderMaterial = shaderMaterial;
        sph.material = shaderMaterial;

        return sph;

    },
    
    draw:function(time) { }
}

//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_//\\_

/*
registerGlyph("flag()",["~B}C|E{FzGyIxJvLuMtNsOqPoQnRlSkTiUhUfVdWcXaY`Z^Z[ZYZXZVZT[R[P[OZMYLXJWIVGUEUESEQDPDNELFKHJIIKHLGNFOFQFSGUGVHXIXKYLZN[O]Q^R]T[VZWYXXYVYTYRZQZOZMZK[I[H[F]D]B]@]?]=];]9]7]6]4]2]0[/[-Z+Z*Y(X&X%W$U#T#R!P O",]
);
*/

THREE.Object3D.prototype.addFlag = function() {
  var ball = flago.setup();
  this.add(ball);
  this.ball = ball;
  return ball;
}

function flag() {
  var a = root.addFlag();
  geometrySketch(a);
  a.update = function() {

    this.shaderMaterial.uniforms['time'].value = time*.1;

  }
}

flago = {
    
    setup:function(){
        
      

        lightShader = {

            uniforms : {
                "time": { type: "f", value: 0 },
                "weight": { type: "f", value: 1 },
                "tExplosion": { type: "t", value: null },
            },

            vertexShader : [


        "vec3 mod289(vec3 x)\
        {\
                  return x - floor(x * (1.0 / 289.0)) * 289.0;\
                }",


                // "vec3 mod289(vec3 x)",
                // "{",
                // "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
                // "}",

                "vec4 mod289(vec4 x)",
                "{",
                "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
                "}",

                "vec4 permute(vec4 x)",
                "{",
                "  return mod289(((x*34.0)+1.0)*x);",
                "}",

                "vec4 taylorInvSqrt(vec4 r)",
                "{",
                "  return 1.79284291400159 - 0.85373472095314 * r;",
                "}",

                "vec3 fade(vec3 t) {",
                "  return t*t*t*(t*(t*6.0-15.0)+10.0);",
                "}",

                "float cnoise(vec3 P)",
                "{",
                "  vec3 Pi0 = floor(P); // Integer part for indexing",
                "  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1",
                "  Pi0 = mod289(Pi0);",
                "  Pi1 = mod289(Pi1);",
                "  vec3 Pf0 = fract(P); // Fractional part for interpolation",
                "  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0",
                "  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                "  vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                "  vec4 iz0 = Pi0.zzzz;",
                "  vec4 iz1 = Pi1.zzzz;",

                "  vec4 ixy = permute(permute(ix) + iy);",
                "  vec4 ixy0 = permute(ixy + iz0);",
                "  vec4 ixy1 = permute(ixy + iz1);",

                "  vec4 gx0 = ixy0 * (1.0 / 7.0);",
                "  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                "  gx0 = fract(gx0);",
                "  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                "  vec4 sz0 = step(gz0, vec4(0.0));",
                "  gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                "  gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

                "  vec4 gx1 = ixy1 * (1.0 / 7.0);",
                "  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                "  gx1 = fract(gx1);",
                "  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                "  vec4 sz1 = step(gz1, vec4(0.0));",
                "  gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                "  gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

                "  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                "  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                "  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                "  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                "  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                "  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                "  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                "  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

                "  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                "  g000 *= norm0.x;",
                "  g010 *= norm0.y;",
                "  g100 *= norm0.z;",
                "  g110 *= norm0.w;",
                "  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                "  g001 *= norm1.x;",
                "  g011 *= norm1.y;",
                "  g101 *= norm1.z;",
                "  g111 *= norm1.w;",

                "  float n000 = dot(g000, Pf0);",
                "  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                "  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                "  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                "  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                "  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                "  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                "  float n111 = dot(g111, Pf1);",

                "  vec3 fade_xyz = fade(Pf0);",
                "  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                "  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                "  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ",
                "  return 2.2 * n_xyz;",
                "}",

                "float pnoise(vec3 P, vec3 rep)",
                "{",
                "  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period",
                "  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period",
                "  Pi0 = mod289(Pi0);",
                "  Pi1 = mod289(Pi1);",
                "  vec3 Pf0 = fract(P); // Fractional part for interpolation",
                "  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0",
                "  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
                "  vec4 iy = vec4(Pi0.yy, Pi1.yy);",
                "  vec4 iz0 = Pi0.zzzz;",
                "  vec4 iz1 = Pi1.zzzz;",

                "  vec4 ixy = permute(permute(ix) + iy);",
                "  vec4 ixy0 = permute(ixy + iz0);",
                "  vec4 ixy1 = permute(ixy + iz1);",

                "  vec4 gx0 = ixy0 * (1.0 / 7.0);",
                "  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
                "  gx0 = fract(gx0);",
                "  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
                "  vec4 sz0 = step(gz0, vec4(0.0));",
                "  gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
                "  gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

                "  vec4 gx1 = ixy1 * (1.0 / 7.0);",
                "  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
                "  gx1 = fract(gx1);",
                "  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
                "  vec4 sz1 = step(gz1, vec4(0.0));",
                "  gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
                "  gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

                "  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
                "  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
                "  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
                "  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
                "  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
                "  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
                "  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
                "  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

                "  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
                "  g000 *= norm0.x;",
                "  g010 *= norm0.y;",
                "  g100 *= norm0.z;",
                "  g110 *= norm0.w;",
                "  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
                "  g001 *= norm1.x;",
                "  g011 *= norm1.y;",
                "  g101 *= norm1.z;",
                "  g111 *= norm1.w;",

                "  float n000 = dot(g000, Pf0);",
                "  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
                "  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
                "  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
                "  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
                "  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
                "  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
                "  float n111 = dot(g111, Pf1);",

                "  vec3 fade_xyz = fade(Pf0);",
                "  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
                "  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
                "  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); ",
                "  return 2.2 * n_xyz;",
                "}",

                "varying vec2 vUv;",
                "varying vec3 vReflect;",
                "varying vec3 pos;",
                "varying float ao;",
                "uniform float time;",
                "uniform float weight;",
                "varying float d;",

                "float stripes( float x, float f) {",
                "    float PI = 3.14159265358979323846264;",
                "    float t = .5 + .5 * sin( f * 2.0 * PI * x);",
                "    return t * t - .5;",
                "}",
                "",
                "float turbulence( vec3 p ) {",
                "    float w = 100.0;",
                "    float t = -.5;",
                "    for (float f = 1.0 ; f <= 10.0 ; f++ ){",
                "        float power = pow( 2.0, f );",
                "        t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );",
                "    }",
                "    return t;",
                "}",

                "void main() {",

                    "vUv = uv;",
                    "vec4 mPosition = modelMatrix * vec4( position, 1.0 );",
                    "vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",
                    "vReflect = normalize( reflect( normalize( mPosition.xyz - cameraPosition ), nWorld ) );",
                    "pos = position;",
                    "//float noise = .3 * pnoise( 8.0 * vec3( normal ) );",
                    "float noise = 1.0 *  -.10 *  turbulence( .25 * normal + time );",
                    "//float noise = - stripes( normal.x + 2.0 * turbulence( normal ), 1.6 );",
                    "float displacement = - weight * noise;",
                    "displacement = pnoise( 0.01 * position*10. + vec3( 2.0 * time ), vec3( 10.0 ) );",
                    "ao = noise;",
                    "vec3 newPosition = position + normal * vec3( displacement );",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",

                "}",
            ].join("\n"),

            fragmentShader : [


                "varying vec2 vUv;",
                "uniform sampler2D tExplosion;",
                "varying vec3 vReflect;",
                "varying vec3 pos;",
                "varying float ao;",
                "varying float d;",
                "float PI = 3.14159265358979323846264;",

                "float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}",

                "void main() {",

                    "vec3 color = vec3(vUv.y,vUv.y,vUv.y);//texture2D( tExplosion, vec2( 0, 1.0 - 1.3 * ao + .01 * random(vec3(12.9898,78.233,151.7182),0.0) ) ).rgb;",
                    "gl_FragColor = vec4( color.rgb, 1.0 );",

                "}"
            ].join("\n")
        }

        // shaderMaterial = new THREE.ShaderMaterial({
        //     uniforms: lightShader.uniforms,
        //     vertexShader:   lightShader.vertexShader,
        //     fragmentShader: lightShader.fragmentShader,
        // });

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tExplosion: {
                    type: "t",
                    value: 0,
                    texture: THREE.ImageUtils.loadTexture('http://www.bpsd.mb.ca/naci/nordstrom/samples/web/portfolio_lowhar/images/splosion.png')
                },
                time: {
                    type: "f",
                    value: 0.0
                },
                weight: {
                    type: "f",
                    value: 10.0
                }
            },
           vertexShader:   lightShader.vertexShader,
            fragmentShader: lightShader.fragmentShader,
        });

        var sph = new THREE.Mesh(new THREE.PlaneGeometry(20,10,100,100),shaderMaterial);
        // sph.scale.set(.1,.1,.1);
        // scene.add(sph);
        sph.shaderMaterial = shaderMaterial;
        sph.material = shaderMaterial;

        return sph;

    },
    
    draw:function(time){

        this.shaderMaterial.uniforms['time'].value = time*.1;
        
    }
}
