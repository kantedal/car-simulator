/**
 * Created by filles-dator on 2016-01-26.
*/

///<reference path="./renderer.ts"/>
///<reference path="./data/ground_plane.ts"/>
///<reference path="./data/parts/wheel.ts"/>
///<reference path="./data/physics_object3d.ts"/>
///<reference path="./data/vehicle.ts"/>
///<reference path="./data/dynamic_rigid_body.ts"/>
///<reference path="./data/car_test.ts"/>
///<reference path="./data/environment/object_loader.ts"/>
///<reference path="./math/stats.d.ts"/>
///<reference path="./data/network/socket.ts"/>
/// <reference path="./math/jquery.d.ts" />
/// <reference path="./data/dust/particle_system.ts" />
/// <reference path="./data/dust/particle.ts" />


class CarSimulator {
    private _renderer : Renderer;
    private _clock : THREE.Clock;
    private _stats : Stats;
    private _time : number;
    private _surfaceIndex : number = 0;
    private _socket : Socket;

    private _car : Vehicle;
    private _groundPlanes : GroundPlane;
    private _collisionScene : THREE.Scene;

    private _objectLoader : ObjectLoader;
    private _groundObjects : GroundObjects;
    private _particleSystem : ParticleSystem;
    private _particleSystem2 : ParticleSystem;


    public static ground_width : number = 200;
    public static developer_mode : boolean = false;

    constructor(){
        this._renderer = new Renderer();
        this._clock = new THREE.Clock();
        this._stats = new Stats();
        this._time = 0;
        this._groundPlanes = new GroundPlane();;
        this._car = new Vehicle(this._renderer);

        this._objectLoader = new ObjectLoader();

        if(!CarSimulator.developer_mode) {
            this._particleSystem = new ParticleSystem(this._renderer, this._car.vehicleSetup.wheels[2]);
            this._particleSystem2 = new ParticleSystem(this._renderer, this._car.vehicleSetup.wheels[2]);
            this._groundObjects = new GroundObjects(this._renderer, this._groundPlanes, this._car);
        }

        this._socket = new Socket(this._renderer,this._objectLoader);

        this.handleJqueryEvents();
        //this._dynamicBody = new DynamicRigidBody(new THREE.BoxGeometry( 6, 3, 8 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), this._renderer, 500, this);

    }

    start(){
        var self = this;
        self._renderer.start();
        //self._carTest = new CarTest(this._renderer);
        //this._dynamicBody = new DynamicRigidBody(new THREE.BoxGeometry(8,2,4), new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true}), this._renderer);
        this._collisionScene = new THREE.Scene();

        this._groundPlanes = new GroundPlane(this._renderer, 3);

        var width = CarSimulator.ground_width;
        var dim = this._groundPlanes.dimension;
        for(var x=0; x<dim; x++) {
            for (var z = 0; z < dim; z++) {
                this._groundPlanes.newPlane(new THREE.Vector3(width * x - width * (dim-1)/2, 0, width * z - width*(dim-1)/2));
            }
        }
        this._car.vehicleModel.connectCollisionSurfaces(this._groundPlanes.collisionMesh);

        if(!CarSimulator.developer_mode){
            var objectsLoaderListener: ObjectLoaderListener = {
                objectsLoaded: function() {
                    for(var w=0; w<self._car.vehicleSetup.wheels.length; w++){
                        self._car.vehicleSetup.wheels[w].attatchMesh(self._objectLoader.wheelMesh.clone());
                    }

                    var carMesh = self._objectLoader.carMesh.clone();
                    self._car.vehicleSetup.vehicleBody.attatchMesh(carMesh);

                    self._groundObjects.tree.attachTreeMesh(self._objectLoader.treeMesh);

                    //self._objectLoader.springMesh.position.set(0,0.5,0);
                    ////self._objectLoader.springMesh.rotateX(Math.PI/2);
                    //self._objectLoader.springMesh.scale.set(0.4,0.4,0.4);
                    //for(var i=0; i<self._car.vehicleSetup.springConnector.length; i++){
                    //    self._car.vehicleSetup.springConnector[i].attatchSpringMesh(self._objectLoader.springMesh.clone(), self._objectLoader.springConnectorMesh.clone());
                    //}
                }
            };
            this._objectLoader.load(objectsLoaderListener);
        }

        this._renderer.camera.position.set(0,60,0);
        this._renderer.camera.lookAt(this._car.vehicleModel.object.position);

        this._stats = new Stats();
        this._stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

        this._stats.domElement.style.position = 'absolute';
        this._stats.domElement.style.left = '20px';
        this._stats.domElement.style.top = '20px';

        document.body.appendChild( this._stats.domElement );

        this.update();
    }

    private update(){
        this._stats.begin();
        this._socket.update(this._car);

        var delta = 0.05;
        //delta = this._clock.getDelta();

        this._groundPlanes.update(this._car.vehicleModel.object.position);
        this._car.update(this._time,delta);

        if(!CarSimulator.developer_mode) {
            this._groundObjects.update(this._car.vehicleModel.object.position, this._time, delta);
            this._particleSystem.update(
                this._car.vehicleModel.object.position.clone().add(this._car.vehicleSetup.wheels[2].relativePosition),
                this._clock.getElapsedTime(),
                delta
            );
            this._particleSystem2.update(
                this._car.vehicleModel.object.position.clone().add(this._car.vehicleSetup.wheels[3].relativePosition),
                this._clock.getElapsedTime(),
                delta
            );
        }

        this._renderer.render();
        this._stats.end();

        requestAnimationFrame(() => this.update());
        //setTimeout(() => this.update(), 60/1000);
        //this.update();
    }

    private handleJqueryEvents(){
        var self = this;
        $( "#connectButton" ).click(function() {
            self._socket.connectToPeer($( "#idText" ).val());
        });
    }

    get renderer():Renderer {
        return this._renderer;
    }

    set renderer(value:Renderer) {
        this._renderer = value;
    }

    get collisionScene():THREE.Scene {
        return this._collisionScene;
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