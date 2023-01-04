<script>
  import Component from "./Component.svelte";
  import Shared from "$lib/components/Shared.svelte";
  import guardianLogoUrl from "$assets/guardian-logo.svg"

</script>

<div class="atom">
  <p>Guardian logo</p>
  <img
    src={guardianLogoUrl}
    alt="Guardian frontpage"
  />

  <img
    src="../assets/guardian-logo.svg"
    alt="Guardian frontpage"
  />

  <Shared></Shared>
  <Component></Component>
</div>

<style lang="scss">
  p {
    @include f-headline();
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
  }
</style>
