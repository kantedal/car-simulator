/**
 * Created by filles-dator on 2016-02-25.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../threejs/three.d.ts"/>
///<reference path="./physics_object3d.ts"/>
///<reference path="./constraints/collision_constraint.ts"/>
///<reference path="../math/mathjs.d.ts"/>
///<reference path="./parts/wheel.ts"/>
var ParticleCollider = (function (_super) {
    __extends(ParticleCollider, _super);
    function ParticleCollider(geometry, material, renderer) {
        this._dir = new THREE.Vector3(1, 0, 0);
        geometry.rotateZ(Math.PI / 2);
        _super.call(this, geometry, material, renderer);
        this._renderer = renderer;
        this._gravity = -9.82;
        this._mass = 100;
        this._frictionConst = 0.99;
        this._collisionRadius = 1;
        this._isColliding = false;
        this._forceExternal = math.multiply(math.matrix([0, this._gravity, 0, 0, 0, 0]), this._mass);
        this._forceConstraints = math.matrix([0, 0, 0, 0, 0, 0]);
        this._forceTotal = math.add(this._forceExternal, this._forceConstraints);
        this._M = math.matrix([
            [this._mass, 0, 0, 0, 0, 0],
            [0, this._mass, 0, 0, 0, 0],
            [0, 0, this._mass, 0, 0, 0],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 1],
        ]);
        this.velocity = math.transpose(math.matrix([0, 0, 0, 0, 0, 0]));
        this.state = math.transpose(math.matrix([0, 20, 0, 0, 0, Math.PI / 4]));
        //renderer.scene.add(this.object);
    }
    ParticleCollider.prototype.update = function (time, delta) {
        this._forceTotal = math.add(this._forceExternal, this._forceConstraints); //Combine external and constraint forces
        this.velocity = math.add(this._velocity, math.multiply(math.multiply(math.inv(this._M), this._forceTotal), delta));
        this.state = math.add(this._state, math.multiply(this._velocity, delta));
        this._forceConstraints = math.matrix([0, 0, 0, 0, 0, 0]);
        //super.trackVertices(delta);
        _super.prototype.update.call(this, time, delta);
        if (this.state.valueOf()[1] - this._collisionRadius <= 0) {
            this.velocity = this.collision();
        }
        this.position.set(this._state.valueOf()[0], this._state.valueOf()[1], this._state.valueOf()[2]);
    };
    ParticleCollider.prototype.collision = function () {
        var force_radius = math.matrix([0, -1, 0]);
        var normal = math.matrix([0, 1, 0]);
        //var penetration = collision[1];
        var J = math.matrix([
            normal.valueOf()[0],
            normal.valueOf()[1],
            normal.valueOf()[2],
            math.cross(force_radius, normal).valueOf()[0],
            math.cross(force_radius, normal).valueOf()[1],
            math.cross(force_radius, normal).valueOf()[2]
        ]);
        var mc = 1 / math.multiply(math.multiply(J, math.inv(this._M)), math.transpose(J));
        var lagrange = -mc * (math.multiply(J, this._velocity) - 1) * 1.1;
        var Pc = math.multiply(math.transpose(J), lagrange);
        var newVelocity = math.add(this._velocity, math.multiply(math.inv(this._M), Pc));
        return newVelocity;
    };
    Object.defineProperty(ParticleCollider.prototype, "isColliding", {
        get: function () {
            return this._isColliding;
        },
        set: function (value) {
            this._isColliding = value;
        },
        enumerable: true,
        configurable: true
    });
    return ParticleCollider;
})(PhysicsObject3d);
//# sourceMappingURL=particle_collider.js.map