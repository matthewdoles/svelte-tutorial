<script>
  import { onMount } from 'svelte';

  let hobbies = [];
  let hobbyInput;
  let isLoading = true;

  onMount(() => {
    fetch(
      'https://svelte-course-doles-default-rtdb.firebaseio.com/hobbies.json'
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then((data) => {
        hobbies = Object.values(data);
        let keys = Object.keys(data);
        console.log(keys);

        for (const key in data) {
          console.log(key, data[key]);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        isLoading = false;
      });
  });

  function addHobby() {
    hobbies = [...hobbies, hobbyInput.value];

    isLoading = true;
    fetch(
      'https://svelte-course-doles-default-rtdb.firebaseio.com/hobbies.json',
      {
        method: 'POST',
        body: JSON.stringify(hobbyInput.value),
        headers: { 'Content-Type': 'application/json' },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed!');
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        isLoading = false;
      });
  }
</script>

<label for="hobby">Hobby</label>
<input type="text" id="hobby" bind:this={hobbyInput} />
<button on:click={addHobby}>Add Hobby</button>

{#if isLoading}
  <p>Loading...</p>
{:else}
  <ul>
    {#each hobbies as hobby}
      <li>{hobby}</li>
    {/each}
  </ul>
{/if}
