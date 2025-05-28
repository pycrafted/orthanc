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
        <div>
            <h2>{isEdit ? 'Modifier' : 'Ajouter'} un hôpital</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nom:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Téléphone:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                    />
                </div>

                <div>
                    <label>Adresse:</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Actif:</label>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit">{isEdit ? 'Modifier' : 'Ajouter'}</button>
                <button type="button" onClick={() => navigate('/super-admin/dashboard')}>Annuler</button>
            </form>
        </div>
    );
};

export default HospitalForm; 