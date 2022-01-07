<script>
  import meetups from './Meetups/mettups-store';
  import Header from './UI/Header.svelte';
  import MeetupGrid from './Meetups/MeetupGrid.svelte';
  import Button from './UI/Button.svelte';
  import EditMeetup from './Meetups/EditMeetup.svelte';
  import MeetupDetail from './Meetups/MeetupDetail.svelte';
  import Spinner from './UI/Spinner.svelte';

  let editMode;
  let editedId;
  let page = 'overview';
  let pageData = {};
  let isLoading = true;

  fetch('https://svelte-course-doles-default-rtdb.firebaseio.com/meetups.json')
    .then((res) => {
      if (!res.ok) {
        throw new Error('Fetching meetups failed, please try again later.');
      }
      return res.json();
    })
    .then((data) => {
      const loadedMeetups = [];
      for (const key in data) {
        loadedMeetups.push({ id: key, ...data[key] });
      }
      setTimeout(() => {
        isLoading = false;
        meetups.setMeetups(loadedMeetups);
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {});

  function savedMeetup(event) {
    editMode = null;
  }

  function cancelEdit() {
    editMode = null;
    editedId = null;
  }

  function showDetails(event) {
    page = 'details';
    pageData.id = event.detail;
  }

  function closeDetails() {
    page = 'overview';
    pageData = {};
  }

  function startEdit(event) {
    console.log(event);
    editMode = 'edit';
    editedId = event.detail;
  }
</script>

<Header />

<main>
  {#if page === 'overview'}
    {#if editMode === 'edit'}
      <EditMeetup id={editedId} on:save={savedMeetup} on:cancel={cancelEdit} />
    {/if}
    {#if isLoading}
      <Spinner />
    {:else}
      <MeetupGrid
        meetups={$meetups}
        on:showdetails={showDetails}
        on:edit={startEdit}
        on:add={() => (editMode = 'edit')}
      />
    {/if}
  {:else}
    <MeetupDetail id={pageData.id} on:close={closeDetails} />
  {/if}
</main>

<style>
  main {
    margin-top: 5rem;
  }
  .meetup-controls {
    margin: 1rem;
  }
</style>
