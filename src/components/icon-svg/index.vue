<template>
  <svg
    class="icon-svg"
    :class="`icon-svg__${name}`"
    :width="width"
    :height="height"
    aria-hidden="true">
    <use :xlink:href="`#icon-${name}`"></use>
  </svg>
</template>

<script>
export default {
  name: 'icon-svg',
  props: {
    name: {
      type: String,
      required: true
    },
    width: {
      type: String
    },
    height: {
      type: String
    }
  }
}
</script>

<style>
  .icon-svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
