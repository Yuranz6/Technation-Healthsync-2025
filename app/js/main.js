const fontAwesomeScript = document.createElement("script");
fontAwesomeScript.src = "https://kit.fontawesome.com/c9fbfc084b.js";
fontAwesomeScript.crossOrigin = "anonymous"; // Set the crossorigin attribute
document.head.appendChild(fontAwesomeScript);

import { createClient } from "https://esm.sh/@supabase/supabase-js";

window.supabase = null;
async function initializeSupabase() {
    try {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        
        // Use environment config if available, otherwise fallback
        let backendApiUrl = 'http://localhost:5001';
        if (typeof window !== 'undefined' && window.EnvConfig) {
            backendApiUrl = window.EnvConfig.getBackendApiUrl();
        } else {
            // Fallback detection
            if (!isLocal) {
                backendApiUrl = 'https://technation-healthsync-2025.onrender.com';
            }
        }
        
        if (isLocal) {
            const response = await fetch(`${backendApiUrl}/keys`);
            const { SUPABASE_URL, SUPABASE_KEY } = await response.json();

            supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            
            console.log("Supabase initialized.");
        } else {
            // In production, try to get from backend API or use config
            try {
                const response = await fetch(`${backendApiUrl}/keys`);
                const { SUPABASE_URL, SUPABASE_KEY } = await response.json();
                supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
                console.log("Supabase initialized from backend API.");
            } catch (apiError) {
                // Fallback to config.js if backend API fails
                console.warn("Backend API unavailable, using config.js");
                if (typeof config !== 'undefined') {
                    supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
                    console.log("Supabase initialized from config.");
                } else {
                    throw new Error("Unable to initialize Supabase: no backend API or config available");
                }
            }
        }

    } catch (error) {
        console.error("Error initializing Supabase:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initializeSupabase();
    document.dispatchEvent(new Event("supabaseReady"));

    let currentPage = window.location.pathname.split("/").pop(); // Get current file name
    document.querySelectorAll(".nav-links a").forEach(link => {
        if (link.getAttribute("href") === currentPage || 
            (currentPage === "" && link.getAttribute("href") === "index.html")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});


/* === ✅ 1. Highlight the Current Page in the Navbar === */
function highlightActivePage() {
    let currentPage = window.location.pathname.split("/").pop(); // Get current file name
    document.querySelectorAll(".nav-links a").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
}
