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
        <div className="card-cyber neon-border mb-8">
            <h3 className="text-2xl neon-text font-cyber mb-6 glitch-effect" data-text="Hôpitaux">Hôpitaux</h3>
            <button className="btn-cyber mb-4" onClick={() => navigate('/super-admin/hospitals/add')}>Ajouter un hôpital</button>
            <div className="overflow-x-auto">
                <table className="w-full neon-border bg-dark.light text-text.light rounded-xl overflow-hidden">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 neon-text">Nom</th>
                            <th className="py-2 px-4 neon-text">Email</th>
                            <th className="py-2 px-4 neon-text">Téléphone</th>
                            <th className="py-2 px-4 neon-text">Adresse</th>
                            <th className="py-2 px-4 neon-text">Statut</th>
                            <th className="py-2 px-4 neon-text">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hospitals.map(hospital => (
                            <tr key={hospital.id} className="hover:bg-dark.lighter transition">
                                <td className="py-2 px-4">{hospital.name}</td>
                                <td className="py-2 px-4">{hospital.email}</td>
                                <td className="py-2 px-4">{hospital.phone}</td>
                                <td className="py-2 px-4">{hospital.address}</td>
                                <td className="py-2 px-4">{hospital.is_active ? 'Actif' : 'Inactif'}</td>
                                <td className="py-2 px-4 flex flex-col gap-2">
                                    <button className="btn-cyber" onClick={() => navigate(`/super-admin/hospitals/${hospital.id}`)}>Modifier</button>
                                    <button className="btn-cyber" onClick={() => handleToggleStatus(hospital.id, !hospital.is_active)}>
                                        {hospital.is_active ? 'Désactiver' : 'Activer'}
                                    </button>
                                    <button className="btn-cyber" onClick={() => handleDelete(hospital.id)}>Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark.lighter p-8 font-sans">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl neon-text font-cyber glitch-effect" data-text="Tableau de bord Super Admin">Tableau de bord Super Admin</h1>
                <button className="btn-cyber" onClick={handleLogout}>Déconnexion</button>
            </div>
            <div className="flex gap-4 mb-8">
                <button className={`btn-cyber ${activeTab === 'hospitals' ? 'bg-primary.dark' : ''}`} onClick={() => setActiveTab('hospitals')}>Hôpitaux</button>
                <button className={`btn-cyber ${activeTab === 'users' ? 'bg-primary.dark' : ''}`} onClick={() => setActiveTab('users')}>Utilisateurs</button>
            </div>
            {error && <p className="text-center font-bold mb-4 text-red-500">{error}</p>}
            {activeTab === 'hospitals' && renderHospitals()}
            {activeTab === 'users' && (
                <div className="card-cyber neon-border">
                    <h2 className="text-2xl neon-text font-cyber mb-6 glitch-effect" data-text="Liste des Utilisateurs">Liste des Utilisateurs</h2>
                    <button className="btn-cyber mb-4" onClick={() => navigate('/admin/users/add')}>Ajouter un utilisateur</button>
                    {users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full neon-border bg-dark.light text-text.light rounded-xl overflow-hidden">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 neon-text">Nom d'utilisateur</th>
                                        <th className="py-2 px-4 neon-text">Email</th>
                                        <th className="py-2 px-4 neon-text">Rôle</th>
                                        <th className="py-2 px-4 neon-text">Hôpital</th>
                                        <th className="py-2 px-4 neon-text">Statut</th>
                                        <th className="py-2 px-4 neon-text">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-dark.lighter transition">
                                            <td className="py-2 px-4">{user.username}</td>
                                            <td className="py-2 px-4">{user.email}</td>
                                            <td className="py-2 px-4">{user.role}</td>
                                            <td className="py-2 px-4">{user.hospital?.name || 'N/A'}</td>
                                            <td className="py-2 px-4">{user.is_active ? 'Actif' : 'Inactif'}</td>
                                            <td className="py-2 px-4 flex flex-col gap-2">
                                                <button className="btn-cyber" onClick={() => navigate(`/admin/users/edit/${user.id}`)}>
                                                    Modifier
                                                </button>
                                                <button className="btn-cyber" onClick={() => handleToggleUserStatus(user.id, !user.is_active)}>
                                                    {user.is_active ? 'Désactiver' : 'Activer'}
                                                </button>
                                                <button className="btn-cyber" onClick={() => handleDeleteUser(user.id)}>
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center">Aucun utilisateur trouvé</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard; 