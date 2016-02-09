/**
 * Created by filles-dator on 2016-01-26.
 */

///<reference path="../physics_object3d.ts"/>
///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="./motor.ts"/>
///<reference path="./spring.ts"/>

class Wheel extends PhysicsObject3d {
    private _rotation : number;
    private _wheelRotation : number = 0;
    private _connectedMotor : Motor;
    private _connectedSpring : Spring;
    private _steering : Steering;
    private _frictionalMomentum : number;

    constructor(renderer: Renderer){
        super(new THREE.CylinderGeometry(2,2,1).rotateX(Math.PI/2), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);

        this.collisionRadius = 0;
        this._rotation = 0;
        this.position.set(5,0,0);
    }

    public update(time: number, delta: number){

        var normalizedGradient = this.velocity.clone().normalize();
        if(this.velocity.length() == 0)
            normalizedGradient = this.realDirection.clone();

        this.frictionConst = 0.8 + 0.12*(Math.abs(
                this.realDirection.x*normalizedGradient.x +
                this.realDirection.y*normalizedGradient.y +
                this.realDirection.z*normalizedGradient.z
            ));

        super.update(time, delta);


        ////////////***************************************//////////////
        if(this._connectedMotor && this.isColliding && this._connectedMotor.torque != 0) {
            var frictionCoeff = 0.1;
            this._frictionalMomentum = Math.abs((1-Math.acos(this.normalDirection.dot(new THREE.Vector3(0,1,0))))*500*(9.82)*frictionCoeff);

            var totalTorque = Math.abs(this._connectedMotor.torque-this._frictionalMomentum);

            this.forwardForce = totalTorque;
        }else{
            this.forwardForce = 0;
        }

        if(this._steering){
            this.desiredDirection.applyAxisAngle(new THREE.Vector3(0,1,0), this._steering.steeringAngle-this._rotation);
            this._rotation = this._steering.steeringAngle;
            this.object.rotation.set(0,this._rotation,0);
        }

        this.geometry.rotateZ(-0.2*this.velocity.length());
    }

    public connectMotor(motor:Motor):void {
        this._connectedMotor = motor;
    }

    public connectSpring(spring:Spring):void {
        this._connectedSpring = spring;
        this._connectedSpring.position.set(1,0,0);
        this.object.add(spring.springObject);
    }

    public connectSteering(steering:Steering):void {
        this._steering = steering;
    }

    get rotation():number {
        return this._rotation;
    }

}