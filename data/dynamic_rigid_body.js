/**
 * Created by filles-dator on 2016-01-28.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="./physics_object3d.ts"/>
var DynamicRigidBody = (function (_super) {
    __extends(DynamicRigidBody, _super);
    function DynamicRigidBody(geometry, material, renderer) {
        _super.call(this, geometry, material, renderer);
        this._gravity = -9.82;
        this._mass = 500;
        this._forwardForce = 0;
        this._frictionConst = 0.99;
        this._inclineForce = new Vector3(0, 0, 0);
        this._frictionForce = new Vector3(0, 0, 0);
    }
    DynamicRigidBody.prototype.update = function (time, delta) {
        if (this.hasCollisionSurface) {
            var gradientMagnitude = -Math.abs(Math.PI / 2 - this.gradientDirection.angleTo(new THREE.Vector3(0, -1, 0))) / (Math.PI / 2);
            var normalMagnitude = -Math.abs(this.gradientDirection.angleTo(new THREE.Vector3(0, -1, 0))) / (Math.PI / 2);
            this._inclineForce.set(this.gradientDirection.x, this.gradientDirection.y, this.gradientDirection.z).multiplyScalar(this._mass * this._gravity * gradientMagnitude);
            var newVelocity = new THREE.Vector3(0, 0, 0);
            this.acceleration = new THREE.Vector3((this._inclineForce.x + this.realDirection.x * this._forwardForce), (this._inclineForce.y + this.realDirection.y * this._forwardForce), (this._inclineForce.z + this.realDirection.z * this._forwardForce));
            if (this.isColliding) {
                newVelocity = new THREE.Vector3(this.velocity.x + this.acceleration.x * 0.00005, this.velocity.y + this.acceleration.y * 0.00005, this.velocity.z + this.acceleration.z * 0.00005).multiplyScalar(this._frictionConst);
                var projectedDir = newVelocity.clone().projectOnPlane(this.normalDirection);
                var yDiff = (newVelocity.y - projectedDir.y) * this.velocity.length();
                if (yDiff < 0.05) {
                    newVelocity = projectedDir;
                }
                else
                    console.log(yDiff);
            }
            else {
                newVelocity = new THREE.Vector3(this.velocity.x, this.velocity.y + (this._mass * this._gravity) * 0.000005, this.velocity.z);
            }
            this.updateVelocity(new THREE.Vector3(newVelocity.x, newVelocity.y, newVelocity.z));
            this.position.setX(this.position.x + (this.velocity.x)); // + this.velocity.x); //this.realDirection.x * this.velocity.length());
            this.position.setY(this.position.y + (this.velocity.y)); // + this.velocity.y); //this.realDirection.y * this.velocity.length());
            this.position.setZ(this.position.z + (this.velocity.z)); // + this.velocity.z); //this.realDirection.z * this.velocity.length());
        }
        _super.prototype.update.call(this, time, delta);
    };
    Object.defineProperty(DynamicRigidBody.prototype, "forwardForce", {
        get: function () {
            return this._forwardForce;
        },
        set: function (value) {
            this._forwardForce = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicRigidBody.prototype, "frictionConst", {
        get: function () {
            return this._frictionConst;
        },
        set: function (value) {
            this._frictionConst = value;
        },
        enumerable: true,
        configurable: true
    });
    return DynamicRigidBody;
})(PhysicsObject3d);
//# sourceMappingURL=dynamic_rigid_body.js.map