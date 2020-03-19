<script>
	import {total, recovered, dead, actual} from "./store";
</script>

<main>
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
		padding: 2vmin;

		font-size: 10vmin;
		color: #eeeeee;
	}

	.count {
		display: grid;

		grid-column-gap: 4vmin;
		grid-row-gap: 0.5vmin;

		justify-items: end;
		align-self: flex-end;
		justify-self: flex-end;

		font-size: 14vmin;
		color: #eeeeee;

		padding: 2vmin;
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
		width: 100%;

		background-color: #eeeeee;
	}
	.actual {
		grid-row: 5;
		grid-column: 2;
	}
</style>