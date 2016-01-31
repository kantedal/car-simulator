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
        this._mass = 100;
        this._frictionConst = 0.99;
        this._inclineForce = new Vector3(0, 0, 0);
        this._frictionForce = new Vector3(0, 0, 0);
    }
    DynamicRigidBody.prototype.update = function (time, delta) {
        if (this.hasCollisionSurface) {
            this.position.setX(this.position.x + this.realDirection.x * this.velocity.length());
            this.position.setY(this.position.y + this.realDirection.y * this.velocity.length());
            this.position.setZ(this.position.z + this.realDirection.z * this.velocity.length());
            var gradientMagnitude = Math.cos(this.gradientDirection.angleTo(new THREE.Vector3(0, -1, 0))) * this._gravity * this._mass * 50;
            this._inclineForce.set(this.gradientDirection.x, this.gradientDirection.y, this.gradientDirection.z).multiplyScalar(gradientMagnitude);
            this._frictionForce.set(this._inclineForce.x, this._inclineForce.y, this._inclineForce.z).reflect(this.normalDirection).multiplyScalar(0);
        }
        _super.prototype.update.call(this, time, delta);
    };
    return DynamicRigidBody;
})(PhysicsObject3d);
//# sourceMappingURL=dynamic_rigid_body.js.map