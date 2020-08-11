<script>
	export let segment;
</script>

<style>
	nav {
		margin: 10px 0;
		margin-bottom: 20px;
		font-weight: bold;
		color: #fff;
		padding: 0 1em;
		display: flex;
		flex-flow: row;
		justify-content: center;
		align-items: center;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
		color: #ffffff99;
	}

	[aria-current] {
		position: relative;
		display: inline-block;
		color: #fff;
	}

	[aria-current]::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 7px;
    	background-image: radial-gradient(#ffffff, #ffffff00 80%);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		font-size: 1.7rem;
		padding: 0px 0.5em;
		display: block;
	}
</style>

<nav>
	<ul>
		<li><a aria-current="{segment === undefined ? 'page' : undefined}" href=".">home</a></li>
		<li><a aria-current="{segment === 'about' ? 'page' : undefined}" href="about">about</a></li>

		<!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
		<li><a rel=prefetch aria-current="{segment === 'blog' ? 'page' : undefined}" href="blog">blog</a></li>
	</ul>
</nav>
