



var yplanetFragmentShader = ["\
   void main(void) {\n\
      float mtime = time*0.001;\n\
      //\n\
      vec3 eyept = vec3(0.0, 0.0, 1.0);\n\
      vec3 moonpt = vec3(100.0, 50.0, 0.0);\n\
      vec3 turb1pt = vPosition + vec3(mtime,0.0,0.0) + vec3(50.0,20.0,-31.0);\n\
      vec3 turb2pt = vec3(x*3.0, y*3.0, z*3.0) + vec3(mtime,0.0,0.0);\n\
      //\n\
      float t1 = turbulence(turb1pt);\n\
      float t2 = turbulence(turb2pt);\n\
      //\n\
      // float landamp = t1 < 0.2 ? 0.0 : t1;\n\
      float landamp = smoothstep(0.15, 0.45, t1*t1);\n\
      float oceanamp = 1.0 - landamp;\n\
      float cloudamp = t2*t2;\n\
      float coronaamp = 0.1 - min(0.1, dot(eyept, vNormal));\n\
      float lightamp = smoothstep(0.0, 0.2, t2*t2*t2);\n\
      //\n\
      vec3 oceanc = vec3(0.0, 0.0, .05);\n\
      vec3 landc  = vec3(0.15, 0.15, 0.25);\n\
      vec3 cloudc = vec3(1.0, 1.0, 1.0);\n\
      vec3 lightc = vec3(0.5, 0.3, 0.2);\n\
      vec3 coronac = vec3(0.0, 0.0, 0.3);\n\
      //\n\
      float dfamp = abs(dot(vNormal, normalize((moonpt-vPosition))));\n\
      vec3 color = vec3(0.0,0.0,0.0);\n\
      if (t1 < 0.0) {\n\
        color = vec3(1.0,0.0,0.0);\n\
      }\n\
      else {\n\
        color = (landamp * landc) + (oceanamp * oceanc);\n\
        // color = color * dfamp;\n\
        // color += mix(color, cloudc, cloudamp);\n\
        color += lightc * min(lightamp, landamp);\n\
        color = clamp(color, 0.0, 1.0);\n\
      }\n\
      gl_FragColor = vec4(color, alpha);\n\
   }\
"].join("\n");

registerGlyph("yplanet()",[
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
   [ [-1, 0], [1,0]], 
]);

function yplanet() {
   var sketch = addSphereShaderSketch(defaultVertexShader, yplanetFragmentShader);
   sketch.code = [["yplanet", yplanetFragmentShader],["flame", flameFragmentShader]];
   sketch.enableFragmentShaderEditing();
}




var tworaysFragmentShader = [
,'   float raySphere(vec3 V, vec3 W, vec4 S) {'
,'      vec3 P = V - S.xyz;'
,'      float b = 2. * dot(P, W);'
,'      float c = dot(P, P) - S.w * S.w;'
,'      float d = b*b - 4.*c;'
,'      return d < 0. ? 0. : (-b - sqrt(d)) / 2.;'
,'   }'
,'   vec3 shadeSphere(vec3 W, vec3 P, vec4 S) {'
,'      vec3 N = (P - S.xyz) / S.w;'
,'      vec3 R = W - 2. * N * dot(W, N);'
,'      vec3 L = normalize(vec3(1.,1.,.5));'
,'      float d = .2 + max(0., dot(L, N));'
,'      float s = pow(max(0.,dot(L, R)), 5.);'
,'      return max(vec3(1.,0.,0.) * d, vec3(1.,1.,1.) * s);'
,'   }'
,'   void main(void) {'
,'      vec3 V = vec3(0.,0.,0.);'
,'      vec3 W = normalize(vec3(dx,dy,-10.));'
,'      vec4 S = vec4(0.,0.,-10.5,1.);'
,'      float t = raySphere(V, W, S);'
,'      vec3 c = t==0. ? vec3(0.,0.,0.) : shadeSphere(W,V+t*W,S);'
,'      vec3 V2 = vec3(0.,0.,0.);'
,'      vec3 W2 = normalize(vec3(dx,dy,-8.));'
,'      vec4 S2 = vec4(mx,my,-8.5,1.);'
,'      float t2 = raySphere(V2, W2, S2);'
,'      vec3 c2 = t2==0. ? vec3(0.,0.,0.) : shadeSphere(W2,V2+t2*W2,S2);'
,'      gl_FragColor = vec4(c2, alpha);'
,'   }'
].join("\n");

function tworays() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, tworaysFragmentShader);
   sketch.code = [["",tworaysFragmentShader]];
   sketch.enableFragmentShaderEditing();
   sketch.mouseDrag = function() { }
}
registerGlyph("rays()",[ [ [1,-1],[-1,-1],[-1,1],[1,1]], ]);


registerGlyph("tworays()",[
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
   makeOval(-1,  0, 1, 1, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
]);
