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
        <div>
            <h2>Connexion</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nom d'utilisateur:</label>
                    <input
                        type="text"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Mot de passe:</label>
                    <input
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
};

export default Login; 