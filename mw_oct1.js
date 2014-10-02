
// front panel glyph and shader 

var fplFragmentShader = [
,'   vec3 gamma_encode(vec3 inclr, float gamma) {'
,'      vec3 r;'
,'      r = vec3(pow(inclr.x,gamma), pow(inclr.y,gamma), pow(inclr.z,gamma));'
,'      return r;'
,'   }'
,'   highp float mkspot(highp float tx, highp float periodx, highp float ty, highp float periody) {'
,'      highp float v1 = (sin(tx * periodx * 2.0 * 3.14159) + 1.0) * 0.5;'
,'      highp float v2 = (sin(ty * periody * 2.0 * 3.14159) + 1.0) * 0.5;' 
,'      highp float rval = pow(v1 * v2, 5.0);' 
,'      return rval; '
,'   }' 
,'   void main(void) {'
,'      float numrows = 7.;'
,'      float numcols = 7.;'
,'      float lt_radius = 0.25;'
,'      float glow_radius = 0.35;'
,'      float outline_radius = 0.4;'
,'      //'
,'      float tx = (dx + 1.) * 0.5;'
,'      float ty = (dy + 1.) * 0.5;'
,'      float ndx = (dx + 1.) * numcols * 0.5;'
,'      float ndy = (dy + 1.) * numrows * 0.5;'
,'      float mndx = floor(ndx);'
,'      float mndy = floor(ndy);' 
,'      float mtime = time * 0.025;'
,'      float trb1 = turbulence(vec3(mndx*42., mndy*32., floor(time*47.0)));'
,'      //'
,'      vec3 lt_clr = vec3(0.05, 0.1, 0.05);'
,'      vec3 nolt_clr = vec3(0.2, 0.0, 0.0);'
,'      vec3 panel_clr = vec3(0.0, 0.0, 0.0);'
,'      vec3 glow_clr = vec3(0.5, 0.2, 0.2);'
,'      vec3 line_clr = vec3(0.01, 0.01, 0.02);'
,'      vec3 outline_clr = vec3(0., .7, 0.);'
,'      vec3 spot_clr = vec3(0., 0.5, 0.5);'
,'      //'
,'      vec3   out_color = vec3(0., 0., 0.);'
,'      float  out_alpha = 1.0;'
,'      //'
,'      float lt_amp = 0., line_amp= 0., outline_amp = 0., spot_amp = 0.;'
,'      float a = sqrt((mndx*mndx) + (mndy*mndy));'
,'      spot_amp = mkspot(tx, numcols, ty, numrows);'
,'      spot_amp *= step(0.2, trb1);'
,'      // lt_amp = (spot_amp > 0.0) ? 0.0 : 1.0;'
,'      '
,'      // line_amp = step(0.975, max(mod(ndx, 1.0), mod(ndy, 1.0)));'
,'      //'
,'      out_color += spot_amp * spot_clr;'
,'      // out_color += lt_amp * lt_clr;'
,'      // out_color += outline_amp * outline_clr;'
,'      out_color += line_amp * line_clr;'
,'      out_color += (1.0 - (line_amp + lt_amp + spot_amp)) * panel_clr;' 
,'      //'
,'      // if (lt_amp < 0.0) out_color = vec3(0., 1., 0.);'
,'      out_color = gamma_encode(clamp(out_color, 0.0, 1.0), 0.6);'
,'      gl_FragColor = vec4(out_color, clamp(out_alpha, 0.0, 1.0));'
,'   }'			       
].join("\n");


registerGlyph("frontpanel()",[
		       [ [-1, -1], [-1, 1]],
		       [ [-1, 1], [0, 1]],
		       [ [-1, 0], [0, 0]], 
		       ]);

function frontpanel() {
    var sketch = addPlaneShaderSketch(defaultVertexShader, fplFragmentShader, 1);
    sketch.code = [["fpl", fplFragmentShader]];
    sketch.enableFragmentShaderEditing();
};

// end of front panel

