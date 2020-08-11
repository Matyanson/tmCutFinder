<div class="content">
    <div class="tools">
        <button class={`${$tool == -1? "selected":""}`} on:click={()=>tool.set(-1)}>Select</button>
        <button class={`${$tool == 0? "selected":""}`} on:click={()=>tool.set(0)}>Path</button>
        <button class={`${$tool == 1? "selected":""}`} on:click={()=>tool.set(1)}>Junction</button>
    </div>
    <div class="properties">
        {#if $tool == 0}
        <button on:click={()=>newPath()}>New Path</button>
        <button class={`${$pathType == "normal"? "selected":""}`} on:click={()=>pathType.set("normal")}>normal</button>
        <button class={`${$pathType == "cut"? "selected":""}`} on:click={()=>pathType.set("cut")}>1Way</button>
        {:else if $tool == 1} 
        <button class={`grey ${$junType == "normal"? "selected":""}`} on:click={()=>junType.set("normal")}>normal</button>
        <button class={`yellow ${$junType == "checkpoint"? "selected":""}`} on:click={()=>junType.set("checkpoint")}>Checkpoint</button>
        <button class={`green ${$junType == "start"? "selected":""}`} on:click={()=>junType.set("start")}>Start</button>
        <button class={`red ${$junType == "finish"? "selected":""}`} on:click={()=>junType.set("finish")}>Finish</button>
        {/if}
    </div>
</div>

<script>
    import { tool, pathType, junType, paths, selectedPath } from '../store.js';
    function newPath(){
        console.log($paths);
        $selectedPath = paths.new();
        console.log($paths);
    }
</script>

<style>
button{
    background: #474792;
    color: whitesmoke;
    border-radius: 6px;
    margin: 0 3px;
    border: none;
    text-align: center;
    text-decoration: none;
    font-size: 1.1rem;
}
.selected{
    filter: saturate(0.5) grayscale(1);
}
.grey{
    background: #626299;
}
.yellow{
    background: #697430;
}
.green{
    background: #509247;
}
.red{
    background: #924747;
}
.content{
    display: flex;
    flex-flow: row wrap;
    justify-content: left;
    align-items: center;
    padding: 5px;
    background: #22223d;
}
.tools{
    display: flex;
    flex-flow: column;
    align-items: stretch;
    margin-right: 10px;
    background: #2e2e61;
}
.properties{
    display: flex;
    flex-flow: row wrap;
    justify-content: left;
    align-items: center;
}
</style>