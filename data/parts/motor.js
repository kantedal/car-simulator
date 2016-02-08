/**
 * Created by filles-dator on 2016-02-01.
 */
///<reference path="../../threejs/three.d.ts"/>
var Motor = (function () {
    function Motor(maxForce, acceleration) {
        this._torque = 0;
        this._forceConst = maxForce;
        this._timeConst = acceleration;
        this._isAccelerating = false;
        this._accelerationStartTime = 0;
        this._currentTime = 0;
    }
    Motor.prototype.accelerate = function (time, delta) {
        if (!this._isAccelerating) {
            this._isAccelerating = true;
            this._accelerationStartTime = time;
        }
    };
    Motor.prototype.update = function (time, delta) {
        this._currentTime = time;
        if (this._isAccelerating) {
            this._torque = this._forceConst;
        }
        else {
            this._accelerationStartTime = 0;
            this._torque = 0;
        }
        // console.log(this._torque + "  " + this.isAccelerating);
    };
    Object.defineProperty(Motor.prototype, "isAccelerating", {
        get: function () {
            return this._isAccelerating;
        },
        set: function (value) {
            console.log("start");
            this._isAccelerating = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Motor.prototype, "torque", {
        get: function () {
            return this._torque;
        },
        set: function (value) {
            this._torque = value;
        },
        enumerable: true,
        configurable: true
    });
    return Motor;
})();
//# sourceMappingURL=motor.js.map