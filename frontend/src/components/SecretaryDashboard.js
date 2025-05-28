import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SecretaryDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddPatientForm, setShowAddPatientForm] = useState(false);
    const [newPatient, setNewPatient] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        role: 'PATIENT',
        selectedDoctors: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const appointmentsResponse = await axios.get('http://localhost:8000/api/appointments/', { headers });
            const appointmentsData = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : appointmentsResponse.data.results || [];
            setAppointments(appointmentsData);

            const patientsResponse = await axios.get('http://localhost:8000/api/users/?role=PATIENT', { headers });
            const patientsData = Array.isArray(patientsResponse.data) ? patientsResponse.data : patientsResponse.data.results || [];
            setPatients(patientsData);

            const doctorsResponse = await axios.get('http://localhost:8000/api/users/?role=DOCTOR', { headers });
            const doctorsData = Array.isArray(doctorsResponse.data) ? doctorsResponse.data : doctorsResponse.data.results || [];
            setDoctors(doctorsData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Une erreur est survenue lors du chargement des données');
            }
            setLoading(false);
        }
    };

    const handleConfirmAppointment = async (appointmentId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            await axios.post(
                `http://localhost:8000/api/appointments/${appointmentId}/confirm/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            fetchData();
        } catch (error) {
            console.error('Error confirming appointment:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Une erreur est survenue lors de la confirmation du rendez-vous');
            }
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            await axios.post(
                `http://localhost:8000/api/appointments/${appointmentId}/cancel/`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            fetchData();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Une erreur est survenue lors de l\'annulation du rendez-vous');
            }
        }
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const patientResponse = await axios.post(
                'http://localhost:8000/api/users/',
                {
                    username: newPatient.username,
                    email: newPatient.email,
                    first_name: newPatient.first_name,
                    last_name: newPatient.last_name,
                    phone: newPatient.phone,
                    password: newPatient.password,
                    role: 'PATIENT'
                },
                { headers }
            );

            for (const doctorId of newPatient.selectedDoctors) {
                await axios.post(
                    'http://localhost:8000/api/patient-doctors/',
                    {
                        patient: patientResponse.data.id,
                        doctor: doctorId
                    },
                    { headers }
                );
            }

            setNewPatient({
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                phone: '',
                password: '',
                role: 'PATIENT',
                selectedDoctors: []
            });
            setShowAddPatientForm(false);
            fetchData();
        } catch (error) {
            console.error('Error adding patient:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Une erreur est survenue lors de l\'ajout du patient');
            }
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h1>Tableau de bord Secrétaire</h1>

            <h2>Rendez-vous</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Patient</th>
                        <th>Médecin</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(appointment => (
                        <tr key={appointment.id}>
                            <td>{new Date(appointment.date).toLocaleDateString()}</td>
                            <td>{appointment.start_time}</td>
                            <td>
                                {patients.find(p => p.id === appointment.patient)?.first_name} {patients.find(p => p.id === appointment.patient)?.last_name}
                            </td>
                            <td>
                                {doctors.find(d => d.id === appointment.doctor)?.first_name} {doctors.find(d => d.id === appointment.doctor)?.last_name}
                            </td>
                            <td>{appointment.status}</td>
                            <td>
                                {appointment.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleConfirmAppointment(appointment.id)}>
                                            Confirmer
                                        </button>
                                        <button onClick={() => handleCancelAppointment(appointment.id)}>
                                            Annuler
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Patients</h2>
            <button onClick={() => setShowAddPatientForm(true)}>Ajouter un patient</button>
            {showAddPatientForm && (
                <form onSubmit={handleAddPatient}>
                    <h3>Nouveau patient</h3>
                    <div>
                        <label>Nom d'utilisateur:</label>
                        <input
                            type="text"
                            value={newPatient.username}
                            onChange={(e) => setNewPatient({...newPatient, username: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={newPatient.email}
                            onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Prénom:</label>
                        <input
                            type="text"
                            value={newPatient.first_name}
                            onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Nom:</label>
                        <input
                            type="text"
                            value={newPatient.last_name}
                            onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Téléphone:</label>
                        <input
                            type="tel"
                            value={newPatient.phone}
                            onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Mot de passe:</label>
                        <input
                            type="password"
                            value={newPatient.password}
                            onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label>Médecins:</label>
                        <select
                            multiple
                            value={newPatient.selectedDoctors}
                            onChange={(e) => setNewPatient({
                                ...newPatient,
                                selectedDoctors: Array.from(e.target.selectedOptions, option => option.value)
                            })}
                            required
                        >
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    {doctor.first_name} {doctor.last_name} - {doctor.specialty}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Ajouter</button>
                    <button type="button" onClick={() => setShowAddPatientForm(false)}>Annuler</button>
                </form>
            )}
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Médecins associés</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map(patient => (
                        <tr key={patient.id}>
                            <td>{patient.first_name} {patient.last_name}</td>
                            <td>{patient.email}</td>
                            <td>{patient.phone}</td>
                            <td>
                                {patient.doctors?.map(doctor => (
                                    <span key={doctor.id}>
                                        {doctor.first_name} {doctor.last_name}
                                        {doctor.specialty ? ` (${doctor.specialty})` : ''}
                                    </span>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Médecins</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Spécialité</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map(doctor => (
                        <tr key={doctor.id}>
                            <td>{doctor.first_name} {doctor.last_name}</td>
                            <td>{doctor.email}</td>
                            <td>{doctor.phone}</td>
                            <td>{doctor.specialty}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SecretaryDashboard; 