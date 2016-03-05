/**
 * Created by filles-dator on 2016-02-08.
 */

///<reference path="./vehiclesetup.ts"/>
///<reference path="./vehicle.ts"/>

class Car extends VehicleSetup {

    constructor(renderer : Renderer, vehicle : Vehicle){
        super(renderer, vehicle);

        this.steering = new Steering(0);
        this.motor = new Motor(20000, 100);

        this.wheels = [
            new Wheel(renderer),
            new Wheel(renderer),
            new Wheel(renderer),
            new Wheel(renderer)
        ];

        vehicle.vehicleBody.object.add(this.wheels[0].object);
        this.wheels[0].object.position.set(-3, -1.5, -4);
        this.wheels[0].connectVehicle(vehicle);
        this.wheels[0].connectSteering(this.steering);
        vehicle.vehicleBody.addCollisionPoint(this.wheels[0].object.position);

        vehicle.vehicleBody.object.add(this.wheels[1].object);
        this.wheels[1].object.position.set(3, -1.5, -4);
        this.wheels[1].connectVehicle(vehicle);
        this.wheels[1].connectSteering(this.steering);
        vehicle.vehicleBody.addCollisionPoint(this.wheels[1].object.position);

        vehicle.vehicleBody.object.add(this.wheels[2].object);
        this.wheels[2].object.position.set(-3, -1.5, 4);
        this.wheels[2].connectVehicle(vehicle);
        this.wheels[2].connectMotor(this.motor);
        vehicle.vehicleBody.addCollisionPoint(this.wheels[2].object.position);

        vehicle.vehicleBody.object.add(this.wheels[3].object);
        this.wheels[3].object.position.set(3, -1.5, 4);
        this.wheels[3].connectVehicle(vehicle);
        this.wheels[3].connectMotor(this.motor);
        vehicle.vehicleBody.addCollisionPoint(this.wheels[3].object.position);

        //this.springs = [
        //    new Spring(renderer, this.vehicle, Math.PI/9),
        //    new Spring(renderer, this.vehicle, -Math.PI/9)
        //];

    }
}