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
var CarSimulator = (function () {
    function CarSimulator() {
        this._isStarted = false;
        this._surfaceIndex = 0;
        CarSimulator.is_touch_device = this.isTouchDevice();
        this._renderer = new Renderer();
        this._clock = new THREE.Clock();
        this._stats = new Stats();
        this._time = 0;
        this._delta = 0.05;
        this._groundPlanes = new GroundPlane();
        ;
        this._car = new Vehicle(this._renderer);
        this._objectLoader = new ObjectLoader();
        if (!CarSimulator.developer_mode) {
            this._particleSystem = new ParticleSystem(this._renderer, this._car.vehicleSetup.wheels[2]);
            this._particleSystem2 = new ParticleSystem(this._renderer, this._car.vehicleSetup.wheels[2]);
            this._groundObjects = new GroundObjects(this._renderer, this._groundPlanes, this._car);
        }
        this._socket = new Socket(this._renderer, this._objectLoader);
        this.handleJqueryEvents();
        //this._dynamicBody = new DynamicRigidBody(new THREE.BoxGeometry( 6, 3, 8 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), this._renderer, 500, this);
    }
    CarSimulator.prototype.start = function () {
        var self = this;
        self._renderer.start();
        //self._carTest = new CarTest(this._renderer);
        //this._dynamicBody = new DynamicRigidBody(new THREE.BoxGeometry(8,2,4), new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true}), this._renderer);
        this._collisionScene = new THREE.Scene();
        this._groundPlanes = new GroundPlane(this._renderer, 3);
        var width = CarSimulator.ground_width;
        var dim = this._groundPlanes.dimension;
        for (var x = 0; x < dim; x++) {
            for (var z = 0; z < dim; z++) {
                this._groundPlanes.newPlane(new THREE.Vector3(width * x - width * (dim - 1) / 2, 0, width * z - width * (dim - 1) / 2));
            }
        }
        this._car.vehicleModel.connectCollisionSurfaces(this._groundPlanes.collisionMesh);
        if (!CarSimulator.developer_mode) {
            var objectsLoaderListener = {
                objectsLoaded: function () {
                    for (var w = 0; w < self._car.vehicleSetup.wheels.length; w++) {
                        self._car.vehicleSetup.wheels[w].attatchMesh(self._objectLoader.wheelMesh.clone());
                    }
                    var carMesh = self._objectLoader.carMesh.clone();
                    self._car.vehicleSetup.vehicleBody.attatchMesh(carMesh);
                    self._groundObjects.tree.attachTreeMesh(self._objectLoader.treeMesh);
                    self._objectLoader.springMesh.position.set(0, 0.5, 0);
                    //self._objectLoader.springMesh.rotateX(Math.PI/2);
                    self._objectLoader.springMesh.scale.set(0.4, 0.4, 0.4);
                    for (var i = 0; i < self._car.vehicleSetup.springConnector.length; i++) {
                        self._car.vehicleSetup.springConnector[i].attatchSpringMesh(self._objectLoader.springMesh.clone(), self._objectLoader.springConnectorMesh.clone());
                    }
                }
            };
            this._objectLoader.load(objectsLoaderListener);
        }
        this._renderer.camera.position.set(0, 60, 0);
        this._renderer.camera.lookAt(this._car.vehicleModel.object.position);
        this._stats = new Stats();
        if (CarSimulator.developer_mode) {
            this._stats.setMode(0); // 0: fps, 1: ms, 2: mb
            this._stats.domElement.style.position = 'absolute';
            this._stats.domElement.style.left = '20px';
            this._stats.domElement.style.top = '20px';
            document.body.appendChild(this._stats.domElement);
        }
        this.update();
        this.twoHertzUpdate();
        this.thirtyHertzUpdate();
    };
    CarSimulator.prototype.update = function () {
        var _this = this;
        this._stats.begin();
        if (this._isStarted) {
            this._car.update(this._time, this._delta);
            if (!CarSimulator.developer_mode) {
                this._groundPlanes.update(this._car.vehicleModel.object.position);
                this._groundObjects.update(this._car.vehicleModel.object.position, this._time, this._delta);
                this._particleSystem.update(this._car.vehicleModel.object.position.clone().add(this._car.vehicleSetup.wheels[2].relativePosition), this._clock.getElapsedTime(), this._delta);
                this._particleSystem2.update(this._car.vehicleModel.object.position.clone().add(this._car.vehicleSetup.wheels[3].relativePosition), this._clock.getElapsedTime(), this._delta);
            }
        }
        this._renderer.render();
        this._stats.end();
        requestAnimationFrame(function () { return _this.update(); });
    };
    CarSimulator.prototype.twoHertzUpdate = function () {
        if (this._isStarted) {
            this._groundObjects.slowUpdate(this._car.vehicleModel.object.position);
        }
        var self = this;
        setTimeout(function () { return self.twoHertzUpdate(); }, 500);
    };
    CarSimulator.prototype.thirtyHertzUpdate = function () {
        this._socket.update(this._car);
        var self = this;
        setTimeout(function () { return self.thirtyHertzUpdate(); }, 33);
    };
    CarSimulator.prototype.handleJqueryEvents = function () {
        var self = this;
        $.get("style/connection_start.html", function (data) {
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
                                        $("#" + self._socket.connectionId).html(self._socket.name);
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
                        self._socket.isServer = true;
                        $.get("style/connect_to_server.html", function (data) {
                            $.get("style/connection_server.html", function (data) {
                                $("#connection_box").html(data);
                                $("#connection_id").html("Your ID: " + self._socket.connectionId);
                                $.get("style/client_list.html", function (data) {
                                    $("#connection_box").append(data);
                                    $.get("style/connection_client.html", function (data) {
                                        $("#clientList").append(data);
                                        $("#client").attr("id", self._socket.connectionId);
                                        $("#" + self._socket.connectionId).html(self._socket.name);
                                    });
                                });
                                self._isStarted = true;
                            });
                        });
                    });
                });
            });
        });
    };
    CarSimulator.prototype.isTouchDevice = function () {
        return !!('ontouchstart' in window);
    };
    Object.defineProperty(CarSimulator.prototype, "renderer", {
        get: function () {
            return this._renderer;
        },
        set: function (value) {
            this._renderer = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarSimulator.prototype, "collisionScene", {
        get: function () {
            return this._collisionScene;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarSimulator.prototype, "clock", {
        get: function () {
            return this._clock;
        },
        set: function (value) {
            this._clock = value;
        },
        enumerable: true,
        configurable: true
    });
    CarSimulator.ground_width = 200;
    CarSimulator.developer_mode = false;
    CarSimulator.is_touch_device = false;
    return CarSimulator;
})();
window.onload = function () {
    var app = new CarSimulator();
    app.start();
};
//# sourceMappingURL=carsimulator.js.map