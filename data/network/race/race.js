/**
 * Created by filles-dator on 2016-03-19.
 */
///<reference path="../../../threejs/three.d.ts"/>
///<reference path="../../../renderer.ts"/>
///<reference path="./../connected_vehicle.ts"/>
var Race = (function () {
    function Race(renderer, connectedVehicles) {
        this._renderer = renderer;
        this._connectedVehicles = connectedVehicles;
    }
    return Race;
})();
//# sourceMappingURL=race.js.map