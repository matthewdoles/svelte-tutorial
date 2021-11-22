<script>
  import CustomInput from './CustomInput.svelte';
  import Toggle from './Toggle.svelte';

  let val = 'Matthew';
  let selectedOption = 2;

  function setValue(event) {
    val = event.target.value;
  }
</script>

<!-- <input type="text" value={val} on:input={setValue} /> -->
<!-- <input type="text" bind:value={val} /> -->
<CustomInput bind:val />
<Toggle choosenOption={selectedOption} />
