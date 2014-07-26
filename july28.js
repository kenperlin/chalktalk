.5
/*
    For July 28, 2014 talk.
*/

var pixelsFragmentShader = [
,'   float edge(float t) {'
,'      return clamp(.5 + t / pixelSize, 0., 1.);'
,'   }'
,'   float rect(float X, float Y, float W, float H, float x, float y) {'
,'      return edge(x-X) * edge(X+W-x) * edge(y-Y) * edge(Y+H-y);'
,'   }'
,'   float disk(float X, float Y, float W, float H, float x, float y) {'
,'      float rx = W/2.;'
,'      float ry = H/2.;'
,'      float u = (x - (X+rx)) / rx;'
,'      float v = (y - (Y+ry)) / ry;'
,'      return edge(.5 * (1. - u*u - v*v));'
,'   }'
,'   void main(void) {'
,'      vec3 color1 = vec3(0.,0.,0.);'
,'      vec3 color2 = vec3(1.,1.,1.);'
,'      float D = disk(-.5,-.5, 1., 1., mx+dx,my+dy);'
,'      float xx = mix(dx, dx/4., D);'
,'      float yy = mix(dy, dy/4., D);'
,'      float xd = mix(0., mx, D);'
,'      float yd = mix(0., my, D);'
,'      float T = rect(-.2+xd, -.9+yd, .4, 1.7, xx,yy);'
,'      T += rect(-.9+xd, .5+yd, 1.8, .4, xx,yy);'
,'      vec3 color = mix(color1, color2, T);'
,'      gl_FragColor = vec4(color,alpha);'
,'   }'
].join("\n");

registerGlyph("pixels()",[
   [ [-1,-1],[1,-1],[1,1],[-1,1]],
]);

function pixels() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, pixelsFragmentShader);
   sketch.code = [["",pixelsFragmentShader]];
   sketch.enableFragmentShaderEditing();
   sketch.mouseDrag = function() { }
}

