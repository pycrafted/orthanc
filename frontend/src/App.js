import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import HospitalForm from './components/HospitalForm';
import UserForm from './components/UserForm';
import HospitalAdminDashboard from './components/HospitalAdminDashboard';
import StaffForm from './components/StaffForm';
import SecretaryDashboard from './components/SecretaryDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientMedicalRecord from './components/PatientMedicalRecord';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Routes Super Admin */}
                <Route path="/admin/dashboard" element={
                    <PrivateRoute allowedRoles={['SUPER_ADMIN']}>
                        <SuperAdminDashboard />
                    </PrivateRoute>
                } />
                <Route path="/admin/hospitals/add" element={
                    <PrivateRoute allowedRoles={['SUPER_ADMIN']}>
                        <HospitalForm />
                    </PrivateRoute>
                } />
                <Route path="/admin/hospitals/edit/:id" element={
                    <PrivateRoute allowedRoles={['SUPER_ADMIN']}>
                        <HospitalForm />
                    </PrivateRoute>
                } />
                <Route path="/admin/users/add" element={
                    <PrivateRoute allowedRoles={['SUPER_ADMIN']}>
                        <UserForm />
                    </PrivateRoute>
                } />
                <Route path="/admin/users/edit/:id" element={
                    <PrivateRoute allowedRoles={['SUPER_ADMIN']}>
                        <UserForm />
                    </PrivateRoute>
                } />
                <Route path="/super-admin/hospitals/add" element={<HospitalForm />} />
                <Route path="/super-admin/hospitals/:id" element={<HospitalForm />} />

                {/* Routes Hospital Admin */}
                <Route path="/hospital-admin/dashboard" element={
                    <PrivateRoute allowedRoles={['HOSPITAL_ADMIN']}>
                        <HospitalAdminDashboard />
                    </PrivateRoute>
                } />
                <Route path="/hospital-admin/doctors/add" element={
                    <PrivateRoute allowedRoles={['HOSPITAL_ADMIN']}>
                        <StaffForm />
                    </PrivateRoute>
                } />
                <Route path="/hospital-admin/doctors/edit/:id" element={
                    <PrivateRoute allowedRoles={['HOSPITAL_ADMIN']}>
                        <StaffForm />
                    </PrivateRoute>
                } />
                <Route path="/hospital-admin/secretaries/add" element={
                    <PrivateRoute allowedRoles={['HOSPITAL_ADMIN']}>
                        <StaffForm />
                    </PrivateRoute>
                } />
                <Route path="/hospital-admin/secretaries/edit/:id" element={
                    <PrivateRoute allowedRoles={['HOSPITAL_ADMIN']}>
                        <StaffForm />
                    </PrivateRoute>
                } />

                {/* Routes Secretary */}
                <Route path="/secretary/dashboard" element={
                    <PrivateRoute allowedRoles={['SECRETARY']}>
                        <SecretaryDashboard />
                    </PrivateRoute>
                } />

                {/* Routes Doctor */}
                <Route path="/doctor/dashboard" element={
                    <PrivateRoute allowedRoles={['DOCTOR']}>
                        <DoctorDashboard />
                    </PrivateRoute>
                } />
                <Route path="/patient/:patientId" element={
                    <PrivateRoute allowedRoles={['DOCTOR']}>
                        <PatientMedicalRecord />
                    </PrivateRoute>
                } />

                {/* Route par défaut */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App; 