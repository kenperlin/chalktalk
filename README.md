
**Chalktalk** is a graphic blackboard to teach sciences, computer sciences and more. 
A list of +250 objects ("glyphs") with specific behaviors is available. Glyphs can be connected and affect each others via an input/output maner, so meaningful mecanisms can be build. Glyphs can also be reprogrammed, stylized.

### Dependencies
This version of Chalktalk requires node.js to run. Go to http://nodejs.org/download/ and download node.js

### Installation

	git clone git@github.com:kenperlin/chalktalk.git     # download chalktalk
	cd ./chalktalk/server
	npm install          # install chalktalk server's dependencies
	
### Run
Get your terminal back into ```./chalktalk``` directory.

	./run                # run chalk talk

Then, open `localhost:11235` in your browser. Or via terminal :

	google-chrome http://localhost:11235       # with chrome
	chromium-browser "http://localhost:11235"  # with chromium

### UI's API
To make Chrome run full-screen (the best way to run Chalktalk), use COMMAND-SHIFT-f


### 
To draw something, just drag your mouse.

To see the hot keys menu and tool tips, hold down the SPACE key.


### Hacking
To try creating your own sketch type, copy any of the files in
the sketches/ folder to a new sketches/WHATEVER.js file.

In your new file, change the value of this.label, and customize
it to draw a different shape.

### License
(to come)


