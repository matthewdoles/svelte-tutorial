<script>
  import meetups from './Meetups/mettups-store';
  import Header from './UI/Header.svelte';
  import MeetupGrid from './Meetups/MeetupGrid.svelte';
  import Button from './UI/Button.svelte';
  import EditMeetup from './Meetups/EditMeetup.svelte';
  import MeetupDetail from './Meetups/MeetupDetail.svelte';

  let editMode;
  let editedId;
  let page = 'overview';
  let pageData = {};

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
      meetups.setMeetups(loadedMeetups);
    })
    .catch((err) => {
      console.log(err);
    });

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
    <MeetupGrid
      meetups={$meetups}
      on:showdetails={showDetails}
      on:edit={startEdit}
      on:add={() => (editMode = 'edit')}
    />
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
