/**
 * Created by filles-dator on 2016-02-08.
 */
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="./parts/motor.ts"/>
///<reference path="./parts/spring.ts"/>
///<reference path="./parts/spring_connector.ts"/>
///<reference path="./parts/steering.ts"/>
///<reference path="./vehicle.ts"/>
///<reference path="./relative_dynamic_body.ts"/>
var VehicleSetup = (function () {
    function VehicleSetup(renderer, vehicle) {
        var _this = this;
        this.pressedKeys = [];
        this.onKeyDown = function (e) {
            if (e) {
                _this.pressedKeys[e.keyCode] = true;
                if (_this.pressedKeys[37] || _this.pressedKeys[65]) {
                    if (_this._steering)
                        _this._steering.steeringAcceleration += 100;
                }
                if (_this.pressedKeys[38] || _this.pressedKeys[87]) {
                    if (_this._motor)
                        _this._motor.isAccelerating = true;
                }
                if (_this.pressedKeys[39] || _this.pressedKeys[68]) {
                    if (_this._steering)
                        _this._steering.steeringAcceleration -= 100;
                }
                if (_this.pressedKeys[40] || _this.pressedKeys[83]) {
                }
                if (_this.pressedKeys[76]) {
                    if (_this._spotLight) {
                        if (_this._spotLight.intensity == 10)
                            _this._spotLight.intensity = 0;
                        else
                            _this._spotLight.intensity = 10;
                    }
                }
                if (_this.pressedKeys[32]) {
                    _this._vehicle.vehicleModel.applyImpulse();
                }
            }
        };
        this.onKeyUp = function (e) {
            if (e) {
                _this.pressedKeys[e.keyCode] = false;
                switch (e.which) {
                    case 37:
                        break;
                    case 38:
                        if (_this._motor)
                            _this._motor.isAccelerating = false;
                        break;
                    case 39:
                        break;
                    case 40:
                        break;
                    case 65:
                        break;
                    case 87:
                        if (_this._motor)
                            _this._motor.isAccelerating = false;
                        break;
                    case 68:
                        break;
                    case 83:
                        break;
                }
            }
        };
        this.onTouchStart = function (e) {
            if (e) {
                console.log("TOUCH ");
                _this._motor.isAccelerating = true;
            }
        };
        this.onTouchEnd = function (e) {
            if (e) {
                console.log("TOUCH END");
                _this._motor.isAccelerating = false;
            }
        };
        this._renderer = renderer;
        this._vehicle = vehicle;
        if (CarSimulator.is_touch_device) {
            window.addEventListener('touchstart', this.onTouchStart, false);
            window.addEventListener('touchend', this.onTouchEnd, false);
        }
        else {
            window.addEventListener('keydown', this.onKeyDown, false);
            window.addEventListener('keyup', this.onKeyUp, false);
        }
    }
    VehicleSetup.prototype.update = function (time, delta) {
        if (this._wheels) {
            for (var i = 0; i < this._wheels.length; i++) {
                this._wheels[i].isColliding = this.vehicle.vehicleModel.externalCollision[i];
                this._wheels[i].update(time, delta);
            }
        }
        if (this._springs) {
            for (var i = 0; i < this._wheels.length; i++) {
                this._springs[i].update(time, delta);
            }
        }
        if (this._springConnector) {
            for (var i = 0; i < this._springConnector.length; i++) {
                this._springConnector[i].update(time, delta);
            }
        }
        if (this._motor) {
            this._motor.update(time, delta);
            this._vehicle.vehicleModel.forceConstraints.valueOf()[4] += this._steering.steeringAngle * this._motor.torque * 15;
            this._vehicle.vehicleModel.forceConstraints.valueOf()[4] += this._steering.steeringAngle
                * -this._vehicle.vehicleModel.velocityDirection.clone().normalize().dot(this._vehicle.vehicleModel.localZDirection)
                * this._vehicle.vehicleModel.velocityDirection.length() * 2500;
            this._steering.steeringAngle *= 0.98;
        }
        if (this._steering) {
            this._steering.update(time, delta);
        }
        if (this._spotLight) {
        }
    };
    Object.defineProperty(VehicleSetup.prototype, "steering", {
        get: function () {
            return this._steering;
        },
        set: function (value) {
            this._steering = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleSetup.prototype, "motor", {
        get: function () {
            return this._motor;
        },
        set: function (value) {
            this._motor = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleSetup.prototype, "springs", {
        get: function () {
            return this._springs;
        },
        set: function (value) {
            this._springs = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleSetup.prototype, "wheels", {
        get: function () {
            return this._wheels;
        },
        set: function (value) {
            this._wheels = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleSetup.prototype, "vehicle", {
        get: function () {
            return this._vehicle;
        },
        set: function (value) {
            this._vehicle = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleSetup.prototype, "renderer", {
        get: function () {
            return this._renderer;
        },
        set: function (value) {
            this._renderer = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleSetup.prototype, "vehicleBody", {
        get: function () {
            return this._vehicleBody;
        },
        set: function (value) {
            this._vehicleBody = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleSetup.prototype, "springConnector", {
        get: function () {
            return this._springConnector;
        },
        set: function (value) {
            this._springConnector = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VehicleSetup.prototype, "spotLight", {
        get: function () {
            return this._spotLight;
        },
        set: function (value) {
            this._spotLight = value;
        },
        enumerable: true,
        configurable: true
    });
    return VehicleSetup;
})();
//# sourceMappingURL=vehiclesetup.js.map