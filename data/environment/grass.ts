/**
 * Created by filles-dator on 2016-03-12.
 */

///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./../ground_plane.ts"/>


class Grass {
    private _renderer: Renderer;
    private _groundPlanes: GroundPlane;
    private _particleSystem: THREE.Points;
    private _particles: THREE.Geometry;
    private _particleMaterial: THREE.PointsMaterial;
    private _particleCount = 7000;

    constructor(renderer: Renderer, groundPlanes: GroundPlane){
        this._renderer = renderer;
        this._groundPlanes = groundPlanes;

        this._particles = new THREE.Geometry();

        var texture = new THREE.TextureLoader().load( "texture/grass.png" );
        var texture_alpha = new THREE.TextureLoader().load( "texture/grass_alpha.png" );
        this._particleMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 5,
            map: texture,
            transparent: true,
            depthWrite: false
        });

        for(var p=0; p<this._particleCount; p++){
            var angle = Math.random()*2*Math.PI;
            var length = Math.sqrt(Math.random())*200;

            var x_val = Math.cos(angle)*length;
            var z_val = Math.sin(angle)*length;
            var y_val = this._groundPlanes.simplexNoise(new THREE.Vector3(x_val,0,z_val));

            var particle = new THREE.Vector3(x_val, y_val, z_val);
            this._particles.vertices.push(particle);
        }

        this._particleSystem = new THREE.Points(this._particles, this._particleMaterial);
        this._renderer.scene.add(this._particleSystem);
    }

    public update(current_pos: THREE.Vector3){
        this._particleSystem.geometry.verticesNeedUpdate=true;
        for(var p=0; p<this._particleCount; p++){
            if(current_pos.distanceTo(this._particleSystem.geometry.vertices[p]) > 200){
                var angle = Math.random()*2*Math.PI;
                var length = 50+Math.sqrt(Math.random())*150;

                var x_val = current_pos.x + Math.cos(angle)*length;
                var z_val = current_pos.z + Math.sin(angle)*length;
                var y_val = this._groundPlanes.simplexNoise(new THREE.Vector3(x_val,0,z_val));

                this._particleSystem.geometry.vertices[p].set(x_val, y_val, z_val);
            }
        }
        this._particles.boundingSphere.radius = 10000;
    }

}