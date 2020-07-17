import { writable, get } from 'svelte/store';
import { SvelteComponentDev } from 'svelte/internal';

let trackCounter = 0;

export const imgSrc = writable("");
export const junctions = createJunctions();

function createJunctions() {
	const { subscribe, set, update } = writable([]);

	return {
        subscribe,
        set,
        new: (cords, tracks = [],type = "normal")=>{
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
        addTrack: (junIndex, track) =>{
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
                                t.id = newId;
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
		new: (points = [], type = "normal") => {
            update( n=>{
                n[trackCounter] = {type, points};
                return n;
            });
            const temp = trackCounter;
            trackCounter++;
            return temp;
        },
        addPoint: (id, p)=>{
            let jun = get(junctions);
            let addToEnd = !jun.some((j)=>{
                return j.tracks.some(t=>t.id == id && t.start == false);
            });
            if(addToEnd){
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
            if(addToEnd){
                update(n=>{
                    if(n[id])
                        n[id].points = n[id].points.concat(points);
                    return n;
                })
            }
        },
        split: (trackId, trackIndex)=>{
            const t = get(tracks);
            if(t[trackId] && t[trackId].points[trackIndex]){

                let first = t[trackId].points.slice(0, trackIndex+1);
                let second = t[trackId].points.slice(trackIndex);

                let newId = tracks.new(first);
                update(n=>{
                    n[trackId].points = second;
                    return n;
                });
                junctions.modifyTrack(trackId, false, false, newId);

                let junIndex = junctions.new(
                    second[0],
                    [
                        {id: newId, start: false},
                        {id: trackId, start: true}
                    ]
                );
                return junIndex;
            }
        },
        join: (trackId, trackIndex, newTrackId)=>{
            const t = get(tracks);
            let newTrack = t[newTrackId];
            let track = t[trackId];
            if(!newTrack || !track || !track.points[trackIndex])
                return newTrackId;
            let start = newTrack.points.length > 1 ? false : true;

            if(trackIndex > 0){
                if(trackIndex < track.points.length - 1){
                    console.log("FS");
                    let junIndex = tracks.split(trackId, trackIndex);
                    console.log(`adding track ${newTrackId} to jun ${junIndex}`);
                    junctions.addTrack(junIndex, {id: newTrackId, start });
                    return newTrackId;
                }
                console.log("F");
                if(start){
                    tracks.delete(newTrackId);
                    return trackId;
                }
                else{
                    console.log("connect End");
                    tracks.delete(trackId);
                    update(n=>{
                        n[newTrackId].points = n[newTrackId].points.reverse();
                        return n;
                    });
                    junctions.modifyTrack(newTrackId, true, true);
                    tracks.addPoints(newTrackId, track.points);

                    return newTrackId;
                }
            }
            else if(trackIndex < track.points.length){
                console.log("S")
                if(!start){
                    tracks.addPoints(trackId, newTrack.points);
                    tracks.delete(newTrackId);
                    return trackId;
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