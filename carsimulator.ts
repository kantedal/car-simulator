/**
 * Created by filles-dator on 2016-01-26.
*/

///<reference path="./renderer.ts"/>
///<reference path="./data/ground_plane.ts"/>
///<reference path="./data/parts/wheel.ts"/>
///<reference path="./data/physics_object3d.ts"/>
///<reference path="./data/vehicle.ts"/>

class CarSimulator {
    private _renderer : Renderer;
    private _clock : THREE.Clock;
    private _time : number;
    private _surfaceIndex : number = 0;

    private _vehicle : Vehicle;
    private _dynamicBody : DynamicRigidBody;
    private _groundPlanes : GroundPlane[];
    private _baseGroundPlane : GroundPlane;

    public static ground_width : number = 248.25;

    constructor(){
        this._renderer = new Renderer();
        this._clock = new THREE.Clock();
        this._time = 0;
        this._groundPlanes = [];
    }

    start(){
        var self = this;
        self._renderer.start();

        this._dynamicBody = new DynamicRigidBody(new THREE.BoxGeometry(8,2,4), new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true}), this._renderer);
        this._dynamicBody.position.set(0,25,0);
        this._dynamicBody.object.position.set(0,25,0);


        var ground_plane = new GroundPlane(this._renderer);
        var groundCallback: PlaneLoadedListener = {
            planeLoaded: function (groundPlane: GroundPlane) {
                self._baseGroundPlane = groundPlane;

                self._groundPlanes.push(groundPlane);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                var newground_forward = groundPlane.clone();
                newground_forward.mesh.position.set(0,0,CarSimulator.ground_width);
                newground_forward.geometry.translate(0,0,CarSimulator.ground_width);
                self._groundPlanes.push(newground_forward)
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                var newground_forward_left = groundPlane.clone();
                newground_forward_left.mesh.position.set(CarSimulator.ground_width,0,CarSimulator.ground_width);
                newground_forward_left.geometry.translate(CarSimulator.ground_width,0,CarSimulator.ground_width);
                self._groundPlanes.push(newground_forward_left)
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                var newground_forward_right = groundPlane.clone();
                newground_forward_right.mesh.position.set(-CarSimulator.ground_width,0,CarSimulator.ground_width);
                newground_forward_right.geometry.translate(-CarSimulator.ground_width,0,CarSimulator.ground_width);
                self._groundPlanes.push(newground_forward_right)
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                var newground_right = groundPlane.clone();
                newground_right.mesh.position.set(-CarSimulator.ground_width,0,0);
                newground_right.geometry.translate(-CarSimulator.ground_width,0,0);
                self._groundPlanes.push(newground_right)
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                var newground_left = groundPlane.clone();
                newground_left.mesh.position.set(CarSimulator.ground_width,0,0);
                newground_left.geometry.translate(CarSimulator.ground_width,0,0);
                self._groundPlanes.push(newground_left)
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                var newground_backwards = groundPlane.clone();
                newground_backwards.mesh.position.set(0,0,-CarSimulator.ground_width);
                newground_backwards.geometry.translate(0,0,-CarSimulator.ground_width);
                self._groundPlanes.push(newground_backwards)
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                var newground_backwards_left = groundPlane.clone();
                newground_backwards_left.mesh.position.set(CarSimulator.ground_width,0,-CarSimulator.ground_width);
                newground_backwards_left.geometry.translate(CarSimulator.ground_width,0,-CarSimulator.ground_width);
                self._groundPlanes.push(newground_backwards_left)
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                var newground_backwards_right = groundPlane.clone();
                newground_backwards_right.mesh.position.set(-CarSimulator.ground_width,0,-CarSimulator.ground_width);
                newground_backwards_right.geometry.translate(-CarSimulator.ground_width,0,-CarSimulator.ground_width);
                self._groundPlanes.push(newground_backwards_right)
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length-1].mesh);

                self._dynamicBody.connectCollisionSurface(self._groundPlanes[0].geometry);
            }
        };
        ground_plane.loadPlane(groundCallback, this._renderer);

        this.update();
    }

    update(){
        var delta = this._clock.getElapsedTime()-this._time;
        this._time = this._clock.getElapsedTime();

        this._dynamicBody.update(this._time,delta);
        this._renderer.camera.position.set(this._dynamicBody.position.x,this._dynamicBody.position.y+3,this._dynamicBody.position.z-7);
        this._renderer.camera.lookAt(this._dynamicBody.position);

        //this._vehicle.update(this._time,delta);

        this._renderer.render(this._time);

        var self = this;
        setTimeout( function() {
            requestAnimationFrame(() => self.update());
        }, 1000 / 30 );

    }

    get renderer():Renderer {
        return this._renderer;
    }

    set renderer(value:Renderer) {
        this._renderer = value;
    }

    get clock():THREE.Clock {
        return this._clock;
    }

    set clock(value:THREE.Clock) {
        this._clock = value;
    }
}

window.onload = () => {
    var app = new CarSimulator();
    app.start();
};