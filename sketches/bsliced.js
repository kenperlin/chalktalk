
var boringSlicedFragmentShader = ["\
    uniform float spinAngle;\
    void main(void) {\
      float rr = dx*dx + dy*dy;\
      float dz = rr >= 1. ? 0. : sqrt(1. - rr);\
      float dzdx = -1.3;\
      float zp = dzdx * (dx - mx * 1.3 - .2);\
      if (zp < -dz)\
         rr = 1.;\
      vec3 color = vec3(0.);\
      if (rr < 1.) {\
         vec3 nn = vec3(dx, dy, dz);\
         if (zp < dz) {\
            dz = zp;\
            nn = normalize(vec3(-dzdx,0.,1.));\
         }\
         float s = rr >= 1. ? 0. : .4 + max(0., dot(vec3(.2), nn)) + max(0., dot(vec3(-.1), nn));\
         float X =  dx * cos(spinAngle) + dz * sin(spinAngle);\
         float Y =  dy;\
         float Z = -dx * sin(spinAngle) + dz * cos(spinAngle);\
         vec3 P = vec3(.9*X,.9*Y,.9*Z + 8.);\
         float tu = ( selectedIndex>1. ? noise(P) : turbulence(P) );\
         float c = pow(.5 + .5 * sin(7. * X + 4. * tu), .1);\
         color = vec3(s*c,s*c*c*.6,s*c*c*c*.3);\
          if (selectedIndex > -1.) {\
            float checker = .5;\
            color = vec3(s);\
          }\
          if (selectedIndex > 0.) {\
            float checker = mod(floor(5.*X)+floor(5.*X)+floor(5.*X),2.);\
            color = vec3((checker+.25)*.5);\
            color *= s;\
          }\
          if (selectedIndex > 1.) {\
            float checker = mod(floor(5.*X)+floor(5.*Y)+floor(5.*Z),2.);\
            color = vec3((checker+.25)*.5);\
            color *= s;\
          }\
          if(selectedIndex > 2.){\
            float tube = .5+.5*sin(X*20.)*sin(Y*20.)*sin(Z*20.);\
            color = vec3(tube);\
            color *= s;\
          }\
          if(selectedIndex > 3.){\
            float col = sin(X*30.+sin(sin(X*30.0)*2.0+Y*9.0)*2.0);\
             color = vec3(col);\
             color *= s;\
          }\
          if(selectedIndex > 4.){\
            vec3 rand = vec3(fract(sin((sin(X*6.3)*2.1)*cos(Z*3.14))*3.33));\
            color = vec3(rand);\
            color *= s;\
          }\
          else {\
             float h = .2 * pow(dot(vec3(.67,.67,.48), nn), 20.);\
             color += vec3(h*0.4, h*.7, h);\
             color *= s;\
          }\
       }\
       gl_FragColor = vec4(color,alpha);\
   }\
"].join("\n");

registerGlyph("bSliced()",[
   makeOval(-1, -1, 2, 2, 32,  PI*0.5, PI*2.5),
   makeOval( 0, -1, 1, 1, 32,  PI*2.0, PI*0.5),
]);

function bSliced() {
   var sketch = addPlaneShaderSketch(defaultVertexShader, boringSlicedFragmentShader);
   if(!sketch.switcher)
      sketch.switcher = 0;
   sketch.mouseDrag = function(x, y) {}
   sketch.spinRate = 0;
   sketch.spinAngle = 0;
    sketch.code = [
      ["sphere", "(X,Y,Z)"],
      ["stripes", "mod ( floor(X) , 2 )"],
      ["checker", "mod(floor(X)+floor(Y)+floor(Z), 2 )"],
      ["dots", "0.5 + 0.5 * sin(X)*sin(Y)*sin(Z)"],
      ["waves", "sin(X + sin(2 * sin(X) + 9*Y))"],
      ["cartoon wood", "fract(sin(sin(6 * X) * cos(3 * Z)))"],
   ];
   // sketch.onClick = function() {
   //    this.spinRate = -1 - this.spinRate;
   //    if(this.spinRate>=0)
   //      this.switcher++;
   //    if(this.switcher>3)
   //      this.switcher = 0;
   // }
   sketch.onSwipe = function(dx, dy) {

      switch (pieMenuIndex(dx, dy)) {
        case 1:
          this.spinRate = -1 - this.spinRate;;
          break;
        case 3:
           if(this.spinRate>=0)
            this.switcher++;
          if(this.switcher>5)
            this.switcher = 0;
          break;
      }
   }
   sketch.update = function(elapsed) {
      this.setUniform('spinAngle', this.spinAngle += elapsed * this.spinRate);
   }
}
