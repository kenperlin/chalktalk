"use strict";

var overview_scale = 3;

function overview_click(x, y, z) {
   if (z === undefined) z = 0;
   var panX = _g.panX, panY = _g.panY, panZ = _g.panZ;
   _g.panX = (width() /2 - (x + _g.panX)) * overview_scale;
   _g.panY = (height()/2 - (y + _g.panY)) * overview_scale;
   _g.panZ = (0          - (z + _g.panZ)) * overview_scale;
   group.translate(panX - _g.panX, panY - _g.panY, panZ - _g.panZ);
   isOverviewMode = false;
}

function overview_update() {
   var w = width();
   var h = height();

   function xInOverview(x) { return mix(x, (x - w/2) / overview_scale + w/2 - _g.panX, alpha); }
   function yInOverview(y) { return mix(y, (y - h/2) / overview_scale + h/2 - _g.panY, alpha); }
   function zInOverview(z) { return mix(z, (z      ) / overview_scale       - _g.panZ, alpha); }

   // WHEN ZOOMED OUT, DRAW OVERVIEW OF ENTIRE WORLD.

   var a, b;
   overview_alpha = isOverviewMode ? min(1, overview_alpha + This().elapsed * 2)
                                   : max(0, overview_alpha - This().elapsed);

   if (overview_alpha > 0) {
      ctScene.doDepthTest(false);

      a = overview_alpha;
      if (! isOverviewMode)
         a = max(0, 2 * a - 1);
      b = overview_alpha < .5 ? 2 * overview_alpha : 1;
      var alpha = sCurve(a);
      var blend = sCurve(b);

      color(bgScrimColor(blend));

      fillRect(-_g.panX, -_g.panY, w, h);

      lineWidth(5 / mix(1, overview_scale, a));
      for (var I = 0 ; I < nsk() ; I++)
         if (! group.containsSketch(sk(I))) {
            color(scrimColor(blend / 4, sk(I).colorId));
            sk(I).drawTransformed(xInOverview, yInOverview);
         }

      for (var I = 0 ; I < nsk() ; I++)
         if (! group.containsSketch(sk(I)))
            for (var i = 0 ; i < sk(I).out.length ; i++)
               if (isDef(sk(I).out[i]))
                  for (var k = 0 ; k < sk(I).out[i].length ; k++)
                     sk(I).out[i][k].drawTransformed(xInOverview, yInOverview);

      var xmin = w * (1 - overview_scale) / 2;
      var xmax = w * (1 + overview_scale) / 2;
      var ymin = h * (1 - overview_scale) / 2;
      var ymax = h * (1 + overview_scale) / 2;

      lineWidth(5 / mix(1, overview_scale, overview_alpha));
      color(overlayFadedColor(.03 * overview_alpha));

      for (var x = xmin + w ; x < xmax ; x += w)
         line(xInOverview(x), yInOverview(ymin), xInOverview(x), yInOverview(ymax));
      for (var y = ymin + h ; y < ymax ; y += h)
         line(xInOverview(xmin), yInOverview(y), xInOverview(xmax), yInOverview(y));

      group.drawOverlayView();

      ctScene.doDepthTest(true);
   }

   // VISUAL FEEDBACK WHILE PANNING.

   if (overview_alpha < 1 && sketchPage.isPressed
                          && bgClickCount == 1
                          && bgAction_dir1 == -1
                          && ! sketchPage.isFocusOnLink) {

      var fadeIn = min(1, sketchPage.travel / clickSize());
      color(overlayScrimColor(fadeIn * .25 * (1 - overview_alpha)));
      lineWidth(2.5);

      // SHOW BOUNDARY OF THE WORLD.

      var xmin = w * (1 - overview_scale) / 2;
      var xmax = w * (1 + overview_scale) / 2;
      var ymin = h * (1 - overview_scale) / 2;
      var ymax = h * (1 + overview_scale) / 2;
      fillRect(xmin - w, ymin - h, w          , ymax - ymin + 2 * h);
      fillRect(xmin    , ymin - h, xmax - xmin,                   h);
      fillRect(xmin    , ymax    , xmax - xmin,                   h);
      fillRect(xmax    , ymin - h, w          , ymax - ymin + 2 * h);

      // SHOW GRID.

      for (var x = xmin + w ; x < xmax ; x += w)
         line(x, ymin, x, ymax);
      for (var y = ymin + h ; y < ymax ; y += h)
         line(xmin, y, ymax, y);
   }

   // FAINTLY OUTLINE ENTIRE SCREEN. 

   lineWidth(sketchPage.isFuzzyLines() ? 0.0001 : 0.25);
   color(sketchPage.isFuzzyLines() ? backgroundColor : overlayColor);
   drawRect(-_g.panX - 1, -_g.panY - 1, w + 2, h + 2);
}

