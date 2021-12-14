<script>
  import CustomInput from './CustomInput.svelte';
  import Toggle from './Toggle.svelte';
  import { isValidEmail } from './validation';

  let val = 'Matthew';
  let price = 0;
  let selectedOption = 2;
  let agreed;
  let favColor = 'green';
  let singleFavColor = 'red';
  let usernameInput;
  let someDiv;
  let customInput;
  let enteredEmail = '';
  let formIsValid = false;

  $: if (isValidEmail(enteredEmail)) {
    formIsValid = true;
  } else {
    formIsValid = false;
  }

  $: console.log(price);
  $: console.log(agreed);
  $: console.log(favColor);
  $: console.log(singleFavColor);
  $: console.log(customInput);

  function setValue(event) {
    val = event.target.value;
  }

  function saveData() {
    // console.log(document.querySelector('#username').value);
    console.log(usernameInput.value);
    console.log(usernameInput);
    console.log(someDiv);
    customInput.empty();
  }
</script>

<!-- <input type="text" value={val} on:input={setValue} /> -->
<!-- <input type="text" bind:value={val} /> -->
<CustomInput bind:val bind:this={customInput} />
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

<select bind:value={singleFavColor}>
  <option value="green">Green</option>
  <option value="red">Red</option>
  <option value="blue">Blue</option>
</select>

<hr />

<input type="text" id="username" bind:this={usernameInput} />
<button on:click={saveData}>Save</button>

<div bind:this={someDiv} />

<hr />

<form on:submit|preventDefault>
  <input
    type="email"
    bind:value={enteredEmail}
    class={isValidEmail(enteredEmail) ? '' : 'invalid'}
  />
  <button type="submit" disabled={!formIsValid}>Save</button>
</form>

<style>
  .invalid {
    border: 1px solid red;
  }
</style>
