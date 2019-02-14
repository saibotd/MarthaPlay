import React from 'react';
import ReactDOM from 'react-dom';
import Req from '../Request';
import PlayerState from '../Models/PlayerState';
import { observer } from 'mobx-react';

@observer
export default class FileListItem extends React.Component{
    constructor(props, context){
        super(props, context);
        this.state = {
            stats: null,
            type: null,
            metadata: null,
            images: []
        };
    }
    update(props = this.props){
        Req.send({
            action: 'stat',
            path: props.path
        }, ({path, stats, type, images}) => {
            this.setState({ stats, type, images });
            if(type == 'file'){
                Req.send({
                    action: 'metadata',
                    path: props.path
                }, ({metadata}) => {
                    this.setState({ metadata });
                });
            }
        });
    }
    componentDidMount(){
        this.update();
    }
    componentWillReceiveProps(props){
        this.update(props);
    }
    render(){
        var img;
        if(this.state.images.length){
            img = <div className="img" style={{ backgroundImage: 'url(/img/' + encodeURIComponent(this.state.images[0]) + ')' }} />
        } else {
            img = <div className="img" style={{ opacity: (Math.random()*.6) }} />
        }
        const className = ["component-filelistitem"];
        var title;
        var label;
        var sublabel;
        if(this.state.type == 'file'){
            label = this.props.label;
        }
        sublabel = this.props.sublabel;
        if(this.state.metadata){
            sublabel = this.state.metadata.title;
        }
        if(label || sublabel){
            title = <div className="label">
                <h3>{ label }</h3>
                <small>{ sublabel }</small>
            </div>;
        }
        if(PlayerState.file.startsWith(this.props.path)) className.push('playing');
        return <div className={className.join(' ')} onClick={ ()=> this.props.onClick(this.state) }>
            {img}{title}
        </div>
    }
}

FileList.defaultProps = {
    depth: 0
};