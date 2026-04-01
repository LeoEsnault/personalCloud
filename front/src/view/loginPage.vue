<template>
  <section class="flex h-screen w-screen justify-center">
    
    <div class="flex flex-col w-[60vw] max-w-150 h-fit gap-4 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      
      <h1 class="text-2xl font-bold mb-4 text-gray-800">Connexion</h1>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Mon Email</label>
        <input 
          type="email" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          v-model="email"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Mot de passe</label>
        <input 
          type="password" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          v-model="password"
        />
      </div>

      <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
      @click="login"
      :disabled="loading === true"
      >
        Se connecter
      </button>

    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const authStore = useAuthStore()

async function login(){
    loading .value = true
try{
  const { error } = await authStore.login(email.value, password.value)
  if (error) {   
     console.error('Login error:', error)
    
  }  
  else {
    router.push('/dashboard')
  }
}
catch (error) {
  console.error('Error signing in:', error)
} finally {
  loading.value = false
}
}

onMounted(() => {
  async function onMount() {
    
  try{
  const error = await authStore.checkSessionAndRedirect()
  if (error){
    console.error('Session check error:', error)
    router.push('/')
  }
  else {
    router.push('/dashboard')
  }
  }
  catch (error) {
    console.error('Error checking session:', error)
  }
  }
  onMount()
})

</script>

<style scoped>

</style>