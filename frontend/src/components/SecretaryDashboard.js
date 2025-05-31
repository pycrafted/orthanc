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

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark font-sans text-xl text-gray-400">Chargement...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-dark font-sans"><div className="text-center font-bold text-red-500 text-lg p-8 bg-dark.light neon-border rounded-xl">{error}</div></div>;

    return (
        <div className="min-h-screen bg-dark.lighter p-8 font-sans">
            <h1 className="text-3xl neon-text font-cyber mb-10 glitch-effect" data-text="Tableau de bord Secrétaire">Tableau de bord Secrétaire</h1>

            <div className="card-cyber neon-border mb-10">
                <h2 className="text-2xl neon-text font-cyber mb-6 glitch-effect" data-text="Rendez-vous">Rendez-vous</h2>
                <div className="overflow-x-auto">
                    <table className="w-full neon-border bg-dark.light text-text.light rounded-xl overflow-hidden">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 neon-text">Date</th>
                                <th className="py-2 px-4 neon-text">Heure</th>
                                <th className="py-2 px-4 neon-text">Patient</th>
                                <th className="py-2 px-4 neon-text">Médecin</th>
                                <th className="py-2 px-4 neon-text">Statut</th>
                                <th className="py-2 px-4 neon-text">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appointment => (
                                <tr key={appointment.id} className="hover:bg-dark.lighter transition">
                                    <td className="py-2 px-4">{new Date(appointment.date).toLocaleDateString()}</td>
                                    <td className="py-2 px-4">{appointment.start_time}</td>
                                    <td className="py-2 px-4">
                                        {patients.find(p => p.id === appointment.patient)?.first_name} {patients.find(p => p.id === appointment.patient)?.last_name}
                                    </td>
                                    <td className="py-2 px-4">
                                        {doctors.find(d => d.id === appointment.doctor)?.first_name} {doctors.find(d => d.id === appointment.doctor)?.last_name}
                                    </td>
                                    <td className="py-2 px-4">
                                        <span className={`px-3 py-1 rounded font-bold ${appointment.status === 'PENDING' ? 'bg-yellow-500 text-white' : appointment.status === 'CONFIRMED' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{appointment.status}</span>
                                    </td>
                                    <td className="py-2 px-4 flex gap-2">
                                        {appointment.status === 'PENDING' && (
                                            <>
                                                <button className="btn-cyber" onClick={() => handleConfirmAppointment(appointment.id)}>
                                                    Confirmer
                                                </button>
                                                <button className="btn-cyber bg-red-700 hover:bg-red-900" onClick={() => handleCancelAppointment(appointment.id)}>
                                                    Annuler
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card-cyber neon-border">
                <h2 className="text-2xl neon-text font-cyber mb-6 glitch-effect" data-text="Patients">Patients</h2>
                <button className="btn-cyber mb-4" onClick={() => setShowAddPatientForm(true)}>Ajouter un patient</button>
                {showAddPatientForm && (
                    <form onSubmit={handleAddPatient} className="bg-dark.lighter neon-border p-8 rounded-xl mb-8">
                        <h3 className="text-xl neon-text font-cyber mb-4 glitch-effect" data-text="Nouveau patient">Nouveau patient</h3>
                        <div className="mb-4">
                            <label className="block neon-text mb-2 font-bold">Nom d'utilisateur</label>
                            <input
                                type="text"
                                value={newPatient.username}
                                onChange={(e) => setNewPatient({...newPatient, username: e.target.value})}
                                required
                                className="input-cyber"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block neon-text mb-2 font-bold">Email</label>
                            <input
                                type="email"
                                value={newPatient.email}
                                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                                required
                                className="input-cyber"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block neon-text mb-2 font-bold">Prénom</label>
                            <input
                                type="text"
                                value={newPatient.first_name}
                                onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
                                required
                                className="input-cyber"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block neon-text mb-2 font-bold">Nom</label>
                            <input
                                type="text"
                                value={newPatient.last_name}
                                onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
                                required
                                className="input-cyber"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block neon-text mb-2 font-bold">Téléphone</label>
                            <input
                                type="text"
                                value={newPatient.phone}
                                onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                                required
                                className="input-cyber"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block neon-text mb-2 font-bold">Mot de passe</label>
                            <input
                                type="password"
                                value={newPatient.password}
                                onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                                required
                                className="input-cyber"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block neon-text mb-2 font-bold">Médecins associés</label>
                            <select
                                multiple
                                value={newPatient.selectedDoctors}
                                onChange={e => setNewPatient({...newPatient, selectedDoctors: Array.from(e.target.selectedOptions, option => option.value)})}
                                className="input-cyber"
                                required
                            >
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.first_name} {doc.last_name} {doc.specialty ? `- ${doc.specialty}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button type="submit" className="btn-cyber w-full">Ajouter</button>
                            <button type="button" className="btn-cyber w-full bg-red-700 hover:bg-red-900" onClick={() => setShowAddPatientForm(false)}>Annuler</button>
                        </div>
                    </form>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full neon-border bg-dark.light text-text.light rounded-xl overflow-hidden">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 neon-text">Nom d'utilisateur</th>
                                <th className="py-2 px-4 neon-text">Email</th>
                                <th className="py-2 px-4 neon-text">Prénom</th>
                                <th className="py-2 px-4 neon-text">Nom</th>
                                <th className="py-2 px-4 neon-text">Téléphone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(patient => (
                                <tr key={patient.id} className="hover:bg-dark.lighter transition">
                                    <td className="py-2 px-4">{patient.username}</td>
                                    <td className="py-2 px-4">{patient.email}</td>
                                    <td className="py-2 px-4">{patient.first_name}</td>
                                    <td className="py-2 px-4">{patient.last_name}</td>
                                    <td className="py-2 px-4">{patient.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SecretaryDashboard; 