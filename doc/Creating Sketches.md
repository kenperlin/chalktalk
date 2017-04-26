# How to create a sketch

First, create a .js file in the `sketches/` folder.

In this sketch file, create an anonymous function. This function will be set as the `init` function of the sketch.

Set `this.label` to the name of the sketch. Can alternately set it to an array of names if you want to define multiple sketches in one file.

You also need to set `this.render` to be a function where you draw your sketch. This will get called every frame.

The minimum you need for a sketch is `this.label` and the `this.render` function:

``` javascript
function() {
    this.label = "myCoolSketch";
    this.render = function() {
        // Call drawing functions to draw your sketch here.
    }
}
```

# Drawing in a sketch

Within `this.render`, you can use functions such as `mLine` (two points), `mCurve` (many points in a line), `mDrawRect`, `mDrawOval`, etc.

Most of these drawing functions are defined in `mat.js`, look through that for some information.

Also see `mText(string, [x,y])` for text rendering. If you use this, you have to first call `textHeight(...)` to set the text size, or it'll be tiny/invisible. Use `this.mScale` to make the text size relative to the scale of the sketch. All together:

``` javascript
textHeight(this.mScale(.5));
// Set text height to 1/4 of height of sketch
// (in -1...1 bounding box)
```

These functions have these coordinates: -1 to 1 left to right, -1 to 1 bottom to top, within the bounding box of the sketch. These lines are used for *both* the rendering and the recognizer. Each line or curve is one stroke, and remember, stroke count matters!

You can live edit sketches using the "show code" sketch radial menu command (bottom-right + drag). Hit backquote (\`) to reinterpret the code after you're done editing.

There's also `this.afterSketch`, which should be called within `this.render`:

``` javascript
this.afterSketch(function(){
    // Here insert code that will run only
    // after the sketch is interpreted.
    // Put this in your this.render function.
});
```

Things drawn here *aren't* used in the recognizer, so you can draw with wild abandon.

Its counterpart is `this.duringSketch`, which is for things that should *only* be drawn while you're recognizing it. Things here vanish after sketches are recognized.

``` javascript
this.duringSketch(function(){
    // Here insert code that will only be seen ONLY
    // when a sketch is being recognized.
    // Put this in your this.render function.
});
```

Want to modify your sketch's transformation matrix? The matrix is stored in a variable called `m` (not `this.m`, just `m`). See `sketches/s2c.js` as an example. This gets reset to the identity matrix at the beginning of every render call.

Change color with the `color(...)` function. Takes a string, typical Javascript/CSS-esque color strings such as `"red"` or `"rgb(255, 128, 0)"`.

Want something to animate? Use the global variable `time`.

# Interactivity

Interacting with the mouse?

``` javascript
this.onPress = function(p) {
    // Called when the mouse is clicked.
    // Use p.x, p.y to get the position.
    // Both are from -1 to 1.
}

this.onDrag = function(p) {
    // Called when the mouse is dragged.
    // Same parameter as above.
}
```

Can also do `onCmdPress` and `onCmdDrag`, which are alternate inputs that activate after you hit the bottom-left "cmd" option in the sketch radial menu.

Another possibility for input is the `this.onSwipe` array, which allows you to define 8 different operations for 8 different swipe directions, e.g.:

``` javascript
this.onSwipe[0] = ["Description for help mode", function() {
    // Do whatever you like here
}];
```

These show up in the help mode overlay, which is nice.

# Adding parameters to your sketch

You can make certain aspects of your sketch "stretchy". For example, the fish sketch can be either long and thin or short and fat. The way to define these parameters is as such:

``` javascript
var result = this.stretch("parameter name goes here", S(0).width);
```

In the function call above, `S(0)` is the first stroke of your sketch. `S(1)` would be the second, and so on. Strokes have multiple different properties, such as `width` & `height` (which are obvious), `x` & `y`, (which give you the centre of the stroke) and `xhi`, `xlo`, `yhi` & `ylo` (which gives you the bounds of the stroke).

You can then use the number you get in `result` to change how your sketch is drawn.

You can see examples of this in sketches such as the pendulum, the fish, and the bird.

You can also inspect which parameters are available in sketches in the Chalktalk interface by clicking to the bottom-right of a sketch and swiping vertically (the "- params/code" option in the radial menu).

# Inputs and outputs

You can define output data from a sketch like this:

``` javascript
this.output = function () {
    // The return value of this function will
    // be passed through sketch links.
    return 10; // This example sketch will always output 10.
}
```

You can output any Javascript object.

To get the input values, you can access `this.inValue[n]`, which is an array of the values coming into the sketch. `this.inValue[0]` gives you the value of the first link you drew, `this.inValue[1]` gives you the second, and so on.

There's also `this.inValues`, which gives you a *flattened* version of the input values. For example, with the vector sketches, that output an array of 3 numbers, `this.inValues[0]` would give you the x coordinate of the first vector.

Note that there's not much guarantee as to what kind of value you're going to be getting in the `inValues` array. Like many other things in Chalktalk, this is an area of active research and as such the API may be changing over the next few months. (See the `type-system` branch if you're curious.)

# Interacting with other sketches

There are a few functions that can be defined on a sketch that get called when sketches are moved over them:

``` javascript
this.onIntersect = function(otherSketch) { ... }
```

When you move a sketch around, if it overlaps with another sketch, `this.onIntersect` is called on both sketches. This gets called every frame that the two sketches are touching. `obj` is the object this sketch is touching.

``` javascript
this.over = function(otherSketch) { ... }
this.under = function(otherSketch) { ... }
```

When one sketch is moved and dropped onto another sketch, then `this.over` is called *on the sketch being dropped*, with the sketch that it was dropped into as the parameter. Meanwhile, `this.under` is called *on the sketch that was dropped onto*, with the sketch that was dropped onto it as the parameter. In other words, if sketch A is moved and dropped onto sketch B, then `A.over(B)` is called and `B.under(A)` is called.