
var slicedFragmentShader = ["\
   uniform float spinAngle;\n\
   void main(void) {\n\
      float rr = dx*dx + dy*dy;\n\
      float dz = rr >= 1. ? 0. : sqrt(1. - rr);\n\
      float dzdx = -1.3;\n\
      float zp = dzdx * (dx - mx * 1.3 - .2);\n\
      if (zp < -dz)\n\
         rr = 1.;\n\
      vec3 color = vec3(0.);\n\
      if (rr < 1.) {\n\
         vec3 nn = vec3(dx, dy, dz);\n\
         if (zp < dz) {\n\
            dz = zp;\n\
            nn = normalize(vec3(-dzdx,0.,1.));\n\
         }\n\
         float s = rr >= 1. ? 0. : .3 + max(0., dot(vec3(.3), nn));\n\
         float X =  dx * cos(spinAngle) + dz * sin(spinAngle);\n\
         float Y =  dy;\n\
         float Z = -dx * sin(spinAngle) + dz * cos(spinAngle);\n\
         vec3 P = vec3(.9*X,.9*Y,.9*Z + 8.);\n\
         float t = selectedIndex == 3. ? 0.7 * noise(vec3(X,Y,Z)) :\n\
                   selectedIndex == 5. ? 0.5 * fractal(vec3(X,Y,Z)) :\n\
                   selectedIndex == 6. ? 0.8 * (turbulence(vec3(X,Y,Z+20.))+1.8) :\n\
   		                 0.0 ;\n\
         float c = .5 + .5*cos(7.*X+6.*t);\n\
	 if (selectedIndex == 1.)\n\
	    c = .2 + .8 * c;\n\
         else if (selectedIndex == 0.)\n\
            c = .5 + .4 * noise(vec3(3.*X,3.*Y,3.*Z));\n\
         else if (selectedIndex == 4.)\n\
            c = .5 + .4 * fractal(vec3(3.*X,3.*Y,3.*Z));\n\
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
"].join("\n");

registerGlyph("sliced()",[
   makeOval(-1, -1, 2, 2, 32,  PI*0.5, PI*2.5),
   makeOval( 0, -1, 1, 1, 32,  PI*0.5, PI*2.0),
]);

function sliced() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, slicedFragmentShader);
   sketch.code = [
      ["noise", ".5 + .5 * noise(x,y,z))"],
      ["stripe", ".5 + .5 * sin(x)"],
      ["pinstripe", "pstripe(x) = pow(.5 + .5 * sin(x), 0.1)"],
      ["add noise", "pstripe(x + noise(x,y,z))"],
      ["fractal", "fractal(x,y,z))"],
      ["add fractal", "pstripe(x + fractal(x,y,z))"],
      ["add turbulence", "pstripe(x + turbulence(x,y,z))"],
   ];
   sketch.mouseDrag = function(x, y) {}
   sketch.spinRate = 0;
   sketch.spinAngle = 0;
/*
   sketch.onClick = function() {
      this.spinRate = -1 - this.spinRate;
   }
*/
   sketch.onSwipe = function(dx, dy) {
      switch (pieMenuIndex(dx, dy)) {
      case 1: this.spinRate = -.5 - this.spinRate; break;
      case 3: this.spinRate =   0; break;
      }
   }
   sketch.update = function(elapsed) {
      this.setUniform('spinAngle', this.spinAngle += elapsed * this.spinRate);
   }
}
