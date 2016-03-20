/**
 * Created by filles-dator on 2016-03-19.
 */

///<reference path="../../../threejs/three.d.ts"/>
///<reference path="../../../renderer.ts"/>
///<reference path="./../connected_vehicle.ts"/>

class Race {
    private _renderer: Renderer;
    private _connectedVehicles: ConnectedVehicle[];

    constructor(renderer: Renderer, connectedVehicles: ConnectedVehicle[]){
        this._renderer = renderer;
        this._connectedVehicles = connectedVehicles;
    }
}
