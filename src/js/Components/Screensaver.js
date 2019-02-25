import React from 'react';
import ReactDOM from 'react-dom';
import PlayerState from '../Models/PlayerState';
import { observer } from 'mobx-react';
import moment from 'moment-timezone';

@observer
export default class Screensaver extends React.Component{
    timeout;
    interval;
    constructor(props, context){
        super(props, context);
        this.state = {
            active: false,
            time: '00:00:00'
        };
    }
    componentDidMount(){
        this.init();
        window.addEventListener('mousemove', this.handleInteraction);
        window.addEventListener('click', this.handleInteraction);
        this.interval = setInterval(()=>{ this.setState({ time: moment().format(this.props.timeFormat) }) }, 1000);
    }
    componentWillUnmount(){
        clearInterval(this.interval);
    }
    init = ()=>{
        clearTimeout(this.timeout);
        const _timeout = this.nightMode ? this.props.timeout / 2 : this.props.timeout;
        this.timeout = window.setTimeout(()=>{ this.setState({ active: true }) }, _timeout * 1000)
    }
    handleInteraction = ()=>{
        this.init();
        setTimeout(()=>{
            this.setState({ active: false });
        }, 1);
    }
    get nightMode(){
        const start = moment(this.props.nightModeStart, 'HH:mm');
        const end = moment(this.props.nightModeEnd, 'HH:mm');
        return this.props.nightModeStart
        && this.props.nightModeEnd
        && (
            moment().isBetween(start, end)
            || (
                end.isBefore(start)
                && moment().isBetween(start, end.add(1, 'days'))
            )
        );
    }
    render(){
        if(!this.state.active) return null;
        const time = <div className="time" key="0">{ this.state.time }</div>;
        let meta = time;
        if(PlayerState.metadata){
            meta = [
                time,
                <div key="1" className="album">{ PlayerState.metadata.album }</div>,
                <div key="2" className="title">{ PlayerState.metadata.title }</div>
            ];
        }
        const className = ['screensaver'];
        if(this.nightMode){
            className.push('night');    
        }
        return <div onTouchStart={ this.handleInteraction } onMouseDown={ this.handleInteraction } className={ className.join(' ') }>
            <div className='inner'>{ meta }</div>
        </div>;
    }
}

Screensaver.defaultProps = {
    timeout: 30,
    nightModeStart: null,
    nightModeEnd: null,
    timeFormat: "HH:mm:ss"
};