///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>

import Vector3 = THREE.Vector3;
class PhysicsObject3d {
    private _object : THREE.Mesh;
    private _geometry : THREE.Geometry;
    private _material : THREE.Material;

    private _velocity : THREE.Vector3;
    private _acceleration : THREE.Vector3;

    private _position : THREE.Vector3;
    private _desiredDirection : THREE.Vector3;
    private _normalDirection : THREE.Vector3;
    private _gradientDirection : THREE.Vector3;
    private _realDirection : THREE.Vector3;
    private _moveDirection : THREE.Vector3;

    private _normalArrow : THREE.ArrowHelper;
    private _gradientArrow : THREE.ArrowHelper;
    private _directionArrow : THREE.ArrowHelper;
    private _realArrow : THREE.ArrowHelper;

    private _vert1 : THREE.Mesh;
    private _vert2 : THREE.Mesh;
    private _vert3 : THREE.Mesh;
    private realPos : THREE.Mesh;

    private _hasCollisionSurface : boolean = false;
    private _isColliding : boolean = false;
    private _collisionRadius : number = 0;
    private _collisionPosition : THREE.Vector3;
    private _collisionSurface : THREE.Geometry;

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);
        this._object.position.y = -1;

        this._velocity = new THREE.Vector3(0,0,0);
        this._acceleration = new THREE.Vector3(0,0,0);

        this._position = new THREE.Vector3(0,0,0);
        this._collisionPosition = new THREE.Vector3(0,0,0);
        this._desiredDirection = new THREE.Vector3(1,0,0);
        this._normalDirection = new THREE.Vector3(0,0,0);
        this._gradientDirection = new THREE.Vector3(0,0,0);
        this._realDirection = new THREE.Vector3(0,0,0);
        this._moveDirection = new THREE.Vector3(0,0,0);

        var dir = new THREE.Vector3( 0, 1, 0 );
        var origin = new THREE.Vector3( 0, 0, 0 );
        var length = 10;

        this._normalArrow = new THREE.ArrowHelper( dir, origin, length, 0xff0000 );
        this._directionArrow = new THREE.ArrowHelper( dir, origin, length, 0x00ff00 );
        this._gradientArrow = new THREE.ArrowHelper( dir, origin, length, 0xff00ff );
        this._realArrow = new THREE.ArrowHelper( dir, origin, length, 0x0000ff );

        renderer.scene.add( this._normalArrow );
        renderer.scene.add( this._gradientArrow );
        renderer.scene.add( this._directionArrow );
        renderer.scene.add( this._realArrow );

        this._vert1 = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._vert2 = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._vert3 = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this.realPos = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true}));

        renderer.scene.add( this._vert1 );
        renderer.scene.add( this._vert2 );
        renderer.scene.add( this._vert3 );
        renderer.scene.add( this.realPos );
    }

    public update(time:number, delta:number):void {
        if(this._hasCollisionSurface){
            var faceIndex = 0;
            for (var i = 0; i < this._collisionSurface.faces.length; i++) {
                var collisionPos : THREE.Vector3 = new THREE.Vector3(
                    this._position.x-this._collisionRadius*this.normalDirection.x,
                    this._position.y-this._collisionRadius*this.normalDirection.y,
                    this._position.z-this._collisionRadius*this.normalDirection.z
                );
                this.realPos.position.set(collisionPos.x, collisionPos.y, collisionPos.z);
                if(this.pointInTriangle(
                        this._position,
                        this._collisionSurface.vertices[this._collisionSurface.faces[i].a],
                        this._collisionSurface.vertices[this._collisionSurface.faces[i].b],
                        this._collisionSurface.vertices[this._collisionSurface.faces[i].c])
                ){
                    //this._collisionPosition = collisionPos;
                    faceIndex = i;
                    var vert1 : THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].a];
                    var vert2 : THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].b];
                    var vert3 : THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].c];
                    var vertexNormals = this._collisionSurface.faces[faceIndex].vertexNormals;

                    var areaT = this.triangleArea(vert1, vert2, vert3);
                    var areaB = this.triangleArea(vert1, this._position, vert3);
                    var areaC = this.triangleArea(vert1, this._position, vert2);
                    var areaA = areaT-areaB-areaC;

                    var c1 = areaA/areaT;
                    var c2 = areaB/areaT;
                    var c3 = areaC/areaT;

                    this._normalDirection = new THREE.Vector3(
                        vertexNormals[0].x*c1 + vertexNormals[1].x*c2 + vertexNormals[2].x*c3,
                        vertexNormals[0].y*c1 + vertexNormals[1].y*c2 + vertexNormals[2].y*c3,
                        vertexNormals[0].z*c1 + vertexNormals[1].z*c2 + vertexNormals[2].z*c3
                    );

                    break;
                }
            }

            //this._normalDirection = this._collisionSurface.faces[faceIndex].normal;
            this._normalDirection.normalize();



            this._gradientDirection.set(0,-1,0);
            this._gradientDirection.projectOnPlane(this._normalDirection);
            if(this._gradientDirection.length() < 0.01)
                this._gradientDirection.set(0,0,0);
            else
                this._gradientDirection.normalize();

            this._realDirection.set(this._desiredDirection.x, this._desiredDirection.y, this._desiredDirection.z);
            this._realDirection.projectOnPlane(this._normalDirection);
            this._realDirection.normalize();

            this._object.position.set(this._position.x+1*this.normalDirection.x, this._position.y+2*this.normalDirection.y, this._position.z+2*this.normalDirection.z);
            //this._object.position.set(this._position.x, this._position.y, this._position.z);

            this._realArrow.position.set(this._position.x, this._position.y, this._position.z);
            this._realArrow.setDirection(this._realDirection);

            this._normalArrow.position.set(this._position.x, this._position.y, this._position.z)
            this._normalArrow.setDirection(this._normalDirection);

            this._gradientArrow.position.set(this._position.x, this._position.y, this._position.z)
            this._gradientArrow.setDirection(this._gradientDirection);
            this._gradientArrow.setLength(this._gradientDirection.length()*10);

            this._directionArrow.position.set(this._position.x, this._position.y, this._position.z)
            this._directionArrow.setDirection(this._desiredDirection);

            this._vert1.position.set(vert1.x, vert1.y, vert1.z);
            this._vert2.position.set(vert2.x, vert2.y, vert2.z);
            this._vert3.position.set(vert3.x, vert3.y, vert3.z);

            if(this.checkCollision(vert1, vert2, vert3)){
                this._isColliding = true;
            }else{
                this._isColliding = false;
            }
        }
    }



    public updateVelocity(newVelocity:THREE.Vector3):void {
        //this._acceleration = this._velocity - this._velocity;
        this._velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);
    }


    public connectCollisionSurface(surface : THREE.Geometry):void {
        this._collisionSurface = surface;
        this._hasCollisionSurface = true;
    }

    private checkCollision(vert1:THREE.Vector3, vert2:THREE.Vector3, vert3:THREE.Vector3) : boolean{
        var vert1_dist: number = Math.sqrt( Math.pow(vert1.x-this._position.x, 2) + Math.pow(vert1.z-this._position.z, 2) );
        var vert2_dist: number = Math.sqrt( Math.pow(vert2.x-this._position.x, 2) + Math.pow(vert2.z-this._position.z, 2) );
        var vert3_dist: number = Math.sqrt( Math.pow(vert3.x-this._position.x, 2) + Math.pow(vert3.z-this._position.z, 2) );
        var tot_distance: number = vert1_dist + vert2_dist + vert3_dist;

        var height = (vert1.y*vert1_dist + vert2.y*vert2_dist + vert3.y*vert3_dist)/tot_distance;

        if(this._position.y <= height+0.1) {
            if (this._position.y <= height - 0.1)
                this._position.y = height;
            return true;
        }else
            return false;
    }

    public showAxis():void {

    }


    private triangleArea(A:THREE.Vector3, B:THREE.Vector3, C:THREE.Vector3):number {
        var a = Math.sqrt(Math.pow(A.x-B.x,2) + Math.pow(A.y-B.y,2) + Math.pow(A.z-B.z,2));
        var b = Math.sqrt(Math.pow(A.x-C.x,2) + Math.pow(A.y-C.y,2) + Math.pow(A.z-C.z,2));
        var c = Math.sqrt(Math.pow(B.x-C.x,2) + Math.pow(B.y-C.y,2) + Math.pow(B.z-C.z,2));

        var s =(1/2)*(a+b+c);

        return Math.sqrt(s*(s-a)*(s-b)*(s-c))
    }


    private sign(p1:THREE.Vector3, p2:THREE.Vector3, p3:THREE.Vector3) : number {
        return (p1.x - p3.x) * (p2.z - p3.z) - (p2.x - p3.x) * (p1.z - p3.z);
    }

    private pointInTriangle(pt:THREE.Vector3, v1:THREE.Vector3, v2:THREE.Vector3, v3:THREE.Vector3) : boolean {
        var b1, b2, b3;

        b1 = this.sign(pt, v1, v2) < 0.0;
        b2 = this.sign(pt, v2, v3) < 0.0;
        b3 = this.sign(pt, v3, v1) < 0.0;

        return ((b1 == b2) && (b2 == b3));
    }

    get object():THREE.Mesh {
        return this._object;
    }

    set object(value:THREE.Mesh) {
        this._object = value;
    }
    get geometry():THREE.Geometry {
        return this._geometry;
    }

    set geometry(value:THREE.Geometry) {
        this._geometry = value;
    }
    get material():THREE.Material {
        return this._material;
    }

    set material(value:THREE.Material) {
        this._material = value;
    }

    get collisionSurface():THREE.Mesh {
        return this._collisionSurface;
    }

    set collisionSurface(value:THREE.Mesh) {
        this._collisionSurface = value;
    }

    get position():THREE.Vector3 {
        return this._position;
    }

    set position(value:THREE.Vector3) {
        this._position = value;
    }

    get desiredDirection():THREE.Vector3 {
        return this._desiredDirection;
    }

    set desiredDirection(value:THREE.Vector3) {
        this._desiredDirection = value;
    }

    get normalDirection():THREE.Vector3 {
        return this._normalDirection;
    }

    set normalDirection(value:THREE.Vector3) {
        this._normalDirection = value;
    }

    get velocity():THREE.Vector3 {
        return this._velocity;
    }

    set velocity(value:THREE.Vector3) {
        this._velocity = value;
    }

    get realDirection():THREE.Vector3 {
        return this._realDirection;
    }

    set realDirection(value:THREE.Vector3) {
        this._realDirection = value;
    }

    get collisionRadius():number {
        return this._collisionRadius;
    }

    set collisionRadius(value:number) {
        this._collisionRadius = value;
    }

    get hasCollisionSurface():boolean {
        return this._hasCollisionSurface;
    }

    set hasCollisionSurface(value:boolean) {
        this._hasCollisionSurface = value;
    }

    get gradientDirection():THREE.Vector3 {
        return this._gradientDirection;
    }

    set gradientDirection(value:THREE.Vector3) {
        this._gradientDirection = value;
    }
}