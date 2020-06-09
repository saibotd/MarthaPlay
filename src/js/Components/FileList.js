import axios from "axios";
import { debounce } from "lodash";
import { observe } from "mobx";
import { observer } from "mobx-react";
import path from "path";
import React from "react";
import Slider from "react-slick";
import PlayerState from "../Models/PlayerState";
import FileListItem from "./FileListItem";

@observer
export default class FileList extends React.Component {
    slider = null;
    constructor(props, context) {
        super(props, context);
        this.state = {
            items: [],
        };
    }
    async componentDidMount() {
        const { data } = await axios.post("/ls", { path: this.props.path });
        this.setState(data);
        observe(PlayerState, () => {
            this.currentSlide();
        });
        this.currentSlide();
    }
    handleFileClick(file) {
        if (file.endsWith(".mp4")) {
            return this.props.onVideoFileItemClick(
                path.join(this.props.path, file)
            );
        }
        const files = [];
        let index = 0;
        this.state.items.forEach((item, i) => {
            if (item.endsWith(".mp3"))
                files.push(path.join(this.props.path, item));
            if (item == file) index = i;
        });
        this.props.onAudioFileItemClick(files, index);
    }
    currentSlide = debounce(() => {
        if (!this.slider) return;
        if (PlayerState.state == "stop") return this.slider.slickGoTo(0);
        const file = PlayerState.file;
        if (!file) return;
        let index = -1;
        this.state.items.some((item, i) => {
            const _path = path.join(this.props.path, item);
            if (_path == file || file.startsWith(_path)) {
                index = i;
                return true;
            }
            return false;
        });
        if (index >= 0) this.slider.slickGoTo(index - Math.round(index % 2));
    }, 100);
    render() {
        var back;
        if (this.props.depth > 0) {
            back = (
                <button
                    className="back"
                    onClick={() => {
                        this.props.onBackClick(this.props.depth);
                    }}
                />
            );
        }
        var settings = {
            dots: true,
            infinite: false,
            speed: 500,
            slidesToShow: 2,
            slidesToScroll: 2,
        };
        const items = this.state.items.map((item, i) => {
            return (
                <div key={i}>
                    <FileListItem
                        onClick={(itemState) => {
                            if (itemState.type == "dir")
                                this.props.onFolderItemClick(
                                    item,
                                    this.props.depth
                                );
                            if (itemState.type == "file")
                                this.handleFileClick(item);
                        }}
                        label={i + 1}
                        sublabel={item.replace("/", "")}
                        depth={this.props.depth}
                        path={path.join(this.props.path, item)}
                    />
                </div>
            );
        });
        return (
            <div className="component-filelist">
                <Slider
                    ref={(slider) => {
                        this.slider = slider;
                    }}
                    {...settings}
                >
                    {items}
                </Slider>
                {back}
            </div>
        );
    }
}

FileList.defaultProps = {
    depth: 0,
};
