/**
 * Created by filles-dator on 2016-02-06.
 */
var Steering = (function () {
    function Steering(startAngle) {
        this._steeringAngle = Math.PI / 2;
        this._steeringVelocity = 0;
        this._steeringAcceleration = 0;
        this._startAngle = 0;
        this._steeringAngle = startAngle;
        this._startAngle = startAngle;
        this._steeringVelocity = 0;
        this._steeringAcceleration = 0;
    }
    Steering.prototype.update = function (time, delta) {
        this._steeringVelocity += 0.03 * this._steeringAcceleration;
        this._steeringVelocity *= 0.7;
        this._steeringAngle += 0.03 * this._steeringVelocity;
        this._steeringAcceleration *= 0.5;
    };
    Object.defineProperty(Steering.prototype, "steeringAcceleration", {
        get: function () {
            return this._steeringAcceleration;
        },
        set: function (value) {
            this._steeringAcceleration = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Steering.prototype, "steeringVelocity", {
        get: function () {
            return this._steeringVelocity;
        },
        set: function (value) {
            this._steeringVelocity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Steering.prototype, "steeringAngle", {
        get: function () {
            return this._steeringAngle;
        },
        set: function (value) {
            this._steeringAngle = value;
        },
        enumerable: true,
        configurable: true
    });
    return Steering;
})();
//# sourceMappingURL=steering.js.map