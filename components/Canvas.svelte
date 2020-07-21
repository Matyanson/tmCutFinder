<svg
bind:this={svg}
on:mousedown={mouseDown}
on:mouseup={mouseUp}
on:mousemove={mouseMove}
>
{#each Object.entries($paths) as t}
    <polyline class="path" points={pointsToPath(t[1].points)} stroke-width={6} on:mouseenter={pathEnter(t[0])} on:mouseleave={pathLeave}/>
{/each}
{#each $junctions as j, i}
    <circle cx={j.cords.x * scaleX} cy={j.cords.y * scaleY} r={10} fill={colors.junctions[j.type]} on:mouseenter={()=>junctionEnter(i)} on:mouseleave={()=>junctionLeave()}/>
{/each}
{#if hoverPath > -1}
     <circle class="transparent" cx={fakePoint.x * scaleX} cy={fakePoint.y * scaleY} r={10} fill="#9194a1" />
{/if}

</svg>
<svelte:window on:resize|passive={handleResize} />
{scaleX}:{scaleY}
mouse: {m.x}:{m.y}
hoverT: {hoverPath}
hoverJ: {hoverJunction}
selected: {$selectedPath}
<button on:click={test}>test</button>

<script>
    import { onMount } from 'svelte';
    import { paths, junctions, selectedPath, tool } from '../store';
    import { distanceBetween, nearestTo } from '@/utils/functions.js';
    import colors from '../assets/typeColors.js';
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
    $selectedPath = paths.new();
    let nearestIndex = -1;
    let hoverPath = -1;
    let hoverJunction = -1;
    let fakePoint = { x:0, y:0 };
    const minDist = 20;

    onMount(() => {
        handleResize();
	});

    function test(){
        console.log($paths);
        $selectedPath = paths.new();
        console.log($paths);
        console.log($junctions);
    }
    function mouseDown(){
        console.log("mouseDown");
        switch($tool){
            case 0:
                if(hoverJunction > -1){
                    paths.connectToJunction($selectedPath, hoverJunction);
                }
                else if(hoverPath > -1){
                    $selectedPath = paths.join(hoverPath, nearestIndex, $selectedPath);
                    hoverPath = -1;
                }
                break;
            case 1:
                if(hoverPath > -1 && nearestIndex > -1)
                    junctions.putOnPath(hoverPath, nearestIndex);
                break;
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
        switch($tool){
            case 0:
                 if(mDown && distanceBetween(newM, lastPoint) > minDist){
                    paths.addPoint($selectedPath, newM);
                    lastPoint = newM;
                }
                savefakeJunPossition(4);
                break;
            case 1:
                savefakeJunPossition(0);
                break;
        }
        
        m = newM;

        function savefakeJunPossition(endTrim = 0){
            if(hoverPath > -1){
                const HPoints = $paths[hoverPath].points;
                const temp = nearestTo(HPoints, m);
                if(temp > -1 && temp < HPoints.length - 1 - endTrim){
                    nearestIndex = temp;
                    const nearestPoint = HPoints[nearestIndex];
                    fakePoint = {
                        x: nearestPoint.x,
                        y: nearestPoint.y
                    }
                }else{
                    hoverPath = -1;
                }
            }
        }
    }
    function pathEnter(id){
        hoverPath = id;
    }
    function pathLeave(){
        hoverPath = -1;
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
        $paths = $paths;
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