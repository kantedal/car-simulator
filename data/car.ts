/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>
///<reference path="./parts/motor.ts"/>
///<reference path="./parts/spring.ts"/>
///<reference path="./dynamic_rigid_body.ts"/>

class Car extends PhysicsObject3d {
    private _renderer:Renderer;
    private _rotation:THREE.Vector3;

    //Car parts
    private _wheels:Wheel[];
    private _springs:Spring[];
    private _motor:Motor;
    private _steering:Steering;

    private _carGroup : THREE.Group;

    constructor(renderer : Renderer){
        super(new THREE.BoxGeometry( 6, 3, 8 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);

        this.object.position.setY(3);
        this.rotation = Math.PI/2;

        this._renderer = renderer

        this._carGroup = new THREE.Group();
        this._carGroup.add(this.object);
        this._renderer.scene.add(this._carGroup);

        this._motor = new Motor(5000,3);
        this._wheels = [new Wheel(renderer, this), new Wheel(renderer, this), new Wheel(renderer, this), new Wheel(renderer, this)];
        this._springs = [new Spring(renderer, this), new Spring(renderer, this), new Spring(renderer, this), new Spring(renderer, this)];
        this._steering = new Steering(Math.PI/2);

        this.desiredDirection.set(0,0,0);


        this._wheels[0].connectSpring(this._springs[0]);
        this._wheels[0].connectSteering(this._steering);
        this._wheels[0].object.position.set(-5.5,0,-4);
        this._wheels[0].rotation = Math.PI/2;
        this._springs[0].springGroup.position.set(-4.5,0,-4);
        this._springs[0].springGroup.rotateZ(-Math.PI/9);
        this._carGroup.add(this._wheels[0].object);
        this._carGroup.add(this._springs[0].springGroup);

        this._wheels[1].connectSpring(this._springs[1]);
        this._wheels[1].connectSteering(this._steering);
        this._wheels[1].object.position.set(5.5,0,-4);
        this._wheels[1].rotation = Math.PI/2;
        this._springs[1].springGroup.position.set(4.5,0,-4);
        this._springs[1].springGroup.rotateZ(Math.PI/9);
        this._carGroup.add(this._wheels[1].object);
        this._carGroup.add(this._springs[1].springGroup);

        this._wheels[2].connectMotor(this._motor);
        this._wheels[2].object.position.set(-5.5,0,4);
        this._wheels[2].rotation = Math.PI/2;
        this._springs[2].springGroup.position.set(-4.5,0,4);
        this._springs[2].springGroup.rotateZ(-Math.PI/9);
        this._wheels[2].connectSpring(this._springs[2]);
        this._carGroup.add(this._wheels[2].object);
        this._carGroup.add(this._springs[2].springGroup);

        this._wheels[3].connectMotor(this._motor);
        this._wheels[3].object.position.set(5.5,0,4);
        this._wheels[3].rotation = Math.PI/2;
        this._springs[3].springGroup.position.set(4.5,0,4);
        this._springs[3].springGroup.rotateZ(Math.PI/9);
        this._wheels[3].connectSpring(this._springs[3]);
        this._carGroup.add(this._wheels[3].object);
        this._carGroup.add(this._springs[3].springGroup);


        window.addEventListener( 'keydown', this.onKeyDown, false );
        window.addEventListener( 'keyup', this.onKeyUp, false );
    }

    public update(time:number, delta:number):void {
        super.update(time,delta);
        this._motor.update(time,delta);

        for(var i=0; i<this._wheels.length; i++){
            this._springs[i].update(time, delta);
            this._wheels[i].update(time, delta);
        }

        this.acceleration.set(0,0,0);
        for(var i=0; i<this._wheels.length; i++) {
            if(this._wheels[i].connectedMotor){
                this.acceleration.set(
                    this.acceleration.x + 0.003 * (this._wheels[i].desiredDirection.x * this._motor.torque + this._wheels[i].frictionForce.x*5000),
                    this.acceleration.y + 0.003 * (this._wheels[i].desiredDirection.y * this._motor.torque + this._wheels[i].frictionForce.y*5000),
                    this.acceleration.z + 0.003 * (this._wheels[i].desiredDirection.z * this._motor.torque + this._wheels[i].frictionForce.z*5000)
                );
            }else{
                this.acceleration.set(
                    this.acceleration.x + 0.003 * this._wheels[i].frictionForce.x*5000,
                    this.acceleration.y + 0.003 * this._wheels[i].frictionForce.y*5000,
                    this.acceleration.z + 0.003 * this._wheels[i].frictionForce.z*5000
                );
            }
        }

       // if(!this.isColliding)
        //    this.acceleration.setY(this.acceleration.y - 9.82*10)

        this.velocity.set(
            this.velocity.x + 0.003*this.acceleration.x,
            this.velocity.y + 0.003*this.acceleration.y,
            this.velocity.z + 0.003*this.acceleration.z
        );

        this.velocity.projectOnPlane(this.normalDirection);


        this.position.set(
            this.position.x + this.velocity.x,
            this.position.y + this.velocity.y,
            this.position.z + this.velocity.z
        );

        this._steering.update(time,delta);

        this._carGroup.position.set(this.position.x-this.velocity.x*1.95, this.position.y-this.velocity.y*1.95, this.position.z-this.velocity.z*1.96);


        this._carGroup.rotateOnAxis(new THREE.Vector3(0,1,0), (this._steering.steeringAngle-Math.PI/2)*0.05*this.velocity.length());
        this.rotation += (this._steering.steeringAngle-Math.PI/2)*0.1*this.velocity.length();

        this._renderer.camera.lookAt(this._carGroup.position);
        this._renderer.camera.position.set(this._carGroup.position.x, this._carGroup.position.y+10, this._carGroup.position.z+15);

        //this._carGroup.rotateZ(Math.sin(time*4)*0.02);
    }

    public connectWheelsCollisionSurface(groundPlanes: GroundPlane[]): number{
        var surfaceIndex = 0;
        //for(var g=0; g<groundPlanes.length; g++){
        //    if(Math.abs(this.position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width/2 && Math.abs(this.position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width/2) {
        //        this.connectCollisionSurface(groundPlanes[g].geometry);
        //        surfaceIndex = g;
        //        break;
        //    }
        //}
        for(var g=0; g<groundPlanes.length; g++){
            for(var i=0; i<this._wheels.length; i++) {
                if(Math.abs(this._wheels[i].position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width/2 && Math.abs(this._wheels[i].position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width/2) {
                    this._wheels[i].connectCollisionSurface(groundPlanes[g].geometry);
                   // this.connectCollisionSurface(groundPlanes[g].geometry);
                    surfaceIndex = g;
                }
            }
        }
        return surfaceIndex;
    }

    private pressedKeys = [];
    onKeyDown = (e) => {
        if (e) {

            this.pressedKeys[e.keyCode] = true;

            if(this.pressedKeys[37]) {
                this._steering.steeringAcceleration = 110
            }

            if(this.pressedKeys[38]) {
                this._motor.isAccelerating = true;
            }

            if(this.pressedKeys[39]) {
                this._steering.steeringAcceleration = -110
            }

            if(this.pressedKeys[40]) {
            }
        }
    }
    onKeyUp = (e) => {
        if (e) {
            this.pressedKeys[e.keyCode] = false;
            switch (e.which) {
                case 37: //Left
                    break;
                case 38: //Up
                    this._motor.isAccelerating = false;
                    break;
                case 39: //Right
                    break;
                case 40: //Down
                    break;
            }
        }
    }

    get acceleration():THREE.Vector3 {
        return this._acceleration;
    }

    set acceleration(value:THREE.Vector3) {
        this._acceleration = value;
    }

    get isColliding():boolean {
        return this._isColliding;
    }

    set isColliding(value:boolean) {
        this._isColliding = value;
    }

    get velocity():THREE.Vector3 {
        return this._velocity;
    }

    set velocity(value:THREE.Vector3) {
        this._velocity = value;
    }

    get rotation():THREE.Vector3 {
        return this._rotation;
    }

    set rotation(value:THREE.Vector3) {
        this._rotation = value;
    }

    get carGroup():THREE.Group {
        return this._carGroup;
    }

    set carGroup(value:THREE.Group) {
        this._carGroup = value;
    }

    get steering():Steering {
        return this._steering;
    }

    set steering(value:Steering) {
        this._steering = value;
    }
}