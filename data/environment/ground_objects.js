/**
 * Created by filles-dator on 2016-03-11.
 */
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="./../vehicle.ts"/>
///<reference path="./grass.ts"/>
///<reference path="./cloud.ts"/>
///<reference path="./tree.ts"/>
///<reference path="./flower.ts"/>
///<reference path="./bush.ts"/>
var GroundObjects = (function () {
    function GroundObjects(renderer, ground_planes, vehicle) {
        this._renderer = renderer;
        this._groundPlanes = ground_planes;
        this._vehicle = vehicle;
        this._grassParticles = new Grass(this._renderer, this._groundPlanes);
        this._flowerParticles = new Flower(this._renderer, this._groundPlanes);
        this._cloud = new Cloud(this._renderer);
        this._tree = new Tree(this._renderer, this._groundPlanes);
        this._bushes = new Bushes(this._renderer);
    }
    GroundObjects.prototype.update = function (car_pos, time, delta) {
        this._bushes.update(car_pos, time, delta);
    };
    GroundObjects.prototype.slowUpdate = function (car_pos) {
        this._grassParticles.update(car_pos, this._vehicle.vehicleModel.localZDirection);
        this._flowerParticles.update(car_pos);
        this._cloud.update(car_pos);
        this._tree.update(car_pos);
    };
    Object.defineProperty(GroundObjects.prototype, "tree", {
        get: function () {
            return this._tree;
        },
        enumerable: true,
        configurable: true
    });
    return GroundObjects;
}());
