<script>
	import {onMount, onDestroy} from 'svelte';
	import _ from 'lodash';
	import * as three from 'three';
	import {total, recovered, dead, actual} from "./stores/data.store";
	import {windowSize} from './stores/common.store';
	import {renderer, composer, camera, triggerGlitch, uniforms} from './gl';

	let mainNode;

	const windowSizeUnsub = windowSize.subscribe(([width, height]) => {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
		composer.setSize(width, height);
	});
	const actualUnsub = actual.subscribe(value => {
		if (value) {
			triggerGlitch();
		}
	});

	let requestAnimationFrameID = null; 

	onMount(() => {
		mainNode.appendChild(renderer.domElement);
		
		const genMoveParams = (prevSign = {x: -1, y: -1}) => {
			const axis = Math.random() > 0.5 ? 'x' : 'y';
			const sign = {...prevSign, [axis]: -1 * prevSign[axis]};
			const delta = Math.random() / 4 + 0.1;
			const t = Math.ceil(400 / delta);
			
			return {
				sign,
				axis,
				delta,
				t
			};
		};

		let moveParams = genMoveParams();
		let i = 0;

		function animate(timestamp) {
			uniforms.iTime.value = timestamp / 1000;
			composer.render();

			if (i === moveParams.t) {
				i = 0;
				moveParams = genMoveParams(moveParams.sign);
			}

			i++;

			camera.position[moveParams.axis] += moveParams.sign[moveParams.axis] * moveParams.delta;
			camera.updateMatrixWorld();

			requestAnimationFrameID = requestAnimationFrame(animate);
		}

		animate();
	});

	onDestroy(() => {
		window.cancelAnimationFrame(requestAnimationFrameID);
		windowSizeUnsub();
		actualUnsub();
	});
</script>

<main bind:this={mainNode}>
	{#if $actual}
	<div class="count">
		<div class="crown-container">
			<img class="crown" src="img/crown.svg" alt="crown"/>
		</div>
		<div class="total">{$total}</div>
		<div class="recovered-minus">−</div>
		<div class="recovered">{$recovered}</div>
		<div class="dead-minus">−</div>
		<div class="dead">{$dead}</div>
		<div class="line"/>
		<div class="actual">{$actual}</div>
	</div>
	{:else}
	<div class="placeholder">
		Loading...
	</div>
	{/if}
</main>

<style>
	main {
		position: relative;

		display: flex;
		justify-content: flex-end;
		align-items: flex-end;
		flex-flow: column;

		height: 100%;
		width: 100%;

		background-color: #1e1e1e;
	}

	.crown {
		width: 10vmin;
		height: 10vmin;

		fill:  #eeeeee;
	}

	.placeholder {
		position: absolute;
		right: 0;
		bottom: 0;

		padding: 2vmin;
		margin: 1vmin;

		background-color: #000000cc;
		border-radius: 5px;

		font-size: 10vmin;
		color: #eeeeee;
	}

	.count {
		position: absolute;
		right: 0;
		bottom: 0;

		display: grid;

		grid-column-gap: 4vmin;
		grid-row-gap: 0.5vmin;

		justify-items: end;
		align-self: flex-end;
		justify-self: flex-end;

		font-size: 14vmin;
		color: #eeeeee;

		padding: 2vmin;
		margin: 1vmin;

		background-color: #000000cc;
		border-radius: 5px;
	}

	.crown-container {
		display: flex;
		align-items: center;
		justify-content: center;

		grid-row: 1;
		grid-column: 1;

		justify-self: center;
	}

	.total {
		grid-row: 1;
		grid-column: 2;
	}

	.recovered-minus {
		grid-row: 2;
		grid-column: 1;
	}

	.recovered {
		grid-row: 2;
		grid-column: 2;

		color: #3C8430;
	}

	.dead-minus {
		grid-row: 3;
		grid-column: 1;
	}

	.dead {
		grid-row: 3;
		grid-column: 2;

		color: #A11F1F;
	}

	.line {
		grid-row: 4;
		grid-column: 2;

		height: 0.3vmin;
		min-height: 1px;
		width: 100%;

		background-color: #eeeeee;
	}
	.actual {
		grid-row: 5;
		grid-column: 2;
	}
</style>