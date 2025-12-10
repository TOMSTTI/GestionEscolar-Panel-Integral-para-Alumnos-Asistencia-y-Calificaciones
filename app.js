// Almacenamiento en memoria (NO usar localStorage)
let students = [];
let attendance = {};
let currentDate = new Date().toLocaleDateString('es-AR');

// Inicializar la aplicación
function init() {
    document.getElementById('currentDate').textContent = currentDate;
    updateStudentList();
    updateAttendanceList();
    updateGradeStudentSelect();
    updateStats();
}

// Cambiar entre tabs
function switchTab(index) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
    
    contents.forEach((content, i) => {
        content.classList.toggle('active', i === index);
    });
}

// Agregar alumno
document.getElementById('addStudentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const age = parseInt(document.getElementById('studentAge').value);
    const grade = document.getElementById('studentGrade').value;
    
    if (!name || !age || !grade) {
        showMessage('addMessage', 'Por favor complete todos los campos', 'error');
        return;
    }
    
    const student = {
        id: Date.now(),
        name: name,
        age: age,
        grade: grade,
        grades: { math: null, lang: null, science: null, social: null },
        attendance: []
    };
    
    students.push(student);
    
    showMessage('addMessage', `✓ Alumno ${name} agregado exitosamente`, 'success');
    
    document.getElementById('addStudentForm').reset();
    updateStudentList();
    updateAttendanceList();
    updateGradeStudentSelect();
    updateStats();
});

// Actualizar lista de alumnos
function updateStudentList() {
    const list = document.getElementById('studentList');
    
    if (students.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No hay alumnos registrados.</p>';
        return;
    }
    
    list.innerHTML = students.map(student => {
        const status = getStudentStatus(student);
        const avg = calculateAverage(student);
        const attendanceRate = calculateAttendanceRate(student);
        
        return `
            <div class="student-card">
                <div class="student-header">
                    <div class="student-name">${student.name}</div>
                    <div class="student-status status-${status.class}">${status.text}</div>
                </div>
                <div class="student-info">
                    <div><strong>Grado:</strong> ${student.grade}°</div>
                    <div><strong>Edad:</strong> ${student.age} años</div>
                    <div><strong>Promedio:</strong> ${avg !== null ? avg.toFixed(2) : 'Sin notas'}</div>
                    <div><strong>Asistencia:</strong> ${attendanceRate}%</div>
                </div>
                <div class="actions" style="margin-top:15px;">
                    <button class="btn btn-small btn-danger" onclick="deleteStudent(${student.id})">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

// Calcular promedio
function calculateAverage(student) {
    const grades = [
        student.grades.math,
        student.grades.lang,
        student.grades.science,
        student.grades.social
    ].filter(g => g !== null);
    
    if (grades.length === 0) return null;
    
    return grades.reduce((a, b) => a + b, 0) / grades.length;
}

// Calcular asistencia %
function calculateAttendanceRate(student) {
    if (student.attendance.length === 0) return 0;
    const present = student.attendance.filter(a => a === 'present').length;
    return Math.round((present / student.attendance.length) * 100);
}

// Estado del alumno
function getStudentStatus(student) {
    const avg = calculateAverage(student);
    
    if (avg === null) return { class: 'pendiente', text: '⏳ Pendiente de notas' };
    if (avg >= 7) return { class: 'aprobado', text: '✅ Aprobado' };
    return { class: 'repite', text: '❌ Debe repetir' };
}

// Actualizar lista de asistencia
function updateAttendanceList() {
    const list = document.getElementById('attendanceList');
    
    if (students.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No hay alumnos para tomar asistencia.</p>';
        return;
    }
    
    list.innerHTML = students.map(student => {
        const status = attendance[student.id] || null;
        
        return `
            <div class="attendance-row">
                <div class="attendance-name">${student.name} - ${student.grade}° Grado</div>
                <div class="attendance-btns">
                    <button class="btn-present ${status === 'present' ? 'active' : ''}" 
                            onclick="markAttendance(${student.id}, 'present')">Presente</button>
                    <button class="btn-absent ${status === 'absent' ? 'active' : ''}" 
                            onclick="markAttendance(${student.id}, 'absent')">Ausente</button>
                </div>
            </div>
        `;
    }).join('');
}

// Marcar asistencia
function markAttendance(studentId, status) {
    attendance[studentId] = status;
    updateAttendanceList();
}

// Guardar asistencia
function saveAttendance() {
    let count = 0;
    
    students.forEach(student => {
        if (attendance[student.id]) {
            student.attendance.push(attendance[student.id]);
            count++;
        }
    });
    
    if (count === 0) {
        showMessage('attendanceMessage', 'No hay asistencias para guardar', 'error');
        return;
    }
    
    showMessage('attendanceMessage', `✓ Asistencia guardada para ${count} alumno(s)`, 'success');
    attendance = {};
    updateAttendanceList();
    updateStudentList();
}

// Select de alumnos (calificaciones)
function updateGradeStudentSelect() {
    const select = document.getElementById('gradeStudent');
    select.innerHTML = '<option value="">Seleccionar alumno</option>' +
        students.map(s => `<option value="${s.id}">${s.name} - ${s.grade}° Grado</option>`).join('');
}

// Cargar notas
function loadStudentGrades() {
    const studentId = parseInt(document.getElementById('gradeStudent').value);
    const form = document.getElementById('gradeForm');
    
    if (!studentId) {
        form.style.display = 'none';
        return;
    }
    
    const student = students.find(s => s.id === studentId);
    
    if (student) {
        document.getElementById('gradeMath').value = student.grades.math || '';
        document.getElementById('gradeLang').value = student.grades.lang || '';
        document.getElementById('gradeScience').value = student.grades.science || '';
        document.getElementById('gradeSocial').value = student.grades.social || '';
        form.style.display = 'block';
    }
}

// Guardar calificaciones
function saveGrades() {
    const studentId = parseInt(document.getElementById('gradeStudent').value);
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        showMessage('gradeMessage', 'Seleccione un alumno', 'error');
        return;
    }
    
    student.grades.math = parseFloat(document.getElementById('gradeMath').value) || null;
    student.grades.lang = parseFloat(document.getElementById('gradeLang').value) || null;
    student.grades.science = parseFloat(document.getElementById('gradeScience').value) || null;
    student.grades.social = parseFloat(document.getElementById('gradeSocial').value) || null;
    
    showMessage('gradeMessage', `✓ Calificaciones guardadas para ${student.name}`, 'success');
    updateStudentList();
    updateStats();
}

// Eliminar alumno
function deleteStudent(id) {
    if (confirm('¿Está seguro de eliminar este alumno?')) {
        students = students.filter(s => s.id !== id);
        updateStudentList();
        updateAttendanceList();
        updateGradeStudentSelect();
        updateStats();
    }
}

// Estadísticas generales
function updateStats() {
    const statsGrid = document.getElementById('statsGrid');
    
    const total = students.length;
    const aprobados = students.filter(s => calculateAverage(s) >= 7).length;
    const repiten = students.filter(s => {
        const avg = calculateAverage(s);
        return avg !== null && avg < 7;
    }).length;
    const sinNotas = students.filter(s => calculateAverage(s) === null).length;

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${total}</div>
            <div class="stat-label">Alumnos Totales</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${aprobados}</div>
            <div class="stat-label">Aprobados</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${repiten}</div>
            <div class="stat-label">Repiten</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${sinNotas}</div>
            <div class="stat-label">Pendientes de Notas</div>
        </div>
    `;
}

// Mostrar mensajes
function showMessage(target, msg, type) {
    const div = document.getElementById(target);
    div.innerHTML = `<div class="alert alert-${type === 'success' ? 'success' : 'error'}">${msg}</div>`;
    setTimeout(() => div.innerHTML = '', 3000);
}

// Ejecutar al cargar
window.onload = init;
