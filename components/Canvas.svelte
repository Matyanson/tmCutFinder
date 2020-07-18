<svg
bind:this={svg}
on:mousedown={mouseDown}
on:mouseup={mouseUp}
on:mousemove={mouseMove}
>
{#each Object.entries($tracks) as t}
    <polyline class="track" points={pointsToPath(t[1].points)} stroke-width={6} on:mouseenter={trackEnter(t[0])} on:mouseleave={trackLeave}/>
{/each}
{#each $junctions as j, i}
    <circle cx={j.cords.x * scaleX} cy={j.cords.y * scaleY} r={10} fill="white" on:mouseenter={()=>junctionEnter(i)} on:mouseleave={()=>junctionLeave()}/>
{/each}
{#if hoverTrack > -1}
     <circle class="transparent" cx={fakePoint.x * scaleX} cy={fakePoint.y * scaleY} r={10} fill="red" />
{/if}

</svg>
<svelte:window on:resize|passive={handleResize} />
{scaleX}:{scaleY}
mouse: {m.x}:{m.y}
hoverT: {hoverTrack}
hoverJ: {hoverJunction}
selected: {selectedTrack}
<button on:click={test}>test</button>

<script>
    import { onMount } from 'svelte';
    import { tracks, junctions } from '../store';
    import { distanceBetween, nearestTo } from '@/utils/functions.js';
    //canvas
    let svg;
    let Width;
    let Height;
    $: scaleX = Width / 2000;
    $: scaleY = Height / 2000;
    //mouse
    let m = { x: 0, y: 0};
    let mDown = false;

    let lastPoint = { x: 0, y: 0};
    let selectedTrack = tracks.new();
    let hoverTrack = -1;
    let hoverJunction = -1;
    let fakePoint = { x:0, y:0 };
    const minDist = 20;

    onMount(() => {
        handleResize();
	});

    function test(){
        console.log($tracks);
        selectedTrack = tracks.new();
        console.log($tracks);
        console.log($junctions);
    }
    function mouseDown(){
        console.log("mouseDown");
        if(hoverJunction > -1){
            tracks.connectToJunction(selectedTrack, hoverJunction);
        }
        else if(hoverTrack > -1){
            let nearestIndex = nearestTo($tracks[hoverTrack].points, m);
            console.log(nearestIndex);
            selectedTrack = tracks.join(hoverTrack, nearestIndex, selectedTrack);
            hoverTrack = -1;
        }
        mDown = true;
    }
    function mouseUp(){
        console.log("mouseUp");
        mDown = false;
    }
    function mouseMove(){
        console.log("mouseMove");
        let newM = {
            x: Math.floor((event.clientX - svg.getBoundingClientRect().left) / scaleX),
            y: Math.floor((event.clientY - svg.getBoundingClientRect().top) / scaleY)
        }
        if(mDown && distanceBetween(newM, lastPoint) > minDist){
            tracks.addPoint(selectedTrack, newM);
            lastPoint = newM;
        }
        if(hoverTrack > -1){
            const HPoints = $tracks[hoverTrack].points; 
            const nearestIndex = nearestTo(HPoints, m);
            const nearest = HPoints[nearestIndex];
            fakePoint = {
                x: nearest.x,
                y: nearest.y
            }
        }
        m = newM;
    }
    function trackEnter(id){
        hoverTrack = id;
    }
    function trackLeave(){
        hoverTrack = -1;
    }
    function junctionEnter(index){
        console.log("Entering "+index+" Junction");
        hoverJunction = index;
    }
    function junctionLeave(){
        hoverJunction = -1;
    }
    function handleResize(){
        console.log("resize");
        Height = svg.getBoundingClientRect().height;
        Width = svg.getBoundingClientRect().width;
    }

    function pointsToPath(points){
        let path = "";
        if(points){
            let pointsCopy = points.slice();
            for(let p of pointsCopy){
                path += ` ${p.x * scaleX},${p.y * scaleY}`;
            }
        }
        return path;
    }
</script>

<style>
svg{
    height: 100%;
    width: 100%;
}
svg polyline {
    fill: none;
    stroke: #1b36ca;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: 0.2s;
}
svg circle:hover{
    fill: #4f62ce;
}
.transparent{
    opacity: 0.7;
    pointer-events: none;
}
</style>