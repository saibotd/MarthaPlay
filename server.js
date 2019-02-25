const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const glob = require('glob');
const mm = require('musicmetadata');
const mpg321 = require('mpg321');
const moment = require('moment-timezone');
const cronParser = require('cron-parser');
let config = require('./config.json');

const player = mpg321(config.mpg321_opts).remote();
const app = express();

let state = 'stop',
    metadata = {},
    playlist = [],
    playIndex = 0,
    alarmActive = false;

app.use(express.static(__dirname + '/public'));
app.get('/img/:path', (req, res) => {
    const file = fs.readFileSync(req.params.path);
    res.writeHead(200, {'content-type': 'image/jpeg'});
    res.end(file);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, port: 2222 });

function playerStatusBroadcast(type, status){
    state = status;
    wss.clients.forEach((client)=>{
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ action: 'player',  type, status }));
        }
    });
}

function broadcastState(){
    const file = playlist.length > playIndex ? playlist[playIndex] : null;
    playerStatusBroadcast(file ? 'play' : 'stop', {
        index : playIndex,
        playlist: playlist,
        file : file,
        metadata : file && metadata[file] ? metadata[file] : {}
    });
}

player.on('info', ()=>{
    broadcastState();
});

player.on('end', ()=>{
    console.log(playIndex);
    if(inList(playIndex+1)){
        playIndex++;
        play(playlist[playIndex]);
    } else {
        playerStatusBroadcast('end', {});
        if(alarmActive){
            alarm(false);
        }
    }
});

function play(file = playlist[playIndex]){
    player.stop();
    player.play(file);
}

function alarm(activate=true){
    alarmActive = activate;
    if(activate){
        playlist = config.alarm.playlist;
        playIndex = 0;
        play();
    } else {
        player.stop();
        playlist = [];
        playIndex = 0;
        playerStatusBroadcast('end', {});
    }
    wss.clients.forEach((client)=>{
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ action: 'alarm', active: activate }));
        }
    });
}

function checkAlarm(){
    const alarmInterval = cronParser.parseExpression(config.alarm.schedule);
    const ms =  alarmInterval.next()._date.diff(moment());
    if(ms <= 60 * 1000) alarm();
    setTimeout(checkAlarm, 60 * 1000);
}

if(config.alarm.enabled){
    checkAlarm();
}

function inList(index=playIndex, list=playlist){
    return index > 0 && index < playlist.length;
}

function dirImages(dir){
    let images = [];
    images = glob.sync(dir+'/*.{jpeg,jpg,png,gif}');
    if(!images.length) images = glob.sync(dir+'/../*.{jpeg,jpg,png,gif}');
    return images;
}

wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        const payload = JSON.parse(message);
        switch(payload.data.action){
            case 'ls':
                glob(payload.data.path+'{/*/,/*.{mp3,flac,ogg}}', function(err, matches) {
                    const items = matches.map((m)=>{
                        var item = m.substr(payload.data.path.length+1);
                        if(item.endsWith('/')) item = item.substr(0, item.length-1);
                        return item;
                    })
                    ws.send(JSON.stringify({
                        id: payload.id,
                        data: {
                            action: 'ls',
                            path: payload.data.path,
                            items
                        }
                    }));
                });
            break;
            case 'stat':
                fs.stat(payload.data.path, function(err, stats) {
                    ws.send(JSON.stringify({
                        id: payload.id,
                        data: {
                            action: 'stat',
                            path: payload.data.path,
                            stats,
                            type: stats.isDirectory() ? 'dir' : 'file',
                            images: stats.isDirectory() ? dirImages(payload.data.path) : dirImages(payload.data.path+'/../')
                        }
                    }));
                });
            break;
            case 'play':
                playlist = payload.data.files;
                playIndex = payload.data.index;
                play();
            break;
            case 'metadata':
                const readableStream = fs.createReadStream(payload.data.path);
                mm(readableStream, (error, _metadata) => {
                    ws.send(JSON.stringify({
                        id: payload.id,
                        data: {
                            action: 'metadata',
                            path: payload.data.path,
                            metadata: _metadata,
                            error
                        }
                    }));
                    metadata[payload.data.path] = _metadata;
                    readableStream.close();
                });
            break;
            case 'pause':
                player.pause();
            break;
            case 'next':
                if(!inList(playIndex+1)) break;
                playIndex++;
                play();
            break;
            case 'prev':
                if(!inList(playIndex-1)) break;
                playIndex--;
                play();
            break;
            case 'config':
                ws.send(JSON.stringify({
                    id: payload.id,
                    data: {
                        action: 'config',
                        config: config
                    }
                }));
            break;
            case 'disable_alarm':
                alarm(false);
            break;
            case 'init':
                broadcastState();
            break;
        }
    });
});

server.listen(8080, () => {
  console.log('Listening on %d', server.address().port);
});

process.on('SIGINT', function (data) {
    playerStatusBroadcast('end', {})
    process.exit();
});