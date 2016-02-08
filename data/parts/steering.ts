/**
 * Created by filles-dator on 2016-02-06.
 */
class Steering {
    private _steeringAngle = Math.PI/2;
    private _steeringVelocity = 0;
    private _steeringAcceleration = 0;
    private _startAngle = 0;

    constructor(startAngle:number){
        this._steeringAngle = startAngle;
        this._startAngle = startAngle;
        this._steeringVelocity = 0;
        this._steeringAcceleration = 0;
    }

    public update(time:number, delta:number){
        if(Math.abs(this._steeringAngle-this._startAngle) > Math.PI/4 && Math.sign(this._steeringAcceleration) == Math.sign(this._steeringAngle-this._startAngle)){
            this._steeringVelocity = 0;
            this._steeringAcceleration = 0;

        }

        this._steeringVelocity += 0.03*this._steeringAcceleration;
        this._steeringVelocity *= 0.7;
        this._steeringAngle += 0.03*this._steeringVelocity;
        this._steeringAcceleration *= 0.5;
    }

    get steeringAcceleration():number {
        return this._steeringAcceleration;
    }

    set steeringAcceleration(value:number) {
        this._steeringAcceleration = value;
    }
    get steeringVelocity():number {
        return this._steeringVelocity;
    }

    set steeringVelocity(value:number) {
        this._steeringVelocity = value;
    }
    get steeringAngle():number {
        return this._steeringAngle;
    }

    set steeringAngle(value:number) {
        this._steeringAngle = value;
    }
}