function new_spring_vel = springConstraint2(distance, current_spring_vel, mass)
    restDistance = 1.5;
    kp = 30000;
    kd = 100;
    displacement = distance - restDistance;
    
    new_spring_vel = (-kp*displacement-kd*current_spring_vel)/mass;
end

