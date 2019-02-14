import _ from 'lodash';
import { observable } from 'mobx';
import uniqid from 'uniqid';
import PlayerState from './Models/PlayerState';
import AlarmState from './Models/AlarmState';

class Request{
    ws;
    @observable connected = false;
    callbacks = {};
    constructor(){
        this.ws = new WebSocket('ws://'+window.location.hostname+':2222');
        this.ws.onopen = () => {
            this.connected = true
            this.ws.onmessage = message => {
                const data = JSON.parse(message.data);
                if(data.id) this.callbacks[data.id](data.data);
                delete this.callbacks[data.id];
                if(data.action == 'player'){
                    PlayerState.set(data);
                }
                if(data.action == 'alarm'){
                    AlarmState.set(data);
                }
            }
        };
    }
    send(data, cb = null){
        const id = uniqid();
        const payload = { id, data };
        const message = JSON.stringify(payload);
        this.ws.send(message);
        this.callbacks[id] = cb;
    }
}

const req = new Request();
export default req;