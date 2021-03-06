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
    function Wheel(renderer) {
        _super.call(this, new THREE.CylinderGeometry(2, 2, 1).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        this._wheelRotation = 0;
        this.collisionRadius = 0;
        this._rotation = 0;
        this.position.set(0, 100, 0);
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
            this.forwardForce = totalTorque;
        }
        else {
            this.forwardForce = 0;
        }
        //////////******************************************/////////////////
        var norm = this.realNormalDirection.clone();
        var normYZ = new THREE.Vector2(norm.y, norm.x);
        var rotZ = Math.acos(normYZ.dot(new THREE.Vector2(1, 0)) / (normYZ.length()));
        if (!rotZ)
            rotZ = 0;
        else if (norm.x > 0)
            rotZ = -rotZ;
        var normXY = new THREE.Vector2(norm.y, norm.z);
        var rotX = Math.acos(normXY.dot(new THREE.Vector2(1, 0)) / (normXY.length()));
        if (!rotX)
            rotX = 0;
        else if (norm.z < 0)
            rotX = -rotX;
        this.object.rotation.set(rotX, 0, rotZ);
        this.object.rotateOnAxis(new THREE.Vector3(0, 1, 0), this._rotation);
        this._wheelRotation += 0.05;
        this.geometry.rotateZ(-0.2 * this.velocity.length());
    };
    Wheel.prototype.connectMotor = function (motor) {
        this._connectedMotor = motor;
    };
    Wheel.prototype.connectSpring = function (spring) {
        this._connectedSpring = spring;
        this.object.add(spring.springObject);
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
    return Wheel;
})(DynamicRigidBody);
//# sourceMappingURL=wheel.js.map