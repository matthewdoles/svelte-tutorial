<script>
  import Header from './UI/Header.svelte';
  import MeetupItem from './Meetups/MeetupItem.svelte';

  const meetups = [
    {
      id: 'm1',
      title: 'Coding Bootcamp',
      subtitle: 'Learn to code in 2 hours',
      description:
        'In this meetup, we will have some experts that teach you how to code',
      imageURL: '',
      address: '27th Street Road, 32523 New York',
      contactEmail: 'code@test.com',
    },
    {
      id: 'm1',
      title: 'Swim Together',
      subtitle: "Let's go swimming",
      description: 'We will simply swim some laps',
      imageURL: '',
      address: '27th Street Road, 32523 New York',
      contactEmail: 'code@test.com',
    },
  ];
</script>

<Header />
<section id="meetups">
  {#each meetups as meetup}
    <MeetupItem />
  {/each}
</section>

<style>
  #meetups {
    margin-top: 5rem;
  }
</style>
