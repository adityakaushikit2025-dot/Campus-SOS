// ==========================================
// CAMPUS SOS - MAIN JAVASCRIPT
// ==========================================
import { db } from "./firebase-config.js";
import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const auth = getAuth();
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const ALERT_KEY = "campusSOSAlerts";
const STUDENT_KEY = "campusSOSStudent";


// ==========================================
// LOGIN PAGE
// ==========================================

function showStudentLogin() {

    document.getElementById("studentLogin")
        .classList.remove("hidden");

    document.getElementById("adminLogin")
        .classList.add("hidden");

    document.getElementById("studentTab")
        .classList.add("active");

    document.getElementById("adminTab")
        .classList.remove("active");
}


function showAdminLogin() {

    document.getElementById("studentLogin")
        .classList.add("hidden");

    document.getElementById("adminLogin")
        .classList.remove("hidden");

    document.getElementById("studentTab")
        .classList.remove("active");

    document.getElementById("adminTab")
        .classList.add("active");
}


// ==========================================
// STUDENT LOGIN
// ==========================================

function studentLogin() {

    const name =
        document.getElementById("studentName").value.trim();

    const roll =
        document.getElementById("rollNumber").value.trim();

    const message =
        document.getElementById("loginMessage");


    if (!name || !roll) {

        message.innerText =
            "Please enter name and roll number.";

        message.className = "error";

        return;
    }


    const student = {
        name: name,
        roll: roll
    };


    localStorage.setItem(
        STUDENT_KEY,
        JSON.stringify(student)
    );


    window.location.href = "student.html";
}


// ==========================================
// ADMIN LOGIN
// ==========================================

async function adminLogin() {

    const username =
        document.getElementById("adminUsername").value.trim();

    const password =
        document.getElementById("adminPassword").value.trim();

    const message =
        document.getElementById("loginMessage");

    if (!username || !password) {

        message.innerText =
            "Please enter email and password.";

        message.className = "error";

        return;
    }

    try {

        await signInWithEmailAndPassword(
            auth,
            username,
            password
        );

        sessionStorage.setItem(
            "campusSOSAdmin",
            "true"
        );

        window.location.href =
            "admin.html";

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        message.innerText =
            "Invalid email or password.";

        message.className = "error";
    }
}


// ==========================================
// STUDENT DASHBOARD
// ==========================================

function loadStudentDashboard() {

    const studentData =
        localStorage.getItem(STUDENT_KEY);


    if (!studentData) {

        window.location.href = "index.html";

        return;
    }


    const student =
        JSON.parse(studentData);


    const welcome =
        document.getElementById("studentWelcome");


    if (welcome) {

        welcome.innerText =
            student.name;
    }


    loadStudentHistory();
}


// ==========================================
// SOS SYSTEM
// ==========================================

let sosTimer = null;
let sosSeconds = 5;
function getCurrentLocation() {

    const message =
        document.getElementById("locationMessage");

    if (!navigator.geolocation) {
        message.innerText =
            "GPS is not supported by this browser.";
        return;
    }

    message.innerText =
        "📍 Getting your location...";

    navigator.geolocation.getCurrentPosition(
        function(position) {

            const latitude =position.coords.latitude;

            const longitude =position.coords.longitude;
                window.sosLatitude = latitude;
                window.sosLongitude = longitude;

            message.innerText =
                "📍 Location detected successfully.";

            console.log(
                "Latitude:",
                latitude
            );

            console.log(
                "Longitude:",
                longitude
            );

        },
        function(error) {

            console.error(
                "Location error:",
                error
            );

            message.innerText =
                "Unable to get location. Please allow location permission.";
        }
    );
}

function startSOS() {
    if (sosTimer) {
    return;
}

    const emergencyType =
        document.getElementById("emergencyType").value;

    const location =
        document.getElementById("location").value;


    if (!emergencyType) {

        alert("Please select emergency type.");

        return;
    }


    if (!location) {

        alert("Please select campus location.");

        return;
    }


    sosSeconds = 5;


    document.getElementById("countdown")
        .classList.remove("hidden");

    document.getElementById("cancelSOS")
        .classList.remove("hidden");


    document.getElementById("countdown")
        .innerText =
        "SOS sending in " + sosSeconds + " seconds...";


    sosTimer = setInterval(function () {

        sosSeconds--;


        document.getElementById("countdown")
            .innerText =
            "SOS sending in " +
            sosSeconds +
            " seconds...";


        if (sosSeconds <= 0) {

            clearInterval(sosTimer);
            sosTimer=null;

            sendSOS();
        }

    }, 1000);
}


// ==========================================
// CANCEL SOS
// ==========================================

function cancelSOS() {

    clearInterval(sosTimer);


    document.getElementById("countdown")
        .classList.add("hidden");

    document.getElementById("cancelSOS")
        .classList.add("hidden");


    alert("SOS cancelled.");
}


// ==========================================
// SEND SOS TO FIREBASE
// ==========================================

async function sendSOS() {

    const student =
        JSON.parse(
            localStorage.getItem(STUDENT_KEY)
        );


    if (!student) {

        alert("Student login required.");

        return;
    }


    const type =
        document.getElementById("emergencyType").value;

    const location =
        document.getElementById("location").value;

    const description =
        document.getElementById("description").value.trim();


    const priority =
        document.getElementById("priority").value;
        const locationMessage =
    document.getElementById("locationMessage");

let latitude = "";
let longitude = "";

if (locationMessage &&
    locationMessage.innerText.includes("Location detected")) {

    // GPS coordinates are stored by getCurrentLocation()
    latitude = window.sosLatitude || "";
    longitude = window.sosLongitude || "";
}
        if (!priority) {
    alert("Please select emergency priority.");
    return;
}


    const alertData = {

        studentName:
            student.name,

        rollNumber:
            student.roll,

        emergencyType:
            type,

        location:
            location,
            latitude: latitude,
            longitude: longitude,

        description:
            description || "No description provided.",

        priority:
            priority,

        status:
            "Pending",

        createdAt:
            new Date().toLocaleString()

    };


    try {

        await addDoc(
            collection(db, "sosAlerts"),
            alertData
        );


        console.log(
            "SOS saved to Firebase"
        );


        document.getElementById("countdown")
            .classList.add("hidden");

        document.getElementById("cancelSOS")
            .classList.add("hidden");


        document.getElementById("description")
            .value = "";


        alert(
            "🚨 SOS sent successfully!\n\n" +
            "Emergency: " + type +
            "\nLocation: " + location
        );


        loadStudentHistory();


    } catch (error) {

        console.error(
            "Firebase error:",
            error
        );


        document.getElementById("countdown")
            .classList.add("hidden");

        document.getElementById("cancelSOS")
            .classList.add("hidden");


        alert(
            "SOS save nahi hua. Firebase connection check karo."
        );
    }
}


// ==========================================
// PRIORITY
// ==========================================

function getPriority(type) {

    if (
        type === "Fire" ||
        type === "Accident" ||
        type === "Medical"
    ) {

        return "High";
    }


    if (
        type === "Security" ||
        type === "Harassment"
    ) {

        return "Medium";
    }


    return "Low";
}


// ==========================================
// STUDENT HISTORY
// ==========================================

async function loadStudentHistory() {

    const container =
        document.getElementById("studentHistory");


    if (!container) {
        return;
    }


    const student =
        JSON.parse(
            localStorage.getItem(STUDENT_KEY)
        );


    if (!student) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(db, "sosAlerts")
            );


        const alerts =
            snapshot.docs.map(function(docItem) {

                return {
                    id: docItem.id,
                    ...docItem.data()
                };

            });


        const myAlerts =
            alerts.filter(function(alert) {

                return alert.rollNumber === student.roll;

            });


        if (myAlerts.length === 0) {

            container.innerHTML =
                "<p>No SOS alerts yet.</p>";

            return;
        }


        myAlerts.sort(function(a, b) {

            return b.id.localeCompare(a.id);

        });


        container.innerHTML =
            myAlerts.map(function(alert) {

                return `

                <div class="history-item">

                    <div>

                        <strong>
                            ${alert.emergencyType}
                        </strong>

                        <p>
                            📍 ${alert.location}
                        </p>

                        <small>
                            ${alert.createdAt}
                        </small>

                    </div>

                    <span class="status ${alert.status.toLowerCase()}">
                        ${alert.status}
                    </span>

                </div>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "History loading error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load SOS history.</p>";
    }
}


// ==========================================
// ADMIN DASHBOARD
// ==========================================

function loadAdminDashboard() {

    const isAdmin =
        sessionStorage.getItem(
            "campusSOSAdmin"
        );


    if (isAdmin !== "true") {

        window.location.href =
            "index.html";

        return;
    }


    renderAdminAlerts();
}
function listenForAlerts() {
    const alertsRef = collection(db, "sosAlerts");

    onSnapshot(alertsRef, function(snapshot) {
        renderAdminAlerts();
    });
}

// ==========================================
// ADMIN ALERTS FROM FIREBASE
// ==========================================

async function renderAdminAlerts() {

    console.log("ADMIN FIREBASE FUNCTION RUNNING");

    const container =
        document.getElementById("adminAlerts");

    if (!container) {
        return;
    }

    const searchInput =
        document.getElementById("searchAlerts");

    const statusFilter =
        document.getElementById("statusFilter");

    const searchText =
        searchInput
            ? searchInput.value.toLowerCase()
            : "";

    if (searchInput) {
        searchInput.oninput = renderAdminAlerts;
    }

    if (statusFilter) {
        statusFilter.onchange = renderAdminAlerts;
    }

    try {

        const snapshot =
            await getDocs(
                collection(db, "sosAlerts")
            );

        const alerts =
            snapshot.docs.map(function(docItem) {

                return {
                    ...docItem.data(),
                    firebaseId: docItem.id
                };

            });

        console.log(
            "Firebase alerts:",
            alerts
        );

        const filteredAlerts =
            alerts.filter(function(alert) {

                if (
                    statusFilter &&
                    statusFilter.value !== "All" &&
                    alert.status !== statusFilter.value
                ) {
                    return false;
                }

                const text = (

                    alert.studentName + " " +
                    alert.rollNumber + " " +
                    alert.emergencyType + " " +
                    alert.location + " " +
                    alert.priority + " " +
                    alert.status

                ).toLowerCase();

                return text.includes(searchText);

            });

        console.log(
            "FILTERED ALERTS:",
            filteredAlerts.length
        );

        document.getElementById("totalAlerts")
            .innerText = alerts.length;

        document.getElementById("pendingAlerts")
            .innerText =
            alerts.filter(
                a => a.status === "Pending"
            ).length;

        document.getElementById("respondingAlerts")
            .innerText =
            alerts.filter(
                a => a.status === "Responding"
            ).length;

        document.getElementById("resolvedAlerts")
            .innerText =
            alerts.filter(
                a => a.status === "Resolved"
            ).length;

        container.innerHTML =
            filteredAlerts.map(function(alert) {

                return `

                <div class="alert-card">

                    <div class="alert-top">

                        <div>

                            <h3>
                                🚨 ${alert.emergencyType}
                            </h3>

                            <span class="priority ${alert.priority.toLowerCase()}">
                                ${alert.priority} Priority
                            </span>

                        </div>

                        <span class="status ${alert.status.toLowerCase()}">
                            ${alert.status}
                        </span>

                    </div>

                    <div class="alert-info">

                        <p>
                            👤 <strong>Student:</strong>
                            ${alert.studentName}
                        </p>

                        <p>
                            🎓 <strong>Roll:</strong>
                            ${alert.rollNumber}
                        </p>

                        <p>
                            📍 <strong>Location:</strong>
                            ${alert.location}
                        </p>${alert.latitude && alert.longitude ? `
    <p>
        🌐 <strong>GPS:</strong>
        ${alert.latitude}, ${alert.longitude}
    </p>
` : ""}
                        ${alert.latitude && alert.longitude ? `
                            <button
                            onclick="viewLocation(${alert.latitude}, ${alert.longitude})">
                            📍 View Location
                            </button>
` : ""}

                        <p>
                            🕒 <strong>Time:</strong>
                            ${alert.createdAt}
                        </p>

                        <p>
                            📝 <strong>Description:</strong>
                            ${alert.description}
                        </p>

                    </div>

                    <div class="actions">

                        <button
                            onclick="updateStatus('${alert.firebaseId}', 'Responding')">
                            Respond
                        </button>

                        <button
                            onclick="updateStatus('${alert.firebaseId}', 'Resolved')">
                            Resolve
                        </button>

                        <button
                            onclick="updateStatus('${alert.firebaseId}', 'Pending')">
                            Pending
                        </button>

                    </div>

                </div>

                `;

            }).join("");

    } catch (error) {

        console.error(
            "Admin alerts loading error:",
            error
        );

        container.innerHTML =
            `<div class="empty">
                Unable to load emergency alerts.
            </div>`;
    }
}


// ==========================================
// UPDATE STATUS IN FIREBASE
// ==========================================

async function updateStatus(id, status) {

    console.log("Updating document ID:", id);
    console.log("New status:", status);

    try {

        const alertRef = doc(
            db,
            "sosAlerts",
            id
        );

        console.log("Document reference created:", alertRef.path);

        await updateDoc(alertRef, {
            status: status
        });

        console.log("Status updated successfully!");

        await renderAdminAlerts();

    } catch (error) {

        console.error("STATUS UPDATE ERROR:", error);

        alert(
            "Status update nahi hua.\n\n" +
            error.message
        );
    }
}

// ==========================================
// CLEAR DATA
// ==========================================

async function clearAllAlerts() {
    const confirmDelete = confirm("Delete all demo SOS alerts?");

    if (!confirmDelete) {
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "sosAlerts"));

        for (const docItem of snapshot.docs) {
            await deleteDoc(doc(db, "sosAlerts", docItem.id));
        }

        localStorage.removeItem(ALERT_KEY);

        await renderAdminAlerts();

        alert("All demo SOS alerts deleted.");
    } catch (error) {
        console.error("CLEAR DATA ERROR:", error);
        alert("Demo data delete nahi hua.\n\n" + error.message);
    }
}

// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        STUDENT_KEY
    );


    window.location.href =
        "index.html";
}


function adminLogout() {

    sessionStorage.removeItem(
        "campusSOSAdmin"
    );


    window.location.href =
        "index.html";
}


// ==========================================
// AUTO LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (
            document.getElementById(
                "studentWelcome"
            )
        ) {

            loadStudentDashboard();

        }


        if (document.getElementById("adminAlerts")) {
            loadAdminDashboard();
            listenForAlerts();
        }

    }
);


// ==========================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==========================================

window.showStudentLogin =
    showStudentLogin;

window.showAdminLogin =
    showAdminLogin;

window.studentLogin =
    studentLogin;

window.adminLogin =
    adminLogin;

window.startSOS =
    startSOS;
    window.getCurrentLocation =getCurrentLocation;

window.cancelSOS =
    cancelSOS;

window.updateStatus =
    updateStatus;
    function viewLocation(latitude, longitude) {

    const mapUrl =
        "https://www.google.com/maps/search/?api=1&query=" +
        latitude + "," + longitude;

    window.location.href = mapUrl;
}

window.viewLocation =
    viewLocation;

window.clearAllAlerts =
    clearAllAlerts;

window.logout =
    logout;

window.adminLogout =
    adminLogout;


// ==========================================
// FIREBASE CONNECTION TEST
// ==========================================

console.log(
    "Firebase connected successfully!"
);

console.log(db);