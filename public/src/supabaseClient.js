// Import Supabase client from CDN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// Supabase URL & Anon Key
const supabaseUrl = 'https://gtczlhkhhnwiuzrdsziv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y3psaGtoaG53aXV6cmRzeml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NTQ0MzEsImV4cCI6MjA2NDQzMDQzMX0.acNhGKq8XvzEIdoM5k4D8qvl_n77irsS_m1Jj4xqMaE';

// Create and export the Supabase client
export const supabase = createClient(
    `${supabaseUrl}`,
    `${supabaseAnonKey}`
)

// Function to fetch transactions
export async function getTransactions() {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

export async function getTransactionsByMonth(month, year) {
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .gte('date', startDate.toISOString())
            .lt('date', endDate.toISOString())
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

export async function insertTransaction(date, description, type, amount, userId) {
    const transaction = {
        date,
        description,
        type,
        amount,
        user_id: userId,
    };
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction]);
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error inserting transaction:', error);
        return [];
    }
}