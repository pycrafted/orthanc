import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Styles constants
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        color: '#2c3e50',
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px',
        marginBottom: '30px'
    },
    section: {
        marginBottom: '40px'
    },
    sectionTitle: {
        color: '#2c3e50',
        fontSize: '1.5rem',
        marginBottom: '20px'
    },
    tableContainer: {
        overflowX: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white'
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        padding: '12px',
        textAlign: 'left',
        borderBottom: '2px solid #dee2e6',
        color: '#495057'
    },
    tableRow: {
        borderBottom: '1px solid #dee2e6',
        '&:hover': {
            backgroundColor: '#f8f9fa'
        }
    },
    tableCell: {
        padding: '12px',
        color: '#212529'
    },
    primaryButton: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#2980b9'
        }
    },
    secondaryButton: {
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#27ae60'
        }
    },
    confirmButton: {
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#27ae60'
        }
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#c0392b'
        }
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    form: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '600px'
    },
    formGroup: {
        marginBottom: '15px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#495057'
    },
    input: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    textarea: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        minHeight: '100px',
        fontSize: '1rem'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        marginTop: '20px'
    },
    status: {
        PENDING: {
            backgroundColor: '#f1c40f',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.9rem'
        },
        CONFIRMED: {
            backgroundColor: '#2ecc71',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.9rem'
        },
        CANCELLED: {
            backgroundColor: '#e74c3c',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.9rem'
        }
    }
};

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
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

            // Récupérer les rendez-vous
            const appointmentsResponse = await axios.get('http://localhost:8000/api/appointments/', { headers });
            setAppointments(appointmentsResponse.data.results || []);

            // Récupérer les patients
            const patientsResponse = await axios.get('http://localhost:8000/api/users/?role=PATIENT', { headers });
            setPatients(patientsResponse.data.results || []);

            setLoading(false);
        } catch (error) {
            console.error('Erreur générale:', error.message);
            setError('Une erreur est survenue lors du chargement des données');
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

            const response = await axios.post(
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
            console.error('Erreur lors de la confirmation:', error);
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

            const response = await axios.post(
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
            console.error('Erreur lors de l\'annulation:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                setError('Une erreur est survenue lors de l\'annulation du rendez-vous');
            }
        }
    };

    if (loading) return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.2rem',
            color: '#666'
        }}>
            Chargement...
        </div>
    );

    if (error) return (
        <div style={{
            color: '#dc3545',
            padding: '20px',
            textAlign: 'center',
            fontSize: '1.1rem'
        }}>
            {error}
        </div>
    );

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Tableau de bord Médecin</h1>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Rendez-vous</h2>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Date</th>
                                <th style={styles.tableHeader}>Heure</th>
                                <th style={styles.tableHeader}>Patient</th>
                                <th style={styles.tableHeader}>Statut</th>
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(appointment => (
                                <tr key={appointment.id} style={styles.tableRow}>
                                    <td style={styles.tableCell}>{new Date(appointment.date).toLocaleDateString()}</td>
                                    <td style={styles.tableCell}>{appointment.start_time}</td>
                                    <td style={styles.tableCell}>
                                        {patients.find(p => p.id === appointment.patient)?.first_name} {patients.find(p => p.id === appointment.patient)?.last_name}
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={styles.status[appointment.status]}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        {appointment.status === 'PENDING' && (
                                            <div style={styles.buttonGroup}>
                                                <button
                                                    onClick={() => handleConfirmAppointment(appointment.id)}
                                                    style={styles.confirmButton}
                                                >
                                                    Confirmer
                                                </button>
                                                <button
                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                    style={styles.cancelButton}
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Patients</h2>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Nom</th>
                                <th style={styles.tableHeader}>Email</th>
                                <th style={styles.tableHeader}>Téléphone</th>
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(patient => (
                                <tr key={`patient-${patient.id}`} style={styles.tableRow}>
                                    <td style={styles.tableCell}>{patient.first_name} {patient.last_name}</td>
                                    <td style={styles.tableCell}>{patient.email}</td>
                                    <td style={styles.tableCell}>{patient.phone}</td>
                                    <td style={styles.tableCell}>
                                        <button
                                            onClick={() => navigate(`/patient/${patient.id}`)}
                                            style={styles.secondaryButton}
                                        >
                                            Voir le dossier médical
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard; 