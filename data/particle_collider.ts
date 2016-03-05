/**
 * Created by filles-dator on 2016-02-25.
 */

///<reference path="../threejs/three.d.ts"/>
///<reference path="./physics_object3d.ts"/>
///<reference path="./constraints/collision_constraint.ts"/>
///<reference path="../math/mathjs.d.ts"/>
///<reference path="./parts/wheel.ts"/>

class ParticleCollider extends PhysicsObject3d {
    private _renderer : Renderer;
    private _gravity : number;
    private _mass : number;
    private _frictionConst : number;
    private _M : mathjs.Matrix;
    private _forceExternal : mathjs.Matrix;
    private _forceConstraints : mathjs.Matrix;
    private _forceTotal : mathjs.Matrix;
    private _collisionRadius : number
    private _isColliding : boolean;

    public _dir : THREE.Vector3 = new THREE.Vector3(1,0,0);

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        geometry.rotateZ(Math.PI/2);
        super(geometry, material, renderer);
        this._renderer = renderer;

        this._gravity = -9.82;
        this._mass = 100;
        this._frictionConst = 0.99;
        this._collisionRadius = 1;
        this._isColliding = false;

        this._forceExternal = math.multiply(math.matrix([0,this._gravity,0,0,0,0]), this._mass);
        this._forceConstraints = math.matrix([0,0,0,0,0,0]);
        this._forceTotal = math.add(this._forceExternal, this._forceConstraints);

        this._M = math.matrix([
            [this._mass, 0, 0, 0, 0, 0],
            [0, this._mass, 0, 0, 0, 0],
            [0, 0, this._mass, 0, 0, 0],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 1],
        ]);

        //this.velocity = math.transpose(math.matrix([0,0,0,0,0,0]));
        //this.state = math.transpose(math.matrix([0,20,0,0,0,Math.PI/4]));

        //renderer.scene.add(this.object);
    }

    public update(time:number, delta:number):void{
        //this._forceTotal = math.add(this._forceExternal, this._forceConstraints); //Combine external and constraint forces
        //this.velocity = math.add(this._velocity, math.multiply(math.multiply(math.inv(this._M), this._forceTotal), delta));
        //this.state = math.add(this._state, math.multiply(this._velocity, delta));
        //this._forceConstraints = math.matrix([0,0,0,0,0,0]);

        //super.trackVertices(delta);
        super.update(time,delta);
    }

    public collision(velocity : mathjs.Matrix):mathjs.Matrix {
        var force_radius = math.matrix([0, -1, 0]);
        var normal = math.matrix([0, 1, 0]);
        //var penetration = collision[1];

        var J = math.matrix([
            normal.valueOf()[0],
            normal.valueOf()[1],
            normal.valueOf()[2],
            math.cross(force_radius,normal).valueOf()[0],
            math.cross(force_radius,normal).valueOf()[1],
            math.cross(force_radius,normal).valueOf()[2]
        ]);

        var mc = 1/math.multiply( math.multiply(J, math.inv(this._M)), math.transpose(J));
        var lagrange = -mc*(math.multiply(J,velocity)-1)*1.1;

        var Pc = math.multiply(math.transpose(J),lagrange);

        var newVelocity : mathjs.Matrix = math.add(velocity, math.multiply(math.inv(this._M),Pc));

        return newVelocity;
    }

    get isColliding():boolean {
        return this._isColliding;
    }

    set isColliding(value:boolean) {
        this._isColliding = value;
    }
}