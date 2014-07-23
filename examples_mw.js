

// XPLANET

var xplanetFragmentShader = ["\
   void main(void) {\n\
      float mtime = 1.0 + time*0.1;\n\
      float dz = sqrt(1.-dx*dx-dy*dy);\n\
      float cRot = cos(.2*mtime), sRot = sin(.2*mtime);\n\
      float cVar = cos(.1*mtime), sVar = sin(.1*mtime);\n\
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
      vec3 color = vec3(d*f*.35, d*f*.7, d*f);          /* COLOR  */\n\
      gl_FragColor = vec4(color,alpha*min(1.,10.*d));\n\
   }\
"].join("\n");

registerGlyph("xplanet()",[
   makeOval(-1, -1, 2, 2, 32,PI/2,5*PI/2),                // OUTLINE PLANET CCW FROM TOP.
   [ [0, -1], [0,1]], 
]);

function xplanet() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, xplanetFragmentShader);
   sketch.code = [["xplanet", xplanetFragmentShader],["flame", flameFragmentShader]];
   sketch.enableFragmentShaderEditing();
}


// YPLANET

var yplanetFragmentShader = ["\
   void main(void) {\n\
      float mtime = 1.0 + time*0.2;\n\
      float dz = sqrt(1.-dx*dx-dy*dy);\n\
      float cRot = cos(.2*mtime), sRot = sin(.2*mtime);\n\
      float cVar = cos(.1*mtime), sVar = sin(.1*mtime);\n\
      vec3 pt = vec3(cRot*dx+sRot*dz+cVar,dy,-sRot*dx+cRot*dz+sVar);\n\
      float g = turbulence(vPosition);\n\
      // float g = turbulence(pt);                         /* CLOUDS */\n\
      vec2 v = .6 * vec2(dx,dy);                        /* SHAPE  */\n\
      float d = 1. - 4.1 * dot(v,v);\n\
      float s = .3*dx + .3*dy + .9*dz; s *= s; s *= s;  /* LIGHT  */\n\
      d = d>0. ? .1+.05*g+.6*(.1+g)*s*s : d>-.1 ? d+.1 : 0.;\n\
      float f = -.2 + sin(4. * pt.x + 8. * g + 4.);     /* FIRE   */\n\
      f = f > 0. ? 1. : 1. - f * f * f;\n\
      if (d <= 0.1)\n\
         f *= (g + 5.) / 3.;\n\
      // vec3 color = vec3(d*f*f*.99, d*f*.3, d*f*.3);          /* COLOR  */\n\
      vec3 color = vec3(g*g, g*g, g*g); \n\
      gl_FragColor = vec4(color,1.0);\n\
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



