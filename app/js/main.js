const fontAwesomeScript = document.createElement("script");
fontAwesomeScript.src = "https://kit.fontawesome.com/c9fbfc084b.js";
fontAwesomeScript.crossOrigin = "anonymous"; // Set the crossorigin attribute
document.head.appendChild(fontAwesomeScript);

import { createClient } from "https://esm.sh/@supabase/supabase-js";

window.supabase = null;
async function initializeSupabase() {
    try {
        const isLocal = window.location.hostname === "localhost";
        if (isLocal) {
            const response = await fetch("http://localhost:5000/keys");
            const { SUPABASE_URL, SUPABASE_KEY } = await response.json();

            supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            
            console.log("Supabase initialized.");
        } else {
            const response = await fetch('/api/supabase');
            const { SUPABASE_URL, SUPABASE_KEY } = await response.json();

            supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            
            console.log("Supabase initialized.");
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
