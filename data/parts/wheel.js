/**
 * Created by filles-dator on 2016-01-26.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../physics_object3d.ts"/>
///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="./motor.ts"/>
///<reference path="./spring.ts"/>
///<reference path="../particle_collider.ts"/>
var Wheel = (function (_super) {
    __extends(Wheel, _super);
    function Wheel(renderer) {
        _super.call(this, new THREE.CylinderGeometry(2, 2, 1), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        this._wheelRotation = 0;
        this._forwardForce = 0;
    }
    Wheel.prototype.update = function (time, delta, axis) {
        _super.prototype.update.call(this, time, delta);
        if (this._steering) {
            this.object.rotateOnAxis(axis, this._steering.steeringVelocity * delta);
        }
        if (this._connectedMotor) {
            this._forwardForce = this._connectedMotor.torque;
        }
    };
    Wheel.prototype.connectMotor = function (motor) {
        this._connectedMotor = motor;
    };
    Wheel.prototype.connectSteering = function (steering) {
        this._steering = steering;
    };
    Object.defineProperty(Wheel.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wheel.prototype, "forwardForce", {
        get: function () {
            return this._forwardForce;
        },
        set: function (value) {
            this._forwardForce = value;
        },
        enumerable: true,
        configurable: true
    });
    return Wheel;
})(ParticleCollider);
//# sourceMappingURL=wheel.js.map