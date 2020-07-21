import { writable, get } from 'svelte/store';
import { SvelteComponentDev } from 'svelte/internal';

let trackCounter = 0;

export const imgSrc = writable("");
export const tool = writable(0);
export const trackType = writable("normal");
export const junType = writable("normal");
export const selectedTrack = writable(-1);
export const junctions = createJunctions();

function createJunctions() {
	const { subscribe, set, update } = writable([]);

	return {
        subscribe,
        set,
        new: (cords, tracks = [],type = get(junType))=>{
            let jun = get(junctions);
            let previous = jun.find(j=>{
                j.cords == cords;
            });
            update( n=>{
                let NTracks = tracks.map(t=>{
                    t.id = Number(t.id);
                    return t;
                })
                if(previous){
                    n[previous].tracks = NTracks;
                    console.log("UpdatingJunction");
                }else{
                    console.log("addingNewJunction");
                    n.push({
                        cords,
                        type,
                        tracks: NTracks
                    })
                }
                return n;
            });
            if(previous)
                return previous;
            return jun.length -1;
        },
        putOnTrack: (trackId, trackIndex) =>{
            tracks.split(trackId, trackIndex, get(junType));
        },
        addTrack: (junIndex, track) =>{
            track.id = Number(track.id);
            update(n=>{
                if(n[junIndex]){
                    n[junIndex].tracks.push(track);
                }
                return n;
            })
        },
        deleteTrack: (trackId)=>{
            update(n=>{
                n.forEach((x, index)=>{
                    n[index].tracks = x.tracks.filter(t=>{
                        return t.id !== trackId;
                    })
                })
                return n;
            });
        },
        modifyTrack: (trackId, inverseStart = false, inverseEnd = false, newId = "")=>{
            update(n=>{
                n.forEach((x, index)=>{
                    n[index].tracks = x.tracks.map(t=>{
                        if(t.id == trackId){
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
        modifyTrackEnd: (trackId, firstEnd, inverse = false, newId = "")=>{
            update(n=>{
                n.forEach((x, index)=>{
                    n[index].tracks = x.tracks.map(t=>{
                        if(t.id == trackId && t.start == firstEnd){
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

function createTracks() {
    const { subscribe, set, update }  = writable({});

	return {
        subscribe,
        set,
		new: (points = [], type = get(trackType)) => {
            update( n=>{
                n[trackCounter] = {type, points};
                return n;
            });
            const temp = trackCounter;
            trackCounter++;
            return temp;
        },
        isEndBlocked: (id, checkFirst = false, checkSecond = false)=>{
            const jun = get(junctions);
            return  jun.some((j)=>{
                let first = checkFirst && j.tracks.some(t=>t.id == id && t.start == true);
                let second = checkSecond && j.tracks.some(t=>t.id == id && t.start == false);
                return first || second;
            });
        },
        addPoint: (id, p)=>{
            if(!tracks.isEndBlocked(id, false, true)){
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
                return j.tracks.some(t=>t.id == id && t.start == false);
            });
            if(!tracks.isEndBlocked(id, false, true)){
                update(n=>{
                    if(n[id])
                        n[id].points = n[id].points.concat(points);
                    return n;
                })
            }
        },
        split: (trackId, trackIndex, junType = "normal")=>{
            const t = get(tracks);
            if(t[trackId] && t[trackId].points[trackIndex]){

                let first = t[trackId].points.slice(0, trackIndex+1);
                let second = t[trackId].points.slice(trackIndex);

                let newId = tracks.new(first, t[trackId].type);
                update(n=>{
                    n[trackId].points = second;
                    return n;
                });
                junctions.modifyTrackEnd(trackId, true, false, newId);

                let junIndex = junctions.new(
                    second[0],
                    [
                        {id: newId, start: false},
                        {id: trackId, start: true}
                    ],
                    junType
                );
                return junIndex;
            }
        },
        connectToJunction: (trackId, junIndex)=>{
            const t = get(tracks);
            const jun = get(junctions);
            let track = t[trackId];
            let start = track.points.length > 0 ? false : true;
            tracks.addPoint(trackId, jun[junIndex].cords);
            junctions.addTrack(junIndex, {id: trackId, start});
                
        },
        join: (trackId, trackIndex, newTrackId)=>{
            const t = get(tracks);
            let newTrack = t[newTrackId];
            let track = t[trackId];
            if(!newTrack || !track || !track.points[trackIndex] || tracks.isEndBlocked(newTrackId, false, true)){
                console.log("end is blocked");
                return newTrackId;
            }

            let start = newTrack.points.length > 0 ? false : true;
            tracks.addPoint(newTrackId, track.points[trackIndex]);

            if(trackIndex > 0){
                if(trackIndex < track.points.length - 1){
                    console.log("FS");
                    let junIndex = tracks.split(trackId, trackIndex, "normal");
                    console.log(`adding track ${newTrackId} to jun ${junIndex}`);
                    junctions.addTrack(junIndex, {id: newTrackId, start });
                    return newTrackId;
                }
                console.log("F");
                if(tracks.isEndBlocked(trackId, false, true)){
                    console.log("lastEndIsBlocked");
                    return newTrackId;
                }

                if(start){
                    tracks.delete(newTrackId);
                    return trackId;
                }
                else{
                    console.log("connect End");
                    tracks.addPoints(trackId, newTrack.points.reverse());
                    junctions.modifyTrack(newTrackId, true, true);
                    junctions.modifyTrack(newTrackId, false, false, trackId);
                    tracks.delete(newTrackId);

                    return trackId;
                }
            }
            else if(trackIndex < track.points.length){
                console.log("S")
                if(tracks.isEndBlocked(trackId, true, false)){
                    console.log("firstEndIsBlocked");
                    return newTrackId;
                }
                if(!start){
                    console.log("connect End");
                    if(trackId == newTrackId){
                        junctions.new(
                            track.points[0],
                            [
                                {id: trackId, start: true},
                                {id: trackId, start: false}
                            ]
                        )
                        return newTrackId;
                    }
                    tracks.addPoints(newTrackId, track.points);
                    junctions.modifyTrack(trackId, false, false, newTrackId);
                    tracks.delete(trackId);
                    return newTrackId;
                }else{
                    update(n=>{
                        n[trackId].points = n[trackId].points.reverse();
                        return n;
                    })
                    tracks.delete(newTrackId);
                    junctions.modifyTrack(trackId, true, true);
                    return trackId;
                }
            }
            
        },
        delete: (trackId)=>{
            update(n=>{
                if(n[trackId]){
                    delete n[trackId];
                    junctions.deleteTrack(trackId);
                }
                return n;
            })
        }
	};
}

export const tracks = createTracks();