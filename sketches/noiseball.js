
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
