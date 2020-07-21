<button on:click={()=>tool.set(-1)}>Select</button>
<button on:click={()=>tool.set(0)}>Track</button>
<button on:click={()=>tool.set(1)}>Junction</button>
{#if $tool == 0}
    <button on:click={()=>trackType.set("normal")}>normal</button>
    <button on:click={()=>trackType.set("cut")}>1Way</button>
    {:else if $tool == 1}
    <button on:click={()=>junType.set("normal")}>normal</button>
    <button on:click={()=>junType.set("checkpoint")}>Checkpoint</button>
    <button on:click={()=>junType.set("start")}>Start</button>
    <button on:click={()=>junType.set("finish")}>Finish</button>
{/if}

<script>
    import { tool, trackType, junType } from '../store.js'; 
</script>