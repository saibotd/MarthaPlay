import axios from "axios";
import { observer } from "mobx-react";
import path from "path";
import React from "react";
import PlayerState from "../Models/PlayerState";
import Alarm from "./Alarm";
import FileList from "./FileList";
import PlayerControls from "./PlayerControls";
import Screensaver from "./Screensaver";
import VideoPlayer from "./VideoPlayer";

@observer
export default class App extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            path: [],
            config: null,
            video: null,
        };
        window.App = this;
    }
    componentDidMount() {
        this.loadConfig();
    }
    loadConfig = async () => {
        const { data } = await axios.get("/config");
        document.getElementById(
            "root"
        ).style.transform = `rotate(${data.config.rotation}deg);`;
        this.setState({ config: data.config });
    };
    handleFolderItemClick = (item, depth) => {
        if (depth < this.state.path.length)
            this.state.path = this.state.path.slice(0, depth);
        if (depth == 0) this.state.path = [];
        this.state.path.push(item);
        this.setState({ path: this.state.path });
    };
    handleAudioFileItemClick = (files, index) => {
        PlayerState.setPlaylist(files, index);
    };
    handleVideoFileItemClick = (video) => {
        if (PlayerState.state == "play") PlayerState.pause();
        this.setState({ video });
    };
    handleBackClick = (depth) => {
        this.state.path = this.state.path.slice(0, depth - 1);
        this.setState({ path: this.state.path });
    };
    componentDidUpdate() {
        var offset = window.innerHeight * 0.75 * this.state.path.length - 40;
        if (offset == -40) offset = 0;
        document.getElementById("filelists").style.transform =
            "translateY(-" + offset + "px)";
    }
    render() {
        if (!this.state.config) return null;
        let _path = "";
        const fileLists = this.state.path.map((pathPart, i) => {
            _path = path.join(_path, pathPart);
            return (
                <FileList
                    key={_path}
                    depth={i + 1}
                    path={_path}
                    onBackClick={this.handleBackClick}
                    onFolderItemClick={this.handleFolderItemClick}
                    onAudioFileItemClick={this.handleAudioFileItemClick}
                    onVideoFileItemClick={this.handleVideoFileItemClick}
                />
            );
        });
        return (
            <div>
                <div id="filelists">
                    <FileList
                        key="root"
                        depth={0}
                        path={""}
                        onFolderItemClick={this.handleFolderItemClick}
                        onAudioFileItemClick={this.handleAudioFileItemClick}
                        onVideoFileItemClick={this.handleVideoFileItemClick}
                    />
                    {fileLists}
                </div>
                <PlayerControls />
                <VideoPlayer
                    onExit={() => this.setState({ video: null })}
                    video={this.state.video}
                />
                <Screensaver
                    timeout={this.state.config.screensaver_timeout}
                    timeFormat={this.state.config.time_format}
                    nightModeStart={this.state.config.night_mode[0]}
                    nightModeEnd={this.state.config.night_mode[1]}
                />
                <Alarm />
            </div>
        );
    }
}
