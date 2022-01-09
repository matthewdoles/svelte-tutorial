<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import meetups from '../mettups-store';
  import MeetupItem from '../components/Meetups/MeetupItem.svelte';
  import MeetupFilter from '../components/Meetups/MeetupFilter.svelte';
  import Button from '../components/UI/Button.svelte';
  import EditMeetup from '../components/Meetups/EditMeetup.svelte';
  import Spinner from '../components/UI/Spinner.svelte';

  let fetchedMeetups = [];
  let editMode;
  let editedId;
  let isLoading;
  let favsOnly = false;
  let unsubscribe;

  $: filteredMeetups = favsOnly
    ? fetchedMeetups.filter((m) => m.isFavorite)
    : fetchedMeetups;

  const dispatch = createEventDispatcher();

  onMount(() => {
    unsubscribe = meetups.subscribe((items) => (fetchedMeetups = items));
    isLoading = true;
    fetch(
      'https://svelte-course-doles-default-rtdb.firebaseio.com/meetups.json'
    )
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
        meetups.setMeetups(loadedMeetups.reverse());
      })
      .catch((err) => {
        error = err;
        console.log(err);
      })
      .finally(() => {
        isLoading = false;
      });
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  function setFilter(event) {
    favsOnly = event.detail === 1;
  }

  function savedMeetup(event) {
    editMode = null;
  }

  function cancelEdit() {
    editMode = null;
    editedId = null;
  }

  function startEdit(event) {
    console.log(event);
    editMode = 'edit';
    editedId = event.detail;
  }
</script>

<svelte:head>
  <title>All Meetups</title>
</svelte:head>

{#if editMode === 'edit'}
  <EditMeetup id={editedId} on:save={savedMeetup} on:cancel={cancelEdit} />
{/if}
{#if isLoading}
  <Spinner />
{:else}
  <section id="meetup-controls">
    <MeetupFilter on:select={setFilter} />
    <Button on:click={() => dispatch('add')}>New Meetup</Button>
  </section>
  {#if filteredMeetups.length === 0}
    <p id="no-meetups">No Meetups, you may start adding some.</p>
  {/if}
  <section id="meetups">
    {#each filteredMeetups as meetup (meetup.id)}
      <div transition:scale animate:flip={{ duration: 300 }}>
        <MeetupItem
          id={meetup.id}
          title={meetup.title}
          subtitle={meetup.subtitle}
          description={meetup.description}
          imageUrl={meetup.imageUrl}
          address={meetup.description}
          email={meetup.contactEmail}
          isFav={meetup.isFavorite}
          on:showdetails
          on:edit
        />
      </div>
    {/each}
  </section>
{/if}

<style>
  #meetup-controls {
    margin: 1rem;
    display: flex;
    justify-content: space-between;
  }
  #no-meetups {
    margin: 1rem;
  }

  #meetups {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 1rem;
  }

  @media (min-width: 768px) {
    #meetups {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
