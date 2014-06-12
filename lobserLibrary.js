// TREE.js - requires THREE.js
/*

TODO:

** - setup search function so that "all" applies to limbs and branches
double check 'magic' edges on surface maker
setup reportlayers that splits up branches better
tree.appendTree - doesn't know what 'this' is - wtf fucking fuck seriously
*/

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

        for(var i = 0 ; i < 200 ; i++){
            var thing = new THREE.SkinnedMesh(geo,material,false);
            // thing.scale = new THREE.Vector3(5,5,5);
            thing.id=i;
            thing.position.x = 50-Math.random()*100;
            thing.position.y = (Math.random()*10);
            thing.position.z = 50+-thing.position.y*9;
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
       
        offset = count*omouseX*.1;
        
        for(var i = 0 ; i < things.length ; i++){
            things[i].bones[1]._rotation.z = omouseY*4*noise(things[i].position.x/100+offset,things[i].position.y/100,things[i].position.z/100);

        }


      
    }
}


registerGlyph("makeBarley()",["M N!N#N$N%N&N'N(N(N)N*N+O,O-O.O/O0O1O2O3O4P4P5P6P7P8P9P:P;P<P=P>P?P@PAPBPCPCPDPEPFPGPHPIPJPKPLPMPNPOPPPQPQPRPSPTPUPVPWPXPYPZP[P]P^P_P`P`PaPbPcPdPePfPgPhPiPjPkPlPmPnPnPoPpPqPrPsPtOuOvOwOxOyOzO{O|O|O}O~","N&M&M&L'L'K(K(J)J)I)I*H*H+H,H,H-H.I.I/J/K/K/L/M/M/N/O/O/P/Q/Q/R/R0S1S1S2T2T3U3U4U5U5U6U6T7T7S8S8R9R9Q9P:P:O:O;N;M;M;L<K<K<J<J=I=I>J?J?K?K@L@M@M@N@O@O@PAQAQARASASATBUBUBVCVCVDVDUEUFUFTGTGSHSHRIRIQJQJQK",]
);

THREE.Object3D.prototype.addBarley = function() {
  var plane = barleyField.setup();
  this.add(plane);
  this.plane = plane;
  return plane;
}

function makeBarley() {
	var a = root.addBarley();
	geometry(a);
	a.update = function() {
		this.getMatrix().translate(0,-2,0).scale(0.08);
		 offset = time*mouseX*.002;
        
        for(var i = 0 ; i < this.things.length ; i++){
            this.things[i].bones[1]._rotation.z = (mouseY*.001)*4*noise(things[i].position.x/100+offset,things[i].position.y/100,things[i].position.z/100);

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
               // "     vecNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

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

        shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: {
                    type: "f",
                    value: 0.0
                },
            },
            vertexShader:   lightShader.vertexShader,
            fragmentShader: lightShader.fragmentShader,
        });


        sph = new THREE.Mesh(new THREE.PlaneGeometry(50,50),shaderMaterial);
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


registerGlyph("shaderPlane()",["y y&y*z/z3{8{<|A}E}J}N}S~W~]~a~f~j~o}syrtpppkpgpbp^pXpTpOpKpFpBp=p9r4r0s+s't'o'k'f'b']'W'S'N'J&E&A&<&8&3%/%+*+.+3+7+<+A+E+J+N+S+W+]+a+f+j*o*s)w'w't*p-m0i3f6c9_<[?WBTEPHMJIMFPCT@W=Z9^7b3e0i.l+p(s&w#z ~",]
);

THREE.Object3D.prototype.addFragPlane = function() {
  var plane = fragPlane.setup();
  this.add(plane);
  this.plane = plane;
  return plane;
}

function shaderPlane() {
	var a = root.addFragPlane();
	geometry(a);
	a.update = function() {
		this.getMatrix().translate(0,-2,0).scale(0.08);
		this.shaderMaterial.uniforms['time'].value = time*.1;
	}
}


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




registerGlyph("tree()",["FrFoGlHjHgIeIbJ`J]KYKWLTLRMOMMNJNGOEOBP@P=P:Q8Q5R3Q2N2K2I1F1D1A1>1<09070401///,/).'.$.!-!/%0'1*1,1/122427393<4?4A5D5F5I5L5N6Q6T6V6Y6[6_6b5d5g5i5l4o4q4t4w4y4|4}4{4x4v3s3p3n3k4i4f4c4a4^4Z4X4U5S5P5M5K5H5",]
);

THREE.Object3D.prototype.addTree = function() {
  var palm = palmTree.setup();
  this.add(palm);
  this.palm = palm;
  return palm;
}

function tree() {
	var a = root.addTree();
	geometry(a);
	a.update = function() {

		this.getMatrix().translate(0,-2,0).scale(0.08);
		this.shaderMaterial.uniforms['time'].value = time*.1;

	}
}


registerGlyph("noiseBaller()",["wOxRyUzXz[z_ybxdvfshqkommokqisfudwbx_y[{X{U|R}O}L~I~F~C}@}=};|8z6x4v2t0r.o,m+j)g(e'b&_%[$X#U!S!P!M!J!G#D#A$>%;&8'6)3+1-./,1*3(6&8%;$>#A#D#G!J!M!P S V Y ] `!c#f$h%k&m(o*q-s/u1w4x6z9{<|?}A}D}G}J|M{P{S{V",]
);

THREE.Object3D.prototype.addNoiseBall = function() {
  var ball = noiseBall.setup();
  this.add(ball);
  this.ball = ball;
  return ball;
}

function noiseBaller() {
	var a = root.addNoiseBall();
	geometry(a);
	a.update = function() {

		this.shaderMaterial.uniforms['time'].value = time*.1;

	}
}


noiseBall = {
    
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
                    "displacement += 1.0 ;//* pnoise( 0.01 * position + vec3( 2.0 * time ), vec3( 10.0 ) );",
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

                    "vec3 color = vec3((ao*-10.)+1.);//vec3(vUv.y,vUv.y,vUv.y);//texture2D( tExplosion, vec2( 0, 1.0 - 1.3 * ao + .01 * random(vec3(12.9898,78.233,151.7182),0.0) ) ).rgb;",
                    "gl_FragColor = vec4( color.rgb, 1.0 );",

                "}"
            ].join("\n")
        }

        // shaderMaterial = new THREE.ShaderMaterial({
        //     uniforms: lightShader.uniforms,
        //     vertexShader:   lightShader.vertexShader,
        //     fragmentShader: lightShader.fragmentShader,
        // });

        shaderMaterial = new THREE.ShaderMaterial({
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


        sph = new THREE.Mesh(new THREE.SphereGeometry(1,200,200),shaderMaterial);
        // scene.add(sph);
        sph.shaderMaterial = shaderMaterial;
        sph.material = shaderMaterial;

        return sph;

    },
    
    draw:function(time){

        this.shaderMaterial.uniforms['time'].value = time*.1;
        
    }
}




var Joint = function(params){

	//Each joint looks like this:
	//Joint(Object3D).children[0]=rotator(Object3D)
	//Joint(Object3D).children[0].children[0]=ballGeo(Mesh)
	//Joint(Object3D).children[0].children[0].children[0]=ballGeo(Mesh)
	//Joint(Object3D).children[0].children[1]=scalar(Object3D)
	//Joint(Object3D).children[0].children[1].children[0]=jointGeo(Mesh)
	//Joint(Object3D).children[0].children[2]=Joint(Object3D) (the next joint, if there is one)

	THREE.Object3D.call(this);
	this.params = params;
	this.limbs = [];
	this.parts = [];
	this.nameArray = [];
}

Joint.prototype = Object.create(THREE.Object3D.prototype);

Joint.prototype.construct = function(off){

	// the argument off refers to the offset in y 

	var p = this.params;

	this.ballMesh = new THREE.Mesh( p.ballGeo, p.mat );
	this.ballMesh2 = new THREE.Mesh( p.ballGeo, p.mat );
	this.jointMesh = new THREE.Mesh( p.jointGeo, p.mat );
	this.ballMesh.scale = new THREE.Vector3(p.jointScale.x,p.jointScale.x,p.jointScale.x);
	this.jointMesh.position.y = .5;	

	this.scalar = new THREE.Object3D();
	this.rotator = new THREE.Object3D();

	this.scalar.add(this.jointMesh);
	this.scalar.scale = p.jointScale;

	this.rotator.add(this.ballMesh);
	this.ballMesh2.position.y = p.jointScale.y/p.jointScale.x;
	this.ballMesh.add(this.ballMesh2);

	this.rotator.add(this.scalar);

	this.add(this.rotator);
	var offset = p.jointScale.y;

	if(off!=undefined)
		var offset = off;

	this.position.y = offset;
}

Joint.prototype.mergeGeo = function(){

    var meshes = [];

    this.updateMatrixWorld();
    
    meshes[0] = this.ballMesh.geometry.clone();
    meshes[1] = this.jointMesh.geometry.clone();
    meshes[2] = this.ballMesh2.geometry.clone();

    meshes[0].applyMatrix(this.matrixWorld);
    meshes[1].applyMatrix(this.children[0].children[1].children[0].matrixWorld);
    meshes[2].applyMatrix(this.children[0].children[0].children[0].matrixWorld);

    THREE.GeometryUtils.merge(meshes[0],meshes[1]);
    THREE.GeometryUtils.merge(meshes[0],meshes[2]);

    return meshes[0];
}

TREE = function(params){


	//TREE is an object3D so it can be transformed

	if(!params) params = {};

	THREE.Object3D.call(this);
	this.limbs = [];
	this.name = 0;
	this.nameArray = [];
	this.parts = [];

	var zero = new THREE.Vector3(0,0,0);
	var one = new THREE.Vector3(1,1,1);
	var colour = params.color || 0xFFFFFF;

	this.params = {
		name : 0,
		jointScale : new THREE.Vector3(1,1,1),
		ballGeo :  new THREE.SphereGeometry(1,8,6),
		jointGeo : new THREE.CylinderGeometry( 1,1,1,8,1),
		color : colour,
		mat : new THREE.MeshLambertMaterial({ color:colour, shading: THREE.SmoothShading }),
		offset : 0,
		scalar : new THREE.Object3D(),
		rotator : new THREE.Object3D(),
		poser : new THREE.Object3D(),
		num : 100,
		tubeGeo : []
	}

	this.self = this;

	// this.treeParent = this;
	this.metaBalls.treeParent = this;
}

TREE.prototype = Object.create(THREE.Object3D.prototype);

//create

TREE.prototype.branch = function(amt,obj,params){

	//Create one branch, a collection of linked limbs

	var p = this.params;
	var parent = obj || this;
	var amount = amt || p.num;
	var countUp = 0;

	var joint = new Joint(parent.params);

	if(!parent.offset)
		parent.offset=0;
	if(!parent.joint)
		parent.joint=0;

	var offsetOffset = parent!=undefined ? parent.offset+parent.limbs.length : 0;
	joint.offset = parent.joint+offsetOffset || 0;
	joint.offset2 = offsetOffset;

	joint.joint = countUp;
	joint.joints = amount-1;
	joint.parentJoint = parent; 
	joint.name = Math.floor(Math.random()*1e9);
	parent.limbs.push(joint);
	countUp++;

	//start weird

	var keys = (Object.keys(joint.params));

	var tempParams = {};

	for(var i = 0 ; i < keys.length ; i++){
		tempParams[keys[i]] = joint.params[keys[i]];
	}

	joint.params = tempParams;

	if(params){
		var keys = (Object.keys(params));
		for(var i = 0 ; i < keys.length ; i++){
			joint.params[keys[i]] = params[keys[i]];
		}
	}
	////// end weird

	if(parent!=this){
		joint.construct(parent.params.jointScale.y);
		parent.rotator.add(this.recursiveAdd(amount, countUp++, joint));
	}
	else{
		joint.construct(0);
		parent.add(this.recursiveAdd(amount, countUp++, joint));
	}

	return joint;
}

TREE.prototype.recursiveAdd = function(amt,counter,obj){

	//helper function for branch
	
	var joint = new Joint(obj.params);
	joint.offset = obj.offset;
	joint.offset2 = obj.offset2;
	joint.parentJoint = obj.parentJoint;
	joint.name = obj.name;
	joint.construct();
	joint.joint = counter;
	obj.childJoint = joint;
	
	if(amt>1)
		obj.rotator.add(joint);

	amt--;
	counter++;

	if(amt>0){
		this.recursiveAdd(amt,counter++,joint);
	}

	return obj;
}

TREE.prototype.generate = function(genome, parent){


	//e.g. genome = {joints:[15,3,2],divs:[2,3,1],angles:[.78,.05,.03],rads:[2,1,1]}

	var parent = parent || this;

	var g = this.generateFixedParams(genome);

	if(g.joints.length!=g.divs.length || g.joints.length!=g.angles.length || g.divs.length!=g.angles.length){
		alert("arrays must be the same length");
		return;
	}

	var tempRoot = new Joint(this.params);
	tempRoot.construct();
	tempRoot.name = "0";

	for (var i = 0; i < g.rads[0]; i++) {

		//for offsetting
		var altLength = tempRoot.params.jointScale.clone();
		altLength.y = g.length[0];
		altLength.x = altLength.z = g.width[0];
		var root = this.branch(g.joints[0],tempRoot,{jointScale:altLength});

		root.rotator.rotation.z = g.angles[0];
		root.rotator.rotation.y = i * ((2*Math.PI)/g.rads[0]);
		this.recursiveBranch(g,1,root);
		parent.add(root);
		parent.limbs.push(root);
	}

	this.makeDictionary();
}

TREE.prototype.recursiveBranch = function(genome,counter,joint){

	//helper for generate
	
	var g = genome;
	var end = g.end[counter];
	if(end==-1)
		end = joint.joints+1;
	var newBranch,kidJoint;	

	//loop through all the joints in the current branch
	for (var i = g.start[counter]; i < end; i+=g.divs[counter]) {
	
		//loop through the 'rads' - the number of branches from each joint
		for (var j = 0; j < g.rads[counter]; j++) {

			kidJoint = this.findJoint(joint,i);
			var altLength = kidJoint.params.jointScale.clone();
			altLength.y = g.length[counter];

			altLength.x = altLength.z = g.width[counter];

			newBranch = this.branch(g.joints[counter],kidJoint,{jointScale:altLength});

			newBranch.rotator.rotation.z = g.angles[counter];
			newBranch.rotator.rotation.y = j * ((2*Math.PI)/g.rads[counter]);
		}
		if(counter<g.joints.length){
			for (var k = 0; k < kidJoint.limbs.length; k++) {
				this.recursiveBranch(genome,counter+1,kidJoint.limbs[k]);
			}
		}
	}
}

TREE.prototype.appendBranch = function(obj,args){

	if(!args) args = {};

	var amt = args.amount || 10;

	var x = args.rx || 0;
	var y = args.ry || 0;
	var z = args.rz || 1;

	if(args.rz===0)
		z=0;

	var sc = args.sc || 1;

	//making a tempTree to get access to the 'branch' function
	var tempTree = new TREE();

	var tempRoot = new Joint(tempTree.params);
	var altLength = tempRoot.params.jointScale.clone();
	altLength.y = sc;
	tempRoot.construct();

	var root = tempTree.branch(amt,obj,{jointScale:altLength});

	var posY = args.ty || root.parent.parent.params.jointScale.y;	
	
	root.position.y=posY;

	root.rotator.rotation.x = x;
	root.rotator.rotation.y = y;
	root.rotator.rotation.z = z;

	return root;
}

TREE.prototype.makeSkinnedGeo = function(){


    var geo = new THREE.Geometry();
       
    geo.skinIndices = [];
    geo.skinWeights = [];

    geo.bones = [];
    geo.parts = [];
   
    var reportArray = this.report();

    this.mirrorJointArray = [];

    for (var k = 0; k < reportArray.length; k++) {

        var parentJoint = reportArray[k];

        for (var i = 0; i < parentJoint.joints+1; i++) {

            var thisJoint = this.findJoint(parentJoint,i);
            
            this.mirrorJointArray.push(thisJoint);

            var mergedGeo = thisJoint.mergeGeo();

            THREE.GeometryUtils.merge(geo,mergedGeo);

             var len = geo.bones.length;

            for(var j = 0 ; j < mergedGeo.vertices.length ; j++){
                geo.skinIndices.push( new THREE.Vector4(len,len,0,0 ));
                geo.skinWeights.push( new THREE.Vector4(1,1,0,0 ));
            }

            var bone = {};

            bone.name="bone"+len;

            bone.pos = [thisJoint.position.x,thisJoint.position.y,thisJoint.position.z];
            bone.rot = [thisJoint.quaternion.x,thisJoint.quaternion.z,thisJoint.quaternion.y];
            bone.scl = [thisJoint.scale.x,thisJoint.scale.y,thisJoint.scale.z];
            bone.rotq = [thisJoint.rotator.quaternion.x,thisJoint.rotator.quaternion.y,thisJoint.rotator.quaternion.z,thisJoint.rotator.quaternion.w];
            bone.joints = thisJoint.joints;
            bone.joint = thisJoint.joint;
            bone.offset = thisJoint.offset;
            bone.offset2 = thisJoint.offset2;
            bone.rotator = bone;
            bone.scalar = bone;

            if(thisJoint.dictionaryName!=undefined){
            	geo.parts[thisJoint.dictionaryName] = bone;
            	bone.dictionaryName = thisJoint.dictionaryName;
            }

            if(k>0 && i==0){
                bone.parent = this.findParentInMirrorArray(thisJoint,this.mirrorJointArray);
            }
            else
                bone.parent = geo.bones.length-1;


            geo.bones.push(bone);
        }
    }


    this.params.skinMaterial = new THREE.MeshLambertMaterial({color:0xffffff,skinning:true});
    var skinned = new THREE.SkinnedMesh(geo,this.params.skinMaterial,true);

    this.boneDictionary = [];

    for (var i = 0; i < skinned.bones.length; i++) {
        skinned.bones[i].joint = geo.bones[i].joint;
        skinned.bones[i].joints = geo.bones[i].joints;
        skinned.bones[i].offset = geo.bones[i].offset;
        skinned.bones[i].offset2 = geo.bones[i].offset2;
        skinned.bones[i].rotator = geo.bones[i].rotator;
        skinned.bones[i].scalar = geo.bones[i].scalar;
        skinned.bones[i].dictionaryName = geo.bones[i].dictionaryName;
        this.boneDictionary[geo.bones[i].dictionaryName] = skinned.bones[i];
    };
    // console.log(skinned.bones);
    this.bones = skinned.bones;
    // this.boneDictionary = geo.parts;

    return skinned;
}

//utility

TREE.prototype.makeInfo = function(args){

	//helper function for xform
	//applies argument object to each array

	var info = [];
	
	for (var i = 0; i < args.length; i+=2) {
	
		info.push(this.makeList(args[i]));
		info.push(args[i+1]);
	}

	return info;
}

TREE.prototype.findParentInMirrorArray = function(obj,arr){
    var count = 0;
    for (var i = 0; i < arr.length; i++) {
        if(obj.parentJoint == arr[i]){
            count = i;
        }
    }
    return count;
}

TREE.prototype.findInMirrorArray = function(obj,arr){
    var count = 0;
    for (var i = 0; i < arr.length; i++) {
        if(obj == arr[i]){
            count = i;
        }
    }
    return count;
}

TREE.prototype.makeList = function(range,stacker,stackArray,index) {



	var stack = stacker || [];
	var stackArray = stackArray || [];
	var index = index || 0;

	// if(stack.length>5)
	// console.log(stack + " " + range.length);

	if(index < range.length){

		var i = index;

		if (range[i] instanceof Array && i!=range.length-1) {
			for (var j = range[i][0] ; j <= range[i][1]; j++) {

				stack.push(j);

				var tempStack = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack[k] = stack[k];
				}

				this.makeList(range,tempStack,stackArray,i+1);
				stack.pop();

			};
		}

		else if(range[i] == "all" && index%2==0 && index!=range.length-1 ||
			range[i] == -1 && index%2==0 && index!=range.length-1){

			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}

			tempStack.push(0);

			var jarr = [];
			this.findLimbs(this.FIND(tempStack),jarr);

			// console.log(jarr.length);

			for (var j = 0 ; j < jarr.length ; j++){


				stack.push(j);

				var tempStack = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack[k] = stack[k];
				}
				// console.log(tempStack);


				this.makeList(range,tempStack,stackArray,i+1);

				stack.pop();


			}

		}
		else if(range[i] == "all" && index%2!=0 && index!=range.length-1 ||
			range[i] == -1 && index%2!=0 && index!=range.length-1){


			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}
			// tempStack.push(0);

			// console.log(tempStack);

			var jarr = [];
			this.findLimbs(this.FIND(tempStack),jarr);

			// console.log(jarr[0].limbs);
		
			var limbs = jarr[0].limbs;//this.FIND(tempStack).limbs;

		// console.log(jarr[tempStack[tempStack.length-1]].limbs);


			// console.log(tempStack);
			// console.log(limbs.length);

			for (var j = 0 ; j < limbs.length ; j++){

				// console.log(j);

				stack.push(j);

				var tempStack2 = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack2[k] = stack[k];
				}

				// console.log(tempStack);

				this.makeList(range,tempStack2,stackArray,i+1);

				stack.pop();
			}

		}

		else if(range[i] == -2 && index==range.length-1 || 
				range[i] == "all" && index==range.length-1 || 
				range[i] == -1 && index==range.length-1 ||
				range[i] == -3 && index==range.length-1){

			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}

			tempStack.push(0);

			var joints = this.FIND(tempStack).joints;

			var min=0;
			var max = joints+1;

			if(range[i]==-2)
				min=1;

			if(range[i]==-3)
				min=max-1;

			for (var j = min ; j < max ; j++){

				stack.push(j);

				var tempStack = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack[k] = stack[k];
				}

				this.makeList(range,tempStack,stackArray,i+1);
				stack.pop();
			}

		}
		else if(range[i] instanceof Array && index==range.length-1){
			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}

			tempStack.push(0);

			var min = range[i][0];
			var max = range[i][1];

			var joints = this.FIND(tempStack).joints;

			if(min>joints+1)
				min=joints+1;
			if(max>joints+1)
				max=joints+1;

			for (var j = min ; j <= max ; j++){

				if(range[i]==-2)
					j++;

				stack.push(j);

				var tempStack = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack[k] = stack[k];
				}

				this.makeList(range,tempStack,stackArray,i+1);
				stack.pop();
			}
		}
		else{

			stack.push(range[i]);

			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}

			this.makeList(range,tempStack,stackArray,i+1);
			stack.pop();
		}

	}
	else{
		stackArray.push(stack);
	}


	return stackArray;
}

TREE.prototype.arrayStringName = function (arr){
	for (var i = 0; i < arr.length; i++) {
		arr[i].name = arr[i].toString();
	}
}

TREE.prototype.makeListAll = function(range) {

	//by Andrew Magill

	var allRange = this.makeList(range);
	
	// var result = [];

	// var allRange = [];

	// var processed = this.makeList(range);

	// for (var i = 0; i < processed.length; i++) {
	// 		if(processed[i][processed[i].length-1]=="all"){
	// 			var newarr = processed[i];
	// 			newarr[newarr.length-1]=0;
	// 			var joint = this.FIND(newarr);
	// 			if(joint.joints!=undefined){
	// 				newarr[newarr.length-1]=[0,joint.joints];
	// 				allRange.push(newarr);
	// 			}
	// 		}
	// }

	return allRange;
}

TREE.prototype.generateFixedParams = function(params){

	//helper function for generate

	var counter = 0;

	var keys = (Object.keys(params));
	for(var i = 0 ; i < keys.length ; i++){
		if(counter < params[keys[i]].length){
			counter = params[keys[i]].length;
		}
	}

	var amt = counter;

	var tempParams = this.generateDefaultParams(amt);
	
	var keys = (Object.keys(params));
	for(var i = 0 ; i < keys.length ; i++){
		tempParams[keys[i]] = params[keys[i]];
		if(tempParams[keys[i]].length<amt){
			for (var j = tempParams[keys[i]].length - 1 ; j < amt-1; j++) {
				console.log(keys[i]);
				if(keys[i]=='end')
					tempParams[keys[i]].push(-1);
				else
					tempParams[keys[i]].push(tempParams[keys[i]][tempParams[keys[i]].length-1]);
			}
		}
	}
	
	return tempParams;
}

TREE.prototype.generateDefaultParams = function(amt){

	//helper function for generate

	var params = {
		joints:[],
		divs:[],
		start:[],
		angles:[],
		length:[],
		rads:[],
		width:[],
		end:[],
	};

	for (var i = 0; i < amt; i++) {

		params.joints.push(5);
		params.divs.push(1);
		params.start.push(0);
		params.angles.push(1);
		params.length.push(5);
		params.rads.push(2);
		params.width.push(1);
		params.end.push(-1);

		if(i==0){
			params.rads[0] = 1;
			params.angles[0] = 0;
			params.joints[0] = 10;
		}
	};

	return params;
}

TREE.prototype.cloneVec4Array = function(arr){
    function cloneVec4(val){
        var tempVec = new THREE.Vector4();
       tempVec.x = val.x;
       tempVec.y = val.y;
       tempVec.z = val.z;
       tempVec.w = val.w;
       return tempVec;
    }
    var tempArray = [];
    for (var i = 0; i < arr.length; i++) {
        tempArray[i] = cloneVec4(arr[i]);
    }
    return tempArray;
}



//find and report

TREE.prototype.findJoint = function(obj,num){

	//Return a particular joint on a branch
	//where obj is the root 

	var returner;

	if(obj){

		if(num>obj.joints+1)
			num=obj.joints+1;

		if(num>0){
			num--
			returner = this.findJoint(obj.childJoint,num);
		}
		else{
			returner = obj;
		}
	}
	else
		console.warn("missing object");

	return returner;
}

TREE.prototype.Move = function(selector,func,args,counter,branch){

	//apply a function to a selected joint
	//e.g. Move([0,1,0,1,1],function,{rx:3})
	//no need to supply counter or branch on fist call

	var root = branch || this;
	var count = counter || 0;

	var returner;
	// console.log(root);
	// console.log(selector[count]);
	//selector:[limb with branches, branch, limb, branch, etc, etc, which joint]

	//count up through items in selector; an array
	if( count < selector.length-1 ){

		//create an empty array that we'll fill up with the locations
		//of all the joints that have limbs
		var j = [];
		this.findLimbs(root,j);
		//make sure we're not going past the end of the array
		var c;
		if(selector[count] > j.length-1){
			c=j.length-1;
			console.warn("array is too big: " + selector[count] + " " + selector);
		}
		else
			c=selector[count];

		//use the selected joint for the next recursion
		var joint = j[c];
		returner = this.Move(selector,func,args,count+2,joint.limbs[selector[count+1]]);
	}
	else{
		if( selector[count] == "all" ){
			for (var i = 0; i < root.joints+1; i++) {
				returner = func(this.findJoint(root,i),args);
			}
		}
		else{
			returner = func(this.findJoint(root,selector[count]),args);
		}

	}
	return returner;
}

TREE.prototype.FIND = function(selector,counter,branch){

	//idential to MOVE but instead of applying a function it just returns an object
	var root = branch || this;
	var count = counter || 0;


	var returner;
	
	//count up through items in selector; an array
	if( count < selector.length-1 ){

		//create an empty array that we'll fill up with the locations
		//of all the joints that have limbs
		var j = [];
		this.findLimbs(root,j);
		
		//make sure we're not going past the end of the array
		var c;
		if(selector[count] > j.length-1){
			c=j.length-1;
		}
		else
			c=selector[count];

		//use the selected joint for the next recursion
		var joint = j[c];
		returner = this.FIND(selector,count+2,joint.limbs[selector[count+1]]);
	}
	else{
		if( selector[count] == "all" ){
			for (var i = 1; i < root.joints+1; i++) {
				returner = this.findJoint(root,i);
			}
		}
		else{
			returner = this.findJoint(root,selector[count]);

		}

	}
	return returner;
}

TREE.prototype.findLimbs = function(branch,array){

	//utility function
	//fills an array with a list of the joints that branch from a limb

	var returner;

	if(branch){
		if(branch.limbs){
			if(branch.limbs.length>0){
				array.push(branch);
			}}
			if(branch.childJoint!=undefined && branch.childJoint.name==branch.name){
				returner = this.findLimbs(branch.childJoint,array);
			}
		
		
	}

	return returner;
}

TREE.prototype.report = function(array,obj){

	//returns a one dimensional array with all root joints

	var arr = array || [];
	var joint = obj || this;

	for(var j = 0 ; j < joint.limbs.length ; j++){

		arr.push(joint.limbs[j]);

		var jarr = [];
		this.findLimbs(joint.limbs[j],jarr);


		for(var i = 0 ; i < jarr.length ; i++){

			// joint.nameArray.push(i);
			// console.log(joint.nameArray);

			this.report(arr,jarr[i]);

		}
	}
	return arr;
}

TREE.prototype.reportLayers = function(array,obj,count){

	//makes a multi dimensional array where the first dimension
	//refers to the depth of the indexed branches

	var arr = array || [];	//the first time through it creates an array
	var joint = obj || this; // and references the 0th joint
	var c = count+1 || 0; // and starts the counter at 0

	var larr =  [];

	for(var j = 0 ; j < joint.limbs.length ; j++){

		larr.push(joint.limbs[j]);

		var jarr = [];
		this.findLimbs(joint.limbs[j],jarr);

		for(var i = 0 ; i < jarr.length ; i++){
			this.reportLayers(arr,jarr[i],c);
		}
	}

	if(!arr[c]){
		arr[c] = [];
		for (var i = 0; i < larr.length; i++) {
			arr[c].push(larr[i]);
		};
	}
	else{
		for (var i = 0; i < larr.length; i++) {
			arr[c].push(larr[i]);
		};
	}

	return arr;
}

TREE.prototype.makeDictionary = function(obj,stacker,stackArray,pusher){

	var joint = obj || this;
	var stack = stacker || [];
	var stackArray = stackArray || [];
	var pusher = pusher || 0;

	stack.push(pusher);

	for(var i = 0 ; i < joint.limbs.length ; i++){

		stack.push(i);

		var jarr = [];
		this.findLimbs(joint.limbs[i],jarr);

		var tempStack = [];
		var t2 = [];

		for(var k = 0 ; k < stack.length ; k++){
			tempStack[k] = stack[k];
			t2[k] = stack[k];
		}

		stackArray.push(tempStack);

		t2.push("all");
		var t3 = this.makeList(t2);
		var t4 = t3;//this.makeList(t3[0]);

		for(var k = 0 ; k < t4.length ; k++){
			var tempString = t4[k].toString();
			var tempJoint = this.FIND(t4[k]);
			this.parts[tempString] = tempJoint;
			tempJoint.dictionaryName = tempString;
			// console.log(tempString);
			// console.log(joint.id);
		}

		for(var j = 0 ; j < jarr.length ; j++){
			this.makeDictionary(jarr[j],tempStack,stackArray,j	);
		}

		stack.pop();

	}

	stack.pop();

	return stackArray;
}

TREE.prototype.worldPositions = function(obj){

	//returns the world positions of all the joints on a branch

	var arr = [];

	this.updateMatrixWorld();

	for(var i = 0 ; i <= obj.joints ; i++){

		var tempObj1 = this.findJoint(obj,i);
		tempObj = tempObj1;
		tempObj.updateMatrixWorld();
		if(tempObj1.ballMesh!=undefined)
			tempObj = tempObj1.ballMesh;

		var vector = new THREE.Vector3();
		vector.setFromMatrixPosition( tempObj.matrixWorld );

		var vecScale = new THREE.Vector3();
		vecScale.setFromMatrixScale( tempObj.matrixWorld );

		var vec4 = new THREE.Vector4(vector.x,vector.y,vector.z,(vecScale.z));

		arr.push(vec4);

		if(i==obj.joints){

			vector.setFromMatrixPosition( tempObj1.ballMesh2.matrixWorld );

			var vec4 = new THREE.Vector4(vector.x,vector.y,vector.z,(vecScale.z));
			
			arr.push(vec4);
		}

	}
	return arr;
}

TREE.prototype.worldPositionsArray = function(arr){

	//good for working working with the output of tree.report()
	//which returns a one dimensional array of all joints

	var masterArray = [];

	for(var i = 0 ; i < arr.length ; i++){
		masterArray.push(this.worldPositions(arr[i]));
	}

	return masterArray;
}

TREE.prototype.worldPositionsMultiArray = function(arr){

	//best for working with the output of reportLayers()
	//which returns a 2 dimensional array

	var masterArray = [];

	for(var i = 0 ; i < arr.length ; i++){
		var smallArray = [];
		for(var j = 0 ; j < arr[i].length ; j++){
			smallArray.push(this.worldPositions(arr[i][j]));
		}
		masterArray.push(smallArray);
	}

	return masterArray;
}

//model

TREE.prototype.tubes = function(arr,args){

	//takes a 2 dimensional array where the first dimension
	//use this.worldPositionsArray(tree.report()) - 
	//a one dimensional array of joints

	if(!args) args = {};

	var width = args.width || 1;
	var minWidth = args.minWidth || 0;
	var seg = args.lengthSegs || 1;
	var wseg = args.widthSegs || 6;
	var func = args.func || function(t){return 0};

	var geoObj = new THREE.Object3D();

	
	for(var i = 0 ; i < arr.length ; i++){

		//Building a duplicate curve to offset curve parameterization issue

		var dataCurveArray = [];
		var addX = 0;



		for (var j = 0; j < arr[i].length; j++) {
			var vecW = arr[i][j].w || 1;
			var worldWide = vecW + func(j);
			addX+=vecW;
			if(worldWide<minWidth)
				worldWide=minWidth;
			dataCurveArray.push(new THREE.Vector3(worldWide,addX,0));
		}

		var dataCurve = new THREE.SplineCurve3(dataCurveArray);
		var curve = new THREE.SplineCurve3(arr[i]);
		curve.data = arr[i];
		curve.dataCurve = dataCurve;
		var geo = new THREE.TubeGeometry2(curve, arr[i].length * seg , width, wseg);
		var tube = new THREE.Mesh(geo,this.params.mat);
		geoObj.add(tube);
		this.params.tubeGeo.push(tube);

	}

	return geoObj;
}

TREE.prototype.averagePoints = function(arr,amt){

	//A single array of vectors to be averaged

	amount = amt || .5;

	for (var i = 1; i < arr.length-1; i++) {

		now = arr[i];
		prev = arr[i-1];
		next = arr[i+1];

		var lerped = prev.clone();
		lerped.lerp(next,.5);

		now.lerp(lerped,amount);

	}
}

TREE.prototype.removeZeroLength = function(arr,min){

	var min = min || 0.0001;
	// console.log(min);

	var newArr = [];

	for (var i = 0; i < arr.length; i++) {

		var temp = [];

		for(var j = 1 ; j < arr[i].length ; j++){
			now = arr[i][j];
			prev = arr[i][j-1];

			if(j==1)
				temp.push(arr[i][j-1]);

			var checker = new THREE.Vector3(prev.x-now.x,prev.y-now.y,prev.z-now.z);

			if(!(checker.length() < min)){
				temp.push(now);
			}
		}

		if(temp.length>1){
			newArr.push(temp);
		}
	}

	return newArr;
}

TREE.prototype.insertLerpVerts = function(arr,args){

	if(!args) args = {};

	var points = args.points || 1;
	var tx = args.tx || 0;
	var ty = args.ty || 0;
	var tz = args.tz || 0;
	var freq = args.freq || .4;
	var mult = args.mult || 4;
	var bulge = args.bulge || 0;
	var tipOff = args.tipOff || 0;
	var tipLength = args.tipLength || 0;
	var tipNoiseFreq = args.tipNoiseFreq || .1;
	var tipNoiseMult = args.tipNoiseMult || 0;
	var tipPoint = args.tipPoint || 1;

	var skip = args.skip || false;


	var func = args.func || function(t,p){};
	var parentI = args.parentI || 0;

	var tempArr = [];

	// console.log(arr);

	if(arr.length>1){

		for (var i = 0; i < arr.length; i++) {

			var temp = [];

			var start = arr[i][0];
			var end = arr[i][arr[i].length-1];

			arr[i].unMoved = [];

			for(var j = 1 ; j < points+1 ; j++){

				var b = points+1;

				// console.log(1/2);

				var lerpVec = start.clone();
				lerpVec.lerp(end,j/b);

				arr[i].unMoved.push(lerpVec);

				var aim;

				// if(i>0)
				// console.log(arr[i-1].un);

				if(i>0){
					aim = arr[i-1].unMoved[j-1];
				}
				else{
					// aim = lerpVec.clone();
					if(arr[1]){
						var start2 = arr[1][0];
						var end2 = arr[1][arr[1].length-1];
						var lerpVec2 = start2.clone();
						lerpVec2.lerp(end2,j/b);
						// var toward2 = lerpVec.clone();
						// toward2.lerp(lerpVec2,.5);
						// var diff = lerpVec.clone();
						// diff = diff.subVectors(lerpVec2,toward);
						// diff.normalize();
						// subr.multiplyScalar(-1);
						aim = lerpVec2.clone();
					}
					// aim.multiplyScalar(-1);
				}

				var toward = lerpVec.clone();
				toward.lerp(aim,.5);

				var towardStart = lerpVec.clone();
				towardStart.lerp(start,.5);


				var diff = lerpVec.clone();
				diff = diff.subVectors(lerpVec,toward);
				diff.normalize();
				var nLerp = diff.clone();

				diff.multiplyScalar(Math.sin(i*freq)*mult);
				// diff.multiplyScalar(tx);

				var cLerp = lerpVec.clone();
				cLerp = cLerp.subVectors(lerpVec,towardStart);
				cLerp.normalize();

				nLerp.cross(cLerp);

				if(i==0){
					nLerp.multiplyScalar(-tipOff); //nlerp travels out
				}
				else
					nLerp.multiplyScalar(tipOff); //nlerp travels out
				
				// tipLength=args.parentI;
				// if(args.parentI < 8){
				// 	tipLength=15;
				// }
				var modLength = func(parentI);

				if(modLength==undefined)
					modLength=0;

				cLerp.multiplyScalar(tipLength+modLength); // clerp travels down

				var tLerp = lerpVec.clone();

				var tip = arr[i][arr[i].length-1];

				tip.x+=nLerp.x+(noise(tip.x*tipNoiseFreq,tip.y*tipNoiseFreq,tip.z*tipNoiseFreq)*tipNoiseMult);
				tip.y+=nLerp.y+(noise(tip.x*tipNoiseFreq,tip.y*tipNoiseFreq,tip.z*tipNoiseFreq)*tipNoiseMult);
				tip.z+=nLerp.z+(noise(tip.x*tipNoiseFreq,tip.y*tipNoiseFreq,tip.z*tipNoiseFreq)*tipNoiseMult);

				tip.x+=cLerp.x;
				tip.y+=cLerp.y;
				tip.z+=cLerp.z;


				// var cLerp = diff.clone();

				// // cLerp.normalize();
				

				// if(i>0)
				// 	cLerp.cross(arr[i][0]);
				// else
				// 	cLerp.y=0;

				// // cLerp.addScalar(-1);
				// // cLerp.multiplyScalar(bulge);
				// cLerp.normalize();

				// diff.multiply(cLerp.multiplyScalar(5))

				tLerp.x+=diff.x;
				tLerp.y+=diff.y;
				tLerp.z+=diff.z;


				// tLerp.x+=nLerp.x;
				// tLerp.y+=nLerp.y;
				// tLerp.z+=nLerp.z;

				// lerpVec.x+=Math.sin(i*.4)*4;
				// lerpVec.y+=Math.cos(i*.4);
				// lerpVec.z+=tz;
				
				if(args.tipPoint)
					arr[i][arr[i].length-1].w=tipPoint;

				arr[i].splice(arr[i].length-1,0,tLerp);

				if(arr[i+1]){
					if(skip)
						arr[i][arr[i].length-1]=arr[i+1][arr[i+1].length-1];
					if(args.tipPoint)
						arr[i][arr[i].length-1].w=tipPoint;
				}

			}

			// if(!(Math.sin(i*.3)>-.5 && Math.sin(i*.3)<.5)){
				tempArr.push(arr[i]);
			// }

		}
	}

	return tempArr;
}

TREE.prototype.nurbsishSurface = function(arr,divsx,divsy){

	divsX = divsx || arr.length;
	divsY = divsy || divsX;

	//create Y curves (to the original X)
	//create a new set of interpolated X curves based on those

	var curvesX = [];
	var curvesY = [];
	var curvesX2 = [];
	var curvesY2 = [];
	var pointsY = [];
	var pointsX = [];

	for (var i = 0; i < arr.length; i++) {
		curvesX.push(new THREE.SplineCurve3(arr[i]));
	}
	for (var i = 0; i <= divsX; i++) {
		var tempPoints = [];
		for(var j = 0 ; j < curvesX.length ; j++){
			tempPoints.push(curvesX[j].getPointAt(i/divsX));
		}
		pointsY.push(tempPoints);
	};

	for (var i = 0; i < pointsY.length; i++) {
		curvesY.push(new THREE.SplineCurve3(pointsY[i]));
	}

	for (var i = 0; i <= divsY; i++) {
		var tempPoints = [];
		for(var j = 0 ; j < curvesY.length ; j++){
			tempPoints.push(curvesY[j].getPointAt(i/divsY));
		}
		pointsX.push(tempPoints);
	};

	for (var i = 0; i < pointsY.length; i++) {
		var temp = [];
		for (var j = 0; j < pointsY[i].length; j++) {
			temp.push(pointsY[i][j]);
		};
		this.averagePoints(temp);
		curvesY2.push(temp);
	}

	for (var i = 0; i < pointsX.length; i++) {
		var temp = [];
		for (var j = 0; j < pointsX[i].length; j++) {
			temp.push(pointsX[i][j]);
		};
		this.averagePoints(temp);
		curvesX2.push(temp);
	}

	var XY = [];

	XY.push(curvesY2);
	XY.push(curvesX2);

	return XY;
}

TREE.prototype.mergeMeshes = function(obj){
	//take an array of geo and merge it
	// console.log(obj);

	var arr = [];

	obj.traverse(function(t){
		if(t.geometry){
			arr.push(t);
		}
	})

	// console.log(arr);

	var geo = new THREE.Geometry();

	for (var i = 0; i < arr.length; i++) {
		arr[i].parent.updateMatrixWorld();
		var temp = arr[i].clone();
		temp.applyMatrix(arr[i].parent.matrixWorld);
		THREE.GeometryUtils.merge(geo,temp);
	};

	return geo;
}

TREE.prototype.animateTubes = function(w,sc){

	// Rebuilds tube geometry and deletes the old geo
	// Kinda crappy but whaddya gonna do - throws errors too - meh

	var obj;

	for (var i = 0; i < this.params.tubeGeo.length; i++) {

		obj = this.params.tubeGeo[i];

		obj.geometry.dispose();

		sc.remove(obj);
	};

	this.params.tubeGeo=[];
	sc.add(this.makeTubes(w));
}

TREE.prototype.makeTubes = function(args){

	//simplifies the process of making tubes
	//args = {
	// width - argument passed to tube geometry
	// minWidth - in world space, tube won't get smaller than this
	// widthSegs - radial subdivisions
	// lengthSegs - length subdivisions - multiplier of control points (not total)
	// func - a function which takes an input from a loop based on joint #s
	//}

	var arrayToSort = this.report();
	// arrayToSort.sort(function(a,b){return a.id-b.id});
	return this.tubes(this.worldPositionsArray(arrayToSort),args);
}

TREE.prototype.openSurface = function(points){

	//points is a 2 dimensional array of vectors
	//generate a parametric surface where each vertex is the position of each joint

	function makeSheet(u,v){
		var c = points;

		var tempU = Math.round(u*(c.length));
		var tempV = Math.round(v*(c[0].length));
		
		if(u*(c.length)>c.length-1){
			tempU = c.length-1;
		}
		if(v*(c[0].length)>c[0].length-1){
			tempV = c[0].length-1;
		}

		return(c[tempU][tempV]);
	}


	var geo = new THREE.ParametricGeometry( makeSheet, points.length, points[0].length );

	geo.computeVertexNormals();

	return geo;
}

TREE.prototype.solidify = function(geo,offset,w,h){

	//works with parametric geometry
	//extrudes along the normals and stitches the edges

	var width = w || 10;
	var height = h || 10;

	var vertsize = geo.vertices.length;
	var facesize = geo.faces.length;

	var tempVerts = [];
	var tempFaces = [];

	for (var i = 0; i < vertsize; i++) {
		geo.vertices.push(geo.vertices[i].clone());
	}
	for (var i = 0; i < facesize; i++) {
		geo.faces.push(geo.faces[i].clone());
	}
	for (var i = facesize; i < geo.faces.length; i++) {

		geo.faces[i].a = geo.faces[i].a + vertsize;
		geo.faces[i].b = geo.faces[i].b + vertsize;
		geo.faces[i].c = geo.faces[i].c + vertsize;

		if(geo.vertices[geo.faces[i].a].off!=true){
			geo.vertices[geo.faces[i].a].sub(geo.faces[i].normal.multiplyScalar(offset));
			geo.vertices[geo.faces[i].a].off=true;
		}
		if(geo.vertices[geo.faces[i].b].off!=true){
			if(i==facesize)//don't know why I have to do this - looks messy
				geo.vertices[geo.faces[i].b].sub(geo.faces[i].normal.multiplyScalar(offset/offset));
			else
			geo.vertices[geo.faces[i].b].sub(geo.faces[i].normal.multiplyScalar(offset));
			geo.vertices[geo.faces[i].b].off=true;
		}	
		if(geo.vertices[geo.faces[i].c].off!=true){
			if(i==facesize)
				geo.vertices[geo.faces[i].c].sub(geo.faces[i].normal.multiplyScalar(offset/offset));
			else
			geo.vertices[geo.faces[i].c].sub(geo.faces[i].normal.multiplyScalar(offset));
			geo.vertices[geo.faces[i].c].off=true;
		
		}
			
		
	}

	for (var i = 0; i < (geo.vertices.length); i++) {

		if(i<width-1){

			var a = i;
			var b = i+1;
			var c = i+vertsize;
			var d = i+1+vertsize;
			geo.faces.push(new THREE.Face3(a,b,c));
			geo.faces.push(new THREE.Face3(d,c,b));

			// var a = i+((width*height)-width);
			// var b = i+1+((width*height)-width);
			// var c = i+vertsize+((width*height)-width);
			// var d = i+1+vertsize+((width*height)-width);
			// geo.faces.push(new THREE.Face3(a,b,c));
			// geo.faces.push(new THREE.Face3(d,c,b));

		}
		if(i<height-1){

			var a = i*(width+1);
			var b = (i+1)*(width+1);
			var c = (i*(width+1))+vertsize;
			var d = (i*(width+1))+(width+1)+vertsize;
			geo.faces.push(new THREE.Face3(c,b,a));
			geo.faces.push(new THREE.Face3(b,c,d));

			// var a = width-1+(i*width);
			// var b = width-1+((i+1)*width);
			// var c = width-1+((i*width)+vertsize);
			// var d = width-1+((i*width)+width+vertsize);
			// geo.faces.push(new THREE.Face3(a,b,c));
			// geo.faces.push(new THREE.Face3(d,c,b));
		
		}
	};
}

TREE.prototype.solidSurface = function(points,offset){

	var w = points.length;
	var h = points[0].length;
	var off = offset || 1;

	var geometry;
	geometry = this.openSurface(points);
	this.solidify(geometry,off,w,h);

	geometry.mergeVertices();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var mesh = new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({side:THREE.DoubleSide}))

	return mesh;
}

TREE.prototype.metaBalls = {

	holder:new THREE.Object3D(),
	resolution:100,
	size:500,
	effect:0,
	box:0,
	ballSize:1,

	init:function(){

		if(this.holder.children.length>0){
			for (var i = 0; i < this.holder.children.length; i++) {
				this.holder.remove(this.holder.children[0]);
			}
		}
		this.effect = new THREE.MarchingCubes( this.resolution, new THREE.MeshLambertMaterial({color:0xffffff}),true,true );
		this.effect.scale.set(this.size,this.size,this.size);
		this.box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.2})),

		this.box.scale.set(this.size*2,this.size*2,this.size*2);

		this.holder.add(this.effect);

		return this.holder;
	},

	showBox:function(){
		this.holder.add(this.box);
	},

	hideBox:function(){
		this.holder.remove(this.box);
	},

	setSize:function(val){
		this.size = val;
		var size = this.size;
		this.effect.scale.set( size,size,size );
		this.box.scale.set(size*2,size*2,size*2);
	},

	setResolution:function(val){
		this.resolution = val;
		this.init();
	},

	updateBalls:function(arr) {

		var balls,ballArr,flatArray;


		if(arr==undefined){

			var report = this.treeParent.report();
			ballArr = this.treeParent.worldPositionsArray(report);

			flatArray = [];

			for (var i = 0; i < ballArr.length; i++) {
				for (var j = 0; j < ballArr[i].length; j++) {
					flatArray.push(ballArr[i][j]);
				}
			}
		}

		var balls = arr || flatArray;

		this.effect.reset();

		// fill the field with some metaballs

		var i, ballx, bally, ballz, subtract, strength;

		subtract = 10;
		strength = this.ballSize*.005;//1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );

		for ( var i = 0; i < balls.length; i ++ ) {
			// console.log(balls[0][i]);
			ballx = (((balls[i].x+this.size)*  (1/this.size/2))); 
			bally = (((balls[i].y+this.size)*  (1/this.size/2)));//+(size*.000625); 
			ballz = (((balls[i].z+this.size)*  (1/this.size/2)));//+(size*.000625); 

			this.effect.addBall(ballx, bally, ballz, strength, subtract);
		}

		// if ( floor ) object.addPlaneY( 2, 12 );
		// if ( wallz ) object.addPlaneZ( 2, 12 );
		// if ( wallx ) object.addPlaneX( 2, 12 );

	},

	generateGeo:function(){

		var geo = this.effect.generateGeometry();
		geo.verticesNeedUpdate = true;

		for ( var i = 0; i < geo.vertices.length; i ++ ) {

			(geo.vertices[i].x*=this.size) + (this.size/2); 
			(geo.vertices[i].y*=this.size) + (this.size/2);
			(geo.vertices[i].z*=this.size) + (this.size/2);
		}

		// console.log(geo.vertices);

		geo.mergeVertices();

		var obj = new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}));

		// this.holder.add(obj);
		return obj;
	}
}

//modify

TREE.prototype.passFunc = function (array,func,GPU){

	// this.applyFunc(array,func,GPU);

	var accelerated = GPU || false;
	
	for (var i = 0; i < array.length; i+=2) {
		for (var j = 0; j < array[i].length; j++) {
		 	var process = this.makeList(array[i][j]);
		 	for (var k = 0; k < process.length; k++) {
		 		if(accelerated){
		 			array[i+1].GPU = true;
		 			
		 			if(process[k].name == undefined)
 						this.arrayStringName(process);

		 			func(this.boneDictionary[process[k].name],array[i+1]);
		 		}
		 		else{
					this.Move(process[k],func,array[i+1]);
					
				}
			};
		 }; 
	};
}

TREE.prototype.applyFunc = function (array,func,GPU){

	//same as passFunc but modified for new organization

	var accelerated = GPU || false;

	for (var i = 0; i < array.length; i+=2) {
		for (var j = 0; j < array[i].length; j++) {

	 		if(accelerated)
	 			array[i+1].GPU = true;
		 		
 			if(array[i][j].name == undefined){
 			 	this.arrayStringName(array[i]);
 			}

			
			if(GPU){
				func(this.boneDictionary[array[i][j].name],array[i+1]);
			}
			else{
				func(this.parts[array[i][j].name],array[i+1]);
			}
		 }
	}
}

TREE.prototype.setGeo = function(obj,args){

	//swap out the geometry for the specified joint

	var jointGeo = args.jointGeo || obj.params.jointGeo;
	var ballGeo = args.ballGeo || obj.params.ballGeo;
	var ballGeo2 = args.ballGeo2 || ballGeo;

	obj.ballMesh.geometry = ballGeo;
	obj.ballMesh2.geometry = ballGeo2;
	obj.jointMesh.geometry = jointGeo;
}

TREE.prototype.aimAt = function(obj,args){

	//aims selected joints at a target in world space
	//ugly solution, runs slowly

	var target = args.target || new THREE.Vector3(0,0,0);
	
	var tempParent = obj.parent;

	THREE.SceneUtils.detach(obj,tempParent,scene); //*ergh

	obj.lookAt(target);
	obj.rotation.y+=Math.PI/2;

	obj.parent.updateMatrixWorld();

	THREE.SceneUtils.attach(obj,scene,tempParent); //*ick
}

TREE.prototype.axisRotate = function(obj,args) { 

	//rotate a joint in world space
	//runs well but strange jiggling with long joint chains and large transformations

	if(!args) args = {};

	var axis = args.axis || new THREE.Vector3(0,0,1);
	var radians = args.radians || 0;

	var parent;

	if(!obj.parent){
		console.warn("axisRotate missing parent");
		parent = this;
	}
	else
		parent = obj.parent;

	var tempMatrix = new THREE.Matrix4();
	var inverse = new THREE.Matrix4();
	var multed = new THREE.Matrix4();

	var quat = new THREE.Quaternion();

	inverse.getInverse(parent.matrixWorld);

    tempMatrix.makeRotationAxis(axis, radians);
  
    multed.multiplyMatrices(inverse,tempMatrix); // r56

    quat.setFromRotationMatrix(multed);

    var rot = new THREE.Vector3(axis.x,axis.y,axis.z);
    
    rot.applyQuaternion(quat);

	obj.quaternion.setFromAxisAngle(rot,radians);

	obj.updateMatrixWorld();
}

TREE.prototype.setJointLength = function (obj,args){

	var len = args.length || obj.scalar.scale.y;

	obj.scalar.children[0].scale.y = len/obj.scalar.scale.y;
	obj.scalar.children[0].position.y = len/obj.scalar.scale.y/2;

	for(var i = 2 ; i < obj.rotator.children.length ; i++){
		obj.rotator.children[i].position.y=len;
	}

	obj.ballMesh2.position.y = len;
	obj.childJoint.position.y = len;
}

TREE.prototype.setJointWidth = function (obj,args){

	var wid = args.width || obj.scalar.scale.y;

	obj.scalar.scale.x = wid;
	obj.scalar.scale.z = wid;

	obj.ballMesh.scale.x = wid;
	obj.ballMesh.scale.z = wid;

	// obj.childJoint.position.y = wid;
}

TREE.prototype.xform = function (array,func){

	//deprecated, use passFunc

	this.passFunc(array,func);//deprecated
}

TREE.prototype.appendObj = function (obj,args){

	//append geometry to selected joint

	if(!args) args = {};

	var appendage = new THREE.Object3D();

	if(args.obj)
		appendage= args.obj.clone();

	var rx,ry,rz,sc,scx,scy,scz,tx,ty,tz;

	sc = args.sc || 1;

	if(args.sc){
		scx = scy = scz = args.sc;
	}
	else{
		scx = args.scx || 1 ;
		scy = args.scy || 1 ;
		scz = args.scz || 1 ;
		
	}
	rx = args.rx || 0 ;
	ry = args.ry || 0 ;
	rz = args.rz || 0 ;
	tx = args.tx || 0 ;
	ty = args.ty || 0 ;
	tz = args.tz || 0 ;

	appendage.position = new THREE.Vector3(tx,ty,tz);
	appendage.rotation = new THREE.Euler(rx,ry,rz);
	appendage.scale = new THREE.Vector3(scx,scy,scz);

	obj.rotator.add(appendage);
	obj.parts.push(appendage);	
}

TREE.prototype.appendTree = function (obj,args){

	// just a little helper function for if you want
	// to grow a tree from a tree

	//e.g
	// tree.generate({
	// 		joints: [90,20],
	// 		divs:   [1,5],
	// 		start:  [0],
	// 		angles: [0,Math.PI/2],
	// 		length: [1],
	// 		rads:   [1],
	// });
	// var t = findTopParent(obj);


	var newTree;
	
	if(!args.newTree)
		newTree = new TREE();
	else
		newTree = args.newTree;

	newTree.generate(args.tree,obj);

	obj.limbs.push(newTree);
}

TREE.prototype.transform = function (obj,args){


	// console.log(obj);
	var rx,ry,rz,sc,scx,scy,scz,tx,ty,tz,
	off,offMult,freq,
	jOff,jMult,jFreq,
	jFract, jOffset,
	offsetter,offsetter2,offsetter3,offsetter4,
	jointOff,scoff,sjoff,
	nMult,nOff,nFreq,nFract,
	sinScaleMult,sinScale,sinOff,
	offScale,offScaleMult,offScaleOff,
	rotator, nObjOff,
	GPU;


	if(args){
		sc = args.sc || 1;

		if(args.sc){
			scx = scy = scz = args.sc;
		}
		else{
			scx = args.scx || 1 ;
			scy = args.scy || 1 ;
			scz = args.scz || 1 ;
			
		}
		rx = args.rx || 0 ;
		ry = args.ry || 0 ;
		rz = args.rz || 0 ;
		tx = args.tx || 0 ;
		ty = args.ty || 0 ;
		tz = args.tz || 0 ;

		off = args.off || 0;
		offMult = args.offMult || 0;
		freq = args.freq || 0;
		jOff = args.jOff || 0;
		jMult = args.jMult || 0;
		jFreq = args.jFreq || 0;
		jFract = args.jFract * obj.joint || 1;
		nMult = args.nMult || 0;
		nFreq = args.nFreq || 0;
		nObjOff = args.nObjOff || 0;
		nOff = args.nOff  || 1;
		nFract = args.nFract  * obj.joint || 1;
		jOffset = args.jOffset || 0;
		offsetter = args.offsetter || 0;
		offsetter2 = args.offsetter2 || 0;
		offsetter3 = args.offsetter3 || 0;
		offsetter4 = args.offsetter4 || 0;
		sinScale = args.sinScale || 1;
		sinScaleMult = args.sinScaleMult || 1;
		sinOff = args.sinOff || 0;
		offScale = args.offScale || 0;
		offScaleMult = args.offScaleMult || 1;
		offScaleOff = args.offScaleOff || 0;
		rotator = args.rotator || false;


		GPU = args.GPU || false;

	}
	else{

		rx = ry = rz = tx = ty = tz = sinOff = 0;
		sc = scx = scy = scz = freq = jFreq = jFract = offScaleMult = 1;
		off = offMult = jOff = jMult = jOffset = offsetter = offsetter2 = sinScale = sinScaleMult = 
		nMult = nFreq = nOff = nFract = offScale = offScaleOff = offsetter4 = nObjOff = 0;
		GPU = rotator = false;
	}
	
	var objOffset = obj.offset;
	var objOffsetter = offsetter;
	
	if(offsetter2){
		objOffset = obj.offset2;
		objOffsetter = offsetter2;
	}
	if(offsetter3){
		objOffset = obj.parentJoint.joint;
		objOffsetter = offsetter3;
	}
	if(offsetter4){
		objOffset = obj.parentJoint.parentJoint.joint;
		objOffsetter = offsetter4;
	}

	if(jMult||jOff||jMult||offMult||offsetter||offsetter2||nMult){

		var off1 = jFract * Math.sin( (jOffset * objOffset) + jOff + ( ( jFreq * obj.joint + 1 ) ) ) * jMult;
		var off2 = Math.sin( off + ( freq * objOffset ) ) * offMult;
		var off3 = objOffset * objOffsetter;
		var off4 = nFract * (noise( nOff + ( nFreq * obj.joint + ((objOffset+1)*nObjOff)) ) * nMult);

		jointOff = off3 + off2 + off1 + off4;

	}
	else
		jointOff = 0;

	if(args.sinScale||args.sinScaleMult){
		scoff = ( Math.sin ( (obj.joint * sinScale) + sinOff ) ) * sinScaleMult;
	}
	else
		scoff = 0;

	if(args.offScale || args.offScaleOff || args.offScaleMult)
		sjoff = ( Math.sin ( (obj.parentJoint.joint * offScale) + offScaleOff ) ) * offScaleMult;
	else
		sjoff = 0;

	scalar = sjoff+scoff;

	if(GPU){
		obj.rotator = obj;
		obj.rotator.rotation = obj._rotation;
	}


	var rotOb = obj.rotator;
	if(rotator)rotOb = obj;


	if(args.rx != undefined) rotOb.rotation.x=rx+jointOff;
	if(args.ry != undefined) rotOb.rotation.y=ry+jointOff;
	if(args.rz != undefined) rotOb.rotation.z=rz+jointOff;
	
	if(args.tx != undefined)
		obj.rotator.position.x=tx+jointOff;
	if(args.ty != undefined) 
		obj.rotator.position.y=ty+jointOff;
	if(args.tz != undefined)
		obj.rotator.position.z=tz+jointOff;

	if(args.sc || args.scx || args.scy || args.scz);
		obj.rotator.scale = new THREE.Vector3(scx,scy,scz).addScalar(scalar);

	return obj;
}

TREE.prototype.setScale = function (sc){
	this.scale.x = sc;
	this.scale.y = sc;
	this.scale.z = sc;
}

function findTopParent(obj){

	var re;

	if(obj.parent.parent)
		re = findTopParent(obj.parent);
	else{
		re=obj;
	}
	return re;
}

var pi = Math.PI/2;
var pi2 = Math.PI;
var sin = Math.sin;
var cos = Math.cos;

sc1 = {
	setup:function(){},
	draw:function(){}
}


applyPreset = function(){

	var div = document.getElementById('user');
	var options = document.getElementById('select').options;
	var divAnim = document.getElementById('anim');
	
	switch(options.selectedIndex)
	{
	case 0:
		scriptSource = "sketches/sin_01.js";
		AceReplace();
		updateCode();
		break;
	case 1:
	 	scriptSource = "sketches/sin_06.js";
		AceReplace();
		updateCode();
		break;
	case 2:
	 	scriptSource = "sketches/examples/funhouseMirror.js";
		AceReplace();
		updateCode();
		break;
	case 3:
	 	scriptSource = "sketches/examples/spider.js";
		AceReplace();
		updateCode();
		break;
	case 4:
	 	scriptSource = "sketches/examples/swirlySun.js";
		AceReplace();
		updateCode();
		break;
	case 5:
	 	scriptSource = "sketches/examples/furryMoth.js";
		AceReplace();
		updateCode();
		break;
	case 6:
	 	scriptSource = "sketches/examples/dancingCentipede.js";
		AceReplace();
		updateCode();
		break;
	case 7:
	 	scriptSource = "sketches/examples/stickFigure.js";
		AceReplace();
		updateCode();
		break;
	case 8:
	 	scriptSource = "sketches/examples/starfish.js";
		AceReplace();
		updateCode();
		break;
	case 9:
	 	scriptSource = "sketches/examples/starfishAnimated.js";
		AceReplace();
		updateCode();
		break;
	case 10:
	 	scriptSource = "sketches/examples/fishStick.js";
		AceReplace();
		updateCode();
		break;
	case 11:
	 	scriptSource = "sketches/examples/fishStickSaveImgs.js";
		AceReplace();
		updateCode();
		break;
	case 12:
	 	scriptSource = "sketches/examples/basics.js";
		AceReplace();
		updateCode();
		break;
	case 13:
	 	scriptSource = "sketches/examples/simple.js";
		AceReplace();
		updateCode();
		break;
	case 14:
	 	scriptSource = "sketches/examples/talyaCreature.js";
		AceReplace();
		updateCode();
		break;
	case 15:
	 	scriptSource = "sketches/examples/metaBalls.js";
		AceReplace();
		updateCode();
		break;
	case 16:
	 	scriptSource = "sketches/examples/buttonTrees.js";
		AceReplace();
		updateCode();
		break;
	case 17:
	 	scriptSource = "sketches/examples/sierpinski.js";
		AceReplace();
		updateCode();
		break;
	case 18:
	 	scriptSource = "sketches/examples/micInput.js";
		AceReplace();
		updateCode();
		break;
	default:
	   div.value = '{"num":200,"scale":[2,8,2],"ss":1,"leaves":1,"divs":2,"rads":1,"leafss":[0.95,0.8,0.2],"leafDivs":[2,2,2],"fruit":true,"term":[0,1,2,3],"leafJoints":[10,15,10],"jScale1":[2,5,2],"anim":{"num":2.7}}';
	
	}
}

function noCursor(){
	document.body.style.cursor = 'url("assets/textures/dot.png"), auto';
}

function setupDepthEffect(skin){
	// useComposer = true;
	// useDepth = true;
	// composer = new THREE.EffectComposer( renderer );
	// composer.addPass( new THREE.RenderPass( scene, camera ) );

	// depthShader = THREE.ShaderLib[ "depthRGBA" ];
	// depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

	// if(!skin)
	// 	depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
	// else
	// 	depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, skinning:true } );

	// depthMaterial.blending = THREE.NoBlending;
	// depthTarget = new THREE.WebGLRenderTarget( window.innerWidth*2, window.innerHeight*2, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );

	// rgbEffect = new THREE.ShaderPass( THREE.depthNoiseShader );

	// rgbEffect.uniforms['tDepth'].value = depthTarget;
	// rgbEffect.uniforms[ 'amount' ].value = 0.0;//0015;
	// rgbEffect.uniforms[ 'offer' ].value = 0.0;//0015;

	// rgbEffect.renderToScreen = true;
	// composer.addPass( rgbEffect , "tDepth");


        useComposer = true;
        useDepth = true;
        composer = new THREE.EffectComposer( renderer );
        composer.addPass( new THREE.RenderPass( scene, camera ) );

        depthShader = THREE.ShaderLib[ "depthRGBA" ];
        depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
        if(!skin)
		depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms} );
        else
        depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms, skinning:true } );
        depthMaterial.blending = THREE.NoBlending;
        depthTarget = new THREE.WebGLRenderTarget( window.innerWidth*2, window.innerHeight*2, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
    
        rgbEffect = new THREE.ShaderPass( THREE.depthNoiseShader );
        
        rgbEffect.uniforms['tDepth'].value = depthTarget;
        rgbEffect.uniforms[ 'amount' ].value = 0.0;//0015;
        rgbEffect.uniforms[ 'offer' ].value = 0.0;//0015;

        rgbEffect.renderToScreen = true;
        composer.addPass( rgbEffect , "tDepth");        
}

function animateDepthEffect(args){

	if(!args) args = {};

	var offer = args.offer || count;
	var far = args.far || 0;
	var freq1 = args.freq1 || 256;
	var freq2 = args.freq2 || 256;
	var freq3 = args.freq3 || freq1;
	var freq4 = args.freq4 || freq2;
	var amt1 = args.amt1 || .01;
	var amt2 = args.amt2 || .01;
	var amt3 = args.amt3 || amt1;
	var amt4 = args.amt4 || amt2;

	rgbEffect.uniforms[ 'offer' ].value = offer;
	rgbEffect.uniforms[ 'far' ]  .value = far;
	rgbEffect.uniforms[ 'freq1' ].value = freq1;
	rgbEffect.uniforms[ 'freq2' ].value = freq2;
	rgbEffect.uniforms[ 'freq3' ].value = freq3;
	rgbEffect.uniforms[ 'freq4' ].value = freq4;
	rgbEffect.uniforms[ 'amt1' ] .value = amt1;
	rgbEffect.uniforms[ 'amt2' ] .value = amt2;
	rgbEffect.uniforms[ 'amt3' ] .value = amt3;
	rgbEffect.uniforms[ 'amt4' ] .value = amt4;
}

function findTopParent(obj){

	var re;

	console.log(obj);
	if(obj.parent.parent)
		re = findTopParent(obj.parent);
	else{
		re=obj;
	}
	return re;
}

function weave(wng,args){

    obj = new THREE.Object3D();

    if(!args) args={};

    var lay = args.layer || 1;
    var xy = args.xy || 0;
    var zero = args.zero || .1;

    var divx = args.divx || 50;
    var divy = args.divy || 10;

    var tubeArgs = {lengthSegs:2,width:1,minWidth:1.5};
    if(args.tubeArgs) tubeArgs = args.tubeArgs;

    // console.log(args);

    if(!args.off) args.off={};


    var array = [];

    var pnts;

    var tempTree = new TREE();

    if(wng.limbs)
        pnts = wng.worldPositionsArray(wng.reportLayers()[lay]);
    else
        pnts = wng;
   
    for(var i = 0 ; i < pnts.length-1 ; i++){
        var pnts2 = [];
        pnts2.push(pnts[i]);
        pnts2.push(pnts[i+1]);

        var ngeo = tempTree.nurbsishSurface(pnts2,divx,divy);
       
        surf = tempTree.removeZeroLength(ngeo[xy],zero);

        args.off.parentI = i;
      
        surf = tempTree.insertLerpVerts(surf,args.off);

        var tubeGeo = tempTree.tubes(surf,tubeArgs);
        
        obj.add(tubeGeo);

    }

    return obj;
}

/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FlyControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;
	if ( domElement ) this.domElement.setAttribute( 'tabindex', -1 );

	// API

	this.movementSpeed = 1.0;
	this.rollSpeed = 0.005;

	this.dragToLook = false;
	this.autoForward = false;

	// disable default target object behavior

	// internals

	this.tmpQuaternion = new THREE.Quaternion();

	this.mouseStatus = 0;

	this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
	this.moveVector = new THREE.Vector3( 0, 0, 0 );
	this.rotationVector = new THREE.Vector3( 0, 0, 0 );

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	this.keydown = function( event ) {

		if ( event.altKey ) {

			return;

		}

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 16: /* shift */ this.movementSpeedMultiplier = .1; break;

			case 87: /*W*/ this.moveState.forward = 1; break;
			case 83: /*S*/ this.moveState.back = 1; break;

			case 65: /*A*/ this.moveState.left = 1; break;
			case 68: /*D*/ this.moveState.right = 1; break;

			case 82: /*R*/ this.moveState.up = 1; break;
			case 70: /*F*/ this.moveState.down = 1; break;

			case 38: /*up*/ this.moveState.pitchUp = 1; break;
			case 40: /*down*/ this.moveState.pitchDown = 1; break;

			case 37: /*left*/ this.moveState.yawLeft = 1; break;
			case 39: /*right*/ this.moveState.yawRight = 1; break;

			case 81: /*Q*/ this.moveState.rollLeft = 1; break;
			case 69: /*E*/ this.moveState.rollRight = 1; break;

		}

		this.updateMovementVector();
		this.updateRotationVector();

	};

	this.keyup = function( event ) {

		switch( event.keyCode ) {

			case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

			case 87: /*W*/ this.moveState.forward = 0; break;
			case 83: /*S*/ this.moveState.back = 0; break;

			case 65: /*A*/ this.moveState.left = 0; break;
			case 68: /*D*/ this.moveState.right = 0; break;

			case 82: /*R*/ this.moveState.up = 0; break;
			case 70: /*F*/ this.moveState.down = 0; break;

			case 38: /*up*/ this.moveState.pitchUp = 0; break;
			case 40: /*down*/ this.moveState.pitchDown = 0; break;

			case 37: /*left*/ this.moveState.yawLeft = 0; break;
			case 39: /*right*/ this.moveState.yawRight = 0; break;

			case 81: /*Q*/ this.moveState.rollLeft = 0; break;
			case 69: /*E*/ this.moveState.rollRight = 0; break;

		}

		this.updateMovementVector();
		this.updateRotationVector();

	};

	this.mousedown = function( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.dragToLook ) {

			this.mouseStatus ++;

		} else {

			switch ( event.button ) {

				case 0: this.moveState.forward = 1; break;
				case 2: this.moveState.back = 1; break;

			}

			this.updateMovementVector();

		}

	};

	this.mousemove = function( event ) {

		if ( !this.dragToLook || this.mouseStatus > 0 ) {

			var container = this.getContainerDimensions();
			var halfWidth  = container.size[ 0 ] / 2;
			var halfHeight = container.size[ 1 ] / 2;

			this.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
			this.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

			this.updateRotationVector();

		}

	};

	this.mouseup = function( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.dragToLook ) {

			this.mouseStatus --;

			this.moveState.yawLeft = this.moveState.pitchDown = 0;

		} else {

			switch ( event.button ) {

				case 0: this.moveState.forward = 0; break;
				case 2: this.moveState.back = 0; break;

			}

			this.updateMovementVector();

		}

		this.updateRotationVector();

	};

	this.update = function( delta ) {

		var moveMult = delta * this.movementSpeed;
		var rotMult = delta * this.rollSpeed;

		this.object.translateX( this.moveVector.x * moveMult );
		this.object.translateY( this.moveVector.y * moveMult );
		this.object.translateZ( this.moveVector.z * moveMult );

		this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
		this.object.quaternion.multiply( this.tmpQuaternion );

		// expose the rotation vector for convenience
		this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );


	};

	this.updateMovementVector = function() {

		var forward = ( this.moveState.forward || ( this.autoForward && !this.moveState.back ) ) ? 1 : 0;

		this.moveVector.x = ( -this.moveState.left    + this.moveState.right );
		this.moveVector.y = ( -this.moveState.down    + this.moveState.up );
		this.moveVector.z = ( -forward + this.moveState.back );

		//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

	};

	this.updateRotationVector = function() {

		this.rotationVector.x = ( -this.moveState.pitchDown + this.moveState.pitchUp );
		this.rotationVector.y = ( -this.moveState.yawRight  + this.moveState.yawLeft );
		this.rotationVector.z = ( -this.moveState.rollRight + this.moveState.rollLeft );

		//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

	};

	this.getContainerDimensions = function() {

		if ( this.domElement != document ) {

			return {
				size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
			};

		} else {

			return {
				size	: [ window.innerWidth, window.innerHeight ],
				offset	: [ 0, 0 ]
			};

		}

	};

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, this.mousemove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.mousedown ), false );
	this.domElement.addEventListener( 'mouseup',   bind( this, this.mouseup ), false );

	window.addEventListener( 'keydown', bind( this, this.keydown ), false );
	window.addEventListener( 'keyup',   bind( this, this.keyup ), false );

	this.updateMovementVector();
	this.updateRotationVector();

};
/**
 * @author troffmo5 / http://github.com/troffmo5
 *
 * Effect to render the scene in stereo 3d side by side with lens distortion.
 * It is written to be used with the Oculus Rift (http://www.oculusvr.com/) but
 * it works also with other HMD using the same technology
 */

THREE.OculusRiftEffect = function ( renderer, options ) {
	// worldFactor indicates how many units is 1 meter
	var worldFactor = (options && options.worldFactor) ? options.worldFactor: 1.0;

	// Specific HMD parameters
	var HMD = (options && options.HMD) ? options.HMD: {
		// Parameters from the Oculus Rift DK1
		hResolution: 1280,
		vResolution: 800,
		hScreenSize: 0.14976,
		vScreenSize: 0.0936,
		interpupillaryDistance: 0.064,
		lensSeparationDistance: 0.064,
		eyeToScreenDistance: 0.041,
		distortionK : [1.0, 0.22, 0.24, 0.0],
		chromaAbParameter: [ 0.996, -0.004, 1.014, 0.0]
	};

	// Perspective camera
	var pCamera = new THREE.PerspectiveCamera();
	pCamera.matrixAutoUpdate = false;
	pCamera.target = new THREE.Vector3();

	// Orthographic camera
	var oCamera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
	oCamera.position.z = 1;

	// pre-render hooks
	this.preLeftRender = function() {};
	this.preRightRender = function() {};

	renderer.autoClear = false;
	var emptyColor = new THREE.Color("black");

	// Render target
	var RTParams = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };
	var renderTarget = new THREE.WebGLRenderTarget( 640, 800, RTParams );
	var RTMaterial = new THREE.ShaderMaterial( {
		uniforms: {
			"texid": { type: "t", value: renderTarget },
			"n": { type: "f", value: 0 },
			"scale": { type: "v2", value: new THREE.Vector2(1.0,1.0) },
			"scaleIn": { type: "v2", value: new THREE.Vector2(1.0,1.0) },
			"lensCenter": { type: "v2", value: new THREE.Vector2(0.0,0.0) },
			"hmdWarpParam": { type: "v4", value: new THREE.Vector4(1.0,0.0,0.0,0.0) },
			"chromAbParam": { type: "v4", value: new THREE.Vector4(1.0,0.0,0.0,0.0) }
		},
		vertexShader: [
			"varying vec2 vUv;",
			"void main() {",
			" vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"}"
		].join("\n"),

		fragmentShader: [
			"uniform vec2 scale;",
			"uniform vec2 scaleIn;",
			"uniform vec2 lensCenter;",
			"uniform vec4 hmdWarpParam;",
			'uniform vec4 chromAbParam;',
			"uniform sampler2D texid;",
			"varying vec2 vUv;",
			"uniform float n;",
			"float rand(vec2 co){return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453 +n);}",

			"void main()",
			"{",
			"  vec2 uv = (vec2(vUv.x+(rand(vUv)*.003),vUv.y+(.1+rand(vUv)*.003))*2.0)-1.0;", // range from [0,1] to [-1,1]
			"  vec2 theta = (uv-lensCenter)*scaleIn;",
			"  float rSq = theta.x*theta.x + theta.y*theta.y;",
			"  vec2 rvector = theta*(hmdWarpParam.x + hmdWarpParam.y*rSq + hmdWarpParam.z*rSq*rSq + hmdWarpParam.w*rSq*rSq*rSq);",
			'  vec2 rBlue = rvector;',// * (chromAbParam.z + chromAbParam.w * rSq);',
			"  vec2 tcBlue = (lensCenter + scale * rBlue);",
			"  tcBlue = (tcBlue+1.0)/2.0;", // range from [-1,1] to [0,1]
			"  if (any(bvec2(clamp(tcBlue, vec2(0.0,0.0), vec2(1.0,1.0))-tcBlue))) {",
			"    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",
			"    return;}",
			"  vec2 tcGreen = lensCenter + scale * rvector;",
			"  tcGreen = (tcGreen+1.0)/2.0;", // range from [-1,1] to [0,1]
			"  vec2 rRed = rvector /* (chromAbParam.x + chromAbParam.y * rSq)*/;",
			"  vec2 tcRed = lensCenter + scale * rRed;",
			"  tcRed = (tcRed+1.0)/2.0;", // range from [-1,1] to [0,1]

			"  gl_FragColor = texture2D(texid, tcRed);",
			"}"
		].join("\n")
	} );

	var mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), RTMaterial );

	// Final scene
	var finalScene = new THREE.Scene();
	finalScene.add( oCamera );
	finalScene.add( mesh );

    var left = {}, right = {};
    var distScale = 1.0;
	this.setHMD = function(v) {
		HMD = v;
		// Compute aspect ratio and FOV
		var aspect = HMD.hResolution / (2*HMD.vResolution);

		// Fov is normally computed with:
		//   THREE.Math.radToDeg( 2*Math.atan2(HMD.vScreenSize,2*HMD.eyeToScreenDistance) );
		// But with lens distortion it is increased (see Oculus SDK Documentation)
		var r = -1.0 - (4 * (HMD.hScreenSize/4 - HMD.lensSeparationDistance/2) / HMD.hScreenSize);
		distScale = (HMD.distortionK[0] + HMD.distortionK[1] * Math.pow(r,2) + HMD.distortionK[2] * Math.pow(r,4) + HMD.distortionK[3] * Math.pow(r,6));
		var fov = THREE.Math.radToDeg(2*Math.atan2(HMD.vScreenSize*distScale, 2*HMD.eyeToScreenDistance));

		// Compute camera projection matrices
		var proj = (new THREE.Matrix4()).makePerspective( fov, aspect, 0.3, 10000 );
		var h = 4 * (HMD.hScreenSize/4 - HMD.interpupillaryDistance/2) / HMD.hScreenSize;
		left.proj = ((new THREE.Matrix4()).makeTranslation( h, 0.0, 0.0 )).multiply(proj);
		right.proj = ((new THREE.Matrix4()).makeTranslation( -h, 0.0, 0.0 )).multiply(proj);

		// Compute camera transformation matrices
		left.tranform = (new THREE.Matrix4()).makeTranslation( -worldFactor * HMD.interpupillaryDistance/2, 0.0, 0.0 );
		right.tranform = (new THREE.Matrix4()).makeTranslation( worldFactor * HMD.interpupillaryDistance/2, 0.0, 0.0 );

		// Compute Viewport
		left.viewport = [0, 0, HMD.hResolution/2, HMD.vResolution];
		right.viewport = [HMD.hResolution/2, 0, HMD.hResolution/2, HMD.vResolution];

		// Distortion shader parameters
		var lensShift = 4 * (HMD.hScreenSize/4 - HMD.lensSeparationDistance/2) / HMD.hScreenSize;
		left.lensCenter = new THREE.Vector2(lensShift, 0.0);
		right.lensCenter = new THREE.Vector2(-lensShift, 0.0);

		RTMaterial.uniforms['hmdWarpParam'].value = new THREE.Vector4(HMD.distortionK[0], HMD.distortionK[1], HMD.distortionK[2], HMD.distortionK[3]);
		RTMaterial.uniforms['chromAbParam'].value = new THREE.Vector4(HMD.chromaAbParameter[0], HMD.chromaAbParameter[1], HMD.chromaAbParameter[2], HMD.chromaAbParameter[3]);
		RTMaterial.uniforms['scaleIn'].value = new THREE.Vector2(1.0,1.0/aspect);
		RTMaterial.uniforms['scale'].value = new THREE.Vector2(1.0/distScale, 1.0*aspect/distScale);
		// Create render target
		if ( renderTarget ) renderTarget.dispose();
		renderTarget = new THREE.WebGLRenderTarget( HMD.hResolution*distScale/2, HMD.vResolution*distScale, RTParams );
		RTMaterial.uniforms[ "texid" ].value = renderTarget;

	}	
	this.getHMD = function() {return HMD};

	this.setHMD(HMD);	

	this.setSize = function ( width, height ) {
		left.viewport = [width/2 - HMD.hResolution/2, height/2 - HMD.vResolution/2, HMD.hResolution/2, HMD.vResolution];
		right.viewport = [width/2, height/2 - HMD.vResolution/2, HMD.hResolution/2, HMD.vResolution];

		renderer.setSize( width, height );
	};

	this.render = function ( scene, camera ) {
		var cc = renderer.getClearColor().clone();

		// Clear
		renderer.setClearColor(emptyColor);
		renderer.clear();
		renderer.setClearColor(cc);

		// camera parameters
		if (camera.matrixAutoUpdate) camera.updateMatrix();

		// Render left
		this.preLeftRender();

		pCamera.projectionMatrix.copy(left.proj);

		pCamera.matrix.copy(camera.matrix).multiply(left.tranform);
		pCamera.matrixWorldNeedsUpdate = true;

		renderer.setViewport(left.viewport[0], left.viewport[1], left.viewport[2], left.viewport[3]);

		RTMaterial.uniforms['lensCenter'].value = left.lensCenter;
		renderer.render( scene, pCamera, renderTarget, true );

		renderer.render( finalScene, oCamera );

		// Render right
		this.preRightRender();

		pCamera.projectionMatrix.copy(right.proj);

		pCamera.matrix.copy(camera.matrix).multiply(right.tranform);
		pCamera.matrixWorldNeedsUpdate = true;

		renderer.setViewport(right.viewport[0], right.viewport[1], right.viewport[2], right.viewport[3]);

		RTMaterial.uniforms['lensCenter'].value = right.lensCenter;
		RTMaterial.uniforms['n'].value += .333355;


		renderer.render( scene, pCamera, renderTarget, true );
		renderer.render( finalScene, oCamera );

	};

	this.dispose = function() {
		if ( RTMaterial ) {
			RTMaterial.dispose();
		}
		if ( renderTarget ) {
			renderTarget.dispose();
		}
	};

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DotScreenShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tSize":    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
		"center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle":    { type: "f", value: 1.57 },
		"scale":    { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec2 center;",
		"uniform float angle;",
		"uniform float scale;",
		"uniform vec2 tSize;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float pattern() {",

			"float s = sin( angle ), c = cos( angle );",

			"vec2 tex = vUv * tSize - center;",
			"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

			"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

		"}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",

			"float average = ( color.r + color.g + color.b ) / 3.0;",

			"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

		"}"

	].join("\n")
};
/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.RGBShiftShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"amount":   { type: "f", value: 0.005 },
		"angle":    { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float amount;",
		"uniform float angle;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 offset = amount * vec2( cos(angle), sin(angle));",
			"vec4 cr = texture2D(tDiffuse, vUv + offset);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

		"}"

	].join("\n")

};

THREE.depthNoiseShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tDepth": { type: "t", value: null },

		"amount":   { type: "f", value: 0.005 },
		"angle":    { type: "f", value: 0.0 },
		"offer":    { type: "f", value: 0.0 },

		"near":   { type: "f", value: 0.005 },
		"far":   { type: "f", value: 100.0 },

		"freq1":   { type: "f", value: 256.0 },
		"freq2":   { type: "f", value: 256.0 },
		"freq3":   { type: "f", value: 256.0 },
		"freq4":   { type: "f", value: 256.0 },

		"amt1":   { type: "f", value: 0.01 },
		"amt2":   { type: "f", value: 0.01 },
		"amt3":   { type: "f", value: 0.01 },
		"amt4":   { type: "f", value: 0.01 },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

	"vec3 mod289(vec3 x) {",
	"  return x - floor(x * (1.0 / 289.0)) * 289.0;",
	"}",

	"vec2 mod289(vec2 x) {",
	"  return x - floor(x * (1.0 / 289.0)) * 289.0;",
	"}",

	"vec3 permute(vec3 x) {",
	"  return mod289(((x*34.0)+1.0)*x);",
	"}",

	"float snoise(vec2 v)",
	"  {",
	"  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0",
	"                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)",
	"                     -0.577350269189626,  // -1.0 + 2.0 * C.x",
	"                      0.024390243902439); // 1.0 / 41.0",
	
	"  vec2 i  = floor(v + dot(v, C.yy) );",
	"  vec2 x0 = v -   i + dot(i, C.xx);",
		
	"  vec2 i1;",
	"  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0",
	"  //i1.y = 1.0 - i1.x;",
	"  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
	"  // x0 = x0 - 0.0 + 0.0 * C.xx ;",
	"  // x1 = x0 - i1 + 1.0 * C.xx ;",
	"  // x2 = x0 - 1.0 + 2.0 * C.xx ;",
	"  vec4 x12 = x0.xyxy + C.xxzz;",
	"  x12.xy -= i1;",

		
	"  i = mod289(i); // Avoid truncation effects in permutation",
	"  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
	"		+ i.x + vec3(0.0, i1.x, 1.0 ));",

	"  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
	"  m = m*m ;",
	"  m = m*m ;",

		"// Gradients: 41 points uniformly over a line, mapped onto a diamond.",
	"// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)",

		"  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
	"  vec3 h = abs(x) - 0.5;",
	"  vec3 ox = floor(x + 0.5);",
	"  vec3 a0 = x - ox;",

	"// Approximation of: m *= inversesqrt( a0*a0 + h*h );",
	"  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",

		"// Compute final noise value at P",
	"  vec3 g;",
	"  g.x  = a0.x  * x0.x  + h.x  * x0.y;",
	"  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
	"  return 130.0 * dot(m, g);",
	"}",

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",

		"uniform float amount;",
		"uniform float angle;",
		"uniform float offer;",
		"uniform float near;",
		"uniform float far;",
		"uniform float freq1;",
		"uniform float freq2;",
		"uniform float freq3;",
		"uniform float freq4;",
		"uniform float amt1;",
		"uniform float amt2;",
		"uniform float amt3;",
		"uniform float amt4;",

		"varying vec2 vUv;",

		"float linarize(float depth, float zfar, float znear)",
		"{",
			"return -zfar * znear / (depth * (zfar - znear) - zfar);",
		"}",

		"float unpackDepth( const in vec4 rgba_depth ) {",

			"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
			"float depth = dot( rgba_depth, bit_shift );",
			"return depth;",

		"}",

		"float rand(vec2 co){return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);}",
		"vec3 gamma(vec3 c, float p1,float p2,float p3,float a) { return vec3(pow(c.x,(1.0+p1)*a),pow(c.y,(1.0+p2)*a),pow(c.z,(1.0+p3)*a)); }",


		// "float smoothstep(float edge0, float edge1, float value) {",
		// "  float t = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);",
		// "  return t * t * (3.0 - 2.0 * t);",
		// "}",

		"void main() {",

			//vignette
			"float dist = distance( vUv, vec2( 0.5 ) );",
			"vec2 offset = vec2( ((1.+sin(vUv.x*10.))/30.));",

			//setup depth
			"vec4 cr2 = texture2D(tDepth, vUv);",
			"float zee = unpackDepth(cr2);",
			"float lin = clamp(linarize(zee,100.,near),0.,3.14);",
			"float remap = abs(cos(lin+far))*5.;",//+((cr2.a*-1.)+1.0);",

			//distort UVs for depth
			"float xOff = vUv.x + ( snoise ( ( vec2 ( vUv.x + offer , vUv.y + offer ) * freq1 ) ) * -remap * amt1 );",
			"float yOff = vUv.y + ( snoise ( ( vec2 ( 1.5 + vUv.x + offer , .5 + vUv.y + offer ) * freq2 ) ) * -remap * amt2 );",

			//make and color correct depth
			"vec4 ucr3 = texture2D(tDepth, vec2( xOff , yOff  ));",
			"float uzee = unpackDepth(ucr3);",
			"float ulin = clamp(linarize(uzee,100.,near),0.,3.14);",
			"float uremap = abs(cos(ulin+far))*5.;",//+((cr2.a*-1.)+1.0);",
			"float ucremap = clamp(remap*remap,0.0,1.0);",
			// "float unoise = clamp(ucremap*ucremap,0.0,1.0);",

			//use distorted depth to distort color
			"float uxOff = vUv.x + ( snoise ( ( vec2 ( vUv.x + offer , vUv.y + offer ) * freq3 ) ) * -uremap*ucremap * amt3 );",
			"float uyOff = vUv.y + ( snoise ( ( vec2 ( 1.5 + vUv.x + offer , .5 + vUv.y + offer ) * freq4 ) ) * -uremap*ucremap * amt4 );",

			"vec4 cr3 = texture2D(tDiffuse, vec2( uxOff , uyOff  ));",

			// "vec2 sn = vec2 ( 1.0);//snoise ( vec2 ( 12.0 * vUv.x + offer, vUv.y + offer ) * 256.0 ) );",
			"float vn = rand(vec2 ( 10.*vUv.x+offer,10.*vUv.y+offer));",
			"vec2 sn = vec2(vn);//snoise ( vec2 ( 12.0 * vUv.x + offer, vUv.y + offer ) * 256.0 ) );",

			"vec4 only = vec4(sn.x+1.0,sn.y+0.8,sn.x+.9,0.65);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			// "cr.rgb *= smoothstep( 0.8, offset.x * 0.799, dist *( .5 + 1.0 ) );",
			
			//"cr3.rgb *= smoothstep( 0.8, offset.x * 0.799, dist *( .5 + 1.0 ) );",

			// "float zee = linarize(cr2.z,1.0,10000.0);",
			// "float zee = unpackDepth(cr2);",
			// "float lin = linarize(zee,100.0,.001);",

			// "gl_FragColor = (only*.1) + vec4(vec3(cr.x,cr.y,cr.z), cga.a);",
			// "gl_FragColor = vec4(vec3((ucremap*uremap)),1.0);",
			// "gl_FragColor = (only*.1) + vec4(gamma(vec3(cr3.x,cr3.y,cr3.z),1.0,2.0,2.5,dist*2.0), cga.a);",
			"gl_FragColor = (only*.1) + vec4(vec3(cr3.x,cr3.y,cr3.z), cga.a);",

			// "vec4 color = (only*.01) + vec4(vec3(cr3.x,cr3.y,cr3.z), cga.a);",
			// "gl_FragColor = vec4(gamma(color.xyz,1.0,.5,.75,dist*2.0),1.0);",

			// "gl_FragColor = (only*.1) + cr3;",


		"}"

	].join("\n")

};

THREE.testShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tDepth": { type: "t", value: null },

		"amount":   { type: "f", value: 0.005 },
		"angle":    { type: "f", value: 0.0 },
		"offer":    { type: "f", value: 0.0 },

		"near":   { type: "f", value: 0.005 },
		"far":   { type: "f", value: 100.0 },

		"freq1":   { type: "f", value: 256.0 },
		"freq2":   { type: "f", value: 256.0 },
		"freq3":   { type: "f", value: 256.0 },
		"freq4":   { type: "f", value: 256.0 },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [


	"vec3 mod289(vec3 x) {",
	"  return x - floor(x * (1.0 / 289.0)) * 289.0;",
	"}",

	"vec2 mod289(vec2 x) {",
	"  return x - floor(x * (1.0 / 289.0)) * 289.0;",
	"}",

	"vec3 permute(vec3 x) {",
	"  return mod289(((x*34.0)+1.0)*x);",
	"}",

	"float snoise(vec2 v)",
	"  {",
	"  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0",
	"                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)",
	"                     -0.577350269189626,  // -1.0 + 2.0 * C.x",
	"                      0.024390243902439); // 1.0 / 41.0",
	
	"  vec2 i  = floor(v + dot(v, C.yy) );",
	"  vec2 x0 = v -   i + dot(i, C.xx);",
		
	"  vec2 i1;",
	"  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0",
	"  //i1.y = 1.0 - i1.x;",
	"  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
	"  // x0 = x0 - 0.0 + 0.0 * C.xx ;",
	"  // x1 = x0 - i1 + 1.0 * C.xx ;",
	"  // x2 = x0 - 1.0 + 2.0 * C.xx ;",
	"  vec4 x12 = x0.xyxy + C.xxzz;",
	"  x12.xy -= i1;",

		
	"  i = mod289(i); // Avoid truncation effects in permutation",
	"  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
	"		+ i.x + vec3(0.0, i1.x, 1.0 ));",

	"  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
	"  m = m*m ;",
	"  m = m*m ;",

		"// Gradients: 41 points uniformly over a line, mapped onto a diamond.",
	"// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)",

		"  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
	"  vec3 h = abs(x) - 0.5;",
	"  vec3 ox = floor(x + 0.5);",
	"  vec3 a0 = x - ox;",

	"// Approximation of: m *= inversesqrt( a0*a0 + h*h );",
	"  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",

		"// Compute final noise value at P",
	"  vec3 g;",
	"  g.x  = a0.x  * x0.x  + h.x  * x0.y;",
	"  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
	"  return 130.0 * dot(m, g);",
	"}",

		"uniform sampler2D tDiffuse;",
				"uniform sampler2D tDepth;",

		"uniform float amount;",
		"uniform float angle;",
		"uniform float offer;",
		"uniform float near;",
		"uniform float far;",
		"uniform float freq1;",
		"uniform float freq2;",
		"uniform float freq3;",
		"uniform float freq4;",

		"varying vec2 vUv;",

		"float linarize(float depth, float zfar, float znear)",
		"{",
			"return -zfar * znear / (depth * (zfar - znear) - zfar);",
		"}",

		"float unpackDepth( const in vec4 rgba_depth ) {",

			"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
			"float depth = dot( rgba_depth, bit_shift );",
			"return depth;",

		"}",


		// "float smoothstep(float edge0, float edge1, float value) {",
		// "  float t = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);",
		// "  return t * t * (3.0 - 2.0 * t);",
		// "}",

		"void main() {",

			// "vec4 color = texture2D( tDiffuse, vUv );",
			"float dist = distance( vUv, vec2( 0.5 ) );",
			// "gl_FragColor = color;",

			"vec2 offset = vec2( ((1.+sin(vUv.x*10.))/30.));",
			"float st = (smoothstep( 0.8, offset.x * 0.799, dist *( .3 + .3 ) )-1.0)*-12.5;",

			"vec4 cr = texture2D(tDiffuse, vUv + (snoise((vec2(vUv.x+offer,vUv.y+offer)*256.0))*vec2(.001+sin((offer*3.333)+vUv.x*120.)*.0015*st*5.,.005+cos(vUv*180.)*st*.0015)));",

			"vec4 cr2 = texture2D(tDepth, vUv); //+ (snoise((vec2(vUv.x+offer,vUv.y+offer)*256.0))*vec2(.001+sin((offer*3.333)+vUv.x*120.)*.0015*st*5.,.005+cos(vUv*180.)*st*.0015)));",

			"float zee = unpackDepth(cr2);",
			"float lin = clamp(linarize(zee,100.,near),0.,3.14);",
			"float remap = abs(cos(lin+far))*5.;",//+((cr2.a*-1.)+1.0);",

			"float xOff = vUv.x + ( snoise ( ( vec2 ( vUv.x + offer , vUv.y + offer ) * freq1 ) ) * -remap *.01 );",
			"float yOff = vUv.y + ( snoise ( ( vec2 ( 1.5 + vUv.x + offer , .5 + vUv.y + offer ) * freq2 ) ) * -remap *.01 );",

			"vec4 ucr3 = texture2D(tDepth, vec2( xOff , yOff  ));",
			"float uzee = unpackDepth(ucr3);",
			"float ulin = clamp(linarize(uzee,100.,near),0.,3.14);",
			"float uremap = abs(cos(ulin+far))*5.;",//+((cr2.a*-1.)+1.0);",

			"float ucremap = clamp(remap*remap,0.0,1.0);",
			"float unoise = clamp(ucremap*ucremap,0.0,1.0);",

			"float uxOff = vUv.x + ( snoise ( ( vec2 ( vUv.x + offer , vUv.y + offer ) * freq3 ) ) * -uremap*ucremap *.01 );",
			"float uyOff = vUv.y + ( snoise ( ( vec2 ( 1.5 + vUv.x + offer , .5 + vUv.y + offer ) * freq4 ) ) * -uremap*ucremap *.01 );",

			"vec4 cr3 = texture2D(tDiffuse, vec2( uxOff , uyOff  ));",

			"vec2 sn = vec2 ( snoise ( vec2 ( 12.0 * vUv.x + offer, vUv.y + offer ) * 256.0 ) );",
			"vec4 only = vec4(sn.x+1.0,sn.y+0.8,sn.x+.9,0.65);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			"cr.rgb *= smoothstep( 0.8, offset.x * 0.799, dist *( .5 + 1.0 ) );",
			
			"cr3.rgb *= smoothstep( 0.8, offset.x * 0.799, dist *( .5 + 1.0 ) );",

			// "float zee = linarize(cr2.z,1.0,10000.0);",
			// "float zee = unpackDepth(cr2);",
			// "float lin = linarize(zee,100.0,.001);",

			// "gl_FragColor = (only*.1) + vec4(vec3(cr.x,cr.y,cr.z), cga.a);",
			// "gl_FragColor = vec4(vec3((ucremap*uremap)),1.0);",
			"gl_FragColor = (only*.1) + vec4(vec3(cr3.x,cr3.y,cr3.z), cga.a);",

			// "gl_FragColor = (only*.1) + cr3;",


		"}"

	].join("\n")

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join("\n")

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

};
function setScale(obj,val){

	obj.scale = new THREE.Vector3(val,val,val);

}
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		this.scene.overrideMaterial = null;

	}

};
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		// don't update color or depth

		context.colorMask( false, false, false, false );
		context.depthMask( false );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		context.enable( context.STENCIL_TEST );
		context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		context.clearStencil( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// re-enable update of color and depth

		context.colorMask( true, true, true, true );
		context.depthMask( true );

		// only render where stencil is set to 1

		context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

	}

};


THREE.ClearMaskPass = function () {

	this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		context.disable( context.STENCIL_TEST );

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var width = window.innerWidth*2 || 1;
		var height = window.innerHeight*2 || 1;
		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

		renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( !pass.enabled ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( pass instanceof THREE.MaskPass ) {

				maskActive = true;

			} else if ( pass instanceof THREE.ClearMaskPass ) {

				maskActive = false;

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			renderTarget = this.renderTarget1.clone();

			renderTarget.width = window.innerWidth;
			renderTarget.height = window.innerHeight;

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		var renderTarget = this.renderTarget1.clone();

		renderTarget.width = width;
		renderTarget.height = height;

		this.reset( renderTarget );

	}

};

var replacer = function (stack, undefined, r, i) {
  // a WebReflection hint to avoid recursion
  return function replacer(key, value) {
    // this happens only first iteration
    // key is empty, and value is the object
    if (key === "") {
      // put the value in the stack
      stack = [value];
      // and reset the r
      r = 0;
      return value;
    }
    switch(typeof value) {
      case "function":
        // not allowed in JSON protocol
        // let's return some info in any case
        return "".concat(
          "function ",
          value.name || "anonymous",
          "(",
            Array(value.length + 1).join(",arg").slice(1),
          "){}"
        );
      // is this a primitive value ?
      case "boolean":
      case "number":
      case "string":
        // primitives cannot have properties
        // so these are safe to parse
        return value;
      default:
        // only null does not need to be stored
        // for all objects check recursion first
        // hopefully 255 calls are enough ...
        if (!value || !replacer.filter(value) || 255 < ++r) return undefined;
        i = stack.indexOf(value);
        // all objects not already parsed
        if (i < 0) return stack.push(value) && value;
        // all others are duplicated or cyclic
        // mark them with index
        return "*R" + i;
    }
  };
}();

// reusable to filter some undesired object
// as example HTML node
replacer.filter = function (value) {
  // i.e. return !(value instanceof Node)
  // to ignore nodes
  return value;
};
function connect( child, scene, parent ) {

		var matrixWorldInverse = new THREE.Matrix4();

		parent.parent.updateMatrixWorld();

		// matrixWorldInverse.getInverse( parent.parent.matrixWorld );

		console.log(matrixWorldInverse);
		child.applyMatrix( matrixWorldInverse );

		scene.remove( child );
		parent.add( child );

	}

var Debug = function(){

	//instantiate a new debugger: 
	//var d = new Debug();
	//then use d.print(variable); or d.print(variable + " " + variable2)
	//or d.print(["variable",variable,"variable2",variable2]);

	this.debug=true;
	this.memory = [];
	this.overflow = 1e4;
	this.flow = 0;

	this.printer = function(v){

		var st = "";
		this.flow++;

		if(this.flow>this.overflow){
			this.debug=false;
		}

		if(v instanceof Object){
			for (var i = 0 ; i < v.length ; i++){
				st+=v[i];
				st+="|";
			}
		}
		else{
			st+=v;
		}

		this.memory.push(st);

		if(this.memory.length>2)
			this.memory.shift();

		return st;
	}

	this.log = function(v){
		var st = this.printer(v);
		this.output(v);
	}

	this.print = function(v){
		var st = this.printer(v);
		this.output(st);
	}

	this.output = function(st){
		if(this.debug){
			if(st!=this.memory[0]||this.memory.length<2)
				console.log(st);
		}
	}
}
function videoSetup(){

	video = document.createElement('video');
	video.width = 320;
	video.height = 240;
	video.autoplay = true;
	video.loop = true;

	//make it cross browser
	window.URL = window.URL || window.webkitURL;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	//get webcam
	navigator.getUserMedia({
		video: true
	}, function(stream) {
		//on webcam enabled
		video.src = window.URL.createObjectURL(stream);
		prompt.style.display = 'none';
		title.style.display = 'inline';
		container.style.display = 'inline';
		gui.domElement.style.display = 'inline';
	}, function(error) {
		prompt.innerHTML = 'Unable to capture WebCam. Please reload the page.';
	});

	videoTexture = new THREE.Texture(video);
}

function videoAnimate(){
	if (video.readyState === video.HAVE_ENOUGH_DATA) {
		videoTexture.needsUpdate = true;
	}
}

function zero(){
	return new THREE.Vector3(0,0,0);
}

var Average = function(s) {

	/*
	var avg = new Average(10);
	avg.avg(valueToAverage);
	*/

	this.size=s;
	this.arr = [];

	this.avg = function(value){
		this.arr.push(value);

		var returnVal = 0;
		for(var i = 0 ; i < this.arr.length ; i++){
			returnVal+=this.arr[i];
		}
		if(this.arr.length>this.size){
			this.arr.shift();
		}
		return returnVal/this.arr.length;
	}
}

 var noise = function(ix, iy, iz) {

 		var x = ix || 0;
 		var y = iy || 0;
 		var z = iz || 0;
      var X = Math.floor(x)&255, Y = Math.floor(y)&255, Z = Math.floor(z)&255;
      x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
      var u = fade(x), v = fade(y), w = fade(z);
      var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
          B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,
      return lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                     grad(p[BA  ], x-1, y  , z   )), // BLENDED
                             lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                     grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                     lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                     grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                             lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                     grad(p[BB+1], x-1, y-1, z-1 ))));
   };
   function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); };
   function lerp(t, a, b) { return a + t * (b - a); };
   function grad(hash, x, y, z) {
      var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
      var u = h<8 ? x : y,                    // INTO 12 GRADIENT DIRECTIONS.
          v = h<4 ? y : h==12||h==14 ? x : z;
      return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
   };
   var p = [ 151,160,137,91,90,15,
   131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
   190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
   88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
   77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
   102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
   135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
   5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
   223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
   129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
   251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
   49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
   138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180 ];
   for (var i=0; i < 256 ; i++) p.push(p[i]);

function sphere(size,divs){
	var div = divs || 6;
	return(new THREE.Mesh(new THREE.SphereGeometry(size,divs,divs),new THREE.MeshLambertMaterial({color:0xffffff})));
}
function blackSphere(size,divs){
	var div = divs || 6;
	return(new THREE.Mesh(new THREE.SphereGeometry(size,divs,divs),new THREE.MeshLambertMaterial({color:0x222222})));
}

function cube(size){
	return(new THREE.Mesh(new THREE.BoxGeometry(size,size,size),new THREE.MeshLambertMaterial({color:0xffffff})));
}

truncateDecimals = function (number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

THREE.saveGeometryToObj4 = function (geo,nums,scalar) {

	geo.updateMatrixWorld();

	var num = parseInt(nums);

	var s = '';
	for (i = 0; i < geo.geometry.vertices.length; i++) {

		var vector = new THREE.Vector3( geo.geometry.vertices[i].x, geo.geometry.vertices[i].y, geo.geometry.vertices[i].z );
		
		geo.matrixWorld.multiplyVector3( vector );
		vector.multiplyScalar(scalar);
		//vector.applyProjection( matrix )
		
		s+= 'v '+(vector.x) + ' ' +
		vector.y + ' '+
		vector.z + '\n';
	}

	for (i = 0; i < geo.geometry.faces.length; i++) {

		s+= 'f '+ (geo.geometry.faces[i].a+1+num) + ' ' +
		(geo.geometry.faces[i].b+1+num) + ' '+
		(geo.geometry.faces[i].c+1+num);

		if (geo.geometry.faces[i].d!==undefined) {
			s+= ' '+ (geo.geometry.faces[i].d+1+num);
		}
		s+= '\n';
	}

	return s;
}

saveGeometryToObj = function (geo,nums) {

	geo.updateMatrixWorld();

	var num = parseInt(nums);

	var s = '';
	for (i = 0; i < geo.geometry.vertices.length; i++) {

		var vector = new THREE.Vector3( geo.geometry.vertices[i].x, geo.geometry.vertices[i].y, geo.geometry.vertices[i].z );
		geo.matrixWorld.multiplyVector3( vector );
		
		//vector.applyProjection( matrix )
		
	    s+= 'v '+(vector.x) + ' ' +
	    vector.y + ' '+
	    vector.z + '</br>';
	}

	for (i = 0; i < geo.geometry.faces.length; i++) {

	    s+= 'f '+ (geo.geometry.faces[i].a+1+num) + ' ' +
	    (geo.geometry.faces[i].b+1+num) + ' '+
	    (geo.geometry.faces[i].c+1+num);

	    if (geo.geometry.faces[i].d!==undefined) {
	        s+= ' '+ (geo.geometry.faces[i].d+1+num);
	    }
	    s+= '</br>';
	}

	return s;
}

function saver(name) {

	var scaleOut = outputScale || 1;

	var name = name || "tree.obj";

	var mshArray = [];

	var returnerArray = [];

	scene.traverse(function(obj){
		if(obj.geometry){
			obj.updateMatrixWorld();
			if(obj.geometry.vertices.length>0){
				returnerArray.push(obj);
			}
		}
	});

	mshArray = returnerArray;

	// alert("saving!");
	var j = 0;
	var output = "";
	console.log(mshArray);
	
	for (var i = 0 ; i < mshArray.length ; i++){
		

		// if(i == mshArray.length-2 || i == mshArray.length-3) i++;
		// else{
			output += THREE.saveGeometryToObj4(mshArray[i],j,(.0003*scaleOut));
			j += mshArray[i].geometry.vertices.length;
		// }
	}
	
	output.replace("undefined","");
	// document.write(output);
	// console.log(output);
	// alert("saved!");
	var blob = new Blob([output], {type: "text/plain;charset=ANSI"});
	saveAs(blob, name);
}

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / https://github.com/WestLangley
 */

THREE.OrbitControls = function ( object, domElement ) {

	THREE.EventDispatcher.call( this );

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.center = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE : -1, ROTATE : 0, ZOOM : 1 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateRight = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta += angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	this.rotateDown = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta += angle;

	};

	this.zoomIn = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale /= zoomScale;

	};

	this.zoomOut = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale *= zoomScale;

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.center )

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.center ).add( offset );

		this.object.lookAt( this.center );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			// this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.userZoomSpeed );

	}

	function onMouseDown( event ) {

		if ( !scope.userRotate ) return;

		event.preventDefault();

		if ( event.button === 0 || event.button === 2 ) {

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

			zoomStart.set( event.clientX, event.clientY );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.ZOOM ) {

			zoomEnd.set( event.clientX, event.clientY );
			zoomDelta.subVectors( zoomEnd, zoomStart );

			if ( zoomDelta.y > 0 ) {

				scope.zoomIn();

			} else {

				scope.zoomOut();

			}

			zoomStart.copy( zoomEnd );

		}

	}

	function onMouseUp( event ) {

		if ( ! scope.userRotate ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( ! scope.userZoom ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.zoomOut();

		} else {

			scope.zoomIn();

		}

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

};

/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 2013-01-23
 * 
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See LICENSE.md
 */

/*global self */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs
  || (navigator.msSaveBlob && navigator.msSaveBlob.bind(navigator))
  || (function(view) {
	"use strict";
	var
		  doc = view.document
		  // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, URL = view.URL || view.webkitURL || view
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = doc.createEvent("MouseEvents");
			event.initMouseEvent(
				"click", true, false, view, 0, 0, 0, 0, 0
				, false, false, false, false, 0, null
			);
			return node.dispatchEvent(event); // false if event was cancelled
		}
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function (ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		, deletion_queue = []
		, process_deletion_queue = function() {
			var i = deletion_queue.length;
			while (i--) {
				var file = deletion_queue[i];
				if (typeof file === "string") { // file is an object URL
					URL.revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			}
			deletion_queue.length = 0; // clear queue
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, FileSaver = function(blob, name) {
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, get_object_url = function() {
					var object_url = get_URL().createObjectURL(blob);
					deletion_queue.push(object_url);
					return object_url;
				}
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_object_url(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_object_url(blob);
				save_link.href = object_url;
				save_link.download = name;
				if (click(save_link)) {
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					return;
				}
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			} else {
				target_view = view.open();
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									deletion_queue.push(file);
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name) {
			return new FileSaver(blob, name);
		}
	;
	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;
	
	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;
	
	view.addEventListener("unload", process_deletion_queue, false);
	return saveAs;
}(self));

/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 *
 *	Subdivision Geometry Modifier 
 *		using Catmull-Clark Subdivision Surfaces
 *		for creating smooth geometry meshes
 *
 *	Note: a modifier modifies vertices and faces of geometry,
 *		so use geometry.clone() if original geometry needs to be retained
 * 
 *	Readings: 
 *		http://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
 *		http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
 *		http://xrt.wikidot.com/blog:31
 *		"Subdivision Surfaces in Character Animation"
 *
 *		(on boundary edges)
 *		http://rosettacode.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
 *		https://graphics.stanford.edu/wikis/cs148-09-summer/Assignment3Description
 *
 *	Supports:
 *		Closed and Open geometries.
 *
 *	TODO:
 *		crease vertex and "semi-sharp" features
 *		selective subdivision
 */

THREE.Face4Stub = function ( a, b, c, d, normal, color, materialIndex ) {

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;

	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [ ];

	this.color = color instanceof THREE.Color ? color : new THREE.Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materialIndex = materialIndex !== undefined ? materialIndex : 0;

	this.centroid = new THREE.Vector3();

};


THREE.GeometryUtils.convertFace4s = function(geometry) {

	// return geometry;

	var faces = geometry.faces;
	var faceVertexUvs = geometry.faceVertexUvs[0];

	var newfaces = [];
	var newfaceVertexUvs = [];

	var f, fl, face, uv;

	for (f=0, fl=faces.length; f < fl; f++) {

		face = faces[f];
		uv = faceVertexUvs[f];

		if ( face instanceof THREE.Face3 ) {
			
			newfaces.push(face);
			if (uv) newfaceVertexUvs.push(uv);

		} else {

			newfaces.push( new THREE.Face3( face.a, face.b, face.c, null, face.color, face.materialIndex) );
			newfaces.push( new THREE.Face3( face.d, face.a, face.c, null, face.color, face.materialIndex) );


			if (uv) newfaceVertexUvs.push([uv[0], uv[1], uv[2]]);
			if (uv) newfaceVertexUvs.push([uv[3], uv[0], uv[2]]);

		}

	}

	geometry.faces = newfaces;
	geometry.faceVertexUvs = [newfaceVertexUvs];

}


THREE.SubdivisionModifier = function ( subdivisions ) {

	this.subdivisions = (subdivisions === undefined ) ? 1 : subdivisions;

	// Settings
	this.useOldVertexColors = false;
	this.supportUVs = true;
	this.debug = false;

};

// Applies the "modify" pattern
THREE.SubdivisionModifier.prototype.modify = function ( geometry ) {

	var repeats = this.subdivisions;

	while ( repeats-- > 0 ) {
		this.smooth( geometry );
	}

	THREE.GeometryUtils.convertFace4s( geometry );
	delete geometry.__tmpVertices;
	geometry.computeCentroids();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();


};

/// REFACTORING THIS OUT

THREE.GeometryUtils.orderedKey = function ( a, b ) {

	return Math.min( a, b ) + "_" + Math.max( a, b );

};


// Returns a hashmap - of { edge_key: face_index }
THREE.GeometryUtils.computeEdgeFaces = function ( geometry ) {

	var i, il, v1, v2, j, k,
		face, faceIndices, faceIndex,
		edge,
		hash,
		edgeFaceMap = {};

	var orderedKey = THREE.GeometryUtils.orderedKey;

	function mapEdgeHash( hash, i ) {

		if ( edgeFaceMap[ hash ] === undefined ) {

			edgeFaceMap[ hash ] = [];

		}

		edgeFaceMap[ hash ].push( i );
	}


	// construct vertex -> face map

	for( i = 0, il = geometry.faces.length; i < il; i ++ ) {

		face = geometry.faces[ i ];

		if ( face instanceof THREE.Face3 ) {

			hash = orderedKey( face.a, face.b );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.b, face.c );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.c, face.a );
			mapEdgeHash( hash, i );

		} else if ( face instanceof THREE.Face4Stub ) {

			hash = orderedKey( face.a, face.b );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.b, face.c );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.c, face.d );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.d, face.a );
			mapEdgeHash( hash, i );

		}

	}

	// extract faces

	// var edges = [];
	// 
	// var numOfEdges = 0;
	// for (i in edgeFaceMap) {
	// 	numOfEdges++;
	//
	// 	edge = edgeFaceMap[i];
	// 	edges.push(edge);
	//
	// }

	//debug('edgeFaceMap', edgeFaceMap, 'geometry.edges',geometry.edges, 'numOfEdges', numOfEdges);

	return edgeFaceMap;

}

/////////////////////////////

// Performs an iteration of Catmull-Clark Subdivision
THREE.SubdivisionModifier.prototype.smooth = function ( oldGeometry ) {

	//debug( 'running smooth' );

	// New set of vertices, faces and uvs
	var newVertices = [], newFaces = [], newUVs = [];

	function v( x, y, z ) {
		newVertices.push( new THREE.Vector3( x, y, z ) );
	}

	var scope = this;
	var orderedKey = THREE.GeometryUtils.orderedKey;
	var computeEdgeFaces = THREE.GeometryUtils.computeEdgeFaces;

	function assert() {

		if (scope.debug && console && console.assert) console.assert.apply(console, arguments);

	}

	function debug() {

		if (scope.debug) console.log.apply(console, arguments);

	}

	function warn() {

		if (console)
		console.log.apply(console, arguments);

	}

	function f4( a, b, c, d, oldFace, orders, facei ) {

		// TODO move vertex selection over here!

		var newFace = new THREE.Face4Stub( a, b, c, d, null, oldFace.color, oldFace.materialIndex );

		if (scope.useOldVertexColors) {

			newFace.vertexColors = []; 

			var color, tmpColor, order;

			for (var i=0;i<4;i++) {

				order = orders[i];

				color = new THREE.Color(),
				color.setRGB(0,0,0);

				for (var j=0, jl=0; j<order.length;j++) {
					tmpColor = oldFace.vertexColors[order[j]-1];
					color.r += tmpColor.r;
					color.g += tmpColor.g;
					color.b += tmpColor.b;
				}

				color.r /= order.length;
				color.g /= order.length;
				color.b /= order.length;

				newFace.vertexColors[i] = color;

			}

		}

		newFaces.push( newFace );

		if (scope.supportUVs) {

			var aUv = [
				getUV(a, ''),
				getUV(b, facei),
				getUV(c, facei),
				getUV(d, facei)
			];

			if (!aUv[0]) debug('a :( ', a+':'+facei);
			else if (!aUv[1]) debug('b :( ', b+':'+facei);
			else if (!aUv[2]) debug('c :( ', c+':'+facei);
			else if (!aUv[3]) debug('d :( ', d+':'+facei);
			else 
				newUVs.push( aUv );

		}
	}

	var originalPoints = oldGeometry.vertices;
	var originalFaces = oldGeometry.faces;
	var originalVerticesLength = originalPoints.length;

	var newPoints = originalPoints.concat(); // New set of vertices to work on

	var facePoints = [], // these are new points on exisiting faces
		edgePoints = {}; // these are new points on exisiting edges

	var sharpEdges = {}, sharpVertices = []; // Mark edges and vertices to prevent smoothening on them
	// TODO: handle this correctly.

	var uvForVertices = {}; // Stored in {vertex}:{old face} format


	function debugCoreStuff() {

		console.log('facePoints', facePoints, 'edgePoints', edgePoints);
		console.log('edgeFaceMap', edgeFaceMap, 'vertexEdgeMap', vertexEdgeMap);

	}

	function getUV(vertexNo, oldFaceNo) {
		var j,jl;

		var key = vertexNo+':'+oldFaceNo;
		var theUV = uvForVertices[key];

		if (!theUV) {
			if (vertexNo>=originalVerticesLength && vertexNo < (originalVerticesLength + originalFaces.length)) {
				debug('face pt');
			} else {
				debug('edge pt');
			}

			warn('warning, UV not found for', key);

			return null;
		}

		return theUV;
 
		// Original faces -> Vertex Nos. 
		// new Facepoint -> Vertex Nos.
		// edge Points

	}

	function addUV(vertexNo, oldFaceNo, value) {

		var key = vertexNo+':'+oldFaceNo;
		if (!(key in uvForVertices)) {
			uvForVertices[key] = value;
		} else {
			warn('dup vertexNo', vertexNo, 'oldFaceNo', oldFaceNo, 'value', value, 'key', key, uvForVertices[key]);
		}
	}

	// Step 1
	//	For each face, add a face point
	//	Set each face point to be the centroid of all original points for the respective face.
	// debug(oldGeometry);
	var i, il, j, jl, face;

	// For Uvs
	var uvs = oldGeometry.faceVertexUvs[0];
	var abcd = 'abcd', vertice;

	debug('originalFaces, uvs, originalVerticesLength', originalFaces.length, uvs.length, originalVerticesLength);

	if (scope.supportUVs)

	for (i=0, il = uvs.length; i<il; i++ ) {

		for (j=0,jl=uvs[i].length;j<jl;j++) {

			vertice = originalFaces[i][abcd.charAt(j)];
			addUV(vertice, i, uvs[i][j]);

		}

	}

	if (uvs.length == 0) scope.supportUVs = false;

	// Additional UVs check, if we index original 
	var uvCount = 0;
	for (var u in uvForVertices) {
		uvCount++;
	}
	if (!uvCount) {
		scope.supportUVs = false;
		debug('no uvs');
	}

	var avgUv ;

	for (i=0, il = originalFaces.length; i<il ;i++) {

		face = originalFaces[ i ];
		facePoints.push( face.centroid );
		newPoints.push( face.centroid );

		if (!scope.supportUVs) continue;

		// Prepare subdivided uv

		avgUv = new THREE.Vector2();

		if ( face instanceof THREE.Face3 ) {

			avgUv.x = getUV( face.a, i ).x + getUV( face.b, i ).x + getUV( face.c, i ).x;
			avgUv.y = getUV( face.a, i ).y + getUV( face.b, i ).y + getUV( face.c, i ).y;
			avgUv.x /= 3;
			avgUv.y /= 3;

		} else if ( face instanceof THREE.Face4Stub ) {

			avgUv.x = getUV( face.a, i ).x + getUV( face.b, i ).x + getUV( face.c, i ).x + getUV( face.d, i ).x;
			avgUv.y = getUV( face.a, i ).y + getUV( face.b, i ).y + getUV( face.c, i ).y + getUV( face.d, i ).y;
			avgUv.x /= 4;
			avgUv.y /= 4;

		}

		addUV(originalVerticesLength + i, '', avgUv);

	}

	// Step 2
	//	For each edge, add an edge point.
	//	Set each edge point to be the average of the two neighbouring face points and its two original endpoints.

	var edgeFaceMap = computeEdgeFaces ( oldGeometry ); // Edge Hash -> Faces Index  eg { edge_key: [face_index, face_index2 ]}
	var edge, faceIndexA, faceIndexB, avg;

	// debug('edgeFaceMap', edgeFaceMap);

	var edgeCount = 0;

	var edgeVertex, edgeVertexA, edgeVertexB;

	////

	var vertexEdgeMap = {}; // Gives edges connecting from each vertex
	var vertexFaceMap = {}; // Gives faces connecting from each vertex

	function addVertexEdgeMap(vertex, edge) {

		if (vertexEdgeMap[vertex]===undefined) {

			vertexEdgeMap[vertex] = [];

		}

		vertexEdgeMap[vertex].push(edge);
	}

	function addVertexFaceMap(vertex, face, edge) {

		if (vertexFaceMap[vertex]===undefined) {

			vertexFaceMap[vertex] = {};

		}

		vertexFaceMap[vertex][face] = edge;
		// vertexFaceMap[vertex][face] = null;
	}

	// Prepares vertexEdgeMap and vertexFaceMap
	for (i in edgeFaceMap) { // This is for every edge
		edge = edgeFaceMap[i];

		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];

		// Maps an edgeVertex to connecting edges
		addVertexEdgeMap(edgeVertexA, [edgeVertexA, edgeVertexB] );
		addVertexEdgeMap(edgeVertexB, [edgeVertexA, edgeVertexB] );

		for (j=0,jl=edge.length;j<jl;j++) {

			face = edge[j];
			addVertexFaceMap(edgeVertexA, face, i);
			addVertexFaceMap(edgeVertexB, face, i);

		}

		// {edge vertex: { face1: edge_key, face2: edge_key.. } }

		// this thing is fishy right now.
		if (edge.length < 2) {

			// edge is "sharp";
			sharpEdges[i] = true;
			sharpVertices[edgeVertexA] = true;
			sharpVertices[edgeVertexB] = true;

		}

	}

	for (i in edgeFaceMap) {

		edge = edgeFaceMap[i];

		faceIndexA = edge[0]; // face index a
		faceIndexB = edge[1]; // face index b

		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];

		avg = new THREE.Vector3();

		//debug(i, faceIndexB,facePoints[faceIndexB]);

		assert(edge.length > 0, 'an edge without faces?!');

		if (edge.length==1) {

			avg.add( originalPoints[ edgeVertexA ] );
			avg.add( originalPoints[ edgeVertexB ] );
			avg.multiplyScalar( 0.5 );

			sharpVertices[newPoints.length] = true;

		} else {

			avg.add( facePoints[ faceIndexA ] );
			avg.add( facePoints[ faceIndexB ] );

			avg.add( originalPoints[ edgeVertexA ] );
			avg.add( originalPoints[ edgeVertexB ] );

			avg.multiplyScalar( 0.25 );

		}

		edgePoints[i] = originalVerticesLength + originalFaces.length + edgeCount;

		newPoints.push( avg );

		edgeCount ++;

		if (!scope.supportUVs) {
			continue;
		}

		// Prepare subdivided uv

		avgUv = new THREE.Vector2();

		avgUv.x = getUV(edgeVertexA, faceIndexA).x + getUV(edgeVertexB, faceIndexA).x;
		avgUv.y = getUV(edgeVertexA, faceIndexA).y + getUV(edgeVertexB, faceIndexA).y;
		avgUv.x /= 2;
		avgUv.y /= 2;

		addUV(edgePoints[i], faceIndexA, avgUv);

		if (edge.length>=2) {
			assert(edge.length == 2, 'did we plan for more than 2 edges?');
			avgUv = new THREE.Vector2();

			avgUv.x = getUV(edgeVertexA, faceIndexB).x + getUV(edgeVertexB, faceIndexB).x;
			avgUv.y = getUV(edgeVertexA, faceIndexB).y + getUV(edgeVertexB, faceIndexB).y;
			avgUv.x /= 2;
			avgUv.y /= 2;

			addUV(edgePoints[i], faceIndexB, avgUv);
		}

	}

	debug('-- Step 2 done');

	// Step 3
	//	For each face point, add an edge for every edge of the face, 
	//	connecting the face point to each edge point for the face.

	var facePt, currentVerticeIndex;

	var hashAB, hashBC, hashCD, hashDA, hashCA;

	var abc123 = ['123', '12', '2', '23'];
	var bca123 = ['123', '23', '3', '31'];
	var cab123 = ['123', '31', '1', '12'];
	var abc1234 = ['1234', '12', '2', '23'];
	var bcd1234 = ['1234', '23', '3', '34'];
	var cda1234 = ['1234', '34', '4', '41'];
	var dab1234 = ['1234', '41', '1', '12'];

	for (i=0, il = facePoints.length; i<il ;i++) { // for every face
		facePt = facePoints[i];
		face = originalFaces[i];
		currentVerticeIndex = originalVerticesLength+ i;

		if ( face instanceof THREE.Face3 ) {

			// create 3 face4s

			hashAB = orderedKey( face.a, face.b );
			hashBC = orderedKey( face.b, face.c );
			hashCA = orderedKey( face.c, face.a );

			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc123, i );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCA], face, bca123, i );
			f4( currentVerticeIndex, edgePoints[hashCA], face.a, edgePoints[hashAB], face, cab123, i );

		} else if ( face instanceof THREE.Face4Stub ) {

			// create 4 face4s

			hashAB = orderedKey( face.a, face.b );
			hashBC = orderedKey( face.b, face.c );
			hashCD = orderedKey( face.c, face.d );
			hashDA = orderedKey( face.d, face.a );

			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc1234, i );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCD], face, bcd1234, i );
			f4( currentVerticeIndex, edgePoints[hashCD], face.d, edgePoints[hashDA], face, cda1234, i );
			f4( currentVerticeIndex, edgePoints[hashDA], face.a, edgePoints[hashAB], face, dab1234, i );


		} else {

			debug('face should be a face!', face);

		}

	}

	newVertices = newPoints;

	// Step 4

	//	For each original point P, 
	//		take the average F of all n face points for faces touching P, 
	//		and take the average R of all n edge midpoints for edges touching P, 
	//		where each edge midpoint is the average of its two endpoint vertices. 
	//	Move each original point to the point


	var F = new THREE.Vector3();
	var R = new THREE.Vector3();

	var n;
	for (i=0, il = originalPoints.length; i<il; i++) {
		// (F + 2R + (n-3)P) / n

		if (vertexEdgeMap[i]===undefined) continue;

		F.set(0,0,0);
		R.set(0,0,0);
		var newPos =  new THREE.Vector3(0,0,0);

		var f = 0; // this counts number of faces, original vertex is connected to (also known as valance?)
		for (j in vertexFaceMap[i]) {
			F.add(facePoints[j]);
			f++;
		}

		var sharpEdgeCount = 0;

		n = vertexEdgeMap[i].length; // given a vertex, return its connecting edges

		// Are we on the border?
		var boundary_case = f != n;

		// if (boundary_case) {
		// 	console.error('moo', 'o', i, 'faces touched', f, 'edges',  n, n == 2);
		// }

		for (j=0;j<n;j++) {
			if (
				sharpEdges[
					orderedKey(vertexEdgeMap[i][j][0],vertexEdgeMap[i][j][1])
				]) {
					sharpEdgeCount++;
				}
		}

		// if ( sharpEdgeCount==2 ) {
		// 	continue;
		// 	// Do not move vertex if there's 2 connecting sharp edges.
		// }

		/*
		if (sharpEdgeCount>2) {
			// TODO
		}
		*/

		F.divideScalar(f);


		var boundary_edges = 0;

		if (boundary_case) {

			var bb_edge;
			for (j=0; j<n;j++) {
				edge = vertexEdgeMap[i][j];
				bb_edge = edgeFaceMap[orderedKey(edge[0], edge[1])].length == 1
				if (bb_edge) {
					var midPt = originalPoints[edge[0]].clone().add(originalPoints[edge[1]]).divideScalar(2);
					R.add(midPt);
					boundary_edges++;
				}
			}

			R.divideScalar(4);
			// console.log(j + ' --- ' + n + ' --- ' + boundary_edges);
			assert(boundary_edges == 2, 'should have only 2 boundary edges');

		} else {
			for (j=0; j<n;j++) {
				edge = vertexEdgeMap[i][j];
				var midPt = originalPoints[edge[0]].clone().add(originalPoints[edge[1]]).divideScalar(2);
				R.add(midPt);
			}

			R.divideScalar(n);
		}

		// Sum the formula
		newPos.add(originalPoints[i]);


		if (boundary_case) {

			newPos.divideScalar(2);
			newPos.add(R);

		} else {

			newPos.multiplyScalar(n - 3);

			newPos.add(F);
			newPos.add(R.multiplyScalar(2));
			newPos.divideScalar(n);

		}

		newVertices[i] = newPos;

	}

	var newGeometry = oldGeometry; // Let's pretend the old geometry is now new :P

	newGeometry.vertices = newVertices;
	newGeometry.faces = newFaces;
	newGeometry.faceVertexUvs[ 0 ] = newUVs;

	delete newGeometry.__tmpVertices; // makes __tmpVertices undefined :P

	newGeometry.computeCentroids();
	newGeometry.computeFaceNormals();
	newGeometry.computeVertexNormals();

};


/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 *
 * Modified from the TorusKnotGeometry by @oosmoxiecode
 *
 * Creates a tube which extrudes along a 3d spline
 *
 * Uses parallel transport frames as described in
 * http://www.cs.indiana.edu/pub/techreports/TR425.pdf
 */

THREE.TubeGeometry2 = function( path, segments, radius, radialSegments, closed ) {

	THREE.Geometry.call( this );

	this.path = path;
	this.segments = segments || 64;
	this.radius = radius || 1;
	this.radialSegments = radialSegments || 8;
	this.closed = closed || false;

	this.grid = [];

	var scope = this,

		tangent,
		normal,
		binormal,

		numpoints = this.segments + 1,

		x, y, z,
		tx, ty, tz,
		u, v,

		cx, cy,
		pos, pos2 = new THREE.Vector3(),
		i, j,
		ip, jp,
		a, b, c, d,
		uva, uvb, uvc, uvd;

	var frames = new THREE.TubeGeometry.FrenetFrames( this.path, this.segments, this.closed ),
		tangents = frames.tangents,
		normals = frames.normals,
		binormals = frames.binormals;

	// proxy internals
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	function vert( x, y, z ) {

		return scope.vertices.push( new THREE.Vector3( x, y, z ) ) - 1;

	}
	function unvert( x, y, z ) {

		return scope.vertices.unshift( new THREE.Vector3( x, y, z ) ) ;

	}


	// consruct the grid

	var divisor = numpoints/path.data.length;

	var tempGridi = [];
	var tempGridj = [];

	

	for ( i = 0; i < numpoints; i++ ) {

		if(!this.grid[i])
			this.grid[ i ] = [];

		var tempGrid = [];

		var rad = 1;

		if(path.data && i >= 0){
			rad = path.data[Math.floor(i/divisor)].w;	
		}

		if(rad<radius)
			rad=radius;

		u = (i / ( numpoints - 1 ));
	

		pos = path.getPointAt( u );

		pos2 = path.dataCurve.getPointAt( u );
		rad = pos2.x;

		tangent = tangents[ i ];
		normal = normals[ i ];
		binormal = binormals[ i ];

		if(i==0){
			for ( j = 0; j < this.radialSegments; j++ ) {
			
			v = j / this.radialSegments * 2 * Math.PI;

			cx = -this.radius * Math.cos( v ) *0 ; // TODO: Hack: Negating it so it faces outside.
			cy = this.radius * Math.sin( v )* 0;

			pos2.copy( pos );
			pos2.x += cx * normal.x + cy * binormal.x;
			pos2.y += cx * normal.y + cy * binormal.y;
			pos2.z += cx * normal.z + cy * binormal.z;
			
			this.grid[ i ][ j ] = vert( pos2.x, pos2.y, pos2.z );

			}
		}

		for ( j = 0; j < this.radialSegments; j++ ) {

			v = j / this.radialSegments * 2 * Math.PI;

			cx = -this.radius * Math.cos( v ) *rad ; // TODO: Hack: Negating it so it faces outside.
			cy = this.radius * Math.sin( v )* rad;

			pos2.copy( pos );
			pos2.x += cx * normal.x + cy * binormal.x;
			pos2.y += cx * normal.y + cy * binormal.y;
			pos2.z += cx * normal.z + cy * binormal.z;
			
			tempGrid[ j ] = vert( pos2.x, pos2.y, pos2.z );

		}

		this.grid.push(tempGrid);
		var newTemp = [];

		if(i==numpoints-1){
			for ( j = 0; j < this.radialSegments; j++ ) {
			
				v = j / this.radialSegments * 2 * Math.PI;

				cx = -this.radius * Math.cos( v ) *0 ; // TODO: Hack: Negating it so it faces outside.
				cy = this.radius * Math.sin( v )* 0;

				pos2.copy( pos );
				pos2.x += cx * normal.x + cy * binormal.x;
				pos2.y += cx * normal.y + cy * binormal.y;
				pos2.z += cx * normal.z + cy * binormal.z;
				
				newTemp[ j ] = vert( pos2.x, pos2.y, pos2.z );

			}
			this.grid.push(newTemp);

		}


	}

	

	// construct the mesh

	for ( i = 0; i < this.segments+2; i++ ) {

		for ( j = 0; j < this.radialSegments; j++ ) {



			ip = ( this.closed ) ? (i + 1) % this.segments : i + 1;
			jp = (j + 1) % this.radialSegments;

			a = this.grid[ i ][ j ];		// *** NOT NECESSARILY PLANAR ! ***
			b = this.grid[ ip ][ j ];
			c = this.grid[ ip ][ jp ];
			d = this.grid[ i ][ jp ];

			uva = new THREE.Vector2( i / this.segments+2, j / this.radialSegments );
			uvb = new THREE.Vector2( ( i + 1 ) / this.segments+2, j / this.radialSegments );
			uvc = new THREE.Vector2( ( i + 1 ) / this.segments+2, ( j + 1 ) / this.radialSegments );
			uvd = new THREE.Vector2( i / this.segments+2, ( j + 1 ) / this.radialSegments );

			this.faces.push( new THREE.Face3( a, b, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

			this.faces.push( new THREE.Face3( b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.TubeGeometry2.prototype = Object.create( THREE.Geometry.prototype );


// For computing of Frenet frames, exposing the tangents, normals and binormals the spline
THREE.TubeGeometry2.FrenetFrames = function(path, segments, closed) {

	var	tangent = new THREE.Vector3(),
		normal = new THREE.Vector3(),
		binormal = new THREE.Vector3(),

		tangents = [],
		normals = [],
		binormals = [],

		vec = new THREE.Vector3(),
		mat = new THREE.Matrix4(),

		numpoints = segments + 1,
		theta,
		epsilon = 0.0001,
		smallest,

		tx, ty, tz,
		i, u, v;


	// expose internals
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	// compute the tangent vectors for each segment on the path

	for ( i = 0; i < numpoints; i++ ) {

		u = i / ( numpoints - 1 );

		tangents[ i ] = path.getTangentAt( u );
		tangents[ i ].normalize();

	}

	initialNormal3();

	function initialNormal1(lastBinormal) {
		// fixed start binormal. Has dangers of 0 vectors
		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		if (lastBinormal===undefined) lastBinormal = new THREE.Vector3( 0, 0, 1 );
		normals[ 0 ].crossVectors( lastBinormal, tangents[ 0 ] ).normalize();
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] ).normalize();
	}

	function initialNormal2() {

		// This uses the Frenet-Serret formula for deriving binormal
		var t2 = path.getTangentAt( epsilon );

		normals[ 0 ] = new THREE.Vector3().subVectors( t2, tangents[ 0 ] ).normalize();
		binormals[ 0 ] = new THREE.Vector3().crossVectors( tangents[ 0 ], normals[ 0 ] );

		normals[ 0 ].crossVectors( binormals[ 0 ], tangents[ 0 ] ).normalize(); // last binormal x tangent
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] ).normalize();

	}

	function initialNormal3() {
		// select an initial normal vector perpenicular to the first tangent vector,
		// and in the direction of the smallest tangent xyz component

		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		smallest = Number.MAX_VALUE;
		tx = Math.abs( tangents[ 0 ].x );
		ty = Math.abs( tangents[ 0 ].y );
		tz = Math.abs( tangents[ 0 ].z );

		if ( tx <= smallest ) {
			smallest = tx;
			normal.set( 1, 0, 0 );
		}

		if ( ty <= smallest ) {
			smallest = ty;
			normal.set( 0, 1, 0 );
		}

		if ( tz <= smallest ) {
			normal.set( 0, 0, 1 );
		}

		vec.crossVectors( tangents[ 0 ], normal ).normalize();

		normals[ 0 ].crossVectors( tangents[ 0 ], vec );
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] );
	}


	// compute the slowly-varying normal and binormal vectors for each segment on the path

	for ( i = 1; i < numpoints; i++ ) {

		normals[ i ] = normals[ i-1 ].clone();

		binormals[ i ] = binormals[ i-1 ].clone();

		vec.crossVectors( tangents[ i-1 ], tangents[ i ] );

		if ( vec.length() > epsilon ) {

			vec.normalize();

			theta = Math.acos( THREE.Math.clamp( tangents[ i-1 ].dot( tangents[ i ] ), -1, 1 ) ); // clamp for floating pt errors

			normals[ i ].applyMatrix4( mat.makeRotationAxis( vec, theta ) );

		}

		binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

	}


	// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

	if ( closed ) {

		theta = Math.acos( THREE.Math.clamp( normals[ 0 ].dot( normals[ numpoints-1 ] ), -1, 1 ) );
		theta /= ( numpoints - 1 );

		if ( tangents[ 0 ].dot( vec.crossVectors( normals[ 0 ], normals[ numpoints-1 ] ) ) > 0 ) {

			theta = -theta;

		}

		for ( i = 1; i < numpoints; i++ ) {

			// twist a little...
			normals[ i ].applyMatrix4( mat.makeRotationAxis( tangents[ i ], theta * i ) );
			binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

		}

	}
};


/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Port of greggman's ThreeD version of marching cubes to Three.js
 * http://webglsamples.googlecode.com/hg/blob/blob.html
 */

THREE.MarchingCubes = function ( resolution, material, enableUvs, enableColors ) {

	THREE.ImmediateRenderObject.call( this );

	this.material = material;
	this.animate = true;

	this.enableUvs = enableUvs !== undefined ? enableUvs : false;
	this.enableColors = enableColors !== undefined ? enableColors : false;

	// functions have to be object properties
	// prototype functions kill performance
	// (tested and it was 4x slower !!!)

	this.init = function( resolution ) {

		this.resolution = resolution;

		// parameters

		this.isolation = 80.0;

		// size of field, 32 is pushing it in Javascript :)

		this.size = resolution;
		this.size2 = this.size * this.size;
		this.size3 = this.size2 * this.size;
		this.halfsize = this.size / 2.0;

		// deltas

		this.delta = 2.0 / this.size;
		this.yd = this.size;
		this.zd = this.size2;

		this.field = new Float32Array( this.size3 );
		this.normal_cache = new Float32Array( this.size3 * 3 );

		// temp buffers used in polygonize

		this.vlist = new Float32Array( 12 * 3 );
		this.nlist = new Float32Array( 12 * 3 );

		this.firstDraw = true;

		// immediate render mode simulator

		this.maxCount = 4096; // TODO: find the fastest size for this buffer
		this.count = 0;

		this.hasPositions = false;
		this.hasNormals = false;
		this.hasColors = false;
		this.hasUvs = false;

		this.positionArray = new Float32Array( this.maxCount * 3 );
		this.normalArray   = new Float32Array( this.maxCount * 3 );

		if ( this.enableUvs ) {

			this.uvArray = new Float32Array( this.maxCount * 2 );

		}

		if ( this.enableColors ) {

			this.colorArray   = new Float32Array( this.maxCount * 3 );

		}

	};

	///////////////////////
	// Polygonization
	///////////////////////

	this.lerp = function( a, b, t ) { return a + ( b - a ) * t; };

	this.VIntX = function( q, pout, nout, offset, isol, x, y, z, valp1, valp2 ) {

		var mu = ( isol - valp1 ) / ( valp2 - valp1 ),
		nc = this.normal_cache;

		pout[ offset ] 	   = x + mu * this.delta;
		pout[ offset + 1 ] = y;
		pout[ offset + 2 ] = z;

		nout[ offset ] 	   = this.lerp( nc[ q ],     nc[ q + 3 ], mu );
		nout[ offset + 1 ] = this.lerp( nc[ q + 1 ], nc[ q + 4 ], mu );
		nout[ offset + 2 ] = this.lerp( nc[ q + 2 ], nc[ q + 5 ], mu );

	};

	this.VIntY = function( q, pout, nout, offset, isol, x, y, z, valp1, valp2 ) {

		var mu = ( isol - valp1 ) / ( valp2 - valp1 ),
		nc = this.normal_cache;

		pout[ offset ] 	   = x;
		pout[ offset + 1 ] = y + mu * this.delta;
		pout[ offset + 2 ] = z;

		var q2 = q + this.yd * 3;

		nout[ offset ] 	   = this.lerp( nc[ q ],     nc[ q2 ],     mu );
		nout[ offset + 1 ] = this.lerp( nc[ q + 1 ], nc[ q2 + 1 ], mu );
		nout[ offset + 2 ] = this.lerp( nc[ q + 2 ], nc[ q2 + 2 ], mu );

	};

	this.VIntZ = function( q, pout, nout, offset, isol, x, y, z, valp1, valp2 ) {

		var mu = ( isol - valp1 ) / ( valp2 - valp1 ),
		nc = this.normal_cache;

		pout[ offset ] 	   = x;
		pout[ offset + 1 ] = y;
		pout[ offset + 2 ] = z + mu * this.delta;

		var q2 = q + this.zd * 3;

		nout[ offset ] 	   = this.lerp( nc[ q ],     nc[ q2 ],     mu );
		nout[ offset + 1 ] = this.lerp( nc[ q + 1 ], nc[ q2 + 1 ], mu );
		nout[ offset + 2 ] = this.lerp( nc[ q + 2 ], nc[ q2 + 2 ], mu );

	};

	this.compNorm = function( q ) {

		var q3 = q * 3;

		if ( this.normal_cache[ q3 ] === 0.0 ) {

			this.normal_cache[ q3     ] = this.field[ q - 1  ] 	    - this.field[ q + 1 ];
			this.normal_cache[ q3 + 1 ] = this.field[ q - this.yd ] - this.field[ q + this.yd ];
			this.normal_cache[ q3 + 2 ] = this.field[ q - this.zd ] - this.field[ q + this.zd ];

		}

	};

	// Returns total number of triangles. Fills triangles.
	// (this is where most of time is spent - it's inner work of O(n3) loop )

	this.polygonize = function( fx, fy, fz, q, isol, renderCallback ) {

		// cache indices
		var q1 = q + 1,
			qy = q + this.yd,
			qz = q + this.zd,
			q1y = q1 + this.yd,
			q1z = q1 + this.zd,
			qyz = q + this.yd + this.zd,
			q1yz = q1 + this.yd + this.zd;

		var cubeindex = 0,
			field0 = this.field[ q ],
			field1 = this.field[ q1 ],
			field2 = this.field[ qy ],
			field3 = this.field[ q1y ],
			field4 = this.field[ qz ],
			field5 = this.field[ q1z ],
			field6 = this.field[ qyz ],
			field7 = this.field[ q1yz ];

		if ( field0 < isol ) cubeindex |= 1;
		if ( field1 < isol ) cubeindex |= 2;
		if ( field2 < isol ) cubeindex |= 8;
		if ( field3 < isol ) cubeindex |= 4;
		if ( field4 < isol ) cubeindex |= 16;
		if ( field5 < isol ) cubeindex |= 32;
		if ( field6 < isol ) cubeindex |= 128;
		if ( field7 < isol ) cubeindex |= 64;

		// if cube is entirely in/out of the surface - bail, nothing to draw

		var bits = THREE.edgeTable[ cubeindex ];
		if ( bits === 0 ) return 0;

		var d = this.delta,
			fx2 = fx + d,
			fy2 = fy + d,
			fz2 = fz + d;

		// top of the cube

		if ( bits & 1 ) {

			this.compNorm( q );
			this.compNorm( q1 );
			this.VIntX( q * 3, this.vlist, this.nlist, 0, isol, fx, fy, fz, field0, field1 );

		};

		if ( bits & 2 ) {

			this.compNorm( q1 );
			this.compNorm( q1y );
			this.VIntY( q1 * 3, this.vlist, this.nlist, 3, isol, fx2, fy, fz, field1, field3 );

		};

		if ( bits & 4 ) {

			this.compNorm( qy );
			this.compNorm( q1y );
			this.VIntX( qy * 3, this.vlist, this.nlist, 6, isol, fx, fy2, fz, field2, field3 );

		};

		if ( bits & 8 ) {

			this.compNorm( q );
			this.compNorm( qy );
			this.VIntY( q * 3, this.vlist, this.nlist, 9, isol, fx, fy, fz, field0, field2 );

		};

		// bottom of the cube

		if ( bits & 16 )  {

			this.compNorm( qz );
			this.compNorm( q1z );
			this.VIntX( qz * 3, this.vlist, this.nlist, 12, isol, fx, fy, fz2, field4, field5 );

		};

		if ( bits & 32 )  {

			this.compNorm( q1z );
			this.compNorm( q1yz );
			this.VIntY( q1z * 3,  this.vlist, this.nlist, 15, isol, fx2, fy, fz2, field5, field7 );

		};

		if ( bits & 64 ) {

			this.compNorm( qyz );
			this.compNorm( q1yz );
			this.VIntX( qyz * 3, this.vlist, this.nlist, 18, isol, fx, fy2, fz2, field6, field7 );

		};

		if ( bits & 128 ) {

			this.compNorm( qz );
			this.compNorm( qyz );
			this.VIntY( qz * 3,  this.vlist, this.nlist, 21, isol, fx, fy, fz2, field4, field6 );

		};

		// vertical lines of the cube

		if ( bits & 256 ) {

			this.compNorm( q );
			this.compNorm( qz );
			this.VIntZ( q * 3, this.vlist, this.nlist, 24, isol, fx, fy, fz, field0, field4 );

		};

		if ( bits & 512 ) {

			this.compNorm( q1 );
			this.compNorm( q1z );
			this.VIntZ( q1 * 3,  this.vlist, this.nlist, 27, isol, fx2, fy,  fz, field1, field5 );

		};

		if ( bits & 1024 ) {

			this.compNorm( q1y );
			this.compNorm( q1yz );
			this.VIntZ( q1y * 3, this.vlist, this.nlist, 30, isol, fx2, fy2, fz, field3, field7 );

		};

		if ( bits & 2048 ) {

			this.compNorm( qy );
			this.compNorm( qyz );
			this.VIntZ( qy * 3, this.vlist, this.nlist, 33, isol, fx,  fy2, fz, field2, field6 );

		};

		cubeindex <<= 4;  // re-purpose cubeindex into an offset into triTable

		var o1, o2, o3, numtris = 0, i = 0;

		// here is where triangles are created

		while ( THREE.triTable[ cubeindex + i ] != -1 ) {

			o1 = cubeindex + i;
			o2 = o1 + 1;
			o3 = o1 + 2;

			this.posnormtriv( this.vlist, this.nlist,
							  3 * THREE.triTable[ o1 ],
							  3 * THREE.triTable[ o2 ],
							  3 * THREE.triTable[ o3 ],
							  renderCallback );

			i += 3;
			numtris ++;

		}

		return numtris;

	};

	/////////////////////////////////////
	// Immediate render mode simulator
	/////////////////////////////////////

	this.posnormtriv = function( pos, norm, o1, o2, o3, renderCallback ) {

		var c = this.count * 3;

		// positions

		this.positionArray[ c ] 	= pos[ o1 ];
		this.positionArray[ c + 1 ] = pos[ o1 + 1 ];
		this.positionArray[ c + 2 ] = pos[ o1 + 2 ];

		this.positionArray[ c + 3 ] = pos[ o2 ];
		this.positionArray[ c + 4 ] = pos[ o2 + 1 ];
		this.positionArray[ c + 5 ] = pos[ o2 + 2 ];

		this.positionArray[ c + 6 ] = pos[ o3 ];
		this.positionArray[ c + 7 ] = pos[ o3 + 1 ];
		this.positionArray[ c + 8 ] = pos[ o3 + 2 ];

		// normals

		this.normalArray[ c ] 	  = norm[ o1 ];
		this.normalArray[ c + 1 ] = norm[ o1 + 1 ];
		this.normalArray[ c + 2 ] = norm[ o1 + 2 ];

		this.normalArray[ c + 3 ] = norm[ o2 ];
		this.normalArray[ c + 4 ] = norm[ o2 + 1 ];
		this.normalArray[ c + 5 ] = norm[ o2 + 2 ];

		this.normalArray[ c + 6 ] = norm[ o3 ];
		this.normalArray[ c + 7 ] = norm[ o3 + 1 ];
		this.normalArray[ c + 8 ] = norm[ o3 + 2 ];

		// uvs

		if ( this.enableUvs ) {

			var d = this.count * 2;

			this.uvArray[ d ] 	  = pos[ o1 ];
			this.uvArray[ d + 1 ] = pos[ o1 + 2 ];

			this.uvArray[ d + 2 ] = pos[ o2 ];
			this.uvArray[ d + 3 ] = pos[ o2 + 2 ];

			this.uvArray[ d + 4 ] = pos[ o3 ];
			this.uvArray[ d + 5 ] = pos[ o3 + 2 ];

		}

		// colors

		if ( this.enableColors ) {

			this.colorArray[ c ] 	 = pos[ o1 ];
			this.colorArray[ c + 1 ] = pos[ o1 + 1 ];
			this.colorArray[ c + 2 ] = pos[ o1 + 2 ];

			this.colorArray[ c + 3 ] = pos[ o2 ];
			this.colorArray[ c + 4 ] = pos[ o2 + 1 ];
			this.colorArray[ c + 5 ] = pos[ o2 + 2 ];

			this.colorArray[ c + 6 ] = pos[ o3 ];
			this.colorArray[ c + 7 ] = pos[ o3 + 1 ];
			this.colorArray[ c + 8 ] = pos[ o3 + 2 ];

		}

		this.count += 3;

		if ( this.count >= this.maxCount - 3 ) {

			this.hasPositions = true;
			this.hasNormals = true;

			if ( this.enableUvs ) {

				this.hasUvs = true;

			}

			if ( this.enableColors ) {

				this.hasColors = true;

			}

			renderCallback( this );

		}

	};

	this.begin = function( ) {

		this.count = 0;

		this.hasPositions = false;
		this.hasNormals = false;
		this.hasUvs = false;
		this.hasColors = false;

	};

	this.end = function( renderCallback ) {

		if ( this.count === 0 )
			return;

		for ( var i = this.count * 3; i < this.positionArray.length; i ++ )
			this.positionArray[ i ] = 0.0;

		this.hasPositions = true;
		this.hasNormals = true;

		if ( this.enableUvs ) {

			this.hasUvs = true;

		}

		if ( this.enableColors ) {

			this.hasColors = true;

		}

		renderCallback( this );

	};

	/////////////////////////////////////
	// Metaballs
	/////////////////////////////////////

	// Adds a reciprocal ball (nice and blobby) that, to be fast, fades to zero after
	// a fixed distance, determined by strength and subtract.

	this.addBall = function( ballx, bally, ballz, strength, subtract ) {

		// Let's solve the equation to find the radius:
		// 1.0 / (0.000001 + radius^2) * strength - subtract = 0
		// strength / (radius^2) = subtract
		// strength = subtract * radius^2
		// radius^2 = strength / subtract
		// radius = sqrt(strength / subtract)

		var radius = this.size * Math.sqrt( strength / subtract ),
			zs = ballz * this.size,
			ys = bally * this.size,
			xs = ballx * this.size;

		var min_z = Math.floor( zs - radius ); if ( min_z < 1 ) min_z = 1;
		var max_z = Math.floor( zs + radius ); if ( max_z > this.size - 1 ) max_z = this.size - 1;
		var min_y = Math.floor( ys - radius ); if ( min_y < 1 ) min_y = 1;
		var max_y = Math.floor( ys + radius ); if ( max_y > this.size - 1 ) max_y = this.size - 1;
		var min_x = Math.floor( xs - radius ); if ( min_x < 1  ) min_x = 1;
		var max_x = Math.floor( xs + radius ); if ( max_x > this.size - 1 ) max_x = this.size - 1;


		// Don't polygonize in the outer layer because normals aren't
		// well-defined there.

		var x, y, z, y_offset, z_offset, fx, fy, fz, fz2, fy2, val;

		for ( z = min_z; z < max_z; z++ ) {

			z_offset = this.size2 * z,
			fz = z / this.size - ballz,
			fz2 = fz * fz;

			for ( y = min_y; y < max_y; y++ ) {

				y_offset = z_offset + this.size * y;
				fy = y / this.size - bally;
				fy2 = fy * fy;

				for ( x = min_x; x < max_x; x++ ) {

					fx = x / this.size - ballx;
					val = strength / ( 0.000001 + fx*fx + fy2 + fz2 ) - subtract;
					if ( val > 0.0 ) this.field[ y_offset + x ] += val;

				}

			}

		}

	};

	this.addPlaneX = function( strength, subtract ) {

		var x, y, z, xx, val, xdiv, cxy,

			// cache attribute lookups
			size = this.size,
			yd = this.yd,
			zd = this.zd,
			field = this.field,

			dist = size * Math.sqrt( strength / subtract );

		if ( dist > size ) dist = size;

		for ( x = 0; x < dist; x ++ ) {

			xdiv = x / size;
			xx = xdiv * xdiv;
			val = strength / ( 0.0001 + xx ) - subtract;

			if ( val > 0.0 ) {

				for ( y = 0; y < size; y ++ ) {

					cxy = x + y * yd;

					for ( z = 0; z < size; z ++ ) {

						field[ zd * z + cxy ] += val;

					}

				}

			}

		}

	};

	this.addPlaneY = function( strength, subtract ) {

		var x, y, z, yy, val, ydiv, cy, cxy,

			// cache attribute lookups
			size = this.size,
			yd = this.yd,
			zd = this.zd,
			field = this.field,

			dist = size * Math.sqrt( strength / subtract );

		if ( dist > size ) dist = size;

		for ( y = 0; y < dist; y ++ ) {

			ydiv = y / size;
			yy = ydiv * ydiv;
			val = strength / ( 0.0001 + yy ) - subtract;

			if ( val > 0.0 ) {

				cy = y * yd;

				for ( x = 0; x < size; x ++ ) {

					cxy = cy + x;

					for ( z = 0; z < size; z ++ )
						field[ zd * z + cxy ] += val;

				}

			}

		}

	};

	this.addPlaneZ = function( strength, subtract ) {

		var x, y, z, zz, val, zdiv, cz, cyz,

			// cache attribute lookups
			size = this.size,
			yd = this.yd,
			zd = this.zd,
			field = this.field,

			dist = size * Math.sqrt( strength / subtract );

		if ( dist > size ) dist = size;

		for ( z = 0; z < dist; z ++ ) {

			zdiv = z / size;
			zz = zdiv * zdiv;
			val = strength / ( 0.0001 + zz ) - subtract;
			if ( val > 0.0 ) {

				cz = zd * z;

				for ( y = 0; y < size; y ++ ) {

					cyz = cz + y * yd;

					for ( x = 0; x < size; x ++ )
						field[ cyz + x ] += val;

				}

			}

		}

	};

	/////////////////////////////////////
	// Updates
	/////////////////////////////////////

	this.reset = function() {

		var i;

		// wipe the normal cache

		for ( i = 0; i < this.size3; i ++ ) {

			this.normal_cache[ i * 3 ] = 0.0;
			this.field[ i ] = 0.0;

		}

	};

	this.render = function( renderCallback ) {

		this.begin();

		// Triangulate. Yeah, this is slow.

		if(this.animate){

			var q, x, y, z, fx, fy, fz, y_offset, z_offset, smin2 = this.size - 2;

			for ( z = 1; z < smin2; z ++ ) {

				z_offset = this.size2 * z;
				fz = ( z - this.halfsize ) / this.halfsize; //+ 1

				for ( y = 1; y < smin2; y ++ ) {

					y_offset = z_offset + this.size * y;
					fy = ( y - this.halfsize ) / this.halfsize; //+ 1

					for ( x = 1; x < smin2; x ++ ) {

						fx = ( x - this.halfsize ) / this.halfsize; //+ 1
						q = y_offset + x;

						this.polygonize( fx, fy, fz, q, this.isolation, renderCallback );

					}

				}

			}
		}

		this.end( renderCallback );

	};

	this.generateGeometry = function() {

		var start = 0, geo = new THREE.Geometry();
		var normals = [];

		var geo_callback = function( object ) {

			var i, x, y, z, vertex, normal,
				face, a, b, c, na, nb, nc, nfaces;


			for ( i = 0; i < object.count; i ++ ) {

				a = i * 3;
				b = a + 1;
				c = a + 2;

				x = object.positionArray[ a ];
				y = object.positionArray[ b ];
				z = object.positionArray[ c ];
				vertex = new THREE.Vector3( x, y, z );

				x = object.normalArray[ a ];
				y = object.normalArray[ b ];
				z = object.normalArray[ c ];
				normal = new THREE.Vector3( x, y, z );
				normal.normalize();

				geo.vertices.push( vertex );
				normals.push( normal );

			}

			nfaces = object.count / 3;

			for ( i = 0; i < nfaces; i ++ ) {

				a = ( start + i ) * 3;
				b = a + 1;
				c = a + 2;

				na = normals[ a ];
				nb = normals[ b ];
				nc = normals[ c ];

				face = new THREE.Face3( a, b, c, [ na, nb, nc ] );

				geo.faces.push( face );

			}

			start += nfaces;
			object.count = 0;

		};

		this.render( geo_callback );

		// console.log( "generated " + geo.faces.length + " triangles" );

		return geo;

	};

	this.init( resolution );

};

THREE.MarchingCubes.prototype = Object.create( THREE.ImmediateRenderObject.prototype );


/////////////////////////////////////
// Marching cubes lookup tables
/////////////////////////////////////

// These tables are straight from Paul Bourke's page:
// http://local.wasp.uwa.edu.au/~pbourke/geometry/polygonise/
// who in turn got them from Cory Gene Bloyd.

THREE.edgeTable = new Int32Array([
0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0])

THREE.triTable = new Int32Array([
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);

//audio input

function enableAudioInput(){

    context = new (window.AudioContext || window.webkitAudioContext)();

    if (!context.createGain)
      context.createGain = context.createGainNode;
    if (!context.createDelay)
      context.createDelay = context.createDelayNode;
    if (!context.createScriptProcessor)
      context.createScriptProcessor = context.createJavaScriptNode;

    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
      window.webkitRequestAnimationFrame || 
      window.mozRequestAnimationFrame    || 
      window.oRequestAnimationFrame      || 
      window.msRequestAnimationFrame     || 
      function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
    })();


    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);

        sample = new MicrophoneSample();
    audioValues = [];
}

function MicrophoneSample() {
  this.ball = [];
  for (var i = 0 ; i < 1024 ; i++){
    this.ball.push(sphere(10));
    // scene.add(this.ball[i]);
  }

  this.avg = [];
  for (var i = 0 ; i < 1024 ; i++){

    this.avg[i] = new Average(3);
   
    }
  // scene.add(this.ball);
  this.getMicrophoneInput();
  this.canvas = document.querySelector('canvas');
}

MicrophoneSample.prototype.getMicrophoneInput = function() {
  navigator.getUserMedia({audio: true},
                          this.onStream.bind(this),
                          this.onStreamError.bind(this));
};

MicrophoneSample.prototype.onStream = function(stream) {
  var input = context.createMediaStreamSource(stream);
  var filter = context.createBiquadFilter();
  filter.frequency.value = 100.0;
  filter.type = filter.LOWPASS;
  filter.Q = 10.0;

  var analyser = context.createAnalyser();

  // Connect graph.
  input.connect(filter);
  filter.connect(analyser);

  this.analyser = analyser;
  // Setup a timer to visualize some stuff.
  requestAnimFrame(this.visualize.bind(this));
};

MicrophoneSample.prototype.onStreamError = function(e) {
  console.error('Error getting microphone', e);
};

MicrophoneSample.prototype.visualize = function() {
  // this.canvas.width = this.WIDTH;
  // this.canvas.height = this.HEIGHT;
  // var drawContext = this.canvas.getContext('2d');

  audioValues = new Uint8Array(this.analyser.frequencyBinCount);
  this.analyser.getByteTimeDomainData(audioValues);
  // for (var i = 0; i < times.length; i++) {

  //       var value = times[i];

  //       // var j = tree.FIND([0,0,i]);
  //       // var j = tree.FIND([0,i/8,0]);
  //       // var avg = value;

  //       // j.rotator.rotation.z = (pi)+(value-126)*.05;// + (i*.00001);
        
    
  // }
  requestAnimFrame(this.visualize.bind(this));
};

