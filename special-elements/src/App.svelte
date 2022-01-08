<script>
  import CartItem from './CartItem.svelte';
  import FamilyNode from './FamilyNode.svelte';
  import Product from './Product.svelte';

  let y;

  $: console.log(y);

  let currentTitle = 'My App';

  let familyStructure = [
    {
      isParent: true,
      name: 'Dan',
      children: [
        {
          isParent: true,
          name: 'Jordan',
          children: [{ isParent: false, name: 'Natalia' }],
        },
      ],
    },
    {
      isParent: true,
      name: 'Sherry',
      children: [],
    },
  ];

  let renderedComponent = { cmp: Product, title: 'Test Product', id: 'p1' };

  function toggle() {
    if (renderedComponent.cmp === Product) {
      renderedComponent = { cmp: CartItem, title: 'Another Product', id: 'p2' };
    } else {
      renderedComponent = { cmp: Product, title: 'Test Product', id: 'p1' };
    }
  }

  function switchTitle() {
    currentTitle = 'A New Title';
  }
</script>

<svelte:window bind:scrollY={y} />
<svelte:head><title>{currentTitle}</title></svelte:head>

<div>
  <button on:click={switchTitle}>Switch Title</button>
  <button on:click={toggle}>Toggle Display</button>

  <svelte:component
    this={renderedComponent.cmp}
    title={renderedComponent.title}
    id={renderedComponent.id}
  />

  {#each familyStructure as familyMember}
    <FamilyNode member={familyMember} />
  {/each}
</div>

<style>
  div {
    height: 3000px;
  }
</style>
