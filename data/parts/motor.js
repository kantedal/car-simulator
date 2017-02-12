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
            this._torque = 1000; //this._forceConst*(1-Math.exp(-this._accelerationStartTime*(time-this._accelerationStartTime)));
        }
        else {
            this._accelerationStartTime = 0;
            this._torque = 0;
        }
    };
    Object.defineProperty(Motor.prototype, "isAccelerating", {
        get: function () {
            return this._isAccelerating;
        },
        set: function (value) {
            if (!this._isAccelerating && value == true)
                this._accelerationStartTime = this._currentTime;
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
}());
