
///<reference path="../../threejs/three.d.ts"/>
///<reference path="Particle.ts"/>
///<reference path="Particle2.ts"/>

///<reference path="../../renderer.ts"/>
///<reference path="../../data/vehicle.ts"/>

import Clock = THREE.Clock;
import Vector3 = THREE.Vector3;
class ParticleSystem {
    private _renderer: Renderer;

    private ParticleArray : Particle[];
    private ParticleArray2 : Particle2[];

    particleSprite : any;
    particleSprite2 : any;
    texture : any;
    texture2 : any;
    material : any;
    material2 : any;

    constructor(renderer: Renderer, texture){
        this._renderer = renderer;
        this.ParticleArray = [];
        this.ParticleArray2 = [];
    }

    public loadTexture(){
        this.texture = new THREE.TextureLoader().load( "./texture/sand.png" );
        this.material = new THREE.SpriteMaterial(  {map:this.texture, transparent: false, fog: false, rotation: Math.random()*Math.PI*2, opacity: Math.random() } );

        this.texture2 = new THREE.TextureLoader().load( "./texture/smoke2.png" );
        this.material2 = new THREE.SpriteMaterial( { map:this.texture2 } );
    }

    public generateParticles(startPos : THREE.Vector3, time : number) {
        for (var i = 0; i < Math.floor((Math.random() * 5) + 1); i++) {
            this.particleSprite = new THREE.Sprite(this.material);

            var rand = Math.random() * 3;
            this.particleSprite.scale.set(rand, rand, rand);
            this.ParticleArray.push(new Particle(startPos, this._renderer, time, this.particleSprite));
        }

        for (var i = 0; i < Math.floor(Math.random() * 5 + 1); i++) {
            this.particleSprite2 = new THREE.Sprite(this.material2);

            this.particleSprite2.scale.set(0.1, 0.1, 0.1);
            this.ParticleArray2.push(new Particle2(startPos, this._renderer, time, this.particleSprite2));
        }
    }

    public simulateParticles(startPos : THREE.Vector3, time : number){
        for(var i = 0; i < this.ParticleArray.length; i++) {
            if (this.ParticleArray[i]) {
                this.ParticleArray[i].update(time, startPos);

                if(this.ParticleArray[i].ParticleDead)
                    this.ParticleArray.splice(i,1);
            }
        }

        for(var i = 0; i < this.ParticleArray2.length; i++) {
            if (this.ParticleArray2[i]) {
                this.ParticleArray2[i].update(time, startPos);

                if(this.ParticleArray2[i].ParticleDead)
                    this.ParticleArray2.splice(i,1);
            }
        }
    }

    update(pos : THREE.Vector3, time : number, acc : boolean)
    {
        if(acc)
            this.generateParticles(pos, time);

        this.simulateParticles(pos, time);

    }


}








