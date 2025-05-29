import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const styles = {
    container: {
        maxWidth: '500px',
        margin: '60px auto',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0,0,0,0.08)',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        color: '#2c3e50',
        fontSize: '1.7rem',
        marginBottom: '30px',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    formGroup: {
        marginBottom: '18px'
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        color: '#495057',
        fontWeight: 'bold'
    },
    input: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    select: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    button: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '12px 28px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        marginTop: '10px',
        width: '100%'
    },
    message: {
        margin: '15px 0',
        textAlign: 'center',
        fontWeight: 'bold'
    }
};

const PatientAppointmentRequest = () => {
    const [hospitals, setHospitals] = useState([]);
    const [hospital, setHospital] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [doctor, setDoctor] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const patientId = localStorage.getItem('user_id');

    // Charger la liste des hôpitaux au chargement
    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get('http://localhost:8000/api/hospitals/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const hospitalsData = Array.isArray(response.data) ? response.data : response.data.results || [];
                setHospitals(hospitalsData);
                setLoading(false);
            } catch (error) {
                setMessage({ type: 'error', text: 'Erreur lors du chargement des hôpitaux.' });
                setLoading(false);
            }
        };
        fetchHospitals();
    }, [navigate]);

    // Charger la liste des médecins quand un hôpital est sélectionné
    useEffect(() => {
        const fetchDoctors = async () => {
            if (!hospital) {
                setDoctors([]);
                setDoctor('');
                return;
            }
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get('http://localhost:8000/api/users/', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: { role: 'DOCTOR', hospital }
                });
                setDoctors(response.data.results || []);
            } catch (error) {
                setMessage({ type: 'error', text: 'Erreur lors du chargement des médecins.' });
            }
        };
        fetchDoctors();
    }, [hospital, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!hospital || !doctor || !date || !startTime) {
            setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
            return;
        }
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }
            // Fusionner date et heure en un seul champ ISO
            const dateTime = `${date}T${startTime}:00`;
            await axios.post('http://localhost:8000/api/appointments/', {
                date: dateTime,
                doctor,
                patient: patientId,
                notes: reason
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Votre demande de rendez-vous a été envoyée avec succès.' });
            setDate('');
            setStartTime('');
            setDoctor('');
            setHospital('');
            setReason('');
        } catch (error) {
            let msg = 'Erreur lors de la demande de rendez-vous.';
            if (error.response && error.response.data && error.response.data.error) {
                msg = error.response.data.error;
            }
            setMessage({ type: 'error', text: msg });
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.title}>Demander un rendez-vous</div>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Hôpital *</label>
                    <select
                        value={hospital}
                        onChange={e => { setHospital(e.target.value); setDoctor(''); }}
                        style={styles.select}
                        required
                    >
                        <option value="">Sélectionner un hôpital</option>
                        {hospitals.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Médecin *</label>
                    <select
                        value={doctor}
                        onChange={e => setDoctor(e.target.value)}
                        style={styles.select}
                        required
                        disabled={!hospital || doctors.length === 0}
                    >
                        <option value="">Sélectionner un médecin</option>
                        {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>
                                {doc.first_name} {doc.last_name} {doc.specialty ? `- ${doc.specialty}` : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Date *</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Heure *</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Motif (optionnel)</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        style={styles.input}
                        placeholder="Motif du rendez-vous"
                    />
                </div>
                {message && (
                    <div style={{
                        ...styles.message,
                        color: message.type === 'error' ? '#dc3545' : '#2ecc71'
                    }}>{message.text}</div>
                )}
                <button type="submit" style={styles.button} disabled={loading}>
                    Envoyer la demande
                </button>
            </form>
        </div>
    );
};

export default PatientAppointmentRequest; 