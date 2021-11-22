<script>
  export let choosenOption = 1;
</script>

<button disabled={choosenOption === 1} on:click={() => (choosenOption = 1)}
  >Option 1</button
>
<button disabled={choosenOption === 2} on:click={() => (choosenOption = 2)}
  >Option 2</button
>
