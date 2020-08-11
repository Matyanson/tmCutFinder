//handle different commands
onmessage = async function(e){
  let d = e.data;
  switch(d.type){
    case "calculate":
      calculateRoutes(d.data);
      break;
    default:
      console.log("undefined command");
      break;
  }
}




async function calculateRoutes(data){
  console.log("start calculating");
  let { paths = [], junctions = [], settings} = data;
  const { limit, maxRouteLength} = settings;
  let percentageMap;
  let totalDistance = 0;
  console.log(data);
 
  //Add info to Paths
  for(const [key, path] of Object.entries(paths)){
    let dist = pointsToDistance(path.points);
    let juns = findJunctions(key);
    paths[key].dist = dist;
    paths[key].start = juns[0];
    paths[key].end = juns[1];
    totalDistance += dist;
  }
  console.log(paths);

  //Prepare variables to help calculate
  let distLimit = totalDistance * maxRouteLength;
  const checkpointsCount = junctions.filter(j=>{
    return j.type == "checkpoint";
  }).length;
  const startPoint = findStartPoint(junctions);
  let routesNumLimit = limit;
  let finalRoutes = [];
  let percentage = 0;
  console.log(`start point: ${startPoint.id}${startPoint.start? "S":"E"}`);

  let startingRoute = {
    points: [startPoint],
    dist: 0,
    cps: []
  }

  //start calculating
  if(startPoint){
    let startJun = startIndex(junctions);
    percentageMap = pointsPercentageMap(startJun);
    console.log("please");
    console.log(percentageMap);
    console.log("starting to calculate:");
    continueRoute(startingRoute);
  }
  postMessage({type: "finished", data: finalRoutes});
  //close();

  async function continueRoute(route){
    let { points, dist = 0, cps = [] } = {...route};
    let curPoint = points[points.length -1];
    let curPath = paths[curPoint.id];
    if(!curPath){
      return;
    }
    let junIndex = curPoint.start ? curPath.start : curPath.end;
    let curJun = junctions[junIndex];

    if(curJun){
      let pointsFromHere = curJun.paths.filter(p=>{
        return p.id != curPoint.id || points.length < 2; //do not go back
      }).map(p=>{
        return {id: Number(p.id), start: !p.start};
      })
      //calculate things
      if(curJun.type == "checkpoint" ){
        let pathRepetition = 0;
        for(p of points.slice().reverse()){
          if(p.id !== curPoint.id)
            break;
          pathRepetition++;
        }
        if(pathRepetition < 3)
          pointsFromHere.push({id: curPoint.id, start: !curPoint.start});
          

        if(!cps.includes(curJun.num))
          cps.push(curJun.num);
      }
      dist+= curPath.dist;
      //calculate percentage
      if(percentageMap[curPoint.id] && percentageMap[curPoint.id] > percentage){
        percentage = percentageMap[curPoint.id];
      }

      //infinite repetition Block
      if(dist > distLimit){
        return;
      }
      //return if route is complete
      if(curJun.type == "finish" && cps.length >= checkpointsCount){
        addFinalRoute(route);
      }
      //travel to other points
      else{
        for(p of pointsFromHere){
          let nextPath = paths[p.id];
          //if not wrong way
          if(nextPath && !(nextPath.type == "cut" && p.start == true)){
            let newPoints = [...points, p];
            let newCps = [...cps];
            continueRoute({points: newPoints, dist, cps: newCps});
          }
        }
      }
    }
  }

  function addFinalRoute(route){
    let { points, dist = 0, cps = [] } = route;
    //insert newRoute (insert sorting alghorithm)
    for(let i = 0; i <= finalRoutes.length; i++){
      if( !finalRoutes[i] || dist < finalRoutes[i].dist){
        //insert
        finalRoutes = insertIntoIndex(finalRoutes, i, route);
        postMessage({type: "updated", data: finalRoutes});
        break;
      }
    }
    //trim if oversized
    if(finalRoutes.length > routesNumLimit)
      finalRoutes.pop();
    //set the distLimit to worst route
    if(finalRoutes.length === routesNumLimit)
      distLimit = finalRoutes[finalRoutes.length-1].dist;
  }

  function findJunctions(pathId){
    let start = junctions.findIndex(j=>{
      return j.paths.some(p=>{
        return p.id == pathId && p.start == true;
      })
    });
    let end = junctions.findIndex(j=>{
      return j.paths.some(p=>{
        return p.id == pathId && p.start == false;
      })
    });
    return [start, end];
  }

  function pointsPercentageMap(jun, percentage = 0, pTo = 100, res = {}){
    let result = {...res};

    let junction = junctions[jun];
    if(junction && junction.paths){
      let newPoints = junction.paths.filter( p=>{
        return !result.hasOwnProperty(p.id);
      })
      let portion = (pTo - percentage) / newPoints.length;
      for(i in newPoints){
        let p = newPoints[i];
        //calculate new percentage
        let percentageNew = percentage + i * portion;
        let pToNew = percentageNew + portion;
        let path = paths[p.id];
        if(path){
          //save
          result[p.id] = percentageNew;
          //calculate new;
          let junIndex = p.start ? path.end : path.start;
          let newResult = pointsPercentageMap(junIndex, percentageNew, pToNew, result);
          result = Object.assign(result, newResult);
        }
      }
    }
    return result;
  }
}




//helper functions
function insertIntoIndex(arr, index, el){
  let result = arr.slice();
  for(let i = result.length-1; i >= index; i--){
    result[i+1] = result[i];
  }
  result[index] = el;
  return result;
}
function startIndex(junctions){
  return junctions.findIndex(j=>{
    return j.type == "start"
  });
}
function findStartPoint(junctions){
  const startJun = junctions[startIndex(junctions)];
  if(startJun && startJun.paths[0]){
    const startTrack = startJun.paths[0];
    return {id: Number(startTrack.id), start: startTrack.start };
  }
}
function pointsToDistance(points){
  let dist = 0;
  for(i in points){
    i = Number(i);
    let p = points[i];
    if(points[i+1]){
      let nextP = points[i+1];
      dist += distanceBetween(p,nextP);
    }
  }
  return dist;
}
function distanceBetween(p1, p2){
  return Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y));
}