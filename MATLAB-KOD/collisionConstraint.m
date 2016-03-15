function new_vel = collisionConstraint(vel, F, delta, normal, force_radius, M, penetration)
    J = [normal(1); normal(2); normal(2)*force_radius(1) - normal(1)*force_radius(2)]'; 
    
    mc = 1/(J*inv(M)*J');
    
    rectPenetration = abs(penetration);
    rectPenetration = rectPenetration^2*rectPenetration*20;
    %rectPenetration = 0;
    lagrange = -mc*(J*vel - 1 - rectPenetration)*1.1;
    
    Pc = J'*lagrange;
    new_vel = inv(M)*Pc;
end

