<svelte:head>
	<title>TM Cut Finder</title>
</svelte:head>
{#if $imgSrc == ""}
<h2>Upload Screenshot of map:</h2>
<ImgUploader/>
{:else}
<div class="fullscreen">
	<Editor/>
</div>
<RouteGenerator/>
<div class="fullscreen">
	<RoutesViewer />
</div>
{/if}

<script>
	import {imgSrc} from '../store';
	import ImgUploader from '../components/getImage.svelte';
	import Editor from '../components/Editor.svelte';
	import RouteGenerator from '../components/RouteGenerator.svelte';
	import RoutesViewer from '../components/RoutesViewer.svelte';
</script>

<style>
.fullscreen{
	width: 100%;
	height: 100vh;
}
h2{
	color: whitesmoke;
}
</style>



