import config from './config.js'; // Import API keys

const { createClient } = supabase;
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

// ✅ Handle Form Submission
document.getElementById("patient-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);

    // Convert FormData to an Object
    let formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value.trim();
    });

    console.log("Submitting to Supabase:", formObject);

    // ✅ Validate Required Fields
    if (!formObject.name || !formObject.dob || !formObject.age) {
        showResponseMessage("Error: Please fill in all required fields.", "red");
        return;
    }

    // ✅ Insert Data into Supabase
    const { data, error } = await supabase
        .from("patients") // Replace with your Supabase table name
        .insert([formObject]);

    if (error) {
        console.error("Error submitting to Supabase:", error);
        showResponseMessage("Error submitting form. Please try again.", "red");
    } else {
        console.log("Successfully submitted:", data);
        showResponseMessage("Form submitted successfully!", "green");
        document.getElementById("patient-form").reset();
        fetchPatientData(); // Refresh patient list
    }
});

// ✅ Function to Show Response Messages
function showResponseMessage(message, color) {
    const messageElement = document.getElementById("response-message");
    messageElement.style.display = "block";
    messageElement.style.color = color;
    messageElement.textContent = message;
}

// ✅ Fetch Patient Data from Supabase
async function fetchPatientData() {
    const { data, error } = await supabase
        .from("patients") // Replace with your Supabase table name
        .select("*");

    if (error) {
        console.error("Error fetching patients:", error);
        showResponseMessage("Error retrieving patient data.", "red");
        return;
    }

    console.log("Retrieved Patients:", data);
    displayPatientData(data);
}

// ✅ Display Retrieved Patient Data
function displayPatientData(patients) {
    const resultsContainer = document.getElementById("patient-results");
    resultsContainer.innerHTML = ""; // Clear previous results

    if (patients.length === 0) {
        resultsContainer.innerHTML = "<p>No patient records found.</p>";
        return;
    }

    patients.forEach(patient => {
        const patientDiv = document.createElement("div");
        patientDiv.classList.add("patient-card");
        patientDiv.innerHTML = `
            <h3>${patient.name}</h3>
            <p><strong>DOB:</strong> ${patient.dob}</p>
            <p><strong>Age:</strong> ${patient.age}</p>
            <p><strong>Allergies:</strong> ${patient.allergies || "None"}</p>
            <p><strong>Prescriptions:</strong> ${patient.prescriptions || "None"}</p>
        `;
        resultsContainer.appendChild(patientDiv);
    });
}

// ✅ Load Patient Data on Page Load
document.addEventListener("DOMContentLoaded", fetchPatientData);
