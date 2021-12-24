import { writable } from 'svelte/store';

const meetups = writable([
  {
    id: 'm1',
    title: 'Coding Bootcamp',
    subtitle: 'Learn to code in 2 hours',
    description:
      'In this meetup, we will have some experts that teach you how to code',
    imageUrl:
      'https://www.lighthouselabs.ca/uploads/post/open_graph_image/459/Coding-vs-programming.jpg',
    address: '27th Street Road, 32523 New York',
    contactEmail: 'code@test.com',
    isFavorite: false,
  },
  {
    id: 'm2',
    title: 'Swim Together',
    subtitle: "Let's go swimming",
    description: 'We will simply swim some laps',
    imageUrl:
      'https://www.ymcarichmond.org/sites/default/files/2021-01/serena-repice-lentini-TVOAbbLL050-unsplash.jpg',
    address: '27th Street Road, 32523 New York',
    contactEmail: 'code@test.com',
    isFavorite: false,
  },
]);

const customMeetupsStore = {
  subscribe: meetups.subscribe,
  addMeetup: (meetupData) => {
    const newMeetup = {
      ...meetupData,
      id: Math.random.toString(),
      isFavorite: false,
    };
    meetups.update((items) => [newMeetup, ...items]);
  },
  toggleFavorite: (id) => {
    meetups.update((items) => {
      const updatedMeetup = { ...items.find((m) => m.id === id) };
      updatedMeetup.isFavorite = !updatedMeetup.isFavorite;
      const meetupIndex = items.findIndex((m) => m.id === id);
      const updatedMeetups = [...items];
      updatedMeetups[meetupIndex] = updatedMeetup;
      return updatedMeetups;
    });
  },
};

export default customMeetupsStore;
