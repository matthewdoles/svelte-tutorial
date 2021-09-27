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
</script>

<h1>Hello {upperCaseName}, my age is {age}</h1>
<button on:click={incrementAge}>Change Age</button>
<button on:click={changeName}>Change Name</button>

<style>
  h1 {
    color: purple;
  }
</style>
