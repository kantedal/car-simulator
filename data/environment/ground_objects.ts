/**
 * Created by filles-dator on 2016-03-11.
 */

///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./../ground_plane.ts"/>
///<reference path="./../vehicle.ts"/>
///<reference path="./grass.ts"/>
///<reference path="./cloud.ts"/>
///<reference path="./tree.ts"/>
///<reference path="./flower.ts"/>
///<reference path="./bush.ts"/>


class GroundObjects {
    private _renderer: Renderer;
    private _vehicle: Vehicle;
    private _groundPlanes: GroundPlane;
    private _grassParticles: Grass;
    private _flowerParticles: Flower;
    private _cloud: Cloud;
    private _tree: Tree;
    private _bushes: Bushes;


    constructor(renderer: Renderer, ground_planes : GroundPlane, vehicle: Vehicle){
        this._renderer = renderer;
        this._groundPlanes = ground_planes;
        this._vehicle = vehicle;

        this._grassParticles = new Grass(this._renderer, this._groundPlanes);
        this._flowerParticles = new Flower(this._renderer, this._groundPlanes);
        this._cloud = new Cloud(this._renderer);
        this._tree = new Tree(this._renderer, this._groundPlanes);
        this._bushes = new Bushes(this._renderer);
    }

    public update(car_pos: THREE.Vector3, time:number, delta:number){
        this._bushes.update(car_pos, time, delta);
    }

    public slowUpdate(car_pos: THREE.Vector3){
        this._grassParticles.update(car_pos, this._vehicle.vehicleModel.localZDirection);
        this._flowerParticles.update(car_pos);
        this._cloud.update(car_pos);
        this._tree.update(car_pos);
    }

    get tree():Tree {
        return this._tree;
    }
}