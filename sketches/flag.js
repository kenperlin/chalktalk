
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
