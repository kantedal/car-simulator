/**
 * Created by filles-dator on 2016-03-11.
 */
/// <reference path="../../math/peerjs.d.ts" />
/// <reference path="../../math/RTCPeerConnection.d.ts" />
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>
///<reference path="../environment/object_loader.ts"/>
/// <reference path="../../math/jquery.d.ts" />
/// <reference path="./connected_vehicle.ts" />

class Socket {
    private _renderer : Renderer;
    private _peer : PeerJs.Peer;
    private _connection : any;
    private _connections : any;
    private _objectLoader: ObjectLoader;

    private _connectedVehicles : ConnectedVehicle[];
    private _isConnected: boolean;
    private _isServer: boolean;
    private _connectionId: string;
    private _name: string;
    private _carColor: string;

    constructor(renderer:Renderer, objectLoader:ObjectLoader){
        this._renderer = renderer;
        this._objectLoader = objectLoader;
        this._connectedVehicles = [];

        this._connections = [];
        this._isConnected = false;
        this._isServer = false;

        var self = this;
        this._peer = new Peer({
            key: 'qyykahhwaql7hkt9'
        });

        this._peer.on('open', function(id) {
            self._connectionId = id;
            console.log('My peer ID is: ' + self._connectionId);
        });

        this._peer.on("connection", function(conn) {
            self._isConnected = true;
            self._connections.push(conn);

            conn.on('data', function(data) {
                self.recievedData(data);
            });
        });


        this._peer.on('data', function(data) {
            console.log("data");
        });

    }

    public connectToPeer(id){
        this._connection = this._peer.connect(id);

        var self = this;
        this._connection.on('open', function() {
            self._isConnected = true;

            // Receive messages
            self._connection.on('data', function(data) {
                self.recievedData(data);
            });

            // Send messages
            self._connection.send('Hello!');
        });
    }

    public update(vehicle:Vehicle){
        if(this._isConnected){
            var pos = vehicle.vehicleModel.object.position;
            var rot = vehicle.vehicleModel.object.rotation;

            var rel_pos = vehicle.vehicleSetup.vehicleBody.object.position;
            var rel_rot = vehicle.vehicleSetup.vehicleBody.object.rotation;

            if(this.isServer) {
                for(var c=0; c<this._connections.length; c++) {
                    for (var i = 0; i < this._connectedVehicles.length; i++) {
                        this._connections[c].send({
                            car_data: {
                                car_id: this._connectedVehicles[i].id,
                                car_name: this._connectedVehicles[i].name,
                                car_color: this._connectedVehicles[i].color,
                                x: this._connectedVehicles[i].cardata.x,
                                y: this._connectedVehicles[i].cardata.y,
                                z: this._connectedVehicles[i].cardata.z,
                                rx: this._connectedVehicles[i].cardata.rx,
                                ry: this._connectedVehicles[i].cardata.ry,
                                rz: this._connectedVehicles[i].cardata.rz,
                                rel_y: this._connectedVehicles[i].cardata.rel_y,
                                rel_rx: this._connectedVehicles[i].cardata.rel_rx,
                                rel_ry: this._connectedVehicles[i].cardata.rel_ry,
                                rel_rz: this._connectedVehicles[i].cardata.rel_rz,
                            }
                        });
                    }

                    this._connections[c].send({
                        car_data: {
                            car_id: this._connectionId,
                            car_name: this._name,
                            car_color: this._carColor,
                            x: pos.x,
                            y: pos.y,
                            z: pos.z,
                            rx: rot.x,
                            ry: rot.y,
                            rz: rot.z,
                            rel_y: rel_pos.y,
                            rel_rx: rel_rot.x,
                            rel_ry: rel_rot.y,
                            rel_rz: rel_rot.z,
                        }
                    });
                }
            }else{
                this._connection.send({
                    car_data: {
                        car_id: this._connectionId,
                        car_name: this._name,
                        car_color: this._carColor,
                        x: pos.x,
                        y: pos.y,
                        z: pos.z,
                        rx: rot.x,
                        ry: rot.y,
                        rz: rot.z,
                        rel_y: rel_pos.y,
                        rel_rx: rel_rot.x,
                        rel_ry: rel_rot.y,
                        rel_rz: rel_rot.z,
                    }
                });
            }
        }
    }

    private recievedData(data){
        if(data.car_data.car_id != this._connectionId) {
            var new_car = true;
            for (var i = 0; i < this._connectedVehicles.length; i++) {
                if (data.car_data.car_id == this._connectedVehicles[i].id && data.car_data.car_id != this._connectionId) {
                    this._connectedVehicles[i].setFromNetworkData(data);
                    new_car = false;
                    break;
                }
            }
            if (new_car)
                this.newVehicle(data);
        }
    }

    private newVehicle(cardata){
        console.log("new vehicle " + this._connectedVehicles.length + " " +  cardata.car_data.car_name);
        this._connectedVehicles.push(
            new ConnectedVehicle(cardata.car_data.car_id, cardata.car_data.car_name, cardata.car_data.car_color, this._renderer, this._objectLoader)
        );

        $.get("style/connection_client.html", function (data) {
            $("#clientList").append(data);
            $("#client").attr("id", cardata.car_data.car_id);
            $("#"+cardata.car_data.car_id).html(cardata.car_data.car_name);
        });
    }

    get connectionId():string {
        return this._connectionId;
    }
    get carColor():string {
        return this._carColor;
    }
    set carColor(value:string) {
        this._carColor = value;
    }
    get name():string {
        return this._name;
    }
    set name(value:string) {
        this._name = value;
    }
    get isServer():boolean {
        return this._isServer;
    }
    set isServer(value:boolean) {
        this._isServer = value;
    }
}