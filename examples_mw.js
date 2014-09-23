





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
