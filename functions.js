
export function pointsToDistance(points){
    let dist = 0;
    for(i in points){
      let p = points[i];
      if(points[i+1]){
        let nextP = points[i+1];
        dist += distanceBetween(p,nextP);
      }
    }
    return dist;
  }
export function nearestTo(points, point){
    let res;
    let min;
    points.forEach((p, i) => {
        let dist = distanceBetween(p, point);
        if(!min || dist < min){
            min = dist;
            res = i;
        }
    });
    return res;
}
export function distanceBetween(p1, p2){
    return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
}