import axios from "axios";
import { observer } from "mobx-react";
import React from "react";
import PlayerState from "../Models/PlayerState";

@observer
export default class FileListItem extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            stats: null,
            type: null,
            metadata: null,
            images: [],
        };
    }
    async update(props = this.props) {
        const { data } = await axios.post("/stat", { path: props.path });
        this.setState(data);
        if (data.type == "file") this.loadMetadata(props);
    }
    async loadMetadata(props = this.props) {
        const { data } = await axios.post("/metadata", { path: props.path });
        this.setState(data);
    }
    componentDidMount() {
        this.update();
    }
    componentWillReceiveProps(props) {
        this.update(props);
    }
    render() {
        let imgStyle = { backgroundColor: "red" };
        if (this.state.images.length) {
            imgStyle = {
                backgroundImage: `url("${this.state.images[0]}")`,
            };
        } else {
            imgStyle = { opacity: Math.random() * 0.6 };
        }

        const className = ["component-filelistitem"];
        var title;
        var label;
        var sublabel;
        if (this.state.type == "file") {
            label = this.props.label;
        }
        sublabel = this.props.sublabel;
        if (this.state.metadata) {
            sublabel = this.state.metadata.title;
        }
        if (label || sublabel) {
            title = (
                <div className="label">
                    <h3>{label}</h3>
                    <small>{sublabel}</small>
                </div>
            );
        }
        if (PlayerState.file.startsWith(this.props.path))
            className.push("playing");
        return (
            <div
                className={className.join(" ")}
                onClick={() => this.props.onClick(this.state)}
            >
                <div className="img" style={imgStyle} />
                {title}
            </div>
        );
    }
}

FileListItem.defaultProps = {};
