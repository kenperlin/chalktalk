var planetFragmentShader = ["\
   void main(void) {\n\
      float dz = sqrt(1.-dx*dx-dy*dy);\n\
      float cRot = cos(.2*time), sRot = sin(.2*time);\n\
      float cVar = cos(.1*time), sVar = sin(.1*time);\n\
      vec3 pt = vec3(cRot*dx+sRot*dz+cVar,dy,-sRot*dx+cRot*dz+sVar);\n\
      float g = turbulence(pt);                         /* CLOUDS */\n\
      vec2 v = .6 * vec2(dx,dy);                        /* SHAPE  */\n\
      float d = 1. - 4.1 * dot(v,v);\n\
      float s = .3*dx + .3*dy + .9*dz; s *= s; s *= s;  /* LIGHT  */\n\
      d = d>0. ? .1+.05*g+.6*(.1+g)*s*s : d>-.1 ? d+.1 : 0.;\n\
      float f = -.2 + sin(4. * pt.x + 8. * g + 4.);     /* FIRE   */\n\
      f = f > 0. ? 1. : 1. - f * f * f;\n\
      if (d <= 0.1)\n\
         f *= (g + 5.) / 3.;\n\
      vec3 color = vec3(d*f*f*.85, d*f, d*.7);          /* COLOR  */\n\
      gl_FragColor = vec4(color,alpha*min(1.,10.*d));\n\
   }\
"].join("\n");

registerGlyph("planet()",[
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
   [ [0,-1], [-1/2,-1/3], [1/2,1/3], [0,1] ], // ZIGZAG DOWN CENTER, FIRST LEFT THEN RIGHT.
]);

function planet() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, planetFragmentShader);
   sketch.code = [["planet", planetFragmentShader],["flame", flameFragmentShader]];
   sketch.enableFragmentShaderEditing();
}
