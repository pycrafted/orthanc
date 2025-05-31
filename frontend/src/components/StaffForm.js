import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const StaffForm = () => {
    const location = useLocation();
    const isSecretary = location.pathname.includes('/secretaries/');
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        role: isSecretary ? 'SECRETARY' : 'DOCTOR',
        is_active: true
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) {
            const fetchStaffData = async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    if (!token) {
                        setError('Non authentifié');
                        navigate('/login');
                        return;
                    }

                    const headers = {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    };

                    const response = await axios.get(`http://localhost:8000/api/users/${id}/`, { headers });
                    const { username, email, first_name, last_name, phone, role, is_active } = response.data;
                    setFormData({
                        username,
                        email,
                        first_name,
                        last_name,
                        phone,
                        password: '',
                        role,
                        is_active
                    });
                } catch (error) {
                    console.error('Erreur lors de la récupération des données:', error);
                    if (error.response?.status === 401) {
                        setError('Session expirée. Veuillez vous reconnecter.');
                        localStorage.removeItem('access_token');
                        navigate('/login');
                    } else {
                        setError('Erreur lors de la récupération des données');
                    }
                }
            };
            fetchStaffData();
        }
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('Non authentifié');
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Récupérer l'ID de l'hôpital de l'admin connecté
            const userResponse = await axios.get('http://localhost:8000/api/users/me/', { headers });
            const hospitalId = userResponse.data.hospital;

            if (!hospitalId) {
                setError('Aucun hôpital associé à votre compte');
                return;
            }

            const data = {
                ...formData,
                hospital: hospitalId
            };

            if (isEdit) {
                // Si c'est une modification, on ne change pas le mot de passe s'il est vide
                if (!data.password) {
                    delete data.password;
                }
                await axios.put(`http://localhost:8000/api/users/${id}/`, data, { headers });
            } else {
                await axios.post('http://localhost:8000/api/users/', data, { headers });
            }

            // Redirection vers le dashboard
            navigate('/hospital-admin/dashboard');
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            if (error.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('access_token');
                navigate('/login');
            } else if (error.response?.data) {
                setError(JSON.stringify(error.response.data));
            } else {
                setError('Erreur lors de l\'enregistrement');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark font-sans">
            <div className="bg-dark.light neon-border p-10 rounded-xl shadow-xl w-full max-w-lg">
                <h2 className="text-3xl neon-text font-cyber mb-8 glitch-effect" data-text={isEdit ? `Modifier un ${formData.role === 'DOCTOR' ? 'médecin' : 'secrétaire'}` : `Ajouter un ${formData.role === 'DOCTOR' ? 'médecin' : 'secrétaire'}`}>{isEdit ? 'Modifier' : 'Ajouter'} un {formData.role === 'DOCTOR' ? 'médecin' : 'secrétaire'}</h2>
                {error && <div className="text-center font-bold mb-4 text-red-500">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Nom d'utilisateur</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="input-cyber"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="input-cyber"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Prénom</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            className="input-cyber"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Nom</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            className="input-cyber"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Téléphone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            pattern="[0-9]{10}"
                            className="input-cyber"
                        />
                    </div>
                    {!isEdit && (
                        <div className="mb-6">
                            <label className="block neon-text mb-2 font-bold">Mot de passe</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!isEdit}
                                minLength="8"
                                className="input-cyber"
                            />
                        </div>
                    )}
                    <div className="mb-8 flex items-center gap-2">
                        <label className="neon-text font-bold">Actif</label>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-primary"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="btn-cyber w-full">{isEdit ? 'Modifier' : 'Ajouter'}</button>
                        <button type="button" className="btn-cyber w-full bg-red-700 hover:bg-red-900" onClick={() => navigate('/hospital-admin/dashboard')}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffForm; 