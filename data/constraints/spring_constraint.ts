/**
 * Created by filles-dator on 2016-02-25.
 */
///<reference path="../../math/mathjs.d.ts"/>
///<reference path="../../threejs/three.d.ts"/>

class SpringConstraint {
    private _restLength : number;

    private _springVel : number;
    private _kp : number;
    private _kd : number;
    private _mass : number;
    private _distance : number;

    private _bottomVel: mathjs.Matrix;
    private _topVel: mathjs.Matrix;
    private _springAcc: number;

    constructor(restLength: number){
        this._restLength = restLength;

        this._springVel = 0;
        this._kp = 20000;
        this._kd = 300;
        this._mass = 500;
        this._distance = 0;

        this._bottomVel = math.matrix([0,0,0]);
        this._topVel = math.matrix([0,0,0]);
        this._springAcc = 0;
    }

    public solveConstraint(wheelAxis:THREE.Vector3, bottomPos: mathjs.Matrix, topPos: THREE.Vector3, bottomVel: mathjs.Matrix, topVel: mathjs.Matrix, delta:number):number{
        this._distance = Math.sqrt(
            Math.pow(bottomPos.valueOf()[0] - topPos.x,2) +
            Math.pow(bottomPos.valueOf()[1] - topPos.y,2) +
            Math.pow(bottomPos.valueOf()[2] - topPos.z,2)
        );
        var displacement = this._distance - this._restLength;

        this._springVel = (-this._kp*displacement-this._kd*this._springVel)/this._mass;

        this._bottomVel = bottomVel;
        this._topVel = topVel;

        return this._springVel;
    }

    get springVel():number {
        return this._springVel;
    }

    set springVel(value:number) {
        this._springVel = value;
    }

    public calculateDistance(bottomPos: mathjs.Matrix, topPos: THREE.Vector3):number{
        var distance = Math.sqrt(
            Math.pow(bottomPos.valueOf()[0] - topPos.x,2) +
            Math.pow(bottomPos.valueOf()[1] - topPos.y,2) +
            Math.pow(bottomPos.valueOf()[2] - topPos.z,2)
        );
        return distance;
    }

    get distance():number {
        return this._distance;
    }

    set distance(value:number) {
        this._distance = value;
    }
}