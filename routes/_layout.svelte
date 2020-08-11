<script>
	import Nav from '../components/Nav.svelte';

	export let segment;
</script>
<svelte:head>
<style>
	main {
		position: relative;
		margin: 0 auto;
		min-height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-flow: column;
		align-items: center;
	}
	body{
		background: rgb(17,174,215);
		background: linear-gradient(0deg, rgba(0,255,166,1) 35%, rgba(17,174,215,1) 100%);
	}
</style>
</svelte:head>


<Nav {segment}/>

<main>
	<slot></slot>
</main>