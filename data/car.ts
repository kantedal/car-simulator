/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>
<<<<<<< HEAD
=======
///<reference path="./parts/motor.ts"/>
///<reference path="./parts/spring.ts"/>
>>>>>>> 7bc88dac21abbf9f01ffc39f50de8e4d844d3590

class Car {
    private _renderer:Renderer;
    private _wheels:Wheel[];
<<<<<<< HEAD
    private _position:THREE.Vector3;

    constructor(renderer : Renderer){
        //super(new THREE.BoxGeometry(7, 2, 5), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);
        this._renderer = renderer

        this._wheels = [new Wheel(renderer)];

        this._wheels[0].position.set(0,0,50);
        renderer.scene.add(this._wheels[0].object);

        this._position = new THREE.Vector3(0,0,50);
    }

    public update(time:number, delta:number):void {
        for(var i=0; i<this._wheels.length; i++){
            this._wheels[i].update(time, delta)
        }

        this._renderer.camera.lookAt(this._wheels[0].object.position);
        this._renderer.camera.position.set(this._wheels[0].position.x, this._wheels[0].position.y+10, this._wheels[0].position.z-15);
=======
    private _springs:Spring[];
    private _position:THREE.Vector3;
    private _motor:Motor;

    private _acceleration:THREE.Vector3;
    private _velocity:THREE.Vector3;
    private _isColliding:boolean;

    private _steeringAngle = 0;

    constructor(renderer : Renderer){
        this._renderer = renderer


        this._motor = new Motor(20000,3);
        this._wheels = [new Wheel(renderer)];
        this._springs = [new Spring(renderer, this)];

        this._wheels[0].connectMotor(this._motor);
        this._wheels[0].connectSpring(this._springs[0]);

        this._velocity = this._wheels[0].velocity;
        this._acceleration = this._wheels[0].acceleration;
        this._isColliding = this._wheels[0].isColliding;

        this._position = new THREE.Vector3(0,0,0);

        renderer.scene.add(this._wheels[0].object);
        window.addEventListener( 'keydown', this.onKeyDown, false );
        window.addEventListener( 'keyup', this.onKeyUp, false );
    }

    public update(time:number, delta:number):void {
        this._motor.update(time,delta);

        for(var i=0; i<this._wheels.length; i++){
            this._springs[i].update(time, delta);
            this._wheels[i].update(time, delta);
        }

        this._acceleration = this._wheels[0].acceleration;
        this._velocity = this._wheels[0].velocity;
        this._isColliding = this._wheels[0].isColliding;

        this._renderer.camera.lookAt(this._wheels[0].object.position);
        this._renderer.camera.position.set(this._wheels[0].position.x, this._wheels[0].position.y+10, this._wheels[0].position.z+15);
>>>>>>> 7bc88dac21abbf9f01ffc39f50de8e4d844d3590
        this._position.set(this._wheels[0].position.x, this._wheels[0].position.y, this._wheels[0].position.z);
    }

    connectCollisionSurface(groundPlanes: GroundPlane[]): number{
        var surfaceIndex = 0;
        for(var g=0; g<groundPlanes.length; g++){
            for(var i=0; i<this._wheels.length; i++) {
                if(Math.abs(this._wheels[i].position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width/2 && Math.abs(this._wheels[i].position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width/2) {
                    this._wheels[i].connectCollisionSurface(groundPlanes[g].geometry);
                    surfaceIndex = g;
                    break;
                }
            }
        }
        return surfaceIndex;
    }

<<<<<<< HEAD
=======
    private pressedKeys = [];
    onKeyDown = (e) => {
        if (e) {

            this.pressedKeys[e.keyCode] = true;

            if(this.pressedKeys[37]) {
                this._steeringAngle += 0.35;
                this._wheels[0].rotation = this._steeringAngle;
            }

            if(this.pressedKeys[38]) {
                this._motor.isAccelerating = true;
            }

            if(this.pressedKeys[39]) {
                this._steeringAngle -= 0.35;
                this._wheels[0].rotation = this._steeringAngle;
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

>>>>>>> 7bc88dac21abbf9f01ffc39f50de8e4d844d3590
    get position():THREE.Vector3 {
        return this._position;
    }

    set position(value:THREE.Vector3) {
        this._position = value;
    }
<<<<<<< HEAD
=======

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
>>>>>>> 7bc88dac21abbf9f01ffc39f50de8e4d844d3590
}