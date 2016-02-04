/**
 * Created by filles-dator on 2016-01-26.
 */

///<reference path="../physics_object3d.ts"/>
///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="./motor.ts"/>
///<reference path="./spring.ts"/>

class Wheel extends DynamicRigidBody {
    private _rotation : number;
    private _wheelRotation : number = 0;
    private _connectedMotor : Motor;
    private _connectedSpring : Spring;
    private _frictionalMomentum : number;

    constructor(renderer: Renderer){
        super(new THREE.CylinderGeometry(2,2,1).rotateX(Math.PI/2), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);

        this.collisionRadius = 0;
        this._rotation = 0;
        this.position.set(0,100,0);
    }

    public update(time: number, delta: number){
        super.update(time,delta);
        var normalizedGradient = this.velocity.clone().normalize();
        if(this.velocity.length() == 0)
            normalizedGradient = this.realDirection.clone();

        this.frictionConst = 0.8 + 0.12*(Math.abs(
                this.realDirection.x*normalizedGradient.x +
                this.realDirection.y*normalizedGradient.y +
                this.realDirection.z*normalizedGradient.z
            ));

        if(this.hasCollisionSurface) {
            var gradientMagnitude = -Math.abs(Math.PI/2 - this.gradientDirection.angleTo(new THREE.Vector3(0,-1,0)))/(Math.PI/2);
            var normalMagnitude = -Math.abs(this.gradientDirection.angleTo(new THREE.Vector3(0,-1,0)))/(Math.PI/2);
            this.inclineForce.set(this.gradientDirection.x,this.gradientDirection.y,this.gradientDirection.z).multiplyScalar(this.mass*this.gravity*gradientMagnitude);

            var newVelocity = new THREE.Vector3(0,0,0);

            this.updateVelocity(new THREE.Vector3(
                newVelocity.x,
                newVelocity.y,
                newVelocity.z
            ));

            this.position.setX(this.position.x + (this.velocity.x)); // + this.velocity.x); //this.realDirection.x * this.velocity.length());
            this.position.setY(this.position.y + (this.velocity.y)); // + this.velocity.y); //this.realDirection.y * this.velocity.length());
            this.position.setZ(this.position.z + (this.velocity.z)); // + this.velocity.z); //this.realDirection.z * this.velocity.length());
        }


        ////////////***************************************//////////////
        if(this._connectedMotor && this.isColliding && this._connectedMotor.torque != 0) {
            var frictionCoeff = 0.1;
            this._frictionalMomentum = Math.abs((1-Math.acos(this.normalDirection.dot(new THREE.Vector3(0,1,0))))*500*(9.82)*frictionCoeff);

            var totalTorque = Math.abs(this._connectedMotor.torque-this._frictionalMomentum);

            this.forwardForce = totalTorque;
        }else{
            this.forwardForce = 0;
        }
        //////////******************************************/////////////////

        var norm = this.realNormalDirection.clone();
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

    public connectSpring(spring:Spring):void {
        this._connectedSpring = spring;
        this.object.add(spring.springObject);
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