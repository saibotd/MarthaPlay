import React from 'react';
import ReactDOM from 'react-dom';
import AlarmState from '../Models/AlarmState';
import { observer } from 'mobx-react';

@observer
export default class Alarm extends React.Component{
    handleClick = ()=>{
        AlarmState.disable();
    }
    render(){
        if(!AlarmState.active) return null;
        return <div className="alarm" onClick={ this.handleClick }>
        </div>;
    }
}
