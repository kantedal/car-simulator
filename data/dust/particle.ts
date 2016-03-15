/**
 * Created by DJ on 2016-02-09.
 */

///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>

class Particle {
    private _particleSprite : THREE.Sprite;
    private _renderer : Renderer;
    private _position : THREE.Vector3;
    private _velocity : THREE.Vector3;
    private _acceleration : THREE.Vector3;
    private _angularVelocity : number;
    private _lifeLength : number = 0.5;

    private _startTime : number;
    private _isDead : boolean;

    constructor(startPos: THREE.Vector3, startVel: THREE.Vector3, renderer: Renderer, time: number, particleSprite: THREE.Sprite){
        this._startTime = time;
        this._position = startPos.clone();
        this._velocity = startVel.clone();
        this._acceleration = new THREE.Vector3(0,-9.82,0);
        this._angularVelocity = Math.random()*5-2.5;

        this._particleSprite = particleSprite;

        this._renderer = renderer;
        this._renderer.scene.add(this._particleSprite);
    }

    public update(time: number, delta: number) {
        var currentTime = (time-this._startTime);
        if(currentTime > this._lifeLength)
        {
            this._isDead = true;
            this._particleSprite.material.dispose();
            this._particleSprite.geometry.dispose();
            this._renderer.scene.remove(this._particleSprite);
        }

        this._velocity.add(this._acceleration.clone().multiplyScalar(delta));
        this._position.add(this._velocity.clone().multiplyScalar(delta));

        this._particleSprite.position.copy(this._position);
        this._particleSprite.scale.addScalar(8*delta);
        this._particleSprite.material.opacity = Math.pow((this._lifeLength - currentTime)/this._lifeLength,3)*0.6;
        this._particleSprite.material.rotation += this._angularVelocity*delta;
    }

    get isParticleDead():boolean {
        return this._isDead;
    }
}

