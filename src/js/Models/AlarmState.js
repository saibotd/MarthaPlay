import { observable } from "mobx";

class AlarmState {
    @observable active = false;
    set(state) {
        this.active = state.active;
    }
    disable = () => {
        this.active = false;
    };
}

const alarmState = new AlarmState();
export default alarmState;
