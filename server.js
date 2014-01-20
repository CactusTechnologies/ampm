var path = require('path'); //http://nodejs.org/api/path.html
var fs = require('node-fs'); // Recursive directory creation. https://github.com/bpedro/node-fs
var winston = require('winston'); // Logging. https://github.com/flatiron/winston

process.chdir(path.dirname(process.mainModule.filename));

global.configPath = '';

// args will be ['node', 'server.js', 'config.json']
if (process.argv.length > 2) {
    global.configPath = process.argv[2];
}

global.app = null;
global.comm = {};

function start() {
    global.config = global.configPath && fs.existsSync(global.configPath) ? JSON.parse(fs.readFileSync(global.configPath)) : {};
    console.log('Server starting up.');
    var ServerState = require('./model/serverState.js').ServerState;
    global.serverState = new ServerState(config.server);
    serverState.start();
    logger.info('Server started.');
}

start();

// Restart when config file changes.
if (global.configPath) {
    var restartTimeout = -1;
    fs.watch(global.configPath, {}, function(e, filename) {
        clearTimeout(restartTimeout);
        restartTimeout = setTimeout(function() {
            serverState.get('persistence').shutdownApp(start);
        }, 1000);
    });
}

/*
Misc
    Press a key in console window to bring up dashboard
    Press a key in app to bring up dashboard
    Shutdown/startup buttons
    Make startup schedule do restarts
    Add a tag property for loggly config to differentiate installs.
    There is an "unzipping app" message even if the app isn't new

Content Updater
    Backup current app/content to .old folders before beginning
    "Rollback" button to bring back .old
    Multiple remotes -- live and test data.

Demo App
    share state

Console
    Localhost console shows local client, master console shows all clients
        List of clients in config file, or use auto-discovery?
    Output
        Number of clients
        CPU temperature? http://ipmiutil.sourceforge.net/
        Display arbitrary amount of state per client (like ICE)
    Input
        Kill running client
        Kill all running clients
        Start dead client
        Start all clients
        Restart client
        Restart all clients
        Update content on all clients: kill process, update content, update client, restart client
        Config editor
        Push config to all clients

State manager
    Runs on master only
    App sends state to master over OSC on interval
    Server sends state to apps over OSC on interval
    State is just a JS object
    Server sends config to clients over socket on interval - or socket?
        On config, write to file and restart app with new config

Run as service? https://npmjs.org/package/node-windows
*/