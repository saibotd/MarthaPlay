import Req from '../Request';
import { observable } from 'mobx';

class AlarmState{
    @observable active = false;
    set(state){
        this.active = state.active;
    }
    disable = ()=>{
        Req.send({
            action: 'disable_alarm'
        });
    }
}

const alarmState = new AlarmState();
export default alarmState;