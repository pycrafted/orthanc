import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
    const [hospitals, setHospitals] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('hospitals');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                if (activeTab === 'hospitals') {
                    const response = await axios.get('http://localhost:8000/api/hospitals/', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // Vérifier si la réponse est un tableau
                    const hospitalsData = Array.isArray(response.data) ? response.data : response.data.results || [];
                    setHospitals(hospitalsData);
                } else if (activeTab === 'users') {
                    const response = await axios.get('http://localhost:8000/api/users/', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // Vérifier si la réponse est un tableau
                    const usersData = Array.isArray(response.data) ? response.data : response.data.results || [];
                    setUsers(usersData);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                setError('Erreur lors de la récupération des données');
            }
        };

        fetchData();
    }, [activeTab, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const handleToggleStatus = async (hospitalId, newStatus) => {
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

            await axios.patch(`http://localhost:8000/api/hospitals/${hospitalId}/`, 
                { is_active: newStatus },
                { headers }
            );

            // Mettre à jour la liste des hôpitaux
            setHospitals(hospitals.map(hospital => 
                hospital.id === hospitalId ? { ...hospital, is_active: newStatus } : hospital
            ));
        } catch (error) {
            console.error('Erreur lors de la modification du statut:', error);
            if (error.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('access_token');
                navigate('/login');
            } else {
                setError('Erreur lors de la modification du statut');
            }
        }
    };

    const handleDelete = async (hospitalId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet hôpital ?')) {
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

                await axios.delete(`http://localhost:8000/api/hospitals/${hospitalId}/`, { headers });
                
                // Mettre à jour la liste des hôpitaux
                setHospitals(hospitals.filter(hospital => hospital.id !== hospitalId));
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                if (error.response?.status === 401) {
                    setError('Session expirée. Veuillez vous reconnecter.');
                    localStorage.removeItem('access_token');
                    navigate('/login');
                } else {
                    setError('Erreur lors de la suppression');
                }
            }
        }
    };

    const handleToggleUserStatus = async (userId, newStatus) => {
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

            await axios.patch(`http://localhost:8000/api/users/${userId}/`, 
                { is_active: newStatus },
                { headers }
            );

            // Mettre à jour la liste des utilisateurs
            setUsers(users.map(user => 
                user.id === userId ? { ...user, is_active: newStatus } : user
            ));
        } catch (error) {
            console.error('Erreur lors de la modification du statut:', error);
            if (error.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('access_token');
                navigate('/login');
            } else {
                setError('Erreur lors de la modification du statut');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
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

                await axios.delete(`http://localhost:8000/api/users/${userId}/`, { headers });
                
                // Mettre à jour la liste des utilisateurs
                setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                if (error.response?.status === 401) {
                    setError('Session expirée. Veuillez vous reconnecter.');
                    localStorage.removeItem('access_token');
                    navigate('/login');
                } else {
                    setError('Erreur lors de la suppression');
                }
            }
        }
    };

    const renderHospitals = () => (
        <div>
            <h3>Hôpitaux</h3>
            <button onClick={() => navigate('/super-admin/hospitals/add')}>Ajouter un hôpital</button>
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Adresse</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {hospitals.map(hospital => (
                        <tr key={hospital.id}>
                            <td>{hospital.name}</td>
                            <td>{hospital.email}</td>
                            <td>{hospital.phone}</td>
                            <td>{hospital.address}</td>
                            <td>{hospital.is_active ? 'Actif' : 'Inactif'}</td>
                            <td>
                                <button onClick={() => navigate(`/super-admin/hospitals/${hospital.id}`)}>Modifier</button>
                                <button onClick={() => handleToggleStatus(hospital.id, !hospital.is_active)}>
                                    {hospital.is_active ? 'Désactiver' : 'Activer'}
                                </button>
                                <button onClick={() => handleDelete(hospital.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            <h1>Tableau de bord Super Admin</h1>
            <button onClick={handleLogout}>Déconnexion</button>

            <div>
                <button onClick={() => setActiveTab('hospitals')}>Hôpitaux</button>
                <button onClick={() => setActiveTab('users')}>Utilisateurs</button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {activeTab === 'hospitals' && renderHospitals()}

            {activeTab === 'users' && (
                <div>
                    <h2>Liste des Utilisateurs</h2>
                    <button onClick={() => navigate('/admin/users/add')}>Ajouter un utilisateur</button>
                    {users.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Nom d'utilisateur</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Hôpital</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>{user.hospital?.name || 'N/A'}</td>
                                        <td>{user.is_active ? 'Actif' : 'Inactif'}</td>
                                        <td>
                                            <button onClick={() => navigate(`/admin/users/edit/${user.id}`)}>
                                                Modifier
                                            </button>
                                            <button onClick={() => handleToggleUserStatus(user.id, !user.is_active)}>
                                                {user.is_active ? 'Désactiver' : 'Activer'}
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.id)}>
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Aucun utilisateur trouvé</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard; 