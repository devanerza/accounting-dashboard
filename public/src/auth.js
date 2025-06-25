import { supabase } from './supabaseClient.js';

export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        // console.log(data); (Uncomment for testing)
        return data;
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

export async function signOut() {
    try {
        const { data, error } = await supabase.auth.signOut();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

export async function checkSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && session.user){
            // console.log(session.user); (Uncomment for testing)
            return session.user;
        } else {
            console.warn('No session found');
            return null;
        }
    } catch (error) {
        console.error('Error checking session:', error);
        throw error;
    }
}
