{#if $routes != []}
<div class="container">
    <div class="selector">
        {#each $routes as r,i }
        <div class={`route ${i == selectedRoute? "selected":""}`} on:click={()=>{selectedRoute = i}} >
            {`${i}.`}
            <div class="dist">{Math.floor(r.dist)}</div>
            <div class="cps">{r.cps.join('-')}</div>
        </div>
        {/each}
    </div>
    {#if selectedRoute > -1}
    <div class="viewer"><Replay selectedRoute={selectedRoute}/></div>
    {/if}
</div>
{/if}

<script>
    import {routes} from "../store.js";
    import Replay from './RouteReplay.svelte';
    let selectedRoute = -1;
</script>

<style>
.container{
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;
}
.selector{
    flex: 0 1 auto;
    padding: 3px;
    background: #22223d;
    color: white;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
}
.selector .route{
    background: #2e2e61;
    color: white;
    border-radius: 6px;
    margin: 0 5px;
    padding: 3px;
    display: flex;
    flex-flow: row nowrap;
}
.route.selected{
    background: #474799;
}
.route .dist{
    background: #585868;
    border-radius: 6px;
    margin: 0 5px;
    padding: 3px;
}
.route .cps{
    
    background: #828343;
    border-radius: 6px;
    margin: 0 5px;
    padding: 3px;
}
.viewer{
    flex: 1 1 auto;
}
</style>