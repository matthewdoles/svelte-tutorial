<script>
  import cartItems from './cart-store';
  import { products } from '../Products/products-store';
  import Button from '../UI/Button.svelte';

  export let title;
  export let price;
  export let id;

  let showDescription = false;
  let description = 'Not available!';
  // let fetchedProducts = [];

  // products.subscribe((prods) => {
  //   fetchedProducts = prods;
  // });

  function displayDescription() {
    showDescription = !showDescription;
    // description = fetchedProducts.find((p) => p.id === id).description;
    const unsubscribe = products.subscribe((prods) => {
      description = prods.find((p) => p.id === id).description;
    });
    unsubscribe();
  }

  function removeFromCart() {
    cartItems.removeItem(id);
  }
</script>

<li>
  <h1>{title}</h1>
  <h2>{price}</h2>
  <Button mode="outline" on:click={displayDescription}>
    {showDescription ? 'Hide Description' : 'Show Description'}
  </Button>
  <Button on:click={removeFromCart}>Remove from Cart</Button>
  {#if showDescription}
    <p>{description}</p>
  {/if}
</li>

<style>
  li {
    margin: 1rem 0;
    border-radius: 5px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    padding: 1rem;
  }

  h1,
  h2 {
    font-size: 1rem;
    margin: 0;
  }

  h2 {
    color: #494949;
    margin-bottom: 1rem;
  }
</style>
