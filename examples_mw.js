



var xeyeballFragmentShader = [
,'   float car2radius(vec3 P) {'
,'      float rad = sqrt(P.x*P.x + P.y*P.y + P.z*P.z);'
,'      return rad;'
,'   }'
,'   float car2incl(vec3 P, float rad) {'
,'      float incl = acos(P.z / rad);'
,'      return incl;'
,'   }'
,'   float car2azi(vec3 P) {'
,'      float azi = atan(P.y / P.x);'
,'      return azi;'
,'   }'
,'   float latamp(float inazi){'
,'      float latitude = smoothstep(0.9, 0.95 , fract(inazi/(2.*3.14159) * 10.));'
,'      return latitude;'
,'   }'
,'   float longamp(float inincl){'
,'      float longitude = smoothstep(0.9, 0.95 , fract(inincl/3.14159 * 10.));'
,'      return longitude;'
,'   }'
,'   void main(void) {'
,'      float mtime = time*0.001;'
,'      //'
,'      float pupil_size = 0.2;'
,'      float iris_size = 0.4;'
,'      float iris_ring = 0.35;'
,'      float sclera_size = 1.0 - iris_size;'
,'      vec3 eyept = vec3(0.0, 0.0, 1.0);'
,'      vec3 moonpt = vec3(50.0, 50.0, 100.0);'
,'      //'
,'      // float t1 = turbulence(turb1pt);'
,'      // float t2 = turbulence(turb2pt);'
,'      float rad = car2radius(vPosition);'
,'      float incl = car2incl(vPosition, rad); '
,'      float azi = car2azi(vPosition);'
,'      float t1 = turbulence(vec3(azi*8.+51.0, incl*16.0+75.2, 251.444));'
,'      float t2 = turbulence(vec3(azi*1.0, incl*1.0, 6251.444));'
,'      float lat_amp = latamp(azi + t2);'
,'      float long_amp = longamp(incl + t2);'
,'      //'
,'      vec3 sclera_clr = vec3(1.,1.,1.);'
,'      vec3 iris_clr = vec3(0., 0.0, 0.5);'
,'      vec3 iris_clr_2 = vec3(0.2, 0.5, 0.2);'
,'      vec3 pupil_clr      = vec3(0., 0., 0.);'
,'      vec3 iris_ring_clr = vec3(0., 0., .2);'
,'      vec3 hilight_clr  = vec3(1., .9, 1.);'
,'      vec3 line_clr = vec3(0.9, 0.1, 0.1);'
,'      vec3 blood_clr = vec3(1.0, 0.0, 0.0);'
,'      vec3 light_clr = vec3(1., 1., 1.);'
,'      float dfamp = max(0.2, dot(vNormal, normalize((moonpt-vPosition))));'
,'      vec3 color = vec3(0.0,0.0,0.0);'
,'      //'
,'      pupil_size = pupil_size - (.1 * dfamp);'
,'      if (incl <= pupil_size) color = pupil_clr;'
,'      if (incl >= pupil_size && incl <= iris_size) {'
,'         color = mix(iris_clr, iris_clr_2, t1*t1);'
,'         if (incl >= iris_ring) color = mix(color, iris_ring_clr, 0.5);'
,'      }'
,'      if (incl > iris_size) color = sclera_clr;'
,'      if (incl > iris_size && (lat_amp+long_amp) > 0.0) color = mix(color, blood_clr, t2 * 0.5);'
,'      // if (incl > iris_size && incl < 2.0 && azi >= 0.65 && azi <= 0.7) color = mix(color, blood_clr, t1);'
,'      // color = color + (lat_amp*line_clr ) + (long_amp*line_clr);'
,'      color = color * dfamp;'
,'      color = clamp(color, 0.0, 1.0);'
,'      gl_FragColor = vec4(color, alpha);'
,'   }'			       
].join("\n");

registerGlyph("xeyeball()",[
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
   [ [-1, 1], [1, -1]], 
]);

function xeyeball() {
   var sketch = addSphereShaderSketch(defaultVertexShader, xeyeballFragmentShader);
   sketch.code = [["yplanet", xeyeballFragmentShader],["flame", flameFragmentShader]];
   sketch.enableFragmentShaderEditing();
}



var xplanetFragmentShader = [
,'   float car2radius(vec3 P) {'
,'      float rad = sqrt(P.x*P.x + P.y*P.y + P.z*P.z);'
,'      return rad;'
,'   }'
,'   float car2incl(vec3 P, float rad) {'
,'      float incl = acos(P.z / rad);'
,'      return incl;'
,'   }'
,'   float car2azi(vec3 P) {'
,'      float azi = atan(P.y / P.x);'
,'      return azi;'
,'   }'
,'   float latamp(float inazi){'
,'      float latitude = smoothstep(0.85, 0.95 , fract(inazi/(2.*3.14159) * 10.));'
,'      return latitude;'
,'   }'
,'   float longamp(float inincl){'
,'      float longitude = smoothstep(0.85, 0.95 , fract(inincl/3.14159 * 10.));'
,'      return longitude;'
,'   }'
,'   void main(void) {'
,'      float mtime = time*0.001;'
,'      //'
,'      vec3 eyept = vec3(0.0, 0.0, 1.0);'
,'      vec3 moonpt = vec3(100.0, 50.0, 0.0);'
,'      vec3 turb1pt = vPosition + vec3(mtime,0.0,0.0) + vec3(50.0,20.0,-31.0);'
,'      vec3 turb2pt = vec3(x*3.0, y*3.0, z*3.0) + vec3(mtime,0.0,0.0);'
,'      //'
,'      float t1 = turbulence(turb1pt);'
,'      float t2 = turbulence(turb2pt);'
,'      float rad = car2radius(vPosition);'
,'      float incl = car2incl(vPosition, rad); '
,'      float azi = car2azi(vPosition);'
,'      float lat_amp = latamp(azi);'
,'      float long_amp = longamp(incl);'
,'      //'
,'      // float landamp = t1 < 0.2 ? 0.0 : t1;'
,'      float landamp = smoothstep(0.15, 0.45, t1*t1);'
,'      float oceanamp = 1.0 - landamp;'
,'      float cloudamp = t2*t2;'
,'      float coronaamp = 0.1 - min(0.1, dot(eyept, vNormal));'
,'      float lightamp = smoothstep(0.0, 0.2, t2*t2*t2);'
,'      //'
,'      vec3 oceanc = vec3(0.0, 0.0, .05);'
,'      vec3 linec = vec3(.2, .2, .2);'
,'      vec3 landc  = vec3(0.15, 0.15, 0.25);'
,'      vec3 cloudc = vec3(1.0, 1.0, 1.0);'
,'      vec3 lightc = vec3(0.5, 0.3, 0.2);'
,'      vec3 coronac = vec3(0.0, 0.0, 0.3);'
,'      //'
,'      float dfamp = abs(dot(vNormal, normalize((moonpt-vPosition))));'
,'      vec3 color = vec3(0.0,0.0,0.0);'
,'      if (t1 < 0.0) {'
,'        color = vec3(1.0,0.0,0.0);'
,'      }'
,'      else {'
,'        color = (landamp * landc) + (oceanamp * oceanc) + (lat_amp*linec ) + (long_amp*linec);'
,'        // color = color * dfamp;'
,'        // color += mix(color, cloudc, cloudamp);'
,'        color += lightc * min(lightamp, landamp);'
,'        color = clamp(color, 0.0, 1.0);'
,'      }'
,'      gl_FragColor = vec4(color, alpha);'
,'   }'
].join("\n");

registerGlyph("xplanet()",[
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
   [ [-1, -1], [1, 1]], 
]);

function xplanet() {
   var sketch = addSphereShaderSketch(defaultVertexShader, xplanetFragmentShader);
   sketch.code = [["xplanet", xplanetFragmentShader],["flame", flameFragmentShader]];
   sketch.enableFragmentShaderEditing();
};




var tworaysFragmentShader = [		       
,'   float raySphere(vec3 V, vec3 W, vec4 S) {'
,'      /* V is where we are looking from, W is the direction we are looking, S is the sphere we are testing against */'
,'      /* returns < 0 if no hit, otherwise distance to first hit from the viewpoint (V) */'
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
,'   vec3 calcPointOfInt(vec3 O, vec3 V, float dist) {'
,'      vec3 result;'
,'      result = vec3(O.x + (V.x*dist),O.y + (V.y*dist), O.z + (V.z*dist));'
,'      return result;'
,'   }'
,'   vec3 calcNormalOnSphere(vec3 Pt, vec4 S) {'
,'      vec3 N = normalize(vec3(Pt.x - S.x, Pt.y - S.y, Pt.z - S.z));'
,'      return N;'
,'   }'
,'   void main(void) {'
,'      vec3 V = vec3(0.,0.,0.);'
,'      vec3 W = normalize(vec3(dx,dy,-10.));'
,'      vec4 S = vec4(0.,0.,-20.5,.5);'
,'      float t = raySphere(V, W, S);'
,'      vec3 c = t==0. ? vec3(0.,0.,0.) : shadeSphere(W,V+t*W,S);'
,'      vec3 V2 = vec3(0.,0.,0.);'
,'      vec3 W2 = normalize(vec3(dx,dy,-8.));'
,'      vec4 S2 = vec4(mx,my,-12.5,.3); /* sph 2 rad = .5 */'
,'      float t2 = raySphere(V2, W2, S2);'
,'      vec3 c2 = t2==0. ? vec3(0.,0.,0.) : shadeSphere(W2,V2+t2*W2,S2);'
,'      vec3 PS1 = calcPointOfInt(V,W,t);  /* point of intersection on bg sphere */'
,'      /* calc normal at pt of intersection */'
,'      vec3 NS1 = calcNormalOnSphere(PS1, S);'
,'      /* calc reflection vector at pt of intersection */'
,'      vec3 reflvec = W - 2. * dot(NS1,W);'
,'      /* calc intersection of refl vector with 2nd sphere */'
,'      float inter2 = raySphere(PS1, reflvec, S2);'
,'      /* calc shade value at pt of intersection with 2nd sphere */'
,'      vec3 c_inter2 = inter2 <= 0. ? vec3(0.,0.,0.) : shadeSphere(reflvec, PS1 + inter2*reflvec, S2);'
,'      /* add this to the light intensity at this point */'
,'      /**/'
,'      vec3 cfinal = clamp(c+c2+c_inter2, 0., 1.);'
,'      gl_FragColor = vec4(cfinal, alpha);'
,'   }'
].join("\n");

function tworays() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, tworaysFragmentShader);
   sketch.code = [["",tworaysFragmentShader]];
   sketch.enableFragmentShaderEditing();
   sketch.mouseDrag = function() { }
}
// registerGlyph("rays()",[ [ [1,-1],[-1,-1],[-1,1],[1,1]], ]);


registerGlyph("tworays()",[
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
   makeOval(-1, -1, 1, 1, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
]);
