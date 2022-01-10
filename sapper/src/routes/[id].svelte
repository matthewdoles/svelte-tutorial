<script context="module">
  export function preload(page) {
    console.log(page);
    const meetupId = page.params.id;

    return this.fetch(
      `https://svelte-course-doles-default-rtdb.firebaseio.com/meetups/${meetupId}.json`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Fetching meetups failed, please try again later.');
        }
        return res.json();
      })
      .then((meetupData) => {
        return { loadedMeetup: { ...meetupData, id: meetupId } };
      })
      .catch((err) => {
        this.error(404, 'Could not fetch meetup.');
      });
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../components/UI/Button.svelte';

  export let loadedMeetup;

  const dispatch = createEventDispatcher();
</script>

<section>
  <div class="image">
    <img src={loadedMeetup.imageUrl} alt={loadedMeetup.title} />
  </div>
  <div class="content">
    <h1>{loadedMeetup.title}</h1>
    <h2>{loadedMeetup.subtitle} - {loadedMeetup.address}</h2>
    <p>{loadedMeetup.description}</p>
    <Button href="mailto:{loadedMeetup.contactEmail}">Contact</Button>
    <Button type="button" mode="outline" href="/">Close</Button>
  </div>
</section>

<style>
  section {
    margin-top: 4rem;
  }

  .image {
    width: 100%;
    height: 25rem;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image {
    background: #e7e7e7;
  }

  .content {
    text-align: center;
    width: 80%;
    margin: auto;
  }

  h1 {
    font-size: 2rem;
    font-family: 'Roboto Slab', sans-serif;
    margin: 0.5rem 0;
  }

  h2 {
    font-size: 1.25rem;
    color: #6b6b6b;
  }

  p {
    font-size: 1.5rem;
  }
</style>
