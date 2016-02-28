function() {
   this.label = 'slice';
   this.render = function() {
      this.duringSketch(function() {
         mCurve(makeOval(-.95, -.95, 1.9, 1.9, 32,PI/2,5*PI/2));
         mCurve([ [0,-.95], [1/2,-1/3], [-1/2,1/3], [0,.95] ]);
      });
   }

   this.fragmentShaders = [

   ["\
   float type      = 0.0;\n\
   float frequency = 1.0;\n\
   float spinAngle = 1.0;\n\
   void main(void) {\n\
      float x = vPosition.x;\n\
      float y = vPosition.y;\n\
      float rr = x*x + y*y;\n\
      float z = rr >= 1. ? 0. : sqrt(1. - rr);\n\
      float dzdx = -1.3;\n\
      float zp = dzdx * (x - mx * 1.3 - .2);\n\
      if (zp < -z)\n\
         rr = 1.;\n\
      vec3 color = vec3(0.);\n\
      if (rr < 1.) {\n\
         vec3 nn = vec3(x, y, z);\n\
         if (zp < z) {\n\
            z = zp;\n\
            nn = normalize(vec3(-dzdx,0.,1.));\n\
         }\n\
         float s = rr >= 1. ? 0. : .3 + max(0., dot(vec3(.3), nn));\n\
         float X =  x * cos(spinAngle) + z * sin(spinAngle);\n\
         float Y =  y;\n\
         float Z = -x * sin(spinAngle) + z * cos(spinAngle);\n\
         vec3 P = vec3(.9*X,.9*Y,.9*Z + 8.);\n\
         float t = type == 3. ? 0.7 * noise(frequency*vec3(X,Y,Z)) :\n\
                   type == 5. ? 0.5 * fractal(frequency*vec3(X,Y,Z)) :\n\
                   type == 6. ? 0.8 * (turbulence(frequency*vec3(X,Y,Z+20.))+1.8) :\n\
                                    0.0 ;\n\
         float c = .5 + .5*cos(7.*frequency*X+6.*t);\n\
         if (type == 0.)\n\
            c = .5 + .4 * noise(3. * frequency * vec3(X,Y,Z));\n\
         else if (type == 1.)\n\
            c = .2 + .8 * c;\n\
         else if (type == 4.)\n\
            c = .5 + .4 * fractal(3. * frequency * vec3(X,Y,Z));\n\
         else\n\
            c = pow(c, .1);\n\
         color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\n\
         if (nn.x > 0.) {\n\
            float h = .2 * pow(dot(vec3(.67,.67,.48), nn), 20.);\n\
            color += vec3(h*.4, h*.7, h);\n\
         }\n\
         else {\n\
            float h = .2 * pow(dot(vec3(.707,.707,0.), nn), 7.);\n\
            color += vec3(h, h*.8, h*.6);\n\
         }\n\
      }\n\
      gl_FragColor = vec4(color,alpha*(rr<1.?1.:0.));\n\
   }\
   "].join("\n"),

   ];

   this.createMesh = function() {
      return new THREE.Mesh(planeGeometry(), this.shaderMaterial());
   }
}


