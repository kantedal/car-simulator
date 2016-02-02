/**
 * Created by filles-dator on 2016-01-26.
 */

///<reference path="../physics_object3d.ts"/>
///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="./motor.ts"/>

class Wheel extends DynamicRigidBody{
    private _rotation : number;
    private _wheelRotation : number = 0;
    private _connectedMotor : Motor;

    constructor(renderer: Renderer){
        super(new THREE.CylinderGeometry(2,2,1).rotateX(Math.PI/2), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);

        this.collisionRadius = 0;
        this._rotation = 0;
    }

    public update(time: number, delta: number){
        //this.updateVelocity(new THREE.Vector3(this.velocity.x*0.95, this.velocity.y*0.95, this.velocity.z*0.95));

        var prev_norm = this.normalDirection.clone();
        super.update(time, delta);

        this.forwardForce = this._connectedMotor.torque;

        var ort = this.normalDirection.clone().cross(this.realDirection);
        var norm = this.normalDirection.clone();
        var normYZ = new THREE.Vector2(norm.y, norm.x);
        var rotZ = Math.acos(normYZ.dot(new THREE.Vector2(1,0))/(normYZ.length()));
        if(!rotZ)
            rotZ = 0;
        else if(norm.x > 0)
            rotZ = -rotZ;

        var normXY = new THREE.Vector2(norm.y, norm.z);
        var rotX = Math.acos(normXY.dot(new THREE.Vector2(1,0))/(normXY.length()));
        if(!rotX)
            rotX = 0;
        else if(norm.z < 0)
            rotX = -rotX;

        this.object.rotation.set(rotX,0,rotZ);
        this.object.rotateOnAxis(new THREE.Vector3(0,1,0), this._rotation);
        this._wheelRotation += 0.05;

        this.geometry.rotateZ(-0.2*this.velocity.length());
    }

    public connectMotor(motor:Motor):void {
        this._connectedMotor = motor;
    }

    get rotation():number {
        return this._rotation;
    }

    set rotation(value:number) {
        this.object.rotateOnAxis(new THREE.Vector3(0,1,0), value-this._rotation);
        this.desiredDirection.applyAxisAngle(new THREE.Vector3(0,1,0), value-this._rotation);
        this._rotation = value;
    }
}