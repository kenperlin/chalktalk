



var yplanetFragmentShader = ["\
   void main(void) {\n\
      float mtime = time*0.001;\n\
      //\n\
      vec3 eyept = vec3(0.0, 0.0, 1.0);\n\
      vec3 moonpt = vec3(100.0, 50.0, 0.0);\n\
      vec3 turb1pt = vPosition + vec3(mtime,0.0,0.0) + vec3(50.0,20.0,-31.0);\n\
      vec3 turb2pt = vec3(x*3.0, y*3.0, z*3.0) + vec3(mtime,0.0,0.0);\n\
      //\n\
      float t1 = turbulence(turb1pt);\n\
      float t2 = turbulence(turb2pt);\n\
      //\n\
      // float landamp = t1 < 0.2 ? 0.0 : t1;\n\
      float landamp = smoothstep(0.15, 0.45, t1*t1);\n\
      float oceanamp = 1.0 - landamp;\n\
      float cloudamp = t2*t2;\n\
      float coronaamp = 0.1 - min(0.1, dot(eyept, vNormal));\n\
      float lightamp = smoothstep(0.0, 0.2, t2*t2*t2);\n\
      //\n\
      vec3 oceanc = vec3(0.0, 0.0, .05);\n\
      vec3 landc  = vec3(0.15, 0.15, 0.25);\n\
      vec3 cloudc = vec3(1.0, 1.0, 1.0);\n\
      vec3 lightc = vec3(0.5, 0.3, 0.2);\n\
      vec3 coronac = vec3(0.0, 0.0, 0.3);\n\
      //\n\
      float dfamp = abs(dot(vNormal, normalize((moonpt-vPosition))));\n\
      vec3 color = vec3(0.0,0.0,0.0);\n\
      if (t1 < 0.0) {\n\
        color = vec3(1.0,0.0,0.0);\n\
      }\n\
      else {\n\
        color = (landamp * landc) + (oceanamp * oceanc);\n\
        // color = color * dfamp;\n\
        // color += mix(color, cloudc, cloudamp);\n\
        color += lightc * min(lightamp, landamp);\n\
        color = clamp(color, 0.0, 1.0);\n\
      }\n\
      gl_FragColor = vec4(color, alpha);\n\
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



