requirejs.config({
    "baseUrl": "../../src",
    "paths": {
      "app": "./src",
      "THREE" : "../deps/three",
    },
    
    "shim": {
        "THREE" : {
			exports : "THREE"
		},
    }
});

// Load the main app module to start the app
requirejs(["main"]);