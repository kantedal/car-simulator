/**
 * Created by filles-dator on 2016-01-26.
*/

///<reference path="./renderer.ts"/>
///<reference path="./data/environment/ground_plane.ts"/>
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
    private _isStarted = false;
    private _renderer : Renderer;
    private _clock : THREE.Clock;
    private _stats : Stats;
    private _time : number;
    private _delta : number;
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
    public static is_touch_device : boolean = false;

    constructor(){
        this._renderer = new Renderer();
        this._clock = new THREE.Clock();
        this._stats = new Stats();
        this._time = 0;
        this._delta = 0.05;

        CarSimulator.is_touch_device = this.isTouchDevice();

        this.handleJqueryEvents();
        //this._dynamicBody = new DynamicRigidBody(new THREE.BoxGeometry( 6, 3, 8 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), this._renderer, 500, this);

    }

    start(){
        var self = this;

        if(!CarSimulator.developer_mode){
            this._objectLoader = new ObjectLoader();
            var objectsLoaderListener: ObjectLoaderListener = {
                objectsLoaded: function() {
                    self._groundPlanes = new GroundPlane(self._renderer, 3);
                    self._car = new Vehicle(self._renderer);

                    var width = CarSimulator.ground_width;
                    var dim = self._groundPlanes.dimension;
                    for(var x=0; x<dim; x++) {
                        for (var z = 0; z < dim; z++) {
                            self._groundPlanes.newPlane(new THREE.Vector3(width * x - width * (dim-1)/2, 0, width * z - width*(dim-1)/2));
                        }
                    }
                    self._car.vehicleModel.connectCollisionSurfaces(self._groundPlanes.collisionMesh);

                    if(!CarSimulator.developer_mode) {
                        self._particleSystem = new ParticleSystem(self._renderer, self._car.vehicleSetup.wheels[2]);
                        self._particleSystem2 = new ParticleSystem(self._renderer, self._car.vehicleSetup.wheels[2]);
                        self._groundObjects = new GroundObjects(self._renderer, self._groundPlanes, self._car);
                    }

                    self._socket = new Socket(self._renderer,self._objectLoader);

                    for(var w=0; w<self._car.vehicleSetup.wheels.length; w++){
                        self._car.vehicleSetup.wheels[w].attatchMesh(ObjectLoader.wheelMesh.clone());
                    }

                    var carMesh = ObjectLoader.carMesh.clone();
                    self._car.vehicleSetup.vehicleBody.attatchMesh(carMesh);

                    self._groundObjects.tree.attachTreeMesh(ObjectLoader.treeMesh);

                    ObjectLoader.springMesh.position.set(0,0.5,0);
                    //self._objectLoader.springMesh.rotateX(Math.PI/2);
                    ObjectLoader.springMesh.scale.set(0.4,0.4,0.4);
                    for(var i=0; i<self._car.vehicleSetup.springConnector.length; i++){
                        self._car.vehicleSetup.springConnector[i].attatchSpringMesh(ObjectLoader.springMesh.clone(), ObjectLoader.springConnectorMesh.clone());
                    }

                    self._renderer.start();
                    self.update();
                    self.twoHertzUpdate();
                    self.thirtyHertzUpdate();
                }
            };

            this._stats = new Stats();
            if(CarSimulator.developer_mode) {
                this._stats.setMode(0); // 0: fps, 1: ms, 2: mb

                this._stats.domElement.style.position = 'absolute';
                this._stats.domElement.style.left = '20px';
                this._stats.domElement.style.top = '20px';

                document.body.appendChild(this._stats.domElement);
            }

            this._renderer.camera.position.set(0,60,0);
            this._renderer.camera.lookAt(new THREE.Vector3(0,0,0));
            this._objectLoader.load(objectsLoaderListener);
        }
    }

    private update(){
        this._stats.begin();

        if(this._isStarted){
            this._car.update(this._time, this._delta);

            if(!CarSimulator.developer_mode) {
                this._groundPlanes.update(this._car.vehicleModel.object.position);
                this._groundObjects.update(this._car.vehicleModel.object.position, this._time, this._delta);
                this._particleSystem.update(
                    this._car.vehicleModel.object.position.clone().add(this._car.vehicleSetup.wheels[2].relativePosition),
                    this._clock.getElapsedTime(),
                    this._delta
                );
                this._particleSystem2.update(
                    this._car.vehicleModel.object.position.clone().add(this._car.vehicleSetup.wheels[3].relativePosition),
                    this._clock.getElapsedTime(),
                    this._delta
                );
            }
        }

        this._renderer.render();
        this._stats.end();
        requestAnimationFrame(() => this.update());
    }

    private twoHertzUpdate(){
        if(this._isStarted) {
            this._groundObjects.slowUpdate(this._car.vehicleModel.object.position);
        }
        var self = this;
        setTimeout(() => self.twoHertzUpdate(), 500);
    }

    private thirtyHertzUpdate(){
        this._socket.update(this._car);

        var self = this;
        setTimeout(() => self.thirtyHertzUpdate(), 33);
    }

    private handleJqueryEvents(){
        var self = this;

        $.get("style/connection_start.html", function(data) {
            $("#connection_box").html(data);

            $("#singlePlayerButton").click(function () {
                $("#connection_box").html("");
                self._isStarted = true;
            });

            $("#connectServerButton").click(function () {
                $.get("style/connection_name.html", function (data) {
                    $("#connection_box").html(data);

                    $("#setSettingsButton").click(function () {

                        self._socket.name = $("#connectionName").val();
                        self._socket.carColor = $("#carColorSelection").val();

                        $.get("style/connect_to_server.html", function (data) {
                            $("#connection_box").html(data);

                            $("#connectButton").click(function () {
                                self._socket.connectToPeer($("#idText").val());
                                self._isStarted = true;

                                $.get("style/client_list.html", function (data) {
                                    $("#connection_box").html(data);
                                    $.get("style/connection_client.html", function (data) {
                                        $("#clientList").append(data);
                                        $("#client").attr("id", self._socket.connectionId);
                                        $("#"+self._socket.connectionId).html(self._socket.name);
                                    });
                                });
                            });

                        });
                    });
                });
            });

            $("#startServerButton").click(function () {
                $.get("style/connection_name.html", function (data) {
                    $("#connection_box").html(data);

                    $("#setSettingsButton").click(function () {

                        self._socket.name = $("#connectionName").val();
                        self._socket.carColor = $("#carColorSelection").val();
                        self._socket.startServer();

                        $.get("style/connect_to_server.html", function (data) {
                            $.get("style/connection_server.html", function (data) {
                                $("#connection_box").html(data);

                                $("#connection_id").html("Your ID: " + self._socket.connectionId);

                                $.get("style/client_list.html", function (data) {
                                    $("#connection_box").append(data);
                                    $.get("style/connection_client.html", function (data) {
                                        $("#clientList").append(data);
                                        $("#client").attr("id", self._socket.connectionId);
                                        $("#"+self._socket.connectionId).html(self._socket.name);
                                    });
                                });

                                self._isStarted = true;
                            });
                        });
                    });
                });
            });
        });
    }

    private isTouchDevice() {
        return !!('ontouchstart' in window);
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