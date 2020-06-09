const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const mm = require("musicmetadata");
const moment = require("moment-timezone");
const cronParser = require("cron-parser");
let config = require("./config.json");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(config.dir));

app.post("/ls", (req, res) => {
    glob(
        path.join(config.dir, req.body.path) + "{/*/,/*.{mp3,flac,ogg,mp4}}",
        function (err, matches) {
            const items = matches.map((m) => {
                var item = m.replace(config.dir, "");
                if (item.startsWith("/")) item = item.substr(1);
                if (item.startsWith(req.body.path))
                    item = item.substr(req.body.path.length);
                if (item.endsWith("/")) item = item.substr(0, item.length - 1);
                return item;
            });
            res.json({
                action: "ls",
                path: req.body.path,
                items,
            });
        }
    );
});

app.post("/stat", (req, res) => {
    fs.stat(path.join(config.dir, req.body.path), function (err, stats) {
        res.json({
            action: "stat",
            path: req.body.path,
            stats,
            type: stats.isDirectory() ? "dir" : "file",
            images: stats.isDirectory()
                ? dirImages(path.join(config.dir, req.body.path))
                : dirImages(path.join(config.dir, req.body.path, "/../")),
        });
    });
});

app.post("/metadata", (req, res) => {
    const readableStream = fs.createReadStream(
        path.join(config.dir, req.body.path)
    );
    mm(readableStream, (error, _metadata) => {
        res.json({
            action: "metadata",
            path: req.body.path,
            metadata: _metadata,
            error,
        });
        readableStream.close();
    });
});

app.get("/config", (req, res) => {
    res.json({
        action: "config",
        config: config,
    });
});

const server = http.createServer(app);
/*
function alarm(activate = true) {
    alarmActive = activate;
    if (activate) {
        playlist = config.alarm.playlist;
        playIndex = 0;
        play();
    } else {
        player.stop();
        playlist = [];
        playIndex = 0;
        playerStatusBroadcast("end", {});
    }
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ action: "alarm", active: activate }));
        }
    });
}

function checkAlarm() {
    const alarmInterval = cronParser.parseExpression(config.alarm.schedule);
    const ms = alarmInterval.next()._date.diff(moment());
    if (ms <= 60 * 1000) alarm();
    setTimeout(checkAlarm, 60 * 1000);
}

if (config.alarm.enabled) {
    //checkAlarm();
}
*/
function dirImages(dir) {
    let images = [];
    images = glob.sync(dir + "/*.{jpeg,jpg,png,gif}");
    if (!images.length) images = glob.sync(dir + "/../*.{jpeg,jpg,png,gif}");
    return images.map((item) => item.replace(config.dir, ""));
}

server.listen(8080, () => {
    console.log("Listening on %d", server.address().port);
});

process.on("SIGINT", function (data) {
    process.exit();
});
