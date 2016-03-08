/**
 * Created by filles-dator on 2016-02-18.
 */
/**
 * Created by filles-dator on 2016-01-28.
 */
///<reference path="../threejs/three.d.ts"/>
///<reference path="./physics_object3d.ts"/>
///<reference path="./constraints/collision_constraint.ts"/>
///<reference path="../math/mathjs.d.ts"/>
///<reference path="./parts/wheel.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DynamicRigidBody = (function (_super) {
    __extends(DynamicRigidBody, _super);
    function DynamicRigidBody(geometry, material, renderer) {
        _super.call(this, geometry, material, renderer);
        this._dir = new THREE.Vector3(1, 0, 0);
        this.xLim = [-2, 2];
        this.yLim = [-1, 1];
        this.zLim = [-4, 4];
        this._renderer = renderer;
        this._gravity = -9.82 * 1.7;
        this._mass = 500;
        this._frictionConst = 0.99;
        this._collisions = [];
        this.calculateInertiaTensor();
        this._forceExternal = math.multiply(math.matrix([0, this._gravity, 0, 0, 0, 0]), this._mass);
        this._forceConstraints = math.matrix([0, 0, 0, 0, 0, 0]);
        this._forceTotal = math.add(this._forceExternal, this._forceConstraints);
        this._M = math.matrix([
            [this._mass, 0, 0, 0, 0, 0],
            [0, this._mass, 0, 0, 0, 0],
            [0, 0, this._mass, 0, 0, 0],
            [0, 0, 0, 5000, 0, -400],
            [0, 0, 0, 0, 5000, 0],
            [0, 0, 0, -400, 0, 5000],
        ]);
        this._M.subset(math.index(math.range(3, 6), math.range(3, 6)), math.multiply(this._inertiaTensor, 1));
        //console.log(this._M.valueOf());
        this.velocity = math.transpose(math.matrix([0, 0, 0, 0, 0, 0]));
        this.state = math.transpose(math.matrix([0, 30, 0, 0, 0, 0]));
        renderer.scene.add(this.object);
    }
    Object.defineProperty(DynamicRigidBody.prototype, "collisions", {
        get: function () {
            return this._collisions;
        },
        enumerable: true,
        configurable: true
    });
    DynamicRigidBody.prototype.update = function (time, delta) {
        this._forceTotal = math.add(this._forceExternal, this._forceConstraints); //Combine external and constraint forces
        this.velocity = math.add(this._velocity, math.multiply(math.multiply(math.inv(this._M), this._forceTotal), delta));
        this.state = math.add(this._state, math.multiply(this._velocity, delta));
        this._forceConstraints = math.matrix([0, 0, 0, 0, 0, 0]);
        _super.prototype.update.call(this, time, delta);
        //var collisions = super.checkCollisions();
        this._collisions = _super.prototype.newCheckCollisions.call(this);
        for (var colNum = 0; colNum < this._collisions.length; colNum++) {
            this.velocity = this.collision(this._collisions[colNum]);
            ;
        }
    };
    DynamicRigidBody.prototype.collision = function (collision) {
        var force_radius = math.matrix([collision[0], collision[1], collision[2]]);
        var normal = math.matrix([collision[3], collision[4], collision[5]]);
        var rotComponent = math.cross(force_radius, normal);
        var J = math.matrix([
            normal.valueOf()[0],
            normal.valueOf()[1],
            normal.valueOf()[2],
            rotComponent.valueOf()[0],
            rotComponent.valueOf()[1],
            rotComponent.valueOf()[2]
        ]);
        var mc = 1 / math.multiply(math.multiply(J, math.inv(this._M)), math.transpose(J));
        var lagrange = -mc * (math.multiply(J, this._velocity) - 0.65) * 1;
        var Pc = math.multiply(math.transpose(J), lagrange);
        var newVelocity = math.add(this._velocity, math.multiply(math.inv(this._M), Pc));
        return newVelocity;
    };
    DynamicRigidBody.prototype.calculateInertiaTensor = function () {
        var dV = 0.1 * 0.1;
        var Ixx = 0;
        for (var y = this.yLim[0]; y <= this.yLim[1]; y += 0.1) {
            for (var z = this.zLim[0]; z <= this.zLim[1]; z += 0.1) {
                Ixx += (Math.pow(y, 2) + Math.pow(z, 2)) * dV;
            }
        }
        Ixx *= 500;
        var Iyy = 0;
        for (var x = this.xLim[0]; x <= this.xLim[1]; x += 0.1) {
            for (var z = this.zLim[0]; z <= this.zLim[1]; z += 0.1) {
                Iyy += (Math.pow(x, 2) + Math.pow(z, 2)) * dV;
            }
        }
        Iyy *= 500;
        var Izz = 0;
        for (var x = this.xLim[0]; x <= this.xLim[1]; x += 0.1) {
            for (var y = this.yLim[0]; y <= this.yLim[1]; y += 0.1) {
                Izz += (Math.pow(x, 2) + Math.pow(y, 2)) * dV;
            }
        }
        Izz *= 500;
        var Ixy = 0;
        for (var x = this.xLim[0]; x <= this.xLim[1]; x += 0.1) {
            for (var y = this.yLim[0]; y <= this.yLim[1]; y += 0.1) {
                Ixy += (x * y) * dV;
            }
        }
        Ixy *= -500;
        var Iyz = 0;
        for (var y = this.yLim[0]; y <= this.yLim[1]; y += 0.1) {
            for (var z = this.zLim[0]; z <= this.zLim[1]; z += 0.1) {
                Iyz += (y * z) * dV;
            }
        }
        Iyz *= -500;
        var Ixz = 0;
        for (var x = this.xLim[0]; x <= this.xLim[1]; x += 0.1) {
            for (var z = this.zLim[0]; z <= this.zLim[1]; z += 0.1) {
                Ixz += (x * z) * dV;
            }
        }
        Ixz *= -500;
        this._inertiaTensor = math.matrix([
            [Ixx, Ixy, Ixz],
            [Ixy, Iyy, Iyz],
            [Ixz, Iyz, Izz]
        ]);
    };
    Object.defineProperty(DynamicRigidBody.prototype, "frictionConst", {
        get: function () {
            return this._frictionConst;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicRigidBody.prototype, "forceExternal", {
        get: function () {
            return this._forceExternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicRigidBody.prototype, "forceConstraints", {
        get: function () {
            return this._forceConstraints;
        },
        set: function (value) {
            this._forceConstraints = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicRigidBody.prototype, "M", {
        get: function () {
            return this._M;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DynamicRigidBody.prototype, "forceTotal", {
        get: function () {
            return this._forceTotal;
        },
        enumerable: true,
        configurable: true
    });
    return DynamicRigidBody;
})(PhysicsObject3d);
//# sourceMappingURL=dynamic_rigid_body.js.map