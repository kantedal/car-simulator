/**
 * Created by filles-dator on 2016-02-08.
 */
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="./parts/motor.ts"/>
///<reference path="./parts/spring.ts"/>
///<reference path="./parts/spring_connector.ts"/>
///<reference path="./parts/steering.ts"/>
///<reference path="./vehicle.ts"/>
///<reference path="./relative_dynamic_body.ts"/>

class VehicleSetup {
    private _renderer : Renderer;
    private _vehicle : Vehicle;
    private _wheels:Wheel[];
    private _springs:Spring[];
    private _springConnector:SpringConnector[];
    private _motor:Motor;
    private _steering:Steering;
    private _vehicleBody:RelativeDynamicBody;
    private _spotLight: THREE.SpotLight;

    constructor(renderer : Renderer, vehicle : Vehicle){
        this._renderer = renderer;
        this._vehicle = vehicle;

        window.addEventListener( 'keydown', this.onKeyDown, false );
        window.addEventListener( 'keyup', this.onKeyUp, false );
    }

    public update(time:number, delta:number):void{
        if(this._wheels){
            for(var i=0; i<this._wheels.length; i++){
                this._wheels[i].isColliding = this.vehicle.vehicleModel.externalCollision[i];
                this._wheels[i].update(time, delta);
                //this._wheels[i].object.position.setY(Math.sin(time*i));
                //this._wheels[i].object.position.set(this._wheels[i].object.position.x, this._wheels[i].object.position.y, this._wheels[i].object.position.z);
            }
        }

        if(this._springs){
            for(var i=0; i<this._wheels.length; i++){
                this._springs[i].update(time, delta);
            }
        }

        if(this._springConnector){
            for(var i=0; i<this._springConnector.length; i++){
                this._springConnector[i].update(time, delta);
            }
        }

        if(this._motor){
            this._motor.update(time, delta);

            this._vehicle.vehicleModel.forceConstraints.valueOf()[4] += this._steering.steeringAngle*this._motor.torque*15;

            this._vehicle.vehicleModel.forceConstraints.valueOf()[4] += this._steering.steeringAngle
                *-this._vehicle.vehicleModel.velocityDirection.clone().normalize().dot(this._vehicle.vehicleModel.localZDirection)
                *this._vehicle.vehicleModel.velocityDirection.length()*2500;

            this._steering.steeringAngle *= 0.98;
        }

        if(this._steering){
            this._steering.update(time, delta);
        }

        if(this._spotLight){
           // this._spotLight.target =
        }
    }

    private pressedKeys = [];
    onKeyDown = (e) => {
        if (e) {

            this.pressedKeys[e.keyCode] = true;

            if(this.pressedKeys[37] || this.pressedKeys[65]) {
                if(this._steering)
                    this._steering.steeringAcceleration += 100;
            }

            if(this.pressedKeys[38] || this.pressedKeys[87]) {
                if(this._motor)
                    this._motor.isAccelerating = true;
            }

            if(this.pressedKeys[39] || this.pressedKeys[68]) {
                if(this._steering)
                    this._steering.steeringAcceleration -= 100;
            }

            if(this.pressedKeys[40] || this.pressedKeys[83]) {
            }

            if(this.pressedKeys[76]){
                if(this._spotLight){
                    if(this._spotLight.intensity == 10)
                        this._spotLight.intensity = 0;
                    else
                        this._spotLight.intensity = 10;
                }
            }
        }
    }
    onKeyUp = (e) => {
        if (e) {
            this.pressedKeys[e.keyCode] = false;
            switch (e.which) {
                case 37: //Left
                    break;
                case 38: //Up
                    if(this._motor)
                        this._motor.isAccelerating = false;
                    break;
                case 39: //Right
                    break;
                case 40: //Down
                    break;
                case 65:
                    break;
                case 87:
                    if(this._motor)
                        this._motor.isAccelerating = false;
                    break;
                case 68:
                    break;
                case 83:
                    break;
            }
        }
    }

    get steering():Steering {
        return this._steering;
    }

    set steering(value:Steering) {
        this._steering = value;
    }

    get motor():Motor {
        return this._motor;
    }

    set motor(value:Motor) {
        this._motor = value;
    }

    get springs():Spring[] {
        return this._springs;
    }

    set springs(value:Array) {
        this._springs = value;
    }

    get wheels():Wheel[] {
        return this._wheels;
    }

    set wheels(value:Array) {
        this._wheels = value;
    }

    get vehicle():Vehicle {
        return this._vehicle;
    }

    set vehicle(value:Vehicle) {
        this._vehicle = value;
    }

    get renderer():Renderer {
        return this._renderer;
    }

    set renderer(value:Renderer) {
        this._renderer = value;
    }

    get vehicleBody():RelativeDynamicBody {
        return this._vehicleBody;
    }

    set vehicleBody(value:RelativeDynamicBody) {
        this._vehicleBody = value;
    }

    get springConnector():SpringConnector[] {
        return this._springConnector;
    }

    set springConnector(value:Array) {
        this._springConnector = value;
    }

    get spotLight():THREE.SpotLight {
        return this._spotLight;
    }

    set spotLight(value:THREE.SpotLight) {
        this._spotLight = value;
    }
}