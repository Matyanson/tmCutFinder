<div class="container">
    <div class="toolbar">
        Manual: <input type="checkbox" bind:checked={manual} on:change={()=>{pausePlayAnim()}}/>
        {#if manual}
            <input type="range" min={0} max={fragments.length-1} bind:value={animIteration} > {animIteration}
            {:else}
            <input type="range" min={1} max={50} bind:value={animSpeed} on:input={()=>resetAnimation()} > {animSpeed/10}x, <button on:click={()=>{animIteration = 0}} >Reset</button>
        {/if}
    </div>
    <div class="display">
        <img src={$imgSrc} alt="TM Map screenshot" >
        <svg bind:this={svg}>
        {#if fragments[animIteration]}
            {#each fragments as points,i}
                <polyline class={`${i == animIteration ? "highlighted" : "normal"}`} points={pointsToPath(points)} stroke-width={7} />
            {/each}
            <circle cx={fragments[animIteration][0].x * scaleX} cy={fragments[animIteration][0].y * scaleY} r={7} fill="aqua" />
        {/if}
        </svg>
    </div>
</div>
<svelte:window on:resize|passive={handleResize} />

<script>
    import { onMount } from 'svelte';
    import {imgSrc, routes, paths} from '../store.js';
    import { distanceBetween } from '@/utils/functions.js';
    export let selectedRoute = 1;
    let manual = true;
    let animIteration = 0;
    let animSpeed = 20; //miltiplyer /10
    const animDelaymin = 20;
    let animDelay = 100; //ms
    let frameSkip = 1;
    let interval;


    
    let svg;
    let scaleX = 1;
    let scaleY = 1;
    onMount(() => {
        handleResize();
    });

    $: fragments = getFragmentedRoute(selectedRoute, $routes);

    function pausePlayAnim(){
        if(manual)
            stopAnimation();
        else
            startAnimation();
    }
    function startAnimation(){
        console.log("starting anim");
        interval = setInterval(moveAnimation, animDelay);
    }
    function stopAnimation(){
        clearInterval(interval);
    }

    function changeAnimSpeed(){
        let speed = animSpeed/10;
        if(speed > 2){
            animDelay = animDelaymin*2 - animDelaymin * (speed - Math.floor(speed));
            frameSkip = Math.floor(speed)-1;
        }else{
            animDelay = (animDelaymin*2*2) / speed;
            frameSkip = 1;
        }
    }
    function resetAnimation(){
        changeAnimSpeed();
        stopAnimation();
        startAnimation();
    }

    function moveAnimation(){
        animIteration += Math.floor(frameSkip);
        if(animIteration > fragments.length){
            animIteration = 0;
        }
    }
    function getFragmentedRoute(routeId, routes){
        let result = [];
        let route = routes[selectedRoute];
        if(route){
            let points = route.points.slice(1, route.points.length);
            for(let p of points){
                let pathCords = p.start? $paths[p.id].points.slice().reverse() : $paths[p.id].points.slice();
                let fragments = fragmentPath(pathCords, 20);
                result = result.concat(fragments);
            }
        }
        return result;
    }

    function fragmentPath(points, maxDist){
        let result = [];
        for(let i = 0; i+1 < points.length; i++){
            let p1 = points[i];
            let p2 = points[i+1];
            let dist = distanceBetween(p1, p2);
            if(dist > maxDist){
                let fragments = splitLine(p1, p2, Math.floor(dist/maxDist));
                for(let j=0; j+1 < fragments.length; j++){
                    result.push([fragments[j], fragments[j+1]]);
                }
            }else{
                result.push([p1,p2]);
            }
        }
        return result;
    }

    function splitLine(p1, p2, count){
        let result = [];
        let width = p2.x - p1.x;
        let height = p2.y - p1.y;
        let segmentX = width / count;
        let segmentY = height / count;
        for(let i = 0; i <= count; i++){
            result.push({
                x: p1.x + segmentX * i,    //newX
                y: p1.y + segmentY * i     //newY
            });
        }
        return result;
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
    function handleResize(){
        scaleX = svg.getBoundingClientRect().width / 2000;
        scaleY = svg.getBoundingClientRect().height / 2000;
        $routes = $routes;
    }
</script>

<style>
.container{
    background: #555;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-flow: column;
}
.container .toolbar{
    flex: 0 1 auto;
}
.container .display{
    flex: 1 1 auto;
    background: #fff;
    position: relative;
    z-index: 0;
}
.display img{
    width: 100%;
    height: 100%;
    position: absolute;
    top:0;
    left:0;
    opacity: 0.5;
    z-index: -1;
}
.display svg{
    width: 100%;
    height: 100%;
}
polyline{
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke: #ececec71;
}
polyline {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
}
polyline.normal{
    stroke: #ececec71;
    transition:all ease-out 1.5s;
}
.highlighted{
    stroke: yellow!important;
    stroke-width: 15px!important;
}
</style>