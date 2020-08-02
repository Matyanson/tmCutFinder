<button on:click={()=>tool.set(-1)}>Select</button>
<button on:click={()=>tool.set(0)}>Track</button>
<button on:click={()=>tool.set(1)}>Junction</button>
<button on:click={()=>newPath()}>New Path</button>
{#if $tool == 0}
    <button on:click={()=>pathType.set("normal")}>normal</button>
    <button on:click={()=>pathType.set("cut")}>1Way</button>
    {:else if $tool == 1}
    <button on:click={()=>junType.set("normal")}>normal</button>
    <button on:click={()=>junType.set("checkpoint")}>Checkpoint</button>
    <button on:click={()=>junType.set("start")}>Start</button>
    <button on:click={()=>junType.set("finish")}>Finish</button>
{/if}

<script>
    import { tool, pathType, junType, paths, selectedPath } from '../store.js';
    function newPath(){
        console.log($paths);
        $selectedPath = paths.new();
        console.log($paths);
    }
</script>