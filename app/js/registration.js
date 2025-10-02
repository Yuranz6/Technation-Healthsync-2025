document.getElementById("patient-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);

    // Convert FormData to JSON object
    let formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value.trim(); // Trim spaces to clean user input
    });

    console.log("Submitting Form Data:", formObject); // Debugging log

    // ✅ New: Check if required fields are filled
    if (!formObject.name || !formObject.dob || !formObject.age) {
        showResponseMessage("Error: Please fill in all required fields.", "red");
        return;
    }

    // Send data to API (Replace with actual backend API)
    fetch("https://api.example.com/patients", { // Update with your actual API endpoint
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formObject)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data);
        showResponseMessage("Form submitted successfully!", "green");
        document.getElementById("patient-form").reset(); // ✅ Clears the form after submission
        fetchPatientData(); // Refresh the patient list after submission
    })
    .catch(error => {
        console.error("Error submitting form:", error);
        showResponseMessage("Error submitting form. Please try again.", "red");
    });
});

// ✅ Function to Show Response Messages
function showResponseMessage(message, color) {
    const messageElement = document.getElementById("response-message");
    messageElement.style.display = "block";
    messageElement.style.color = color;
    messageElement.textContent = message;
}

// ✅ Query API to Retrieve and Display Patient Data
function fetchPatientData() {
    fetch("https://api.example.com/patients") // Update with your actual API endpoint
    .then(response => response.json())
    .then(data => {
        console.log("Retrieved Patient Data:", data);
        displayPatientData(data);
    })
    .catch(error => {
        console.error("Error fetching patient data:", error);
        showResponseMessage("Error retrieving patient data.", "red");
    });
}

// ✅ Function to Display Retrieved Patient Data
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

// ✅ Call fetchPatientData() when the page loads to query stored data
document.addEventListener("DOMContentLoaded", fetchPatientData);
