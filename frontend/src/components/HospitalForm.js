import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const HospitalForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        is_active: true
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) {
            const fetchHospitalData = async () => {
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

                    const response = await axios.get(`http://localhost:8000/api/hospitals/${id}/`, { headers });
                    const { name, email, phone, address, is_active } = response.data;
                    setFormData({
                        name,
                        email,
                        phone,
                        address,
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
            fetchHospitalData();
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

            if (isEdit) {
                await axios.put(`http://localhost:8000/api/hospitals/${id}/`, formData, { headers });
            } else {
                await axios.post('http://localhost:8000/api/hospitals/', formData, { headers });
            }

            navigate('/super-admin/dashboard');
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
                <h2 className="text-3xl neon-text font-cyber mb-8 glitch-effect" data-text={isEdit ? 'Modifier un hôpital' : 'Ajouter un hôpital'}>
                    {isEdit ? 'Modifier' : 'Ajouter'} un hôpital
                </h2>
                {error && <div className="text-center font-bold mb-4 text-red-500">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Nom</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
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
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Adresse</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="input-cyber"
                        />
                    </div>
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
                        <button type="button" className="btn-cyber w-full bg-red-700 hover:bg-red-900" onClick={() => navigate('/super-admin/dashboard')}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HospitalForm; 