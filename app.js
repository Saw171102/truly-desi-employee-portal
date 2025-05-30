// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const authContainer = document.getElementById('authContainer');
const adminDashboard = document.getElementById('adminDashboard');
const surveyDashboard = document.getElementById('surveyDashboard');
const adminLink = document.getElementById('adminLink');
const surveyLink = document.getElementById('surveyLink');
const logoutBtn = document.getElementById('logoutBtn');
const submitSurvey = document.getElementById('submitSurvey');
const previousSurveys = document.getElementById('previousSurveys');
const employeesList = document.getElementById('employeesList');

// Toggle between login and signup forms
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Signup function
signupBtn.addEventListener('click', () => {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return db.collection('employees').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                role: 'employee',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert('Account created! Please login.');
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Login function
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return db.collection('employees').doc(userCredential.user.uid).get();
        })
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                localStorage.setItem('user', JSON.stringify({
                    uid: doc.id,
                    ...userData
                }));
                
                if (userData.role === 'admin') {
                    showAdminDashboard();
                    loadEmployees();
                } else {
                    showSurveyDashboard();
                    loadUserSurveys(doc.id);
                }
            } else {
                throw new Error('User data not found');
            }
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Logout function
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        localStorage.removeItem('user');
        hideAllDashboards();
        authContainer.classList.remove('hidden');
    });
});

// Submit survey
submitSurvey.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const surveyData = {
        areaName: document.getElementById('areaName').value,
        customerName: document.getElementById('customerName').value,
        sampleGiven: document.getElementById('sampleGiven').value,
        customerPhone: document.getElementById('customerPhone').value,
        interestLevel: document.getElementById('interestLevel').value,
        additionalNotes: document.getElementById('additionalNotes').value,
        employeeId: user.uid,
        employeeName: user.name,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('surveys').add(surveyData)
        .then(() => {
            alert('Survey submitted!');
            document.getElementById('areaName').value = '';
            document.getElementById('customerName').value = '';
            document.getElementById('sampleGiven').value = '';
            document.getElementById('customerPhone').value = '';
            document.getElementById('interestLevel').value = '';
            document.getElementById('additionalNotes').value = '';
            loadUserSurveys(user.uid);
        })
        .catch((error) => {
            alert('Error: ' + error.message);
        });
});

// Navigation links
adminLink.addEventListener('click', (e) => {
    e.preventDefault();
    showAdminDashboard();
});

surveyLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSurveyDashboard();
});

// Helper functions
function showAdminDashboard() {
    hideAllDashboards();
    adminDashboard.classList.remove('hidden');
    adminLink.classList.remove('hidden');
    surveyLink.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    authContainer.classList.add('hidden');
}

function showSurveyDashboard() {
    hideAllDashboards();
    surveyDashboard.classList.remove('hidden');
    surveyLink.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    authContainer.classList.add('hidden');
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'admin') {
        adminLink.classList.remove('hidden');
    }
}

function hideAllDashboards() {
    adminDashboard.classList.add('hidden');
    surveyDashboard.classList.add('hidden');
    adminLink.classList.add('hidden');
    surveyLink.classList.add('hidden');
    logoutBtn.classList.add('hidden');
}

function loadUserSurveys(userId) {
    previousSurveys.innerHTML = '<p>Loading surveys...</p>';
    
    db.collection('surveys')
        .where('employeeId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                previousSurveys.innerHTML = '<p>No surveys yet.</p>';
                return;
            }
            
            let html = '<table><tr><th>Date</th><th>Area</th><th>Customer</th><th>Sample</th><th>Interest</th></tr>';
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.createdAt ? data.createdAt.toDate().toLocaleString() : 'N/A';
                
                html += `
                    <tr>
                        <td>${date}</td>
                        <td>${data.areaName}</td>
                        <td>${data.customerName}</td>
                        <td>${data.sampleGiven}</td>
                        <td>${data.interestLevel}</td>
                    </tr>
                `;
            });
            
            html += '</table>';
            previousSurveys.innerHTML = html;
        })
        .catch((error) => {
            previousSurveys.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}

function loadEmployees() {
    employeesList.innerHTML = '<p>Loading employees...</p>';
    
    db.collection('employees').get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                employeesList.innerHTML = '<p>No employees.</p>';
                return;
            }
            
            let html = '<table><tr><th>Name</th><th>Email</th><th>Role</th></tr>';
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                html += `
                    <tr>
                        <td>${data.name}</td>
                        <td>${data.email}</td>
                        <td>${data.role}</td>
                    </tr>
                `;
            });
            
            html += '</table>';
            employeesList.innerHTML = html;
        })
        .catch((error) => {
            employeesList.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}

// Check auth state on page load
auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection('employees').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    localStorage.setItem('user', JSON.stringify({
                        uid: doc.id,
                        ...userData
                    }));
                    
                    if (userData.role === 'admin') {
                        showAdminDashboard();
                        loadEmployees();
                    } else {
                        showSurveyDashboard();
                        loadUserSurveys(doc.id);
                    }
                }
            });
    } else {
        localStorage.removeItem('user');
        hideAllDashboards();
        authContainer.classList.remove('hidden');
    }
});