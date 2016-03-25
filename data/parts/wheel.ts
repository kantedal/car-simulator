/**
 * Created by filles-dator on 2016-01-26.
 */

///<reference path="../physics_object3d.ts"/>
///<reference path="../../math/mathjs.d.ts"/>
///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="./motor.ts"/>
///<reference path="./spring.ts"/>
///<reference path="../particle_collider.ts"/>

class Wheel extends ParticleCollider {
    private _wheelRotation : number = 0;
    private _frictionalMomentum : number;
    private _wheelDirection : THREE.Vector3;
    private _relativePosition: THREE.Vector3;
    private _isColliding : boolean;
    private _collisionNormal : mathjs.Matrix;
    private _relativeVelocity : mathjs.Matrix;

    private _connectedMotor : Motor;
    private _connectedSpring : Spring;
    private _connectedSteering : Steering;
    private _connectedVehicle : Vehicle;

    private _renderer: Renderer;
    private _attatchedMesh: THREE.Mesh;
    private _collisionPoint: THREE.Mesh;

    constructor(renderer: Renderer, pos: THREE.Vector3){
        var geometry;
        if(CarSimulator.developer_mode)
            geometry = new THREE.CylinderGeometry(1.6,1.6,0.9);
        else
            geometry = new THREE.CylinderGeometry(0,0,0);

        super(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);

        this._isColliding = false;
        this._wheelDirection = new THREE.Vector3(0,0,-1);
        this._relativeVelocity = math.matrix([0,0,0,0,0,0]);
        this._relativePosition = new THREE.Vector3(0,0,0)
        this.velocity = math.matrix([0,0,0,0,0,0]);
        this.state = math.matrix([pos.x, pos.y, pos.z,0,0,0]);

        this.object.position.set(pos.x, pos.y, pos.z);

        this._renderer = renderer;

        this._collisionPoint =  new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({color: 0xffff00}));
        this._renderer.scene.add(this._collisionPoint);
    }

    public update(time: number, delta: number){
        //super.update(time,delta);

        //if(!this.isColliding) {
            //this._forceTotal = math.add(this.forceExternal, this.forceConstraints); //Combine external and constraint forces
            //this.velocity = math.add(this.velocity, math.multiply(math.multiply(math.inv(this.M), this.forceTotal), delta));
            //this._relativeVelocity = math.subtract(this.velocity, this._connectedVehicle.vehicleModel.velocity);
            //this.state = math.add(this.state, math.multiply(this._relativeVelocity, delta));
        //}

        //this._forceConstraints = math.matrix([0,0,0,0,0,0]);
        this._forceConstraints = math.multiply(this._forceConstraints,0.9);
        this._relativePosition = this.object.position.clone().applyQuaternion(this._connectedVehicle.vehicleModel.object.quaternion);
        this._collisionPoint.position.copy(this._relativePosition.clone().add(this._connectedVehicle.vehicleModel.object.position));

        this.object.position.set(this.object.position.x, this.state.valueOf()[1], this.object.position.z);

        if(this._connectedVehicle){
            this._wheelDirection = this._connectedVehicle.vehicleModel.localZDirection.clone().multiplyScalar(-1);

            if(this._connectedSteering) {
                this._wheelDirection.applyAxisAngle(this._connectedVehicle.vehicleModel.localYDirection, this._connectedSteering.steeringAngle);
            }

            var wheelRotation = -this._connectedVehicle.vehicleModel.velocityDirection.clone().dot(this._wheelDirection);

            if(CarSimulator.developer_mode)
                this.object.geometry.rotateX(wheelRotation*0.02);
            else if(this._attatchedMesh){
                //console.log(this._attatchedMesh);
                //this._attatchedMesh.children[1].geometry.rotateZ(wheelRotation*0.01);
                var dir = this._wheelDirection;
                this._attatchedMesh.rotateOnAxis(new THREE.Vector3(0,0,1), Math.sign(this.object.position.x)*wheelRotation*0.015);
            }

            if(this.isColliding){
                this._collisionPoint.material.color.setHex(0xff00ff);
                //this.friction();
                this._connectedVehicle.vehicleModel.velocity.valueOf()[4] *= (0.99-0);
            }
            //else
            //    this._collisionPoint.material.color.setHex(0x0000ff);
        }

        if(this._connectedSteering){
            this.object.rotation.set(0,this._connectedSteering.steeringAngle,0)
        }

        if(this._connectedMotor){
            if(this.isColliding && this._connectedMotor.torque != 0){
                this.addMotorForce();
            }
        }

    }

    private addMotorForce(){
        var forward_dir = this._connectedVehicle.vehicleModel.localZDirection.clone().multiplyScalar(-1);

        var force = math.multiply(
            math.matrix([
                forward_dir.x,
                forward_dir.y,
                forward_dir.z
            ]),
            this._connectedMotor.torque);

        var J = math.matrix([
            force.valueOf()[0],
            force.valueOf()[1],
            force.valueOf()[2],
            0,0,0
        ]);

        var mc = 1/math.multiply( math.multiply(J, math.inv(this._connectedVehicle.vehicleModel.M)), math.transpose(J));
        //var ground_force = math.dot(this._connectedVehicle.vehicleModel.forceTotal, new math.matrix([0,1,0,0,0,0]);
        var forceComp = this._connectedVehicle.vehicleModel.localYDirection.clone().dot(new THREE.Vector3(0,1,0));
        if(forceComp > 0) {
            var lagrange = mc * (math.multiply(J, math.matrix([
                    forward_dir.x,
                    forward_dir.y,
                    forward_dir.z,
                    0, 0, 0])
                )) * 5;

            var Fc = math.multiply(math.transpose(J), lagrange);
            this._connectedVehicle.vehicleModel.forceConstraints = math.add(this._connectedVehicle.vehicleModel.forceConstraints, Fc);
            this._connectedVehicle.vehicleSetup.vehicleBody.forceConstraints.valueOf()[3] += 100000;
        }
    }


    private friction() {
        this._connectedVehicle.vehicleModel.velocity.valueOf()[4] *= (0.99-0);

        var direction = this._connectedVehicle.vehicleModel.velocityDirection.clone().normalize();
        var math_direction = math.matrix([direction.x, direction.y, direction.z]);

        var force_radius = math.matrix([
            this._relativePosition.x + this._connectedVehicle.vehicleModel.localYDirection.x*0.9,
            this._relativePosition.y + this._connectedVehicle.vehicleModel.localYDirection.y*0.9,
            this._relativePosition.z + this._connectedVehicle.vehicleModel.localYDirection.z*0.9
        ]);

        var cross = math.cross(force_radius,math_direction).valueOf();
        var J = math.matrix([
            direction.x,
            direction.y,
            direction.z,
            cross[0],
            cross[1],
            cross[2]
        ]);

        var mc = 1/math.multiply(math.multiply(J, math.inv(this._connectedVehicle.vehicleModel.M)), math.transpose(J));

        //var forceVec = this._connectedVehicle.vehicleModel.localZDirection.clone().applyAxisAngle(this._connectedVehicle.vehicleModel.localYDirection, -Math.PI/2);
        //var forceComp = Math.abs(vel.clone().normalize().dot(forceVec));

        //var forceUp = this._connectedVehicle.vehicleModel.forceTotal.valueOf()[1]

        if(this._connectedVehicle.vehicleModel.acceleration.y > 0){

        }
        var lagrange = -mc*(math.multiply(J, this._connectedVehicle.velocity))*0.15;

        var Fc = math.multiply(math.transpose(J),lagrange);
        this._connectedVehicle.vehicleModel.forceConstraints =  math.add(this._connectedVehicle.vehicleModel.forceConstraints, Fc);


    }

    public attatchMesh(mesh:THREE.Mesh){
        this._attatchedMesh = mesh;
        if(this.object.position.x < 0)
            this._attatchedMesh.rotateY(Math.PI);

        this.object.add(this._attatchedMesh)
    }
    
    public connectVehicle(vehicle:Vehicle){
        this._connectedVehicle = vehicle;
    }

    public connectMotor(motor:Motor):void {
        this._connectedMotor = motor;
    }

    public connectSteering(steering:Steering):void {
        this._connectedSteering = steering;
    }

    get rotation():number {
        return this._rotation;
    }

    get wheelDirection():THREE.Vector3 {
        return this._wheelDirection;
    }

    get isColliding():boolean {
        return this._isColliding;
    }

    set isColliding(value:boolean) {
        this._isColliding = value;
    }

    set collisionNormal(value:mathjs.Matrix) {
        this._collisionNormal = value;
    }

    get relativePosition():THREE.Vector3 {
        return this._relativePosition;
    }

    get connectedVehicle():Vehicle {
        return this._connectedVehicle;
    }
}