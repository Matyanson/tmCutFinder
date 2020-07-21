<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<h2>Upload Image</h2>
<ImgUploader/>
<Editor/>
<button>Calculate!</button>



<script>
	import ImgUploader from '../components/getImage.svelte';
	import Editor from '../components/Editor.svelte';
	import { selectedTrack } from '../store.js';
</script>

<style>
	
</style>


