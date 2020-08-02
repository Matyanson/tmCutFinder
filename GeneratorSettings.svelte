<input type="number" bind:value={settings.limit} />
max route length: <input type="range" bind:value={settings.maxRouteLength} min={1} max={5} /> {settings.maxRouteLength}
<script>
    export let settings = {
        limit: 10,
        maxRouteLength: 2
    }
</script>