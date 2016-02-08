///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>

import Vector3 = THREE.Vector3;
class PhysicsObject3d {
    private _renderer : Renderer;
    private _object : THREE.Mesh;
    private _geometry : THREE.Geometry;
    private _material : THREE.Material;

    private _velocity : THREE.Vector3;
    private _acceleration : THREE.Vector3;
    private _force : THREE.Vector3;

    private _position : THREE.Vector3;
    private _desiredDirection : THREE.Vector3;
    private _normalDirection : THREE.Vector3;
    private _realNormalDirection : THREE.Vector3;
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
    private _realPos : THREE.Mesh;

    private _hasCollisionSurface : boolean = false;
    private _isColliding : boolean = false;
    private _collisionRadius : number = 0;
    private _surfaceDistance : number = 0;
    private _collisionPosition : THREE.Vector3;
    private _collisionSurface : THREE.Geometry;

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        this._renderer = renderer;
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);
        this._object.position.y = -1;

        this._velocity = new THREE.Vector3(0,0,0);
        this._acceleration = new THREE.Vector3(0,0,0);
        this._force = new THREE.Vector3(0,0,0);

        this._position = new THREE.Vector3(0,0,0);
        this._collisionPosition = new THREE.Vector3(0,0,0);
        this._desiredDirection = new THREE.Vector3(1,0,0);
        this._normalDirection = new THREE.Vector3(0,1,0);
        this._realNormalDirection = new THREE.Vector3(0,0,0);
        this._gradientDirection = new THREE.Vector3(0,0,0);
        this._realDirection = new THREE.Vector3(0,0,1);
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
        this._realPos = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true}));

        this._renderer.scene.add( this._vert1 );
        this._renderer.scene.add( this._vert2 );
        this._renderer.scene.add( this._vert3 );
        this._renderer.scene.add( this._realPos );
    }

    public update(time:number, delta:number):void {
        if(this._hasCollisionSurface) {
            var faceIndex = 0;
            for (var i = 0; i < this._collisionSurface.faces.length; i++) {
                var collisionPos:THREE.Vector3 = new THREE.Vector3(
                    this._position.x - this._collisionRadius * this._realNormalDirection.x,
                    this._position.y - this._collisionRadius * this._realNormalDirection.y,
                    this._position.z - this._collisionRadius * this._realNormalDirection.z
                );
                this._realPos.position.set(collisionPos.x, collisionPos.y, collisionPos.z);
                if (this.pointInTriangle(
                        this._position,
                        this._collisionSurface.vertices[this._collisionSurface.faces[i].a],
                        this._collisionSurface.vertices[this._collisionSurface.faces[i].b],
                        this._collisionSurface.vertices[this._collisionSurface.faces[i].c])
                ) {
                    //this._collisionPosition = collisionPos;
                    faceIndex = i;
                    var vert1:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].a];
                    var vert2:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].b];
                    var vert3:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].c];
                    var vertexNormals = this._collisionSurface.faces[faceIndex].vertexNormals;

                    var areaT = this.triangleArea(vert1, vert2, vert3);
                    var areaB = this.triangleArea(vert1, this._position, vert3);
                    var areaC = this.triangleArea(vert1, this._position, vert2);
                    var areaA = areaT - areaB - areaC;

                    var c1 = areaA / areaT;
                    var c2 = areaB / areaT;
                    var c3 = areaC / areaT;

                    if (this.isColliding) {
                        this._normalDirection = new THREE.Vector3(
                            vertexNormals[0].x * c1 + vertexNormals[1].x * c2 + vertexNormals[2].x * c3,
                            vertexNormals[0].y * c1 + vertexNormals[1].y * c2 + vertexNormals[2].y * c3,
                            vertexNormals[0].z * c1 + vertexNormals[1].z * c2 + vertexNormals[2].z * c3
                        );

                        //Interpolate real normal direction to normal direction on landing
                        this._realNormalDirection.set(
                            this._normalDirection.x * 0.2 + this._realNormalDirection.x * 0.8,
                            this._normalDirection.y * 0.2 + this._realNormalDirection.y * 0.8,
                            this._normalDirection.z * 0.2 + this._realNormalDirection.z * 0.8
                        );
                    }
                    else {
                        var velocityProj:THREE.Vector3 = this._velocity.clone().projectOnPlane(this._realNormalDirection);
                        var velocityAngle = Math.acos(velocityProj.dot(this._velocity));
                        var newNormalDir:THREE.Vector3 = this.realDirection.clone().applyAxisAngle(new Vector3(1, 0, 0), Math.PI / 2).normalize();

                        //Interpolate real normal direction to normal direction on landing
                        //this._realNormalDirection.set(
                        //    newNormalDir.x*0.2 + this._realNormalDirection.x*0.8,
                        //    newNormalDir.y*0.2 + this._realNormalDirection.y*0.8,
                        //    newNormalDir.z*0.2 + this._realNormalDirection.z*0.8
                        //);
                    }

                    break;
                }
            }
            if (!(vert1 && vert2 && vert3)) {
                var vert1:THREE.Vector3 = new THREE.Vector3(0, 0, 0);
                var vert2:THREE.Vector3 = new THREE.Vector3(0, 0, 0);
                var vert3:THREE.Vector3 = new THREE.Vector3(0, 0, 0);
            }

            //this._normalDirection = this._collisionSurface.faces[faceIndex].normal;
            this._normalDirection.normalize();

            this._vert1.position.set(vert1.x, vert1.y, vert1.z);
            this._vert2.position.set(vert2.x, vert2.y, vert2.z);
            this._vert3.position.set(vert3.x, vert3.y, vert3.z);

            if(this.checkCollision(vert1, vert2, vert3)){
                this._isColliding = true;
            }else{
                this._isColliding = false;
            }

        }

        this._gradientDirection.set(0,-1,0);
        this._gradientDirection.projectOnPlane(this._normalDirection);
        if(this._gradientDirection.length() < 0.01)
            this._gradientDirection.set(0,0,0);

        //this._realDirection.set(this._desiredDirection.x, this._desiredDirection.y, this._desiredDirection.z);
        //this._realDirection.projectOnPlane(this._normalDirection);
        //this._realDirection.normalize();

        this._realArrow.position.set(this._position.x, this._position.y, this._position.z);
        this._realArrow.setDirection(this.velocity);
        //this._realArrow.setLength(this.realDirection.length()*2);

        this._normalArrow.position.set(this._position.x, this._position.y, this._position.z)
        this._normalArrow.setDirection(this._normalDirection);

        this._gradientArrow.position.set(this._position.x, this._position.y, this._position.z)
        this._gradientArrow.setDirection(this._gradientDirection);
        this._gradientArrow.setLength(this._gradientDirection.length()*10);

        this._directionArrow.position.set(this._position.x, this._position.y, this._position.z)
        this._directionArrow.setDirection(this._desiredDirection);
    }



    public updateVelocity(newVelocity:THREE.Vector3):void {
        this._velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);
    }

    public connectCollisionSurface(surface : THREE.Geometry):void {
        this._collisionSurface = surface;
        this._hasCollisionSurface = true;
    }

    private checkCollision(p1:THREE.Vector3, p2:THREE.Vector3, p3:THREE.Vector3) : boolean{
        var det = (p2.z - p3.z) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.z - p3.z);

        var l1 = ((p2.z - p3.z) * (this._position.x - p3.x) + (p3.x - p2.x) * (this._position.z - p3.z)) / det;
        var l2 = ((p3.z - p1.z) * (this._position.x - p3.x) + (p1.x - p3.x) * (this._position.z - p3.z)) / det;
        var l3 = 1.0 - l1 - l2;

        var height = l1 * p1.y + l2 * p2.y + l3 * p3.y;

        this._surfaceDistance = Math.min(Math.max(this._position.y-height, 0.0001), 10.0)/10;

        if(this._position.y <= height+0.1) {
            if (this._position.y <= height - 0.1)
                this._position.y = height;
            return true;
        }else {
           // if (this._position.y >= height + 0.1)
           //     this._position.y = height;
            return false;
        }
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

    get force():THREE.Vector3 {
        return this._force;
    }

    set force(value:THREE.Vector3) {
        this._force = value;
    }

    get isColliding():boolean {
        return this._isColliding;
    }

    set isColliding(value:boolean) {
        this._isColliding = value;
    }

    get realNormalDirection():THREE.Vector3 {
        return this._realNormalDirection;
    }

    set realNormalDirection(value:THREE.Vector3) {
        this._realNormalDirection = value;
    }

    get surfaceDistance():number {
        return this._surfaceDistance;
    }

    set surfaceDistance(value:number) {
        this._surfaceDistance = value;
    }

    get acceleration():THREE.Vector3 {
        return this._acceleration;
    }

    set acceleration(value:THREE.Vector3) {
        this._acceleration = value;
    }
}