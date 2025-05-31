import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/token/', credentials);
            const { access, refresh } = response.data;

            // Stocker les tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Récupérer les informations de l'utilisateur
            const userResponse = await axios.get('http://localhost:8000/api/users/me/', {
                headers: { 'Authorization': `Bearer ${access}` }
            });

            // Stocker le rôle de l'utilisateur
            localStorage.setItem('user_id', userResponse.data.id);
            localStorage.setItem('user_role', userResponse.data.role);

            // Rediriger selon le rôle
            switch (userResponse.data.role) {
                case 'SUPER_ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'HOSPITAL_ADMIN':
                    navigate('/hospital-admin/dashboard');
                    break;
                case 'DOCTOR':
                    navigate('/doctor/dashboard');
                    break;
                case 'SECRETARY':
                    navigate('/secretary/dashboard');
                    break;
                case 'PATIENT':
                    navigate('/patient/dashboard');
                    break;
                default:
                    setError('Rôle non reconnu');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            if (error.response?.status === 401) {
                setError('Nom d\'utilisateur ou mot de passe incorrect');
            } else {
                setError('Erreur lors de la connexion. Veuillez réessayer.');
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-dark font-sans relative overflow-hidden">
            {/* Optionnel : fond animé matrix ou néon */}
            {/* <div className="absolute inset-0 z-0 pointer-events-none">...canvas ou animation...</div> */}
            <form onSubmit={handleSubmit} className="relative z-10 bg-dark.light neon-border p-8 rounded-2xl shadow-2xl w-full max-w-md mt-10 flex flex-col items-center">
                {/* Logo cyberpunk SVG */}
                <div className="mb-6">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="40" height="40" rx="12" fill="#8A2BE2" stroke="#39FF14" strokeWidth="3"/>
                        <path d="M16 32L24 16L32 32" stroke="#39FF14" strokeWidth="3" strokeLinecap="round"/>
                        <circle cx="24" cy="28" r="2" fill="#39FF14"/>
                    </svg>
                </div>
                <h1 className="text-4xl neon-text font-cyber mb-8 glitch-effect text-center tracking-widest" data-text="Connexion">Connexion</h1>
                {error && <div className="text-center font-bold mb-4 text-red-500 bg-dark.lighter neon-border rounded p-2 animate-pulse">{error}</div>}
                <div className="mb-6 w-full">
                    <label className="block neon-text mb-2 font-bold text-left">Nom d'utilisateur</label>
                    <input
                        type="text"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        className="input-cyber"
                        autoFocus
                    />
                </div>
                <div className="mb-8 w-full">
                    <label className="block neon-text mb-2 font-bold text-left">Mot de passe</label>
                    <input
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        className="input-cyber"
                    />
                </div>
                <button type="submit" className="btn-cyber w-full text-lg tracking-wide shadow-lg hover:scale-105 transition-transform duration-150">Se connecter</button>
                <div className="mt-8 text-center text-xs text-gray-400 opacity-60">© {new Date().getFullYear()} PyCrafted - Cyberpunk Medical App</div>
            </form>
        </div>
    );
};

export default Login; 