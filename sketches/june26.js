var flameFragmentShader = ["\
   void main(void) {\n\
      vec3 p = 20.*vPosition;\n\
      float nx = .5 * noise(.1*p);\n\
      float ny = .5 * noise(.1*p + vec3(100., 0., 0.));\n\
      float s = .25 * p.z + turbulence(vec3(p.x+nx, p.y+ny, p.z+.3*time));\n\
      float ss = s * s;\n\
      vec3 color = mix(vec3(.35,0.,0.), s * vec3(1.,ss,ss*ss), min(1., 2.*vNormal.z));\n\
      gl_FragColor = vec4(color, alpha);\n\
   }\
"].join("\n");
