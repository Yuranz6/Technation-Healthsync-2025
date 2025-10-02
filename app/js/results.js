let drugMap = {};
let diagMap = {};



async function loadPatientDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const patient_uhid = urlParams.get("uhid");

    if (!patient_uhid) {
        console.error("No patient UHID provided.");
        return;
    }

    try {
        const [patientRes, prescriptionsRes, drugMapRes, diagnosesRes, diagMapRes] = await Promise.all([
            supabase.from("Patients").select().eq("patient_uhid", patient_uhid).single(),
            supabase.from("Prescriptions").select().eq("patient_uhid", patient_uhid),
            supabase.from("Drugs").select("drug_id, drug_name"),
            supabase.from("Diagnoses").select().eq("patient_uhid", patient_uhid),
            supabase.from("Conditions").select("condition_id, condition_name"),
        ]);

        const { data: patientData, error: patientError } = patientRes;
        const { data: prescriptionsData, error: prescriptionsError } = prescriptionsRes;
        const { data: drugsData, error: drugsError } = drugMapRes;
        const { data: diagData, error: diagError } = diagnosesRes;
        const { data: condData, error: condError } = diagMapRes;
        
        if (patientError) { console.error("Error fetching patient details:", patientError.message); return; }
        if (prescriptionsError) { console.error("Error fetching prescriptions:", prescriptionsError.message); return; }
        if (drugsError) { console.error("Error fetching drugs:", drugsError.message); return; }
        if (diagError) { console.error("Error fetching diagnoses:", diagError.message); return; }
        if (condError) { console.error("Error fetching conditions:", condError.message); return; }
        
        console.log("Patient details:", patientData);
        console.log("Prescriptions:", prescriptionsData);
        console.log("Drugs:", drugsData);
        console.log("Diagnoses:", diagData);
        console.log("Conditions:", condData);


        drugMap = drugsData.reduce((map, drug) => {
                    map[drug.drug_id] = drug.drug_name;
                    return map;
                }, {});
        diagMap = condData.reduce((map, condition) => {
            map[condition.condition_id] = condition.condition_name;
            return map;
        }, {});
        displayPatientDetails(patientData);
        displayPrescriptions(prescriptionsData);
        displayDiagnoses(diagData);

        
        console.log("Mapped Drug IDs:", drugMap);
    } catch (error) {
        console.error("Error loading details:", error);
    }
}

function displayPatientDetails(patient) {
    document.querySelectorAll("#patientName").forEach(element => {
        element.innerText = `${patient.given_name} ${patient.surname}`;
    });
    document.getElementById("patientAge").innerText = patient.age;
    document.getElementById("patientSex").innerText = patient.sex;
    document.getElementById("patientPhone").innerText = patient.phone_number;
    document.getElementById("patientEmail").innerText = patient.email_address;
    document.getElementById("patientAllergies").innerText = patient.allergies;
    document.getElementById("patientBloodType").innerText = patient.blood_type;
}

function displayPrescriptions(patient_prescription) {
    const tableBody = document.querySelector("#prescriptionTable tbody");
    if (!patient_prescription || patient_prescription.length === 0) {
        prescriptionsContainer.innerHTML = "<p>No prescriptions available.</p>";
        return;
    }
    patient_prescription.forEach((prescription) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${prescription.prescription_id}</td>
                <td>${drugMap[prescription.drug_id] || `Unknown (ID: ${prescription.drug_id})`}</td>
                <td>${prescription.dosage}</td>
                <td>${prescription.prescriber_id}</td>
                <td>${prescription.frequency}</td>
                <td>${prescription.start_date}</td>
                <td>${prescription.end_date}</td>
                <td>${prescription.status}</td>
                <td>${prescription.notes}</td>
            `;
            tableBody.appendChild(row);
    });
}

function displayDiagnoses(patient_diagnoses) {
    const tableBody = document.querySelector("#diagnosisTable tbody");
    if (!patient_diagnoses || patient_diagnoses.length === 0) {
        diagnosesContainer.innerHTML = "<p>No diagnoses available.</p>";
        return;
    }
    patient_diagnoses.forEach((diagnosis) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${diagnosis.diagnosis_id}</td>
                <td>${diagMap[diagnosis.condition_id] || `Unknown (ID: ${diagnosis.condition_id})`}</td>
                <td>${diagnosis.condition_id}</td>
                <td>Yes</td>
                <td>No additional notes.</td>
            `;
            tableBody.appendChild(row);
    });
}

// Call the function when the page loads
document.addEventListener("supabaseReady", loadPatientDetails);