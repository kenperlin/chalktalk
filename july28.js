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
,'   vec3 marble(float x, float y) {'
,'      float s = pow(.5 - .5 * cos(5. * x + 5. * turbulence(.5*vec3(x,y,0.))), .2);'
,'      return vec3(s, s*s, s*s*s);'
,'   }'
,'   float disk(float X, float Y, float W, float H, float x, float y) {'
,'      float rx = W/2.;'
,'      float ry = H/2.;'
,'      float u = (x - (X+rx)) / rx;'
,'      float v = (y - (Y+ry)) / ry;'
,'      return edge(.5 * (1. - u*u - v*v));'
,'   }'
,'   void main(void) {'
,'      float D = disk(-.5,-.5, 1., 1., mx+dx,my+dy);'
,'      float xx = mix(dx, dx/8. - mx, D);'
,'      float yy = mix(dy, dy/8. - my, D);'
,'      float T = max(rect(-.2, -.9,  .4, 1.7, xx,yy),'
,'                    rect(-.9,  .5, 1.8,  .4, xx,yy));'
,'      gl_FragColor = vec4(T * marble(xx,yy), alpha);'
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

