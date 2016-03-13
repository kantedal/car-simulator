/**
 * Created by DJ on 2016-02-09.
 */

///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>

class Particle2 {
    private Pos : THREE.Vector3;
    private Vel : THREE.Vector3;
    private lifeLength : number = 1.25;
    private startPos : THREE.Vector3;
    private vy : number;

    private renderer : Renderer;

    private startTime : number;
    private isDead : boolean;

    private angle : number = Math.PI/2;
    private v0 : number = 10;

    particleSprite : THREE.Sprite;


    constructor(startPos : THREE.Vector3, renderer : Renderer, time : number, particleSprite){
        this.startTime = time;
        var startPos = startPos.clone();
        this.startPos = new THREE.Vector3(startPos.x + Math.random() * 2 - 1, startPos.y, startPos.z + Math.random() * 2 - 1);
        this.Pos = new THREE.Vector3();



        this.particleSprite = particleSprite;

        this.renderer = renderer;
        this.renderer.scene.add(this.particleSprite);

    }

    public update(time: number, wheelPos : THREE.Vector3) {

        var currentTime = (time-this.startTime);

        if(currentTime > this.lifeLength)
        {
            this.isDead = true;
            this.particleSprite.material.dispose();
            this.particleSprite.geometry.dispose();
            this.renderer.scene.remove(this.particleSprite);
        }


        this.Pos.x = this.startPos.x + (Math.cos(this.angle)*this.v0)*currentTime;

        this.Pos.y = this.startPos.y + (Math.sin(this.angle)*this.v0)*currentTime-0.3*Math.pow(currentTime, 2);

        this.particleSprite.scale.set(currentTime*10,currentTime*10,currentTime*10);
        this.particleSprite.material.opacity = (this.lifeLength-currentTime)/5.5;

        //Vit fyrkant för spriten syns annars
        if(currentTime > 0.001)
            this.particleSprite.position.set(this.Pos.x, this.Pos.y, this.startPos.z);
        else
            this.particleSprite.position.set(this.Pos.x, this.Pos.y-20, this.startPos.z);


    }



    get ParticleDead():boolean {
        if(this.isDead)
            return true;
        else
            return false
    }



}

