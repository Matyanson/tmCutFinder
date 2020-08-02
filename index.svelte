<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<h2>Upload Image</h2>
<ImgUploader/>
<Editor/>
<RouteGenerator/>
<RoutesViewer />




<script>
	import ImgUploader from '../components/getImage.svelte';
	import Editor from '../components/Editor.svelte';
	import RouteGenerator from '../components/RouteGenerator.svelte';
	import RoutesViewer from '../components/RoutesViewer.svelte';
</script>



