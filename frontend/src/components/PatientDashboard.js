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
        <div className="min-h-screen flex items-center justify-center bg-dark font-sans">
            <div className="bg-dark.light neon-border p-10 rounded-xl shadow-xl w-full max-w-xl text-center">
                <div className="text-3xl neon-text font-cyber mb-10 glitch-effect" data-text="Bienvenue sur votre espace patient">
                    Bienvenue sur votre espace patient
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-6">
                    <button
                        className="btn-cyber"
                        onClick={() => navigate(`/patient/${patientId}`)}
                    >
                        Voir mon dossier médical
                    </button>
                    <button
                        className="btn-cyber"
                        onClick={() => navigate('/patient/appointment-request')}
                    >
                        Demander un rendez-vous
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard; 