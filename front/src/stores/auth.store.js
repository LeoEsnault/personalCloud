import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase/supabase'

export const useAuthStore = defineStore('auth', () => {

    async function login(email, password) {
        try{
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        if(error){
            throw error
        }
        if(data){
               const user_id = data.user.id
                localStorage.setItem('user_id', user_id)

                const token = data.session.access_token
                localStorage.setItem('token', token)
            return data
        } 
         }
        catch (error) {
        console.error('Error signing in:', error)
        } 
        }
    
    async function checkSessionAndRedirect() {
    try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
        console.error('Erreur session :', error.message)
        return
        }
        if (data.session) {
        return
        }
        if (!data.session) {
        return error
        }
    } catch (err) {
        console.error('Erreur inattendue :', err)
    }
    }
    async function logout() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) {
                throw error
            }
            localStorage.removeItem('user_id')
            localStorage.removeItem('token')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }
  return { login, checkSessionAndRedirect, logout }
})
