async function fetchPatients() {
    const { data, error } = await supabase.from("Patients").select().limit(50);

    if (error) {
        console.error("Error fetching patients:", error.message);
        return;
    }
    console.log("Fetched patients:", data);
    displayPatients(data);
}

function displayPatients(patients) {
    // Select table 
    const tableBody = document.querySelector("#patientsTable tbody");

    patients.forEach((patient) => {
        // if the uhid is unique, then add the row
        if (!document.querySelector(`[data-uhid="${patient.patient_uhid}"]`)) {
            const row = document.createElement("tr");
            row.setAttribute("data-uhid", patient.patient_uhid);

            row.innerHTML = `
                <td>${patient.patient_uhid}</td>
                <td>${patient["given_name"].concat(" ", patient.surname)}</td>
                <td>${patient.age}</td>
                <td>${patient.sex}</td>
                <td>${patient.phone_number}</td>
                <td>${patient.email_address}</td>
                <td>14 Oct 2020</td>
                <td class="status active">Active</td>
                <td><button class="view-btn">View</button></td>
            `;
            row.addEventListener("click", () => {
                window.location.href = `results.html?uhid=${patient.patient_uhid}`;
            });
            tableBody.appendChild(row);
        }
    });
}

document.addEventListener("supabaseReady", fetchPatients);
