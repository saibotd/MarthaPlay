import React from "react";

export default class VideoPlayer extends React.Component {
    timeout;
    interval;
    constructor(props, context) {
        super(props, context);
        this.state = {
            active: false,
            time: "00:00:00",
        };
    }
    componentDidMount() {}
    componentWillUnmount() {}

    handleExit = () => {
        this.props.onExit();
    };
    render() {
        if (!this.props.video) return null;
        return (
            <div
                onTouchStart={this.handleExit}
                onMouseDown={this.handleExit}
                className="video-player"
            >
                <video
                    ref={(el) => {
                        if (!el) return;
                        el.addEventListener("ended", this.handleExit, false);
                    }}
                    src={this.props.video}
                    autoPlay
                ></video>
            </div>
        );
    }
}

VideoPlayer.defaultProps = {
    video: null,
    onExit: () => {},
};
