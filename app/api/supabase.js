import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    try {
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_KEY;
        
        if (!SUPABASE_URL || !SUPABASE_KEY) {
            return res.status(400).json({ error: 'Supabase URL or key not defined.' });
        }
        
        // Server-side use, modifications, etc.
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // Client-side use, public access
        res.status(200).json({
            SUPABASE_URL,
            SUPABASE_KEY
        });
    } catch (error) {
        res.status(500).json({ error: 'Error initializing Supabase', details: error.message });
    }
}