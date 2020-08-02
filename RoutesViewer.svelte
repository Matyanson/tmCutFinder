
<div class="container">
    <div class="selector">
        {#each $routes as r,i }
        <div class="route" on:click={()=>{selectedRoute = i}} >{r.dist} {r.cps.join(', ')}</div>
        {/each}
    </div>
    <div class="viewer"><Replay selectedRoute={selectedRoute}/></div>
</div>


<script>
    import {routes} from "../store.js";
    import Replay from './RouteReplay.svelte';
    let selectedRoute = -1;
</script>