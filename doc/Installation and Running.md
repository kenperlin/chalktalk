# Installing Chalktalk

Begin by downloading or cloning the Chalktalk repository in full.

Next, ensure you have [Node.js](https://nodejs.org/en/) installed.

Open a terminal window, `cd` into the `server` directory within Chalktalk, and run `npm install`. This will download Chalktalk's dependencies into the `server/node_modules` directory.

# Running Chalktalk

## macOS or Linux

You should be able to just run the `run` script from the terminal. This will run a node.js server in the background and try to automatically open Chrome to the Chalktalk URL.

(If you want to use another browser, you can, by going to <localhost:11235>.)

## Windows

The `run` script doesn't work on Windows, but you can still run Chalktalk by running `node server/main.js`, and then navigating to <localhost:11235> in any modern browser.