import React from 'react';
import ReactDOM from 'react-dom';
import Req from '../Request';
import FileList from './FileList';
import { observer } from 'mobx-react';
import PlayerControls from './PlayerControls';
import Alarm from './Alarm';
import Screensaver from './Screensaver';
import PlayerState from '../Models/PlayerState';

@observer
export default class App extends React.Component{
    constructor(props, context){
        super(props, context);
        this.state = {
            path: [],
            config: null
        };
        window.App = this;
    }
    componentDidMount(){
        this.loadConfig();
    }
    loadConfig = () =>{
        if(!Req.connected) return window.setTimeout(this.loadConfig, 10);
        Req.send({
            action: 'config'
        }, ({config})=>{
            this.setState({ config });
            document.getElementById('root').style.transform = 'rotate('+ config.rotation +'deg)';
        });
        Req.send({
            action: 'init'
        });
    }
    handleFolderItemClick = (item, depth)=>{
        if(depth < this.state.path.length) this.state.path = this.state.path.slice(0, depth);
        if(depth == 0) this.state.path = [];
        this.state.path.push(item);
        this.setState({ path: this.state.path });
    }
    handleFileItemClick = (files, index)=>{
        Req.send({
            action: 'play',
            files,
            index
        });
        PlayerState.playlist = files;
        PlayerState.index = index;
    }
    handleBackClick = (depth) => {
        this.state.path = this.state.path.slice(0, depth-1);
        this.setState({ path: this.state.path });
    }
    componentDidUpdate(){
        var offset = window.innerHeight*.75*this.state.path.length-40;
        if(offset == -40) offset = 0;
        document.getElementById('filelists').style.transform = 'translateY(-'+offset+'px)';
    }
    render(){
        if(!this.state.config) return null;
        var path = this.state.config.dir;
        const fileLists = this.state.path.map((pathPart, i) => {
            path += ('/' + pathPart);
            return <FileList
                key={path}
                depth={i+1}
                path={path}
                onBackClick={ this.handleBackClick }
                onFolderItemClick={ this.handleFolderItemClick }
                onFileItemClick={ this.handleFileItemClick }
            />;
        });
        return <div>
            <div id="filelists">
                <FileList
                    key="root"
                    depth={0}
                    path={this.state.config.dir}
                    onFolderItemClick={ this.handleFolderItemClick }
                    onFileItemClick={ this.handleFileItemClick }
                />
                { fileLists }
            </div>
            <PlayerControls />
            <Screensaver
                timeout={this.state.config.screensaver_timeout}
                timeFormat={this.state.config.time_format}
                nightModeStart={this.state.config.night_mode[0]}
                nightModeEnd={this.state.config.night_mode[1]}
            />
            <Alarm />
        </div>;
    }
}