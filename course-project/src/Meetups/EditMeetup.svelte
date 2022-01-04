<script>
  import meetups from './mettups-store';
  import { createEventDispatcher } from 'svelte';
  import Button from '../UI/Button.svelte';
  import TextInput from '../UI/TextInput.svelte';
  import Modal from '../UI/Modal.svelte';
  import { isValidEmail, notEmpty } from '../helpers/validation';

  let title = '';
  let subtitle = '';
  let address = '';
  let email = '';
  let description = '';
  let imageUrl = '';

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
    const newMeetup = {
      title,
      subtitle,
      address,
      email,
      description,
      imageUrl,
    };

    meetups.addMeetup(newMeetup);
    dispatch('save');
  }

  function cancel() {
    dispatch('cancel');
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
  </div>
</Modal>

<style>
  form {
    width: 100%;
  }
</style>
