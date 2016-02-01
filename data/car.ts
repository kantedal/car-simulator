/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>

class Car {
    private _renderer:Renderer;
    private _wheels:Wheel[];
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

    get position():THREE.Vector3 {
        return this._position;
    }

    set position(value:THREE.Vector3) {
        this._position = value;
    }
}