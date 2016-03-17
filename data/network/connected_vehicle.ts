/**
 * Created by filles-dator on 2016-03-16.
 */

/// <reference path="../../math/peerjs.d.ts" />
/// <reference path="../../math/RTCPeerConnection.d.ts" />
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>
///<reference path="../environment/object_loader.ts"/>
/// <reference path="../../math/jquery.d.ts" />

class ConnectedVehicle {
    private _renderer: Renderer;
    private _vehicle: Vehicle;
    private _id: string;
    private _name: string;
    private _color: string;
    private _cardata: any;

    constructor(id: string, name: string, color: string, renderer: Renderer, objectloader: ObjectLoader){
        this._id = id;
        this._name = name
        this._color = color;
        this._renderer = renderer;

        this._cardata = {
            car_id: this._id,
            car_name: this._name,
            car_color: this._color,
            x: 0,
            y: 0,
            z: 0,
            rx: 0,
            ry: 0,
            rz: 0,
            rel_y: 0,
            rel_rx: 0,
            rel_ry: 0,
            rel_rz: 0
        };

        this._vehicle = new Vehicle(this._renderer);
        if(!CarSimulator.developer_mode) {
            this._vehicle.vehicleSetup.wheels[0].attatchMesh(objectloader.wheelMesh.clone());
            this._vehicle.vehicleSetup.wheels[1].attatchMesh(objectloader.wheelMesh.clone());
            this._vehicle.vehicleSetup.wheels[2].attatchMesh(objectloader.wheelMesh.clone());
            this._vehicle.vehicleSetup.wheels[3].attatchMesh(objectloader.wheelMesh.clone());

            var mesh = objectloader.carMesh.clone();
            var material = mesh.children[1].material.clone();
            material.color.b = 1;
            mesh.children[1].material = material;
            console.log(mesh);
            this._vehicle.vehicleSetup.vehicleBody.attatchMesh(mesh);
        }
    }

    public setFromNetworkData(data){
        this._cardata = data.car_data;

        this._vehicle.vehicleModel.object.position.set(
            data.car_data.x,
            data.car_data.y,
            data.car_data.z
        );

        this._vehicle.vehicleModel.object.rotation.set(
            data.car_data.rx,
            data.car_data.ry,
            data.car_data.rz
        );

        this._vehicle.vehicleSetup.vehicleBody.object.position.setY(data.car_data.rel_y);
        this._vehicle.vehicleSetup.vehicleBody.object.rotation.set(
            data.car_data.rel_rx,
            data.car_data.rel_ry,
            data.car_data.rel_rz
        );
    }

    get color():string {
        return this._color;
    }
    get name():string {
        return this._name;
    }
    get id():string {
        return this._id;
    }
    get vehicle():Vehicle {
        return this._vehicle;
    }
    get cardata():any {
        return this._cardata;
    }
}