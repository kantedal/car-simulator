/**
 * Created by filles-dator on 2016-03-12.
 */

///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="./../parts/spring.ts"/>


class Bushes {
    private _renderer: Renderer;
    private _bushes: Bush[];
    private _springs: Spring[];

    private _bushCount = 80;

    constructor(renderer: Renderer){
        this._renderer = renderer;
        this._bushes = [];

        var texture = new THREE.TextureLoader().load( "texture/bush.png" )
        var material = new THREE.MeshBasicMaterial( {
            map: texture,
            alphaTest: 0.9,
            side: THREE.DoubleSide
        });

        for(var i=0; i<this._bushCount; i++){
            var angle = -Math.random()*Math.PI*2;
            var length = Math.sqrt(Math.random())*200;

            var x_val = Math.cos(angle)*length;
            var z_val = Math.sin(angle)*length;
            var y_val = GroundPlane.simplexNoise(new THREE.Vector3(x_val,0,z_val));

            var bush = new Bush(material);
            bush.group.position.set(x_val, y_val, z_val);
            renderer.scene.add(bush.group);

            this._bushes.push(bush);
        }
    }

    public update(current_pos: THREE.Vector3, time:number, delta:number){
        for(var i=0; i<this._bushCount; i++){
            var distance = current_pos.distanceTo(this._bushes[i].group.position);
            if(distance > 200){
                var angle = -Math.random()*Math.PI*2;
                var length = Math.sqrt(Math.random())*200;

                var x_val = current_pos.x + Math.cos(angle)*length;
                var z_val = current_pos.z + Math.sin(angle)*length;
                var y_val = GroundPlane.simplexNoise(new THREE.Vector3(x_val,0,z_val));

                this._bushes[i].group.position.set(x_val, y_val, z_val);
            }
            else if(distance < 6)
                this._bushes[i].applyImpluse(new THREE.Vector3(-1,0,0));

            if(this._bushes[i].isSimulating)
                this._bushes[i].update(time, delta);
        }
    }
}

class Bush {
    private _spring: Spring;
    private _group: THREE.Group;
    private _isSimulating = false;

    private _angularVelocity: THREE.Vector3;
    private _rotation: THREE.Vector3;
    private _position: THREE.Vector3;

    constructor(material: THREE.Material){
        this._group = new THREE.Group();
        //this._mesh = [];
        for(var i=0; i<4; i++){
            var mesh = new THREE.Mesh(new THREE.PlaneGeometry( 8, 8, 1, 1 ), material);
            mesh.geometry.translate(0,3,0);
            mesh.geometry.rotateY(Math.random()*2*Math.PI);
            //this._mesh.push(mesh);
            this._group.add(mesh);
        }

        this._spring = new Spring();
        this._angularVelocity = new THREE.Vector3(0,0,0);
        this._rotation = new THREE.Vector3(0,0,0);
        this._position = new THREE.Vector3(0,0,0);
    }

    public update (time:number, delta:number){
        //console.log(this._rotation);
        this._spring.update(time,delta,this._position,this._rotation);
        this._angularVelocity = this._spring.angularSpringVelocity;
        this._rotation.add(this._angularVelocity.clone().multiplyScalar(delta));
        this._group.rotation.set(this._rotation.x,0,0);

        if(this._angularVelocity.length() < 0.001){
            this._isSimulating = false;
        }
    }

    public applyImpluse(velocity: THREE.Vector3){
        this._isSimulating = true;
        this._spring.angularSpringVelocity.add(velocity);
    }

    get spring():Spring {
        return this._spring;
    }
    get group():THREE.Group {
        return this._group;
    }
    get angularVelocity():THREE.Vector3 {
        return this._angularVelocity;
    }
    get isSimulating():boolean {
        return this._isSimulating;
    }
}