
**Chalktalk** is a graphic blackboard to teach sciences, computer sciences and more. 
A list of +250 objects ("glyphs") with specific behaviors is available. Glyphs can be connected and affect each others via an input/output maner, so meaningful mecanisms can be build. Glyphs can also be reprogrammed, stylized.

## This branch

This is an experimental branch for Chalktalk aimed at overhauling Chalktalk's connection/link system, by requiring sketches to declare what type of data they're outputting and what type of data they're expecting as input.

A type system called Atypical is currently being developed as a way to support this. This type system is implemented wholly in Javascript, and is focused on making it easy to define data conversions between types, so as to maximize interoperability between sketches (within reasonable limits). You can see the current implementation in the top-level `types` directory.

### Dependencies
This version of Chalktalk requires node.js to run. Go to http://nodejs.org/download/ and download node.js

### Installation

	git clone git@github.com:kenperlin/chalktalk.git   # download chalktalk
	cd ./chalktalk/server
	npm install                                        # install chalktalk server's dependencies
	
### Run
Get your terminal back into ```./chalktalk``` directory.

	# cd ..              
	./run                # run chalktalk

Then, open `localhost:11235` in your browser. Or via terminal :

	google-chrome http://localhost:11235       # with chrome
	chromium-browser "http://localhost:11235"  # with chromium

You can now draw your objects and play around.

### UI's API

**Basics**

- `[COMMAND-SHIFT-f]`, `[F11]` : switch to full screen (recommended)
- `[Space bar]` : shows up short-keys
- `[=]` : display list of objects
- `[left click]` : toggle between "drawing cursor" ![chalktalk-draw-18px](https://cloud.githubusercontent.com/assets/1420189/21187667/16a47a16-c219-11e6-8300-4a577c3826f4.png) and "move focus cursor" ![chalktalk-move-18px](https://cloud.githubusercontent.com/assets/1420189/21187666/169d4e62-c219-11e6-842c-cea6532d8cf2.png)
- `[double left click]` : transform set of nearby lines into the most resembling glyph
- `...` : connect two glyph via output->input

<!--
![chalktalk-move-24px](https://cloud.githubusercontent.com/assets/1420189/21187406/1d4fbaca-c218-11e6-82c8-400aa479cbb3.png)
![chalktalk-move-18px](https://cloud.githubusercontent.com/assets/1420189/21187666/169d4e62-c219-11e6-842c-cea6532d8cf2.png)
![chalktalk-move-16px](https://cloud.githubusercontent.com/assets/1420189/21187407/1d5960d4-c218-11e6-8fea-2ea3b88604c3.png)
![chalktalk-move-12px](https://cloud.githubusercontent.com/assets/1420189/21187409/1d67e6d6-c218-11e6-938a-ea992b1a7435.png)
![chalktalk-draw-12px](https://cloud.githubusercontent.com/assets/1420189/21187408/1d67b706-c218-11e6-8e3b-4ceb80e2186b.png)
![chalktalk-draw-16px](https://cloud.githubusercontent.com/assets/1420189/21187410/1d6af8a8-c218-11e6-8b20-db9b9a8f5762.png)
![chalktalk-draw-18px](https://cloud.githubusercontent.com/assets/1420189/21187667/16a47a16-c219-11e6-8300-4a577c3826f4.png)
![chalktalk-draw-24px](https://cloud.githubusercontent.com/assets/1420189/21187411/1d6b43f8-c218-11e6-8537-d1f71f7c9739.png)
-->

**Drawing, select, code**

- ![chalktalk-draw-24px](https://cloud.githubusercontent.com/assets/1420189/21187411/1d6b43f8-c218-11e6-8537-d1f71f7c9739.png) `+ left-click + slide` : handdraw one line
- `draw multiple lines + double click` : handdraw glyph (stroke order and directions sensitive)
- `[]` : select object
- `[]` : edit object's properties
- `[]` : edit object's code

**View**

- `[]` : zoom in
- `[]` : zoom out
- ![chalktalk-move-24px](https://cloud.githubusercontent.com/assets/1420189/21187406/1d4fbaca-c218-11e6-82c8-400aa479cbb3.png) `+ left-click` : 2D directional moves to top, right, bottom, left
- `[Shift+R]` : 3D activation/desactivation
- `[]` : 3D directional moves

### Usages
To draw something, just drag your mouse.

To see the hot keys menu and tool tips, hold down the SPACE key.


### Hacking
To try creating your own sketch type, copy any of the files in
the sketches/ folder to a new sketches/WHATEVER.js file.

In your new file, change the value of this.label, and customize
it to draw a different shape.

### License
(to come)


