import { writable, get } from 'svelte/store';
import { SvelteComponentDev } from 'svelte/internal';

let pathCounter = 0;

export const imgSrc = writable("");
export const tool = writable(0);
export const pathType = writable("normal");
export const junType = writable("normal");
export const selectedPath = writable(-1);
export const junctions = createJunctions();

function createJunctions() {
	const { subscribe, set, update } = writable([]);

	return {
        subscribe,
        set,
        new: (cords, paths = [],type = get(junType))=>{
            let jun = get(junctions);
            let previous = jun.find(j=>{
                j.cords == cords;
            });
            update( n=>{
                let NPaths = paths.map(t=>{
                    t.id = Number(t.id);
                    return t;
                })
                if(previous){
                    n[previous].paths = NPaths;
                    console.log("UpdatingJunction");
                }else{
                    console.log("addingNewJunction");
                    n.push({
                        cords,
                        type,
                        paths: NPaths
                    })
                }
                return n;
            });
            if(previous)
                return previous;
            return jun.length -1;
        },
        putOnPath: (pathId, pathIndex) =>{
            paths.split(pathId, pathIndex, get(junType));
        },
        addPath: (junIndex, path) =>{
            path.id = Number(path.id);
            update(n=>{
                if(n[junIndex]){
                    n[junIndex].paths.push(path);
                }
                return n;
            })
        },
        deletePath: (pathId)=>{
            update(n=>{
                n.forEach((x, index)=>{
                    n[index].paths = x.paths.filter(t=>{
                        return t.id !== pathId;
                    })
                })
                return n;
            });
        },
        modifyPath: (pathId, inverseStart = false, inverseEnd = false, newId = "")=>{
            update(n=>{
                n.forEach((x, index)=>{
                    n[index].paths = x.paths.map(t=>{
                        if(t.id == pathId){
                            if(t.start && inverseStart)
                                t.start = false;
                            else if(inverseEnd)
                                t.start = true;
                            if(newId !== "")
                                t.id = Number(newId);
                        }
                        return t;
                    })
                })
                return n;
            });
        },
        modifyPathEnd: (pathId, firstEnd, inverse = false, newId = "")=>{
            update(n=>{
                n.forEach((x, index)=>{
                    n[index].paths = x.paths.map(t=>{
                        if(t.id == pathId && t.start == firstEnd){
                            if(inverse)
                                t.start = !t.start;
                            if(newId !== "")
                                t.id = Number(newId);
                        }
                        return t;
                    })
                })
                return n;
            });
        }
    }
}

function createPaths() {
    const { subscribe, set, update }  = writable({});

	return {
        subscribe,
        set,
		new: (points = [], type = get(pathType)) => {
            update( n=>{
                n[pathCounter] = {type, points};
                return n;
            });
            const temp = pathCounter;
            pathCounter++;
            return temp;
        },
        isEndBlocked: (id, checkFirst = false, checkSecond = false)=>{
            const jun = get(junctions);
            return  jun.some((j)=>{
                let first = checkFirst && j.paths.some(t=>t.id == id && t.start == true);
                let second = checkSecond && j.paths.some(t=>t.id == id && t.start == false);
                return first || second;
            });
        },
        addPoint: (id, p)=>{
            if(!paths.isEndBlocked(id, false, true)){
                console.log(`new point: ${p.x}:${p.y}`);
                update( n=>{
                    if(n[id])
                        n[id].points.push(p);
                    return n;
                });
            }
        },
        addPoints: (id, points)=>{
            let jun = get(junctions);
            let addToEnd = !jun.some((j)=>{
                return j.paths.some(t=>t.id == id && t.start == false);
            });
            if(!paths.isEndBlocked(id, false, true)){
                update(n=>{
                    if(n[id])
                        n[id].points = n[id].points.concat(points);
                    return n;
                })
            }
        },
        split: (pathId, pathIndex, junType = "normal")=>{
            const t = get(paths);
            if(t[pathId] && t[pathId].points[pathIndex]){

                let first = t[pathId].points.slice(0, pathIndex+1);
                let second = t[pathId].points.slice(pathIndex);

                let newId = paths.new(first, t[pathId].type);
                update(n=>{
                    n[pathId].points = second;
                    return n;
                });
                junctions.modifyPathEnd(pathId, true, false, newId);

                let junIndex = junctions.new(
                    second[0],
                    [
                        {id: newId, start: false},
                        {id: pathId, start: true}
                    ],
                    junType
                );
                return junIndex;
            }
        },
        connectToJunction: (pathId, junIndex)=>{
            const t = get(paths);
            const jun = get(junctions);
            let path = t[pathId];
            let start = path.points.length > 0 ? false : true;
            paths.addPoint(pathId, jun[junIndex].cords);
            junctions.addPath(junIndex, {id: pathId, start});
                
        },
        join: (pathId, pathIndex, newPathId)=>{
            const t = get(paths);
            let newPath = t[newPathId];
            let path = t[pathId];
            if(!newPath || !path || !path.points[pathIndex] || paths.isEndBlocked(newPathId, false, true)){
                console.log("end is blocked");
                return newPathId;
            }

            let start = newPath.points.length > 0 ? false : true;
            paths.addPoint(newPathId, path.points[pathIndex]);

            if(pathIndex > 0){
                if(pathIndex < path.points.length - 1){
                    console.log("FS");
                    let junIndex = paths.split(pathId, pathIndex, "normal");
                    console.log(`adding path ${newPathId} to jun ${junIndex}`);
                    junctions.addPath(junIndex, {id: newPathId, start });
                    return newPathId;
                }
                console.log("F");
                if(paths.isEndBlocked(pathId, false, true)){
                    console.log("lastEndIsBlocked");
                    return newPathId;
                }

                if(start){
                    paths.delete(newPathId);
                    return pathId;
                }
                else{
                    console.log("connect End");
                    paths.addPoints(pathId, newPath.points.reverse());
                    junctions.modifyPath(newPathId, true, true);
                    junctions.modifyPath(newPathId, false, false, pathId);
                    paths.delete(newPathId);

                    return pathId;
                }
            }
            else if(pathIndex < path.points.length){
                console.log("S")
                if(paths.isEndBlocked(pathId, true, false)){
                    console.log("firstEndIsBlocked");
                    return newPathId;
                }
                if(!start){
                    console.log("connect End");
                    if(pathId == newPathId){
                        junctions.new(
                            path.points[0],
                            [
                                {id: pathId, start: true},
                                {id: pathId, start: false}
                            ]
                        )
                        return newPathId;
                    }
                    paths.addPoints(newPathId, path.points);
                    junctions.modifyPath(pathId, false, false, newPathId);
                    paths.delete(pathId);
                    return newPathId;
                }else{
                    update(n=>{
                        n[pathId].points = n[pathId].points.reverse();
                        return n;
                    })
                    paths.delete(newPathId);
                    junctions.modifyPath(pathId, true, true);
                    return pathId;
                }
            }
            
        },
        delete: (pathId)=>{
            update(n=>{
                if(n[pathId]){
                    delete n[pathId];
                    junctions.deletePath(pathId);
                }
                return n;
            })
        }
	};
}

export const paths = createPaths();