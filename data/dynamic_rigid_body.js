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
    Object.defineProperty(DynamicRigidBody.prototype, "mass", {
        get: function () {
            return this._mass;
        },
        set: function (value) {
            this._mass = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicRigidBody.prototype, "inclineForce", {
        get: function () {
            return this._inclineForce;
        },
        set: function (value) {
            this._inclineForce = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicRigidBody.prototype, "gravity", {
        get: function () {
            return this._gravity;
        },
        set: function (value) {
            this._gravity = value;
        },
        enumerable: true,
        configurable: true
    });
    return DynamicRigidBody;
})(PhysicsObject3d);
//# sourceMappingURL=dynamic_rigid_body.js.map