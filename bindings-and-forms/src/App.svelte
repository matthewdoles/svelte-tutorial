<script>
  import { check_outros } from 'svelte/internal';
  import CustomInput from './CustomInput.svelte';
  import Toggle from './Toggle.svelte';

  let val = 'Matthew';
  let price = 0;
  let selectedOption = 2;
  let agreed;
  let favColor = 'green';

  $: console.log(price);
  $: console.log(agreed);
  $: console.log(favColor);

  function setValue(event) {
    val = event.target.value;
  }
</script>

<!-- <input type="text" value={val} on:input={setValue} /> -->
<!-- <input type="text" bind:value={val} /> -->
<CustomInput bind:val />
<Toggle choosenOption={selectedOption} />

<input type="number" bind:value={price} />

<label>
  <input type="checkbox" bind:checked={agreed} />
  Agree to terms?
</label>

<h3>Favorite Color?</h3>
<label>
  <input type="radio" name="color" value="red" bind:group={favColor} />
  Red
</label>
<label>
  <input type="radio" name="color" value="green" bind:group={favColor} />
  Green
</label>
<label>
  <input type="radio" name="color" value="blue" bind:group={favColor} />
  Blue
</label>
