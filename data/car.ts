/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>
///<reference path="./parts/motor.ts"/>

class Car {
    private _renderer:Renderer;
    private _wheels:Wheel[];
    private _position:THREE.Vector3;
    private _motor:Motor;

    private _steeringAngle = 0;

    constructor(renderer : Renderer){
        //super(new THREE.BoxGeometry(7, 2, 5), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);
        this._renderer = renderer

        this._motor = new Motor(15000,3);
        this._wheels = [new Wheel(renderer)];

        this._wheels[0].position.set(0,0,50);
        renderer.scene.add(this._wheels[0].object);

        this._wheels[0].connectMotor(this._motor);

        this._position = new THREE.Vector3(0,0,50);

        window.addEventListener( 'keydown', this.onKeyDown, false );
        window.addEventListener( 'keyup', this.onKeyUp, false );
    }

    public update(time:number, delta:number):void {
        this._motor.update(time,delta);

        for(var i=0; i<this._wheels.length; i++){
            this._wheels[i].update(time, delta)
        }

        this._renderer.camera.lookAt(this._wheels[0].object.position);
        this._renderer.camera.position.set(this._wheels[0].position.x, this._wheels[0].position.y+10, this._wheels[0].position.z-15);
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

    get position():THREE.Vector3 {
        return this._position;
    }

    set position(value:THREE.Vector3) {
        this._position = value;
    }
}