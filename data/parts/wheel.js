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
///<reference path="./steering.ts"/>
///<reference path="../car.ts"/>
var Wheel = (function (_super) {
    __extends(Wheel, _super);
    function Wheel(renderer, car) {
        _super.call(this, new THREE.CylinderGeometry(2, 2, 1).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        this._forwardFriction = 0.1;
        this._sideFriction = 0.9;
        this._car = car;
        this.collisionRadius = 0;
        this._rotation = 0;
        //this.position.set(0,100,0);
        this._frictionForce = new THREE.Vector3(0, 0, 0);
    }
    Wheel.prototype.update = function (time, delta) {
        this.velocity = this._car.velocity;
        var normalizedGradient = this.velocity.clone().normalize();
        if (this.velocity.length() == 0)
            normalizedGradient = this.realDirection.clone();
        var sideForce = this.velocity.clone().projectOnVector(this.desiredDirection.clone().applyAxisAngle(this.normalDirection, Math.PI / 2));
        var forwardForce = this.velocity.clone().projectOnVector(this.desiredDirection).multiplyScalar(this._forwardFriction);
        this.frictionForce.set(-forwardForce.x - sideForce.x, -forwardForce.y - sideForce.y, -forwardForce.z - sideForce.z);
        _super.prototype.update.call(this, time, delta);
        ////////////***************************************//////////////
        if (this._connectedMotor && this.isColliding && this._connectedMotor.torque != 0) {
            var frictionCoeff = 0.1;
            this._frictionalMomentum = Math.abs((1 - Math.acos(this.normalDirection.dot(new THREE.Vector3(0, 1, 0)))) * 500 * (9.82) * frictionCoeff);
            var totalTorque = Math.abs(this._connectedMotor.torque - this._frictionalMomentum);
        }
        else {
        }
        //////////******************************************/////////////////
        if (this._connectedSpring) {
        }
        if (this._steering) {
            this.desiredDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this._steering.steeringAngle - this._rotation);
            this._rotation = this._steering.steeringAngle;
            this.object.rotation.set(0, this._rotation, 0);
        }
        this.position.set(this._car.position.x + this.object.position.x * Math.cos(-0.5 * (this._car.rotation - Math.PI / 2)) - this.object.position.z * Math.sin(-0.5 * (this._car.rotation - Math.PI / 2)), this._car.position.y + this.object.position.y, this._car.position.z + this.object.position.z * Math.cos(-0.5 * (this._car.rotation - Math.PI / 2)) + this.object.position.x * Math.sin(-0.5 * (this._car.rotation - Math.PI / 2)));
        this.desiredDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), (this._car.steering.steeringAngle - Math.PI / 2) * 0.05 * this.velocity.length());
        this.geometry.rotateZ(-0.2 * this.velocity.length());
    };
    Wheel.prototype.connectMotor = function (motor) {
        this._connectedMotor = motor;
    };
    Wheel.prototype.connectSpring = function (spring) {
        this._connectedSpring = spring;
        //this.object.add(this._connectedSpring.springGroup);
    };
    Wheel.prototype.connectSteering = function (steering) {
        this._steering = steering;
    };
    Object.defineProperty(Wheel.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this.object.rotateOnAxis(new THREE.Vector3(0, 1, 0), value - this._rotation);
            this.desiredDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), value - this._rotation);
            this._rotation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wheel.prototype, "connectedMotor", {
        get: function () {
            return this._connectedMotor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wheel.prototype, "frictionForce", {
        get: function () {
            return this._frictionForce;
        },
        set: function (value) {
            this._frictionForce = value;
        },
        enumerable: true,
        configurable: true
    });
    return Wheel;
})(PhysicsObject3d);
//# sourceMappingURL=wheel.js.map