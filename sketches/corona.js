var coronaFragmentShader = ["\
   void main(void) {\n\
      float a = .7;\n\
      float b = .72;\n\
      float s = 0.;\n\
      float r0 = sqrt(dx*dx + dy*dy);\n\
      if (r0 > a && r0 <= 1.) {\n\
         float r = r0;\n\
         if (selectedIndex == 2.)\n\
            r = min(1., r + 0.2 * turbulence(vec3(dx,dy,0.)));\n\
         else if (selectedIndex == 3.) {\n\
            float ti = time*.3;\n\
            float t = mod(ti, 1.);\n\
            float u0 = turbulence(vec3(dx*(2.-t)/2., dy*(2.-t)/2., .1* t    +2.));\n\
            float u1 = turbulence(vec3(dx*(2.-t)   , dy*(2.-t)   , .1*(t-1.)+2.));\n\
            r = min(1., r - .1 + 0.3 * mix(u0, u1, t));\n\
         }\n\
         s = (1. - r) / (1. - b);\n\
      }\n\
      if (r0 < b)\n\
         s *= (r0 - a) / (b - a);\n\
      vec3 color = vec3(s);\n\
      if (selectedIndex >= 1.) {\n\
         float ss = s * s;\n\
         color = s*vec3(1.,ss,ss*ss);\n\
      }\n\
      gl_FragColor = vec4(color,alpha*s);\n\
   }\
"].join("\n");

registerGlyph("corona()",[
   makeOval(-.5, -.5, 1, 1, 32,PI/2,5*PI/2),              // INNER LOOP CCW FROM TOP.
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTER LOOP CCW FROM TOP.
]);

function corona() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, coronaFragmentShader);
   sketch.code = [
      ["radial", "r = radius(x,y)"],
      ["color grad", "grad(r)"],
      ["turbulence", "grad(r + turbulence(P))"],
      ["animate", "grad(r + turbulence(P(time)))"],
   ];
}
