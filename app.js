let global_college_db = JSON.parse(localStorage.getItem('cgec_premium_db')) || [
    { 
        roll: 3006789, firstName: "Rudra Protap", lastName: "Chowdhury", studentPhone: "9876543210", 
        guardianName: "M.R. Chowdhury", guardianPhone: "9012345678", branch: "CE", cgpa: 9.3, 
        project: "Smart Bridge Analytics", attendance_count: 14, labs: {}, rank: 0, 
        ca_exams: {CA1: 22, CA2: 24, CA3: 21, CA4: 23}, medical_leaves: 2, backlog: "No",
        khata_evaluated: "Yes", mar_points: 45
    }
];

let session_metrics = JSON.parse(localStorage.getItem('cgec_sessions')) || {
    CE: { Sem1: 20, Sem2: 0 }, CSE: { Sem1: 20, Sem2: 0 }
};

function saveDatabase() {
    localStorage.setItem('cgec_premium_db', JSON.stringify(global_college_db));
    localStorage.setItem('cgec_sessions', JSON.stringify(session_metrics));
}

function switchPortalView(targetView) {
    document.getElementById('portalGateway').style.display = "none";
    if(targetView === 'faculty-auth') {
        document.getElementById('facultyAuthScreen').style.display = "block";
    } else if(targetView === 'student-portal') {
        document.getElementById('studentPortalWorkspace').style.display = "block";
    }
}

function returnToGateway() {
    document.getElementById('facultyAuthScreen').style.display = "none";
    document.getElementById('facultyDashboardWorkspace').style.display = "none";
    document.getElementById('studentPortalWorkspace').style.display = "none";
    document.getElementById('portalGateway').style.display = "block";
    document.getElementById('facultyPass').value = "";
}

function verifyAndUnlockFacultyDashboard() {
    let enteredPass = document.getElementById('facultyPass').value;
    if(enteredPass === "cgec@2026") {
        alert("🎉 Access Granted!");
        document.getElementById('facultyAuthScreen').style.display = "none";
        document.getElementById('facultyDashboardWorkspace').style.display = "block";
        onBranchOrSemChange();
    } else {
        alert("🛑 Invalid Security Key!");
    }
}

function lockAndLogoutFaculty() { returnToGateway(); }

function onBranchOrSemChange() {
    let branch = document.getElementById('branchSelect').value;
    let sem = document.getElementById('semSelect').value;
    document.getElementById('totalClassesLabel').innerText = session_metrics[branch][sem];
    renderAttendanceGrid(branch);
}

function incrementTotalClasses() {
    let branch = document.getElementById('branchSelect').value;
    let sem = document.getElementById('semSelect').value;
    session_metrics[branch][sem] += 1;
    document.getElementById('totalClassesLabel').innerText = session_metrics[branch][sem];
    saveDatabase();
}

function renderAttendanceGrid(branch) {
    let gridContainer = document.getElementById('attendanceGrid');
    gridContainer.innerHTML = "";
    let filteredList = global_college_db.filter(s => s.branch === branch);
    if(filteredList.length === 0) {
        gridContainer.innerHTML = "<p style='color:#64748b; font-size:11px;'>No students registered.</p>";
        return;
    }
    filteredList.forEach(student => {
        let card = document.createElement('div');
        card.className = "student-grid-card present";
        card.innerText = `Roll: ${student.roll}\n${student.firstName}`;
        card.onclick = function() {
            if(card.classList.contains('present')) {
                card.classList.remove('present'); card.classList.add('absent');
                if(student.attendance_count > 0) student.attendance_count -= 1;
            } else {
                card.classList.remove('absent'); card.classList.add('present');
                student.attendance_count += 1;
            }
            saveDatabase();
        };
        gridContainer.appendChild(card);
    });
}

function registerStudent() {
    let fName = document.getElementById('sFirstName').value;
    let lName = document.getElementById('sLastName').value;
    let roll = parseInt(document.getElementById('sRoll').value);
    let phone = document.getElementById('sPhone').value;
    let gName = document.getElementById('gName').value;
    let gPhone = document.getElementById('gPhone').value;
    let branch = document.getElementById('branchSelect').value;

    if(!fName || !lName || isNaN(roll) || !phone || !gName || !gPhone) return alert("Error: Missing parameters.");

    global_college_db.push({
        roll: roll, firstName: fName, lastName: lName, studentPhone: phone,
        guardianName: gName, guardianPhone: gPhone, branch: branch, cgpa: 0.0, project: "Not Assigned",
        attendance_count: 0, labs: {}, rank: 0,
        ca_exams: {CA1: 0, CA2: 0, CA3: 0, CA4: 0}, medical_leaves: 0, backlog: "No",
        khata_evaluated: "No", mar_points: 0
    });
    saveDatabase();
    alert("Success: Student registered!");
    document.getElementById('sFirstName').value = ''; document.getElementById('sLastName').value = '';
    document.getElementById('sRoll').value = ''; document.getElementById('sPhone').value = '';
    onBranchOrSemChange();
}

function searchStudent(roll, branch) {
    return global_college_db.find(s => s.roll === roll && s.branch === branch) || null;
}

function updateTeacherData() {
    let currentBranch = document.getElementById('branchSelect').value;
    let roll = parseInt(document.getElementById('tRoll').value);
    let student = searchStudent(roll, currentBranch);
    if(!student) return alert("Error: Student not found.");

    let m1 = parseFloat(document.getElementById('ca1Marks').value);
    let m2 = parseFloat(document.getElementById('ca2Marks').value);
    if(!isNaN(m1)) student.ca_exams.CA1 = m1;
    if(!isNaN(m2)) student.ca_exams.CA2 = m2;

    let marks = parseFloat(document.getElementById('sMarks').value);
    if(marks) { student.cgpa = marks; }

    saveDatabase();
    alert("Success: Ledger synced.");
}

function generateDeepReport() {
    let currentBranch = document.getElementById('branchSelect').value;
    let sem = document.getElementById('semSelect').value;
    let roll = parseInt(document.getElementById('searchRoll').value);
    let student = searchStudent(roll, currentBranch);
    if(!student) { document.getElementById('reportOutput').innerText = "Resolution Error."; return; }

    let totalSessions = session_metrics[currentBranch][sem] || 1;
    let attPercentage = (student.attendance_count / totalSessions) * 100;

    let report = `📊 CGEC PERFORMANCE REPORT
------------------------------------------------------------------
Student Name  : ${student.firstName} ${student.lastName} | Roll: ${student.roll}
Result Status : ${student.cgpa >= 4.0 ? "🟩 PASS" : "🟥 FAIL"} | Current SGPA: ${student.cgpa}
------------------------------------------------------------------
📞 Contact    : Ward: +91 ${student.studentPhone} | Guardian: +91 ${student.guardianPhone}
📈 Attendance : ${attPercentage.toFixed(2)}% (${student.attendance_count}/${totalSessions} Days)
📝 CA 1 Marks : ${student.ca_exams.CA1} / 25 | CA 2 Marks: ${student.ca_exams.CA2} / 25`;

    document.getElementById('reportOutput').innerText = report;
}

window.onload = function() {
    document.getElementById('portalGateway').style.display = "block";
};