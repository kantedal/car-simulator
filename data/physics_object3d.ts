///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>

import Vector3 = THREE.Vector3;
class PhysicsObject3d {
    private _object : THREE.Mesh;
    private _geometry : THREE.Geometry;
    private _material : THREE.Material;

    private _velocity : THREE.Vector3;
    private _acceleration : THREE.Vector3;
    private _force : THREE.Vector3;
    private _forceRadius : THREE.Vector3;
    private _boundingRadius : THREE.Vector3;

    private _angularAcceleration : THREE.Vector3;
    private _angularVelocity : THREE.Vector3;

    private _position : THREE.Vector3;
    private _rotation : THREE.Vector3;
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
    private _forceRadiusArrow : THREE.ArrowHelper;

    private _centerOfMassPoint : THREE.Mesh;

    private _hasCollisionSurface : boolean = false;
    private _isColliding : boolean = false;
    private _collisionRadius : number = 0;
    private _surfaceDistance : number = 0;
    private _collisionPosition : THREE.Vector3;
    private _collisionSurface : THREE.Geometry;

    private _raycaster : THREE.Raycaster;

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);
        this._object.position.y = -1;

        this._velocity = new THREE.Vector3(0,0,0);
        this._acceleration = new THREE.Vector3(0,0,0);
        this._force = new THREE.Vector3(0,0,0);
        this._forceRadius = new THREE.Vector3(0,0,0);

        this._angularAcceleration = new THREE.Vector3(0,0,0);
        this._angularVelocity = new THREE.Vector3(0,0,0);

        this._position = new THREE.Vector3(0,0,0);
        this._rotation = new THREE.Vector3(0,0,0);
        this._collisionPosition = new THREE.Vector3(0,0,0);
        this._desiredDirection = new THREE.Vector3(1,0,0);
        this._normalDirection = new THREE.Vector3(0,0,0);
        this._realNormalDirection = new THREE.Vector3(0,0,0);
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
        this._forceRadiusArrow = new THREE.ArrowHelper( dir, origin, length, 0xff00ff );

        renderer.scene.add( this._normalArrow );
        renderer.scene.add( this._gradientArrow );
        renderer.scene.add( this._directionArrow );
        renderer.scene.add( this._realArrow );
        renderer.scene.add( this._forceRadiusArrow );

        this._centerOfMassPoint = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true}));
        renderer.scene.add( this._centerOfMassPoint );

        this._raycaster = new THREE.Raycaster();
    }

    public update(time:number, delta:number):void {
        if(this._hasCollisionSurface) {

            this.forceRadius.set(0,0,0);
            this.isColliding = false;
            var collisionPoints = 0;
            for (var i = 0; i < this._collisionSurface.faces.length; i++) {
                //if (this.pointInTriangle(vertexPosition, vert1, vert2, vert3)) {

                var vert1:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[i].a];
                var vert2:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[i].b];
                var vert3:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[i].c];

                for (var vertexIdx = 0; vertexIdx < this._vertexTracker.vertices.length; vertexIdx++) {
                    var vertPos:THREE.Vector3 = this._vertexTracker.vertices[vertexIdx].clone();

                    if (this.checkCollision(vertPos.clone().add(this.position), vert1, vert2, vert3) && this.pointInTriangle(vertPos.clone().add(this.position), vert1, vert2, vert3)) {
                        var vertexNormals = this._collisionSurface.faces[i].vertexNormals;

                        var areaT = this.triangleArea(vert1, vert2, vert3);
                        var areaB = this.triangleArea(vert1, this._position, vert3);
                        var areaC = this.triangleArea(vert1, this._position, vert2);
                        var areaA = areaT - areaB - areaC;

                        var c1 = areaA / areaT;
                        var c2 = areaB / areaT;
                        var c3 = areaC / areaT;

                        this._normalDirection = new THREE.Vector3(
                            vertexNormals[0].x * c1 + vertexNormals[1].x * c2 + vertexNormals[2].x * c3,
                            vertexNormals[0].y * c1 + vertexNormals[1].y * c2 + vertexNormals[2].y * c3,
                            vertexNormals[0].z * c1 + vertexNormals[1].z * c2 + vertexNormals[2].z * c3
                        );

                        this.isColliding = true;

                        this.forceRadius.set(
                            vertPos.x,
                            vertPos.y,
                            vertPos.z
                        );

                        this.force.set(
                            this._normalDirection.x,
                            this._normalDirection.y,
                            this._normalDirection.z
                        ).multiplyScalar(Math.abs((9.82+this._angularVelocity.clone().multiply(this.forceRadius).length()+this.velocity.length())*2000));

                        this.velocity.y = 0;
                    }
                }
            }


            this._centerOfMassPoint.position.set(this._position.x, this._position.y, this._position.z);
            this._object.position.set(this._position.x, this._position.y, this._position.z);

            this._normalDirection.normalize();

            this._gradientDirection.set(0, -1, 0);
            this._gradientDirection.projectOnPlane(this._normalDirection);
            if (this._gradientDirection.length() < 0.01)
                this._gradientDirection.set(0, 0, 0);

            this._realDirection.set(this._desiredDirection.x, this._desiredDirection.y, this._desiredDirection.z);
            this._realDirection.projectOnPlane(this._normalDirection);
            this._realDirection.normalize()

            //this._forceRadiusArrow.position.set(this._position.x, this._position.y, this._position.z);
            //this._forceRadiusArrow.setDirection(this._forceRadius);
            //this._forceRadiusArrow.setLength(this._forceRadius.length());

            //this._normalArrow.position.set(this._position.x, this._position.y, this._position.z)
            //this._normalArrow.setDirection(this._normalDirection);
        }

        //this._object.rotation.set(this._rotation.x, this._rotation.z, this._rotation.z);
        //this._object.position.set(this._position.x, this._position.y, this._position.z);

        //this._realArrow.position.set(this._position.x, this._position.y, this._position.z);
        //this._realArrow.setDirection(this._velocity);
        //this._realArrow.setLength(this._velocity.length()/5);

        //this._gradientArrow.position.set(this._position.x, this._position.y, this._position.z)
        //this._gradientArrow.setDirection(this._gradientDirection);
        //this._gradientArrow.setLength(this._gradientDirection.length()*10);
        //
        //this._directionArrow.position.set(this._position.x, this._position.y, this._position.z)
        //this._directionArrow.setDirection(this._desiredDirection);
    }

    //Vertex tracker to handle vertices positions when colliding
    private _vertexTracker : THREE.Geometry;
    public trackVertices(angVel : THREE.Vector3) : THREE.Vector3{
        if(!this._vertexTracker) {
            this._vertexTracker = this.object.geometry.clone();
        }

        this._vertexTracker.rotateX(angVel.x*0.03);
        this._vertexTracker.rotateZ(angVel.y*0.03);
        this._vertexTracker.rotateZ(angVel.z*0.03);

        return this._vertexTracker.vertices[0];
    }

    private calculateInertiaTensor():void {
        var dV = 0.1*0.1;

        var Ixx = 0;
        for(var y=this.yLim[0]; y<=this.yLim[1]; y+=0.1){
            for(var z=this.zLim[0]; z<=this.zLim[1]; z+=0.1){
                Ixx += (Math.pow(y,2) + Math.pow(z,2))*dV;
            }
        }
        Ixx *= 500;

        var Iyy = 0;
        for(var x=this.xLim[0]; x<=this.xLim[1]; x+=0.1){
            for(var z=this.zLim[0]; z<=this.zLim[1]; z+=0.1){
                Iyy += (Math.pow(x,2) + Math.pow(z,2))*dV;
            }
        }
        Iyy *= 500;

        var Izz = 0;
        for(var x=this.xLim[0]; x<=this.xLim[1]; x+=0.1){
            for(var y=this.yLim[0]; y<=this.yLim[1]; y+=0.1){
                Izz += (Math.pow(x,2) + Math.pow(y,2))*dV;
            }
        }
        Izz *= 500;

        var Ixy = 0;
        for(var x=this.xLim[0]; x<=this.xLim[1]; x+=0.1){
            for(var y=this.yLim[0]; y<=this.yLim[1]; y+=0.1){
                Ixy += (x*y)*dV;
            }
        }
        Ixy *= -500;

        var Iyz = 0;
        for(var y=this.yLim[0]; y<=this.yLim[1]; y+=0.1){
            for(var z=this.zLim[0]; z<=this.zLim[1]; z+=0.1){
                Iyz += (y*z)*dV;
            }
        }
        Iyz *= -500;

        var Ixz = 0;
        for(var x=this.xLim[0]; x<=this.xLim[1]; x+=0.1){
            for(var z=this.zLim[0]; z<=this.zLim[1]; z+=0.1){
                Ixz += (x*z)*dV;
            }
        }
        Ixz *= -500;

        this.inertiaTensor = new THREE.Matrix3;
        this.inertiaTensor.set(
            Ixx, Ixy, Ixz,
            Ixy, Iyy, Iyz,
            Ixz, Iyz, Izz
        );

        var m4: THREE.Matrix4 = new THREE.Matrix4();
        m4.set(
            this.inertiaTensor.elements[0], this.inertiaTensor.elements[1], this.inertiaTensor.elements[2], 0,
            this.inertiaTensor.elements[3], this.inertiaTensor.elements[4], this.inertiaTensor.elements[5], 0,
            this.inertiaTensor.elements[6], this.inertiaTensor.elements[7], this.inertiaTensor.elements[8], 0,
            0, 0, 0, 1
        );

        this.inverseInertiaTensor = this.inertiaTensor.getInverse(m4);
    }

    public updateVelocity(newVelocity:THREE.Vector3):void {
        this._velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);
    }

    public connectCollisionSurface(surface : THREE.Geometry):void {
        this._collisionSurface = surface;
        this._hasCollisionSurface = true;
    }

    private checkCollision(vertPos:THREE.Vector3, p1:THREE.Vector3, p2:THREE.Vector3, p3:THREE.Vector3) : boolean{
        var det = (p2.z - p3.z) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.z - p3.z);

        var l1 = ((p2.z - p3.z) * (vertPos.x - p3.x) + (p3.x - p2.x) * (vertPos.z - p3.z)) / det;
        var l2 = ((p3.z - p1.z) * (vertPos.x - p3.x) + (p1.x - p3.x) * (vertPos.z - p3.z)) / det;
        var l3 = 1.0 - l1 - l2;

        var height = l1 * p1.y + l2 * p2.y + l3 * p3.y;

        this._surfaceDistance = Math.min(Math.max(vertPos.y-height, 0.0001), 10.0)/10;

        if(vertPos.y <= height) {
            return true;
        }else {
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

    private distanceToFace(p1:THREE.Vector3, p2:THREE.Vector3, p3:THREE.Vector3) : number {
        var avgPos:THREE.Vector3 = new Vector3(
            (p1.x + p2.x + p3.x)/3,
            (p1.y + p2.z + p3.y)/3,
            (p1.x + p2.x + p3.z)/3
        );
        return Math.sqrt(Math.pow(this.position.x-avgPos.x, 2) + Math.pow(this.position.y-avgPos.y, 2) + Math.pow(this.position.z-avgPos.z, 2));
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

    get rotation():THREE.Vector3 {
        return this._rotation;
    }

    set rotation(value:THREE.Vector3) {
        this._rotation = value;
    }

    get forceRadius():THREE.Vector3 {
        return this._forceRadius;
    }

    set forceRadius(value:THREE.Vector3) {
        this._forceRadius = value;
    }

    get boundingRadius():THREE.Vector3 {
        return this._boundingRadius;
    }

    set boundingRadius(value:THREE.Vector3) {
        this._boundingRadius = value;
    }

    get angularAcceleration():THREE.Vector3 {
        return this._angularAcceleration;
    }

    set angularAcceleration(value:THREE.Vector3) {
        this._angularAcceleration = value;
    }
    get angularVelocity():THREE.Vector3 {
        return this._angularVelocity;
    }

    set angularVelocity(value:THREE.Vector3) {
        this._angularVelocity = value;
    }
}