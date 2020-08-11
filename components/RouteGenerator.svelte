<div>
    <SettingsComp bind:settings={settings} />
    <button on:click={()=>{startWorker()}} >Start</button>
	<button on:click={()=>{stopWorker()}} >Stop</button>
	{#if generating}
    	{ percentage }
		<p>Generating!!!</p>
	{/if}
</div>
<script>
    import SettingsComp from './GeneratorSettings.svelte';
    import { paths, junctions, routes } from '../store';
    let settings;
    let percentage = 0;
    let generating = false;
    let w;

    function startWorker(){
        console.log("starting woker");
		if(typeof(Worker) !== "undefined" && !w) {
			w = new Worker("./myWorker.js");
			w.postMessage({
				type: "calculate",
				data: {
					paths: $paths,
					junctions: $junctions,
					settings
				}
			});
			generating = true;
			w.onmessage = function(event) {
                let d = event.data;
                if(d.type){
                    switch(d.type){
						case "finished":
							$routes = d.data;
							generating = false;
							w = undefined;
							break;
						case "updated":
							$routes = d.data;
							break;
						default:
							console.log("unknown post from Worker");
                    		console.log(d);
							break;
                    }
                }
			};
		}
	}
	function stopWorker() {
		if(w){
			w.terminate();
			w = undefined;
			generating = false;
		}
	}
</script>