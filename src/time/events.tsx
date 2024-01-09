

export class TimedEvent{
    currentTime: number;
    interval: number;
    constructor(interval:number){
        this.interval = interval;
        this.currentTime = 0;
    }

    // number of times triggered
    step(elapsedTime:number):number{
        this.currentTime += elapsedTime;
        const triggers = Math.floor(this.currentTime/this.interval);
        if(triggers > 0) this.currentTime -= triggers*this.interval;
        return triggers;

    }
}