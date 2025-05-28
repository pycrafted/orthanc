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
        <div>
            <h2>{isEdit ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nom d'utilisateur:</label>
                    <input
                        type="text"
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Prénom:</label>
                    <input
                        type="text"
                        name="first_name"
                        value={user.first_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Nom:</label>
                    <input
                        type="text"
                        name="last_name"
                        value={user.last_name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Téléphone:</label>
                    <input
                        type="tel"
                        name="phone"
                        value={user.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Rôle:</label>
                    <select name="role" value={user.role} onChange={handleChange} required>
                        <option value="HOSPITAL_ADMIN">Admin Hôpital</option>
                        <option value="DOCTOR">Médecin</option>
                        <option value="SECRETARY">Secrétaire</option>
                    </select>
                </div>
                <div>
                    <label>Hôpital:</label>
                    <select name="hospital" value={user.hospital} onChange={handleChange} required>
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
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={user.is_active}
                            onChange={handleChange}
                        />
                        Actif
                    </label>
                </div>
                <button type="submit">{isEdit ? 'Modifier' : 'Ajouter'}</button>
                <button type="button" onClick={() => navigate('/admin/dashboard')}>Annuler</button>
            </form>
        </div>
    );
};

export default UserForm; 