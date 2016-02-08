/**
 * Created by filles-dator on 2016-02-01.
 */

///<reference path="../../threejs/three.d.ts"/>

class Motor {
    private _torque : number = 0;

    private _forceConst : number;
    private _timeConst : number;

    private _isAccelerating : boolean;
    private _accelerationStartTime : number;

    private _currentTime : number;

    constructor(maxForce:number, acceleration:number){
        this._forceConst = maxForce;
        this._timeConst = acceleration;

        this._isAccelerating = false;
        this._accelerationStartTime = 0;

        this._currentTime = 0;
    }

    public accelerate(time:number, delta:number):void {
        if(!this._isAccelerating) {
            this._isAccelerating = true;
            this._accelerationStartTime = time;
        }
    }

    public update(time:number, delta:number):void {
        this._currentTime = time;

        if(this._isAccelerating){
            this._torque = this._forceConst;
        }
        else
        {
            this._accelerationStartTime = 0;
            this._torque = 0;
        }

       // console.log(this._torque + "  " + this.isAccelerating);
    }

    get isAccelerating():boolean {
        return this._isAccelerating;
    }

    set isAccelerating(value:boolean) {
        console.log("start")
        this._isAccelerating = value;
    }

    get torque():number {
        return this._torque;
    }

    set torque(value:number) {
        this._torque = value;
    }
}