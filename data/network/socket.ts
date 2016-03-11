/**
 * Created by filles-dator on 2016-03-11.
 */
/// <reference path="../../math/peerjs.d.ts" />
/// <reference path="../../math/RTCPeerConnection.d.ts" />
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>

class Socket {
    private _renderer : Renderer;
    private _peer : PeerJs.Peer;
    private _connection : any;
    private _isConnected : boolean;
    private _connectedVehicles : Vehicle[];

    constructor(renderer:Renderer){
        this._renderer = renderer;
        this._isConnected = false;
        this._connectedVehicles = [];

        var self = this;
        this._peer = new Peer({
            key: 'qyykahhwaql7hkt9'
        });

        this._peer.on('open', function(id) {
            console.log('My peer ID is: ' + id);
        });

        this._peer.on("connection", function(conn) {
            self._isConnected = true;
            self._connection = conn;
            self._connectedVehicles.push(new Vehicle(self._renderer));

            self._connection.on('data', function(data) {
                self.recievedData(data);
            });

            // Send messages
            self._connection.send('Hello!');
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
            self._connectedVehicles.push(new Vehicle(self._renderer));

            // Receive messages
            self._connection.on('data', function(data) {
                self.recievedData(data);
            });

            // Send messages
            self._connection.send('Hello!');
        });
    }

    public update(vehicle:Vehicle){
        var pos = vehicle.vehicleModel.object.position;
        var rot = vehicle.vehicleModel.object.rotation;

        var wheel1 = vehicle.vehicleSetup.wheels[0].object.position.y;
        var wheel2 = vehicle.vehicleSetup.wheels[1].object.position.y;
        var wheel3 = vehicle.vehicleSetup.wheels[2].object.position.y;
        var wheel4 = vehicle.vehicleSetup.wheels[3].object.position.y;

        if(this._isConnected){
            this._connection.send({
                car_data: {
                    x: pos.x,
                    y: pos.y,
                    z: pos.z,
                    rx: rot.x,
                    ry: rot.y,
                    rz: rot.z,
                    w1: wheel1,
                    w2: wheel2,
                    w3: wheel3,
                    w4: wheel4,
                }
            });
        }
    }

    private recievedData(data){
        this._connectedVehicles[0].setFromNetworkData(data);
    }
}