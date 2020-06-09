import { observable, observe, computed } from "mobx";
import axios from "axios";

class PlayerState {
    @observable index = 0;
    @observable state = "stop";
    @observable playlist = [];
    @observable metadata = null;
    @computed get file() {
        if (this.playlist.length && this.index <= this.playlist.length - 1)
            return this.playlist[this.index];
        return "";
    }
    constructor() {
        this.el = document.createElement("audio");
        this.el.type = "audio/mpeg";
        this.el.addEventListener("ended", () => this.next(true));
        document.body.appendChild(this.el);
    }
    setPlaylist = (files, index = 0) => {
        this.playlist = files;
        this.index = index;
        this.play();
    };
    play = async () => {
        if (!this.file) return;
        this.state = "play";
        this.el.src = this.file;
        this.el.play();
        const { data } = await axios.post("/metadata", { path: this.file });
        this.metadata = data.metadata;
    };
    pause = () => {
        this.state = "pause";
        this.el.pause();
    };
    resume = () => {
        this.state = "play";
        this.el.play();
    };
    next = (auto = false) => {
        if (this.index + 1 >= this.playlist.length) {
            if (auto) {
                this.stop();
            }
            return;
        }
        this.index++;
        this.play();
    };
    stop = () => {
        this.state = "stop";
        this.playlist = [];
        this.index = 0;
        this.metadata = null;
    };
    prev = () => {
        if (this.index == 0) return;
        this.index--;
        this.play();
    };
}

const playerState = new PlayerState();

export default playerState;
