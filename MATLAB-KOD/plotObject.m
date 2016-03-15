function plotHandle = plotObject(object)
    object = object';
    object = [object object(:,1)];
    plotHandle = plot(object(1,:), object(2,:));
end

