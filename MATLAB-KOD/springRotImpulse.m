function rotVel = springRotImpulse(impulsePoint, com, vel_spring, vel, spring_axis, M)
    spring_axis = -spring_axis;
    vel_spring = spring_axis*vel_spring;
    force_radius = [impulsePoint(1) - com(1), impulsePoint(2) - com(2)];
    
    J = [spring_axis(1); spring_axis(2); spring_axis(2)*force_radius(1) - spring_axis(1)*force_radius(2)]'; 
    
    mc = 1/(J*inv(M)*J');
    lagrange = -mc*(J*vel_spring)*1.1;
    
    Pc = J'*lagrange;
    impulse = inv(M)*Pc;
    rotVel = vel(3) + impulse(3);
    
end

