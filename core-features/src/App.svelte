<script>
  export let name = 'Matthew';
  export let age = 26;

  $: upperCaseName = name.toUpperCase();

  $: console.log(name);

  $: if (name === 'Matt') {
    age = 27;
  }

  function incrementAge() {
    age += 1;
  }

  function changeName() {
    name = 'Matt';
  }

  function nameInput(e) {
    name = e.target.value;
  }
</script>

<h1>Hello {upperCaseName}, my age is {age}</h1>
<button on:click={incrementAge}>Change Age</button>
<!-- <button on:click={changeName}>Change Name</button>

<input type="text" value={name} on:input={nameInput} /> -->
<input type="text" bind:value={name} />

<style>
  h1 {
    color: purple;
  }
</style>
