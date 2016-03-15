function spring_velocity = springConstraint(wheelPos, bodyPos, com, vSpring, vCar, vWheel, delta, mass)
    restDistance = 3;
    mass = 1;
    
    wheelPos = [wheelPos(1);wheelPos(2)];
    
    axis = wheelPos-bodyPos;
    vCar = [vCar(1); vCar(2)];
    vWheel = [vWheel(1); vWheel(2)];
    
    vRel = dot((vCar-vWheel), axis);
    mEff = 1/vRel;
    
    displacement = (sqrt((wheelPos(1)-bodyPos(1))^2 + (wheelPos(2)-bodyPos(2))^2) - restDistance)*2;
    
    k = 200;
    c = 10;
    
    %omega = 3;
    %k = mEff*omega^2;
    %c = 2*mEff*0.1*omega;

    gamma = 1/(c+delta*k);
    beta = (delta*k)/(c+delta*k);
    
    %spring_velocity = (vSpring-(beta/mass)*displacement)/(1+delta/(mass*gamma));
    spring_velocity = (vSpring-((delta*k)/mass)*displacement)/(1+(delta*c)/mass+(delta^2*k)/mass);
end

