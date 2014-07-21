var marbleFragmentShader = ["\
   void main(void) {\n\
      float t = selectedIndex == 3. ? .7 * noise(vec3(dx,dy,0.)) :\n\
                selectedIndex == 4. ? .5 * fractal(vec3(dx,dy,5.)) :\n\
                selectedIndex == 5. ? .4 * (turbulence(vec3(dx*1.5,dy*1.5,10.))+1.8)\n\
		                    : .0 ;\n\
      float s = .5 + .5*cos(7.*dx+6.*t);\n\
      if (selectedIndex == 2.) \n\
         s = .5 + noise(vec3(3.*dx,3.*dy,10.));\n\
      else if (selectedIndex > 0.)\n\
         s = pow(s, .1);\n\
      vec3 color = vec3(s,s*s,s*s*s);\n\
      gl_FragColor = vec4(color,alpha);\n\
   }\n\
"].join("\n");

registerGlyph("marble()",[
   [ [-1,-1],[1,-1],[1,1],[-1,1],[-1,-1] ],    // SQUARE OUTLINE CW FROM TOP LEFT.
   [ [-1/3,-1], [-1/3,1] ],
   [ [ 1/3,-1], [ 1/3,1] ],
]);

function marble() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, marbleFragmentShader);
   sketch.code = [
      ["stripe", ".5 + .5 * sin(x)"],
      ["pinstripe", "pstripe(x) = pow(sin(x), 0.1)"],
      ["noise", ".5 + .5 * noise(x,y,z))"],
      ["add noise", "pstripe(x + noise(x,y,z))"],
      ["add fractal", "pstripe(x + fractal(x,y,z))"],
      ["add turbulence", "pstripe(x + turbulence(x,y,z))"],
   ];
}
