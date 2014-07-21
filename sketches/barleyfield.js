
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
