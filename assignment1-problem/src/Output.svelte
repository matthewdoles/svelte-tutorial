<script>
  export let goal;
  $: isHighlighted = goal.includes('!');
</script>

<h1 class:highlight={isHighlighted}>{goal}</h1>

<style>
  .highlight {
    color: red;
  }
</style>
