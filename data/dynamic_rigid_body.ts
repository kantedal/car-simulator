/**
 * Created by filles-dator on 2016-01-28.
 */

///<reference path="./physics_object3d.ts"/>

class DynamicRigidBody extends PhysicsObject3d {

    private _gravity : number;
    private _mass : number;
    private _frictionConst : number;

    private _inclineForce : THREE.Vector3;
    private _frictionForce : THREE.Vector3;

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        super(geometry, material, renderer);

        this._gravity = -9.82;
        this._mass = 100;
        this._frictionConst = 0.99;

        this._inclineForce = new Vector3(0,0,0);
        this._frictionForce = new Vector3(0,0,0);
    }

    public update(time:number, delta:number):void{
        if(this.hasCollisionSurface) {
            this.position.setX(this.position.x + this.realDirection.x * this.velocity.length());
            this.position.setY(this.position.y + this.realDirection.y * this.velocity.length());
            this.position.setZ(this.position.z + this.realDirection.z * this.velocity.length());

            var gradientMagnitude = Math.cos(this.gradientDirection.angleTo(new THREE.Vector3(0,-1,0)))*this._gravity*this._mass*50;
            this._inclineForce.set(this.gradientDirection.x,this.gradientDirection.y,this.gradientDirection.z).multiplyScalar(gradientMagnitude);
            this._frictionForce.set(this._inclineForce.x,this._inclineForce.y,this._inclineForce.z).reflect(this.normalDirection).multiplyScalar(0);

            //this.updateVelocity(new THREE.Vector3(
            //    (this._inclineForce.x - this._frictionForce.x)*delta,
            //    (this._inclineForce.y - this._frictionForce.y)*delta,
            //    (this._inclineForce.z - this._frictionForce.z)*delta
            //);
        }
        super.update(time,delta);
    }
}