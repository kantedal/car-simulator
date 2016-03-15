function point = projPointOnLine(distance, springAxisPoint1, springAxisPoint2)
    distance = max(0, min(3,distance));
    axis = (springAxisPoint2 - springAxisPoint1)/norm(springAxisPoint2 - springAxisPoint1);
    point = springAxisPoint1 + axis*distance + axis*2;
end