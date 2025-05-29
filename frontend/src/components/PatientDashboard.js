import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
    container: {
        maxWidth: '600px',
        margin: '60px auto',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0,0,0,0.08)',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        color: '#2c3e50',
        fontSize: '2rem',
        marginBottom: '30px',
        fontWeight: 'bold'
    },
    button: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '14px 32px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1.1rem',
        margin: '20px 10px',
        transition: 'background 0.2s',
    }
};

const PatientDashboard = () => {
    const navigate = useNavigate();
    const patientId = localStorage.getItem('user_id');

    return (
        <div style={styles.container}>
            <div style={styles.title}>Bienvenue sur votre espace patient</div>
            <button
                style={styles.button}
                onClick={() => navigate(`/patient/${patientId}`)}
            >
                Voir mon dossier médical
            </button>
            <button
                style={styles.button}
                onClick={() => navigate('/patient/appointment-request')}
            >
                Demander un rendez-vous
            </button>
        </div>
    );
};

export default PatientDashboard; 