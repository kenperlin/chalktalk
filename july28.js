
/*
    For July 28, 2014 talk.
*/

var pixelsFragmentShader = ["\
   void main(void) {\n\
      vec3 color = vec3(1.0,0.5,0.1);\n\
      gl_FragColor = vec4(color,alpha);\n\
   }\
"].join("\n");

registerGlyph("pixels()",[
   [ [-1,-1],[1,-1],[1,1],[-1,1]],
]);

function pixels() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, pixelsFragmentShader);
   sketch.enableFragmentShaderEditing();
}

