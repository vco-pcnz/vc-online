<template>
  <profile-layout active-tab="about">
    <template #content="{ userInfo }">
      <edit-form :user-info="userInfo" />
    </template>
  </profile-layout>
</template>

<script setup>
import profileLayout from "../components/profile-layout.vue";
import EditForm from './edit-form.vue'
</script>
