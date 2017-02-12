/**
 * Created by filles-dator on 2016-02-25.
 */
///<reference path="../../math/mathjs.d.ts"/>
///<reference path="../../threejs/three.d.ts"/>
var SpringConstraint = (function () {
    function SpringConstraint(restLength) {
        this._restLength = restLength;
        this._springVel = 0;
        this._kp = 20000;
        this._kd = 300;
        this._mass = 500;
        this._distance = 0;
        this._bottomVel = math.matrix([0, 0, 0]);
        this._topVel = math.matrix([0, 0, 0]);
        this._springAcc = 0;
    }
    SpringConstraint.prototype.solveConstraint = function (wheelAxis, bottomPos, topPos, bottomVel, topVel, delta) {
        this._distance = Math.sqrt(Math.pow(bottomPos.valueOf()[0] - topPos.x, 2) +
            Math.pow(bottomPos.valueOf()[1] - topPos.y, 2) +
            Math.pow(bottomPos.valueOf()[2] - topPos.z, 2));
        var displacement = this._distance - this._restLength;
        this._springVel = (-this._kp * displacement - this._kd * this._springVel) / this._mass;
        this._bottomVel = bottomVel;
        this._topVel = topVel;
        return this._springVel;
    };
    Object.defineProperty(SpringConstraint.prototype, "springVel", {
        get: function () {
            return this._springVel;
        },
        set: function (value) {
            this._springVel = value;
        },
        enumerable: true,
        configurable: true
    });
    SpringConstraint.prototype.calculateDistance = function (bottomPos, topPos) {
        var distance = Math.sqrt(Math.pow(bottomPos.valueOf()[0] - topPos.x, 2) +
            Math.pow(bottomPos.valueOf()[1] - topPos.y, 2) +
            Math.pow(bottomPos.valueOf()[2] - topPos.z, 2));
        return distance;
    };
    Object.defineProperty(SpringConstraint.prototype, "distance", {
        get: function () {
            return this._distance;
        },
        set: function (value) {
            this._distance = value;
        },
        enumerable: true,
        configurable: true
    });
    return SpringConstraint;
}());
