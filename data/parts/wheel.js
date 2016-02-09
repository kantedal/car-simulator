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
var Wheel = (function (_super) {
    __extends(Wheel, _super);
    function Wheel(renderer, vehicle, startPosition) {
        _super.call(this, new THREE.CylinderGeometry(2, 2, 1).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        this._wheelRotation = 0;
        this._vehicle = vehicle;
        this.collisionRadius = 0;
        this._rotation = 0;
        this._forwardForce = 0;
        this.position = startPosition;
        this._vehicle.add(this.object);
    }
    Wheel.prototype.update = function (time, delta) {
        var normalizedGradient = this.velocity.clone().normalize();
        if (this.velocity.length() == 0)
            normalizedGradient = this.realDirection.clone();
        this.frictionConst = 0.8 + 0.12 * (Math.abs(this.realDirection.x * normalizedGradient.x +
            this.realDirection.y * normalizedGradient.y +
            this.realDirection.z * normalizedGradient.z));
        _super.prototype.update.call(this, time, delta);
        ////////////***************************************//////////////
        if (this._connectedMotor && this.isColliding && this._connectedMotor.torque != 0) {
            var frictionCoeff = 0.1;
            this._frictionalMomentum = Math.abs((1 - Math.acos(this.normalDirection.dot(new THREE.Vector3(0, 1, 0)))) * 500 * (9.82) * frictionCoeff);
            var totalTorque = Math.abs(this._connectedMotor.torque - this._frictionalMomentum);
            this._forwardForce = totalTorque;
        }
        else {
            this._forwardForce = 0;
        }
        if (this._steering) {
            this.desiredDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this._steering.steeringAngle - this._rotation);
            this._rotation = this._steering.steeringAngle;
            this.object.rotation.set(0, this._rotation, 0);
        }
        this.geometry.rotateZ(-0.2 * this.velocity.length());
    };
    Wheel.prototype.connectMotor = function (motor) {
        this._connectedMotor = motor;
    };
    Wheel.prototype.connectSpring = function (spring) {
        this._connectedSpring = spring;
        this._connectedSpring.position.set(this.position.x * 0.8, this.position.y * 0.8, this.position.z * 0.8);
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
})(PhysicsObject3d);
//# sourceMappingURL=wheel.js.map