/*
    For July 28, 2014 talk.
*/

var pixelsFragmentShader = [
,'   float edge(float t) {'
,'      return clamp(.5 + t / pixelSize, 0., 1.);'
,'   }'
,'   float rect(float X,float Y,float W,float H,float x,float y) {'
,'      return edge(x-X) * edge(X+W-x) * edge(y-Y) * edge(Y+H-y);'
,'   }'
,'   vec3 marble(float x, float y) {'
,'      float s = turbulence(.5*vec3(x,y,20.));'
,'      s = pow(.5 - .5 * sin(5. * x + 5. * s), .2);'
,'      return vec3(s, s*s, s*s*s);'
,'   }'
,'   float disk(float X,float Y,float W,float H,float x,float y) {'
,'      float rx = W/2.;'
,'      float ry = H/2.;'
,'      float u = (x - (X+rx)) / rx;'
,'      float v = (y - (Y+ry)) / ry;'
,'      return edge(.5 * (1. - u*u - v*v));'
,'   }'
,'   void main(void) {'
,'      float r = 60. * pixelSize;'
,'      float D = disk(-r+mx,-r+my, r+r, r+r, dx,dy);'
,'      float xx = mix(dx, dx/8. + mx, D);'
,'      float yy = mix(dy, dy/8. + my, D);'
,'      float T = max(rect(-.4, -.9,  .8, 1.8, xx,yy),'
,'                    rect(-.9,  .2, 1.8,  .8, xx,yy));'
,'      gl_FragColor = vec4(T * marble(xx,yy), alpha);'
,'   }'
].join("\n");

function pixels() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, pixelsFragmentShader);
   sketch.code = [["",pixelsFragmentShader]];
   sketch.enableFragmentShaderEditing();
   sketch.mouseDrag = function() { }
}
registerGlyph("pixels()",[ [ [-1,-1],[1,-1],[1,1],[-1,1]], ]);

var raysFragmentShader = [
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
,'      gl_FragColor = vec4(c, alpha);'
,'   }'
].join("\n");

function rays() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, raysFragmentShader);
   sketch.code = [["",raysFragmentShader]];
   sketch.enableFragmentShaderEditing();
   sketch.mouseDrag = function() { }
}
registerGlyph("rays()",[ [ [1,-1],[-1,-1],[-1,1],[1,1]], ]);


var ttgridFragmentShader = [
,'   void main(void) {'
,'      vec3 L1 = normalize(vec3(-1.,-1.,-.5));'
,'      vec3 L2 = normalize(vec3( 1., 1., .5));'
,'      float c = clamp(.1 * max(0.,dot(L1,vNormal)) + .8 * max(0.,dot(L2,vNormal)), .2, 1.);'
,'      gl_FragColor = vec4(c,c,c,alpha);'
,'   }'
].join("\n");


function ttgrid() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, ttgridFragmentShader, 63);
   sketch.code = [["", ttgridFragmentShader]];
   sketch.enableFragmentShaderEditing();
   sketch.update = function() {
      if (this.forceImage === undefined)
         this.forceImage = newZeroArray(64 * 64);
      imageEnlarge(ttForce, this.forceImage);
      var geometry = this.mesh.geometry;
      geometry.verticesNeedUpdate = true;
      geometry.normalsNeedUpdate = true;
      geometry.dynamic = true;
      for (var i = 0 ; i < this.forceImage.length ; i++) {
         var col = i % 64;
         var row = floor(i / 64);
         var j = 64 * (64-1-row) + col;
         geometry.vertices[j].z = this.forceImage[i];
      }
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();
   }
}
registerGlyph("ttgrid()",[ [ [-1,-1],[-1,1],[1,1],[1,-1]], ]);


