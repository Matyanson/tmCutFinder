<svg
bind:this={svg}
on:mousedown={mouseDown}
on:mouseup={mouseUp}
on:mousemove={mouseMove}
>
<marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3"
    markerWidth="6" markerHeight="6"
    orient="auto-start-reverse">
    <path d="M 0 0 L 10 3 L 0 6 z" fill="#ddd"/>
</marker>
{#each Object.entries($paths) as t}
    {#if t[1].type == "cut"}
    <polyline class={`path ${t[0] == $selectedPath? 'selected':''}`} points={pointsToPath(t[1].points)} stroke-width={5} stroke={'#000'} on:mouseenter={pathEnter(t[0])} on:mouseleave={pathLeave} marker-end='url(#arrow)'/>
    {:else}
    <polyline class={`path ${t[0] == $selectedPath? 'selected':''}`} points={pointsToPath(t[1].points)} stroke-width={10} stroke={'#1b36ca'} on:mouseenter={pathEnter(t[0])} on:mouseleave={pathLeave} />
    {/if}
{/each}
{#each $junctions as j, i}
    <circle cx={j.cords.x * scaleX} cy={j.cords.y * scaleY} r={10} fill={shapeProps.junctions[j.type].color} on:mouseenter={()=>junctionEnter(i)} on:mouseleave={()=>junctionLeave()}/>
{/each}
{#if hoverPath > -1}
     <circle class="transparent" cx={fakePoint.x * scaleX} cy={fakePoint.y * scaleY} r={10} fill="#9194a1" />
{/if}

</svg>
<svelte:window on:resize|passive={handleResize} />
hover: {hoverPath}

<script>
    import { onMount } from 'svelte';
    import { paths, junctions, selectedPath, tool } from '../store';
    import { distanceBetween, nearestTo } from '@/utils/functions.js';
    import shapeProps from '../assets/shapeTypeProperties.js';
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
                }else
                    savefakeJunPossition(4);
                break;
            case 1:
                savefakeJunPossition();
                break;
        }
        
        m = newM;

        function savefakeJunPossition(endTrim = 0){
            if(hoverPath > -1){
                const HPoints = $paths[hoverPath].points;
                const temp = nearestTo(HPoints, m);
                endTrim = hoverPath == $selectedPath ? endTrim : 0;
                if(temp > -1 && temp < HPoints.length - endTrim &&
                ( $tool != 0 || !paths.isEndBlocked($selectedPath, false, true) )){
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
        Width = svg.getBoundingClientRect().width;
        Height = svg.getBoundingClientRect().height;
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
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: 0.2s;
}
svg polyline:hover{
    stroke: #14258a;
}
svg polyline.selected{
    stroke: #6c82ff;
}
svg circle:hover{
    fill: #4f62ce;
}
.transparent{
    opacity: 0.7;
    pointer-events: none;
}
</style>