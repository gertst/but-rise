<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style>
body {
  font-family: Calibri, 'Trebuchet MS', sans-serif, sans-serif;
  margin: 0;
  padding: 20px 20px;
}

p {
  margin: 0 0;
  padding: 0 0;
}

nav {
  a {
    padding-right: 10px;
  }
}
</style>
