<script>
  import meetups from '../../mettups-store';
  import { createEventDispatcher } from 'svelte';
  import Button from '../UI/Button.svelte';
  import TextInput from '../UI/TextInput.svelte';
  import Modal from '../UI/Modal.svelte';
  import { isValidEmail, notEmpty } from '../../helpers/validation';

  export let id = null;
  let title = '';
  let subtitle = '';
  let address = '';
  let email = '';
  let description = '';
  let imageUrl = '';

  if (id) {
    const unsubscribe = meetups.subscribe((items) => {
      const selectedMeetup = items.find((i) => i.id === id);
      title = selectedMeetup.title;
      subtitle = selectedMeetup.subtitle;
      address = selectedMeetup.address;
      email = selectedMeetup.contactEmail;
      description = selectedMeetup.description;
      imageUrl = selectedMeetup.imageUrl;
    });
    unsubscribe();
  }

  const dispatch = createEventDispatcher();

  $: titleValid = !notEmpty(title);
  $: subtitleValid = !notEmpty(subtitle);
  $: addressValid = !notEmpty(address);
  $: emailValid = !isValidEmail(email);
  $: descriptionValid = !notEmpty(description);
  $: imageUrlValid = !notEmpty(imageUrl);
  $: formIsValid =
    titleValid &&
    subtitleValid &&
    addressValid &&
    emailValid &&
    descriptionValid &&
    imageUrlValid;

  function submitForm() {
    const meetupData = {
      title,
      subtitle,
      address,
      email,
      description,
      imageUrl,
    };

    if (id) {
      fetch(
        `https://svelte-course-doles-default-rtdb.firebaseio.com/meetups/${id}.json`,
        {
          method: 'PATCH',
          body: JSON.stringify(meetupData),
          headers: { 'Content-Type': 'application/json' },
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed!');
          }
          meetups.updateMeetup(id, meetupData);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      fetch(
        'https://svelte-course-doles-default-rtdb.firebaseio.com/meetups.json',
        {
          method: 'POST',
          body: JSON.stringify({ ...meetupData, isFavorite: false }),
          headers: { 'Content-Type': 'application/json' },
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed!');
          }
          return res.json();
        })
        .then((data) => {
          meetups.addMeetup({
            ...meetupData,
            isFavorite: false,
            id: data.name,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
    dispatch('save');
  }

  function cancel() {
    dispatch('cancel');
  }

  function deleteMeetup() {
    fetch(
      `https://svelte-course-doles-default-rtdb.firebaseio.com/meetups/${id}.json`,
      { method: 'DELETE' }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed!');
        }
        meetups.removeMeetup(id);
      })
      .catch((err) => console.log(err));
    dispatch('save');
  }
</script>

<Modal title="Edit Meetup Data" on:cancel>
  <form on:submit|preventDefault={submitForm}>
    <TextInput
      id="title"
      label="Title"
      valid={titleValid}
      validityMessage="Please enter a valid title"
      value={title}
      on:input={(event) => (title = event.target.value)}
    />
    <TextInput
      id="subtitle"
      label="Subtitle"
      valid={subtitleValid}
      validityMessage="Please enter a valid subtitle"
      value={subtitle}
      on:input={(event) => (subtitle = event.target.value)}
    />
    <TextInput
      id="address"
      label="Adress"
      valid={addressValid}
      validityMessage="Please enter a valid address"
      value={address}
      on:input={(event) => (address = event.target.value)}
    />
    <TextInput
      id="imageUrl"
      label="Image URL"
      valid={imageUrlValid}
      validityMessage="Please enter a valid image url"
      value={imageUrl}
      on:input={(event) => (imageUrl = event.target.value)}
    />
    <TextInput
      id="email"
      label="Email"
      valid={emailValid}
      validityMessage="Please enter a valid email address"
      type="email"
      value={email}
      on:input={(event) => (email = event.target.value)}
    />
    <TextInput
      id="description"
      label="Description"
      valid={descriptionValid}
      validityMessage="Please enter a valid description"
      controlType="textarea"
      rows="3"
      bind:value={description}
    />
  </form>
  <div slot="footer">
    <Button type="button" mode="outline" on:click={cancel}>Cancel</Button>
    <Button type="button" on:click={submitForm} disabled={!formIsValid}
      >Save</Button
    >
    {#if id}
      <Button type="button" on:click={deleteMeetup}>Delete</Button>
    {/if}
  </div>
</Modal>

<style>
  form {
    width: 100%;
  }
</style>
