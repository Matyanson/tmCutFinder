<div class="container">
    <div class="toolbar">
        <Toolbar />
    </div>
    <div class="canvas">
        <img src={$imgSrc} alt="TM Map screenshot" >
        <Canvas/>
    </div>
</div>

<script>
    import {imgSrc} from '../store.js';
    import Canvas from './Canvas.svelte';
    import Toolbar from './Toolbar.svelte';
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
.container .canvas{
    flex: 1 1 auto;
    background: #fff;
    position: relative;
    z-index: 0;
}
.container .canvas img{
    width: 100%;
    height: 100%;
    position: absolute;
    top:0;
    left:0;
    opacity: 0.5;
    z-index: -1;
}
</style>