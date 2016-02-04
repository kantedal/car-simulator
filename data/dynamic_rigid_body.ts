/**
 * Created by filles-dator on 2016-01-28.
 */

///<reference path="./physics_object3d.ts"/>

class DynamicRigidBody extends PhysicsObject3d {
    private _gravity : number;
    private _mass : number;
    private _forwardForce : number;
    private _frictionConst : number;

    private _inclineForce : THREE.Vector3;
    private _frictionForce : THREE.Vector3;

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        super(geometry, material, renderer);

        this._gravity = -9.82;
        this._mass = 500;
        this._forwardForce = 0;
        this._frictionConst = 0.99;

        this._inclineForce = new Vector3(0,0,0);
        this._frictionForce = new Vector3(0,0,0);
    }

    public update(time:number, delta:number):void{
        super.update(time,delta);
    }

    get forwardForce():number {
        return this._forwardForce;
    }

    set forwardForce(value:number) {
        this._forwardForce = value;
    }

    get frictionConst():number {
        return this._frictionConst;
    }

    set frictionConst(value:number) {
        this._frictionConst = value;
    }

    get mass():number {
        return this._mass;
    }

    set mass(value:number) {
        this._mass = value;
    }

    get inclineForce():THREE.Vector3 {
        return this._inclineForce;
    }

    set inclineForce(value:THREE.Vector3) {
        this._inclineForce = value;
    }

    get gravity():number {
        return this._gravity;
    }

    set gravity(value:number) {
        this._gravity = value;
    }
}