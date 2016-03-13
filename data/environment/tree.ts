/**
 * Created by filles-dator on 2016-03-12.
 */

///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./../ground_plane.ts"/>


class Tree {
    private _renderer: Renderer;
    private _cloudMaterial1: THREE.SpriteMaterial;
    private _clouds: THREE.Sprite[];

    private _cloudCount = 75;

    constructor(renderer: Renderer){
        this._renderer = renderer;

        var map = new THREE.TextureLoader().load( "texture/cloud.png" );
        this._cloudMaterial1 = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true } );
        this._clouds = [];

        for(var c=0; c<this._cloudCount; c++){
            var angle = Math.random()*2*Math.PI;
            var length = Math.random()*500;
            var x_val = Math.cos(angle)*length;
            var z_val = Math.sin(angle)*length;
            var y_val = 30 + Math.random()*10;
            var scale = 120+Math.random()*10;

            var new_cloud = new THREE.Sprite(this._cloudMaterial1.clone());
            new_cloud.position.set(x_val, y_val, z_val);
            new_cloud.scale.set(scale,scale,scale);
            this._renderer.scene.add(new_cloud);
            this._clouds.push(new_cloud);
        }
    }

    public update(current_pos: THREE.Vector3){
        for(var c=0; c<this._cloudCount; c++){
            if(current_pos.distanceTo(this._clouds[c].position) > 500){
                var angle = Math.random()*2*Math.PI;
                var length = Math.random()*500;
                var x_val = current_pos.x + Math.cos(angle)*length;
                var z_val = current_pos.z + Math.sin(angle)*length;
                var y_val = 40 + Math.random()*10;

                this._clouds[c].material.opacity = 0;
                this._clouds[c].position.set(x_val, y_val, z_val);
            }
            if(this._clouds[c].material.opacity < 1){
                this._clouds[c].material.opacity += 0.01
            }
        }
    }

}