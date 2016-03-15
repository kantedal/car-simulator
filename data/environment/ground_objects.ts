/**
 * Created by filles-dator on 2016-03-11.
 */

///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./../ground_plane.ts"/>
///<reference path="./grass.ts"/>
///<reference path="./cloud.ts"/>
///<reference path="./tree.ts"/>
///<reference path="./flower.ts"/>


class GroundObjects {
    private _renderer: Renderer;
    private _groundPlanes: GroundPlane;
    private _grassParticles: Grass;
    private _flowerParticles: Flower;
    private _cloud: Cloud;
    private _tree: Tree;


    constructor(renderer: Renderer, ground_planes : GroundPlane){
        this._renderer = renderer;
        this._groundPlanes = ground_planes;

        this._grassParticles = new Grass(this._renderer, this._groundPlanes);
        this._flowerParticles = new Flower(this._renderer, this._groundPlanes);
        this._cloud = new Cloud(this._renderer);
        this._tree = new Tree(this._renderer, this._groundPlanes);
    }

    public update(car_pos: THREE.Vector3){
        this._grassParticles.update(car_pos);
        this._flowerParticles.update(car_pos);
        this._cloud.update(car_pos);
        this._tree.update(car_pos);
    }

    get tree():Tree {
        return this._tree;
    }
}