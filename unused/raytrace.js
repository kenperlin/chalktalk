function() {
   this.label = 'raytrace';
   this.mode = 0;
   this.onCmdClick = function() { this.mode++; }
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[-1, 1],[ 1, 1],[ 1,-1]]);
         mCurve([[-1, 1],[-1,-1],[ 1,-1]]);
      });
      if (this.mode > 0) {
         textHeight(this.mScale(0.3));
         mText("u", [0,-1.25]);
         mText("v", [-1.25,0]);
      }
   }

this.fragmentShaders = [

// 1
[''
,'   void main(void) {'
,'      vec3 color = vPosition * .5 + vec3(.5,.5,0.);'
,'      gl_FragColor = vec4(sqrt(color), uAlpha);'
,'   }'
].join('\n'),

// 2
raySphere.concat([''
,'   void main(void) {'
,'      vec3 color = vec3(0.,0.,0.);'
,'      vec4 sphere = vec4(0., 0., -1.4, 0.3);'
,'      vec3 V = vec3(0.,0.,0.);'
,'      vec3 W = normalize(vec3(vPosition.x, vPosition.y, -3.5));'
,'      float t = raySphere(V, W, sphere);'
,'      if (t > 0. && t < 1000.)'
,'         color = vec3(1.,1.,1.);'
,'      gl_FragColor = vec4(sqrt(color), uAlpha);'
,'   }'
].join('\n')),

// 3
raySphere.concat([''
,'   vec3 shadeSphere(vec3 W, vec3 P, vec4 s) {'
,'      vec3 normal = (P - s.xyz) / s.w;'
,'      vec3 color = normal;'
,'      return color;'
,'   }'
,'   void main(void) {'
,'      vec3 color = vec3(0.,0.,0.);'
,'      vec4 sphere = vec4(0., 0., -1.4, 0.3);'
,'      vec3 V = vec3(0.,0.,0.);'
,'      vec3 W = normalize(vec3(vPosition.x, vPosition.y, -3.5));'
,'      float t = raySphere(V, W, sphere);'
,'      if (t > 0. && t < 1000.)'
,'         color = shadeSphere(W, V + t * W, sphere);'
,'      gl_FragColor = vec4(sqrt(color), uAlpha);'
,'   }'
].join('\n')),

// 4
raySphere.concat([''
,'   vec3 lightDir;'
,'   vec3 lightColor;'
,'   vec3 shadeDiffuseSphere(vec3 P, vec4 s, vec3 m, vec3 lightDir, vec3 lightColor) {'
,'      vec3 normal = (P - s.xyz) / s.w;'
,'      vec3 color = .2 * m;'
,'      float diffuse = max(0., dot(normal, lightDir));'
,'      color += lightColor * m * diffuse;'
,'      return color;'
,'   }'
,'   void main(void) {'
,'      lightDir = normalize(vec3(uCursor.x,uCursor.y,1.));'
,'      lightColor = vec3(1.,1.,1.);'
,'      vec3 color = vec3(0.,0.,0.);'
,'      vec4 sphere = vec4(0., 0., -1.4, 0.3);'
,'      vec3 material = vec3(.5, .2, .1);'
,'      vec3 V = vec3(0.,0.,0.);'
,'      vec3 W = normalize(vec3(vPosition.x, vPosition.y, -3.5));'
,'      float t = raySphere(V, W, sphere);'
,'      if (t > 0. && t < 1000.)'
,'         color = shadeDiffuseSphere(V + t * W, sphere, material, lightDir, lightColor);   '
,'      gl_FragColor = vec4(sqrt(color), uAlpha);'
,'   }'
].join('\n')),

// 5
raySphere.concat([''
,'   vec3 lightDir, lightColor;'
,'   vec3 shadeSphere(vec3 W, vec3 P, vec4 s, vec4 m) {'
,'      vec3 normal = (P - s.xyz) / s.w;'
,'      vec3 R = W - 2. * normal * dot(W, normal);'
,'      vec3 color = .2 * m.rgb;'
,'      float diffuse = max(0., dot(normal, lightDir));'
,'      color += lightColor * m.rgb * diffuse;'
,'      float specular = pow(max(0., dot(lightDir, R)), m.a) * min(1., m.a / 20.);   '
,'      color += lightColor * specular;'
,'      return color;'
,'   }'
,'   void main(void) {'
,'      lightDir = normalize(vec3(uCursor.x,uCursor.y,1.));'
,'      lightColor = vec3(1.,1.,1.);'
,'      vec3 color = vec3(0.,0.,0.);'
,'      vec4 sphere = vec4(0., 0., -1.4, 0.3);'
,'      vec4 material = vec4(.5, .2, .1, 10.);'
,'      vec3 V = vec3(0.,0.,0.);'
,'      vec3 W = normalize(vec3(vPosition.x, vPosition.y, -3.5));'
,'      float t = raySphere(V, W, sphere);'
,'      if (t > 0. && t < 1000.)'
,'         color = shadeSphere(W, V + t * W, sphere, material);'
,'      gl_FragColor = vec4(sqrt(color), uAlpha);'
,'   }'
].join('\n')),

// 6
raySphere.concat([''
,'   vec3 lightDir[2], lightColor[2];'
,'   vec4 sphere[3], material[3];'
,'   vec3 shadeSphere(vec3 W, vec3 P, vec4 s, vec4 m) {'
,'      vec3 ambient = .2 * m.rgb;'
,'      vec3 diffuse = m.rgb;'
,'      vec3 specular = vec3(1.,1.,1.) * min(1., m.a / 20.);'
,'      vec3 normal = (P - s.xyz) / s.w;'
,'      vec3 R = W - 2. * normal * dot(W, normal);'
,'      vec3 color = ambient;'
,'      for (int i = 0 ; i < 2 ; i++) {'
,'         float d = pow(max(0., dot(lightDir[i], normal)), 1.5);'
,'         float s = pow(max(0., dot(lightDir[i], R)), m.a);'
,'         color += lightColor[i] * (diffuse * d + specular * s);'
,'      }'
,'      return color;'
,'   }'
,'   void main(void) {'
,'      lightDir[0] = vec3(-.5,-.5,-.3);'
,'      lightDir[1] = normalize(vec3(uCursor.x, uCursor.y, .5));'
,'      lightColor[0] = vec3(1.0,0.5,0.0);'
,'      lightColor[1] = vec3(0.4,0.7,1.0);'
,'      vec3 V = vec3(0.,0.,0.);'
,'      vec3 W = normalize(vec3(vPosition.x, vPosition.y, -3.5));'
,'      sphere[0] = vec4(0., 0., -1.4, 0.15);'
,'      sphere[1] = vec4( .3*cos(.8*uTime), 0., -1.4 + .3*sin(.8*uTime), 0.1);'
,'      sphere[2] = vec4(0., -.3*cos(.8*uTime), -1.4 - .3*sin(.8*uTime), 0.1);'
,'      material[0] = vec4(.50, .50, .50,  5.);'
,'      material[1] = vec4(.00, .25, .75, 20.);'
,'      material[2] = vec4(.80, .00, .10, 20.);'
,'      vec3 color = vec3(0., 0., 0.);'
,'      float t, T = 1000.0;'
,'      for (int i = 0 ; i < 3 ; i++)'
,'         if ((t = raySphere(V, W, sphere[i])) > 0. && t < T) {'
,'            color = shadeSphere(W, V + t * W, sphere[i], material[i]);'
,'            T = t;'
,'         }'
,'      gl_FragColor = vec4(sqrt(color), uAlpha);'
,'   }'
,''
].join('\n')),

// 7
raySphere.concat([''
,'   vec3 lightDir[2], lightColor[2];'
,'   vec4 sphere[3], material[3];'
,'   int findSphere(vec3 V, vec3 W) {'
,'      int I = -1;'
,'      float t, T = 1000.;'
,'      for (int i = 0 ; i < 3 ; i++)'
,'         if ((t = raySphere(V, W, sphere[i])) > 0. && t < T) { I = i; T = t; }'
,'      return I;'
,'   }'
,'   vec3 shadeSphere(vec3 W, vec3 S, vec4 s, vec4 m) {'
,'      vec3 normal = (S - s.xyz) / s.w;'
,'      vec3 R = W - 2. * normal * dot(W, normal);'
,'      vec3 color = m.rgb * .2;'
,'      for (int i = 0 ; i < 2 ; i++)'
,'         if (findSphere(S + .01 * lightDir[i], lightDir[i]) < 0) {'
,'            float d = pow(max(0., dot(lightDir[i], normal)), 1.5);'
,'            float s = pow(max(0., dot(lightDir[i], R)), m.a);'
,'            color += lightColor[i] * (m.rgb * d + min(1., m.a / 20.) * s);'
,'         }'
,'      return color;'
,'   }'
,'   vec3 rayTrace(vec3 V, vec3 W) {'
,'      int I = findSphere(V, W);'
,'      if (I == -1) return vec3(0.,0.,0.);'
,'      vec4 s = I==0 ? sphere  [0] : I==1 ? sphere  [1] : sphere  [2];'
,'      vec4 m = I==0 ? material[0] : I==1 ? material[1] : material[2];'
,'      return shadeSphere(W, V + W * raySphere(V, W, s), s, m);'
,'   }'
,'   void main(void) {'
,'      lightDir[0] = vec3(-.5,-.5,-.3);'
,'      lightDir[1] = normalize(vec3(uCursor.x, uCursor.y, .5));'
,'      lightColor[0] = vec3(1.0,0.5,0.0);'
,'      lightColor[1] = vec3(0.4,0.7,1.0);'
,'      sphere[0] = vec4(0., 0., -1.4, 0.15);'
,'      sphere[1] = vec4( .3*cos(.8*uTime), 0., -1.4 + .3*sin(.8*uTime), 0.1);'
,'      sphere[2] = vec4(0., -.3*cos(.8*uTime), -1.4 - .3*sin(.8*uTime), 0.1);'
,'      material[0] = vec4(.50, .50, .50,  5.);'
,'      material[1] = vec4(.00, .25, .75, 20.);'
,'      material[2] = vec4(.80, .00, .10, 20.);'
,'      vec3 W = normalize(vec3(vPosition.x, vPosition.y, -3.5));'
,'      vec3 color = rayTrace(vec3(0.,0.,0.), W);'
,'      gl_FragColor = vec4(sqrt(color), uAlpha);'
,'   }'
,''
].join('\n')),

];

   this.createMesh = function() {
      return new THREE.Mesh(planeGeometry(), this.shaderMaterial());
   }
}
