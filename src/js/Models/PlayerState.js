import Req from '../Request';
import { observable } from 'mobx';

class PlayerState{
    @observable file = '';
    @observable index = 0;
    @observable state = 'stop';
    @observable playlist = [];
    @observable metadata = null;
    lastState = null;
    subscribers = [];
    subscribe(func){
        this.subscribers.push(func);
    }
    set(state){
        this.subscribers.forEach((func)=>{
            func(state, this.lastState);
        });
        this.lastState = state;
        if(state.type == 'update'){
            console.log(state);
            return;
        }
        this.file = '';
        this.track = '';
        this.index = 0;
        this.state = 'stop';
        this.metadata = null;
        this.playlist = [];
        if(state.type == 'play'){
            this.state = state.type;
            this.index = state.status.index;
            this.file = state.status.file;
            this.playlist = state.status.playlist;
            this.metadata = state.status.metadata;
        }
    }
    play = ()=>{
        this.state = 'play';
        Req.send({
            action: 'pause'
        });
    }
    pause = ()=>{
        this.state = 'pause';
        Req.send({
            action: 'pause'
        });
    }
    next = ()=>{
        Req.send({
            action: 'next'
        });
    }
    prev = ()=>{
        Req.send({
            action: 'prev'
        });
    }
}

const playerState = new PlayerState();
window.playerState = playerState;
export default playerState;