import React from "react";
import ReactDOM from "react-dom";
import Req from "../Request";
import PlayerState from "../Models/PlayerState";
import { observer } from "mobx-react";

@observer
export default class PlayerControls extends React.Component {
    componentDidMount() {
        Req.send({ action: "playlist" });
    }
    render() {
        if (PlayerState.state == "stop") return null;
        let meta;
        if (PlayerState.metadata) {
            meta = (
                <div className="metadata">
                    <span key="0" className="album">
                        {PlayerState.metadata.album}
                    </span>
                    <span key="1" className="title">
                        {PlayerState.metadata.title}
                    </span>
                </div>
            );
        }
        let playPause;
        if (PlayerState.state == "play")
            playPause = (
                <button onClick={PlayerState.pause}>
                    <i className="fa fa-pause" aria-hidden="true" />
                </button>
            );
        if (PlayerState.state == "pause")
            playPause = (
                <button onClick={PlayerState.play}>
                    <i className="fa fa-play" aria-hidden="true" />
                </button>
            );
        return (
            <div className="component-playercontrols">
                <div className="num">
                    {PlayerState.index + 1 + "/" + PlayerState.playlist.length}
                </div>
                {meta}
                <div className="controls">
                    {playPause}
                    <button onClick={PlayerState.next}>
                        <i className="fa fa-step-forward" aria-hidden="true" />
                    </button>
                </div>
            </div>
        );
    }
}
