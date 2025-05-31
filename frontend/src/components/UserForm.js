import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UserForm = () => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'HOSPITAL_ADMIN',
        hospital: '',
        is_active: true
    });
    const [hospitals, setHospitals] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get('http://localhost:8000/api/hospitals/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // Vérifier si la réponse est un tableau
                const hospitalsData = Array.isArray(response.data) ? response.data : response.data.results || [];
                setHospitals(hospitalsData);
            } catch (error) {
                setError('Erreur lors de la récupération des hôpitaux');
            }
        };

        fetchHospitals();

        if (isEdit) {
            const fetchUser = async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await axios.get(`http://localhost:8000/api/users/${id}/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setUser(response.data);
                } catch (error) {
                    setError('Erreur lors de la récupération des données de l\'utilisateur');
                }
            };
            fetchUser();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setUser({
            ...user,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            if (isEdit) {
                await axios.put(`http://localhost:8000/api/users/${id}/`, user, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:8000/api/users/', user, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            navigate('/admin/dashboard');
        } catch (error) {
            setError('Erreur lors de l\'enregistrement de l\'utilisateur');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark font-sans">
            <div className="bg-dark.light neon-border p-10 rounded-xl shadow-xl w-full max-w-lg">
                <h2 className="text-3xl neon-text font-cyber mb-8 glitch-effect" data-text={isEdit ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}>{isEdit ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h2>
                {error && <div className="text-center font-bold mb-4 text-red-500">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Nom d'utilisateur</label>
                        <input
                            type="text"
                            name="username"
                            value={user.username}
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
                            value={user.email}
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
                            value={user.first_name}
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
                            value={user.last_name}
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
                            value={user.phone}
                            onChange={handleChange}
                            required
                            className="input-cyber"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Rôle</label>
                        <select name="role" value={user.role} onChange={handleChange} required className="input-cyber">
                            <option value="HOSPITAL_ADMIN">Admin Hôpital</option>
                            <option value="DOCTOR">Médecin</option>
                            <option value="SECRETARY">Secrétaire</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block neon-text mb-2 font-bold">Hôpital</label>
                        <select name="hospital" value={user.hospital} onChange={handleChange} required className="input-cyber">
                            <option value="">Sélectionner un hôpital</option>
                            {hospitals.length > 0 ? (
                                hospitals.map(hospital => (
                                    <option key={hospital.id} value={hospital.id}>
                                        {hospital.name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Aucun hôpital disponible</option>
                            )}
                        </select>
                    </div>
                    <div className="mb-8 flex items-center gap-2">
                        <label className="neon-text font-bold">Actif</label>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={user.is_active}
                            onChange={handleChange}
                            className="form-checkbox h-5 w-5 text-primary"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="btn-cyber w-full">{isEdit ? 'Modifier' : 'Ajouter'}</button>
                        <button type="button" className="btn-cyber w-full bg-red-700 hover:bg-red-900" onClick={() => navigate('/admin/dashboard')}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm; 