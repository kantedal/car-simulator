/**
 * Created by filles-dator on 2016-03-11.
 */
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./../ground_plane.ts"/>
///<reference path="./grass.ts"/>
///<reference path="./cloud.ts"/>
var GroundObjects = (function () {
    function GroundObjects(renderer, ground_planes) {
        this._renderer = renderer;
        this._groundPlanes = ground_planes;
        this._grassParticles = new Grass(this._renderer, this._groundPlanes);
        this._cloud = new Cloud(this._renderer);
    }
    GroundObjects.prototype.update = function (car_pos) {
        this._grassParticles.update(car_pos);
        this._cloud.update(car_pos);
    };
    return GroundObjects;
})();
//# sourceMappingURL=ground_objects.js.map