
<div class={`container ${opened? "":"closed"}`}>
    {#if $junctions[$selectedJun]}
    <!-- Edit Junction -->
    <div class="header" style={`background-color:${shapeProps.junctions[$junctions[$selectedJun].type].color}bd`}>
        <div class="id">{$selectedJun}</div>
        <div class="title">{$junctions[$selectedJun].type == "checkpoint"? `Checkpoint ${$junctions[$selectedJun].num}` : "Junction"}</div>
    </div>
    <div class="body" style={`background-color:${shapeProps.junctions[$junctions[$selectedJun].type].color}5b`}>
        <div class="otherTypes">
        {#each JunTypes.filter(x=>x!== $junctions[$selectedJun].type) as JType}
            <div class="type" on:click={()=>{junctions.changeType($selectedJun, JType)}} style={`background-color:${shapeProps.junctions[JType].color};`}>
                {JType}
            </div>
        {/each}
        </div>
        <button on:click={()=>{deleteJun()}} >
            delete
        </button>
        <div class="connected">
        {#each $junctions[$selectedJun].paths as p}
            <div class="point" on:click={()=>{$selectedJun = -1; $selectedPath = p.id}}>
                 {`${p.id} Path`}
            </div>
        {/each}
        </div>
    </div>
    {:else if $paths[$selectedPath]}
    <!-- Edit Path -->
    <div class="header" style={`background-color:${shapeProps.paths[$paths[$selectedPath].type].color}bd`}>
        <div class="id">{$selectedPath}</div>
        <div class="title">Path</div>
    </div>
    <div class="body" style={`background-color:${shapeProps.paths[$paths[$selectedPath].type].color}5b`}>
        <div class="otherTypes">
        {#each PathTypes.filter(x=>x!== $paths[$selectedPath].type) as PType}
            <div class="type" on:click={()=>{paths.changeType($selectedPath, PType)}} style={`background-color:${shapeProps.paths[PType].color};`}>
                {PType}
            </div>
        {/each}
        </div>
        <button on:click={()=>{deletePath()}} >
            delete
        </button>
        <div class="connected">
        </div>
    </div>
    {/if}
</div>
<button class="toggle-btn" on:click={()=>{opened = !opened}}>{opened? "-":"+"}</button>


<script>
    import {selectedPath, selectedJun, paths, junctions} from '../store.js';
    import shapeProps from '../assets/shapeTypeProperties.js';
    $: JunTypes = Object.keys(shapeProps.junctions);
    $: PathTypes = Object.keys(shapeProps.paths);

    function deleteJun(){
        console.log(`deltete jun ${$selectedJun}`);
        junctions.delete($selectedJun);
        //$selectedJun = -1;
    }

    function deletePath(){
        console.log(`delete path ${$selectedPath}`);
        paths.delete($selectedPath);
        //$selectedPath = -1;
    }
    let opened = true;
</script>

<style>
button{
    border: none;
    border-radius: 6px;
}
button:focus{
    outline: none;
}
.container{
    overflow: hidden;
    width: 100%;
    border-radius: 6px;
    background: #ffffff;
    float: right;
    transition: all 0.2s;
}
.header{
    padding: 5px 35px 5px 5px;
    display: flex;
    flex-flow: row;
    align-items: center;
    color: whitesmoke;
}
.header .id{
    background: #0f3479b0;
    height: 25px;
    margin: 0 5px;
    padding: 0 7px;
    text-align: center;
    border-radius: 50%;
}
.body{
    display: flex;
    flex-flow: column;
    align-items: center;
    text-align: center;
    padding: 5px;
}
.body .otherTypes{
    display: flex;
    flex-flow: column;
    align-items: stretch;
    width: fit-content;
    margin: auto;
    padding: 3px;
}
.otherTypes .type{
    text-align: center;
    border: #141d6f 1px solid;
    color: whitesmoke;
    border-radius: 6px;
    margin: 3px 0;
    padding: 2px;
    user-select: none;
    cursor: pointer;
}
.connected .point{
    background: #295099;
    color: whitesmoke;
    margin: 5px;
    border-radius: 6px;
    padding: 3px;
}
.toggle-btn{
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    border-radius: 6px;
    background: #14419475;
    color: whitesmoke;
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
}
.closed{
    width: 0;
}
</style>