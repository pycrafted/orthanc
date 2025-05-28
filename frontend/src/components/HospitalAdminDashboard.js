import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HospitalAdminDashboard = () => {
    const [hospital, setHospital] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [secretaries, setSecretaries] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchUserData = async (headers) => {
        const userResponse = await axios.get('http://localhost:8000/api/users/me/', { headers });
        console.log('Données utilisateur:', userResponse.data);
        return userResponse.data;
    };

    const fetchHospitalData = async (headers, hospitalId) => {
        const hospitalResponse = await axios.get(`http://localhost:8000/api/hospitals/${hospitalId}/`, { headers });
        console.log('Données hôpital:', hospitalResponse.data);
        setHospital(hospitalResponse.data);
    };

    const fetchDoctors = async (headers, hospitalId) => {
        const doctorsResponse = await axios.get('http://localhost:8000/api/users/', { 
            headers,
            params: { 
                role: 'DOCTOR',
                hospital: hospitalId
            }
        });
        console.log('Données médecins:', doctorsResponse.data);
        const doctorsData = doctorsResponse.data.results || [];
        console.log('Nombre de médecins reçus:', doctorsData.length);
        setDoctors(doctorsData);
    };

    const fetchSecretaries = async (headers, hospitalId) => {
        const secretariesResponse = await axios.get('http://localhost:8000/api/users/', { 
            headers,
            params: { 
                role: 'SECRETARY',
                hospital: hospitalId
            }
        });
        console.log('Données secrétaires:', secretariesResponse.data);
        const secretariesData = secretariesResponse.data.results || [];
        console.log('Nombre de secrétaires reçus:', secretariesData.length);
        setSecretaries(secretariesData);
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            console.log('Token présent:', !!token);
            
            if (!token) {
                setError('Non authentifié');
                navigate('/login');
                return;
            }

            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            console.log('Headers:', headers);

            // Récupérer les informations de l'utilisateur connecté
            console.log('Tentative de récupération des données utilisateur...');
            const userData = await fetchUserData(headers);
            const userHospitalId = userData.hospital;
            console.log('ID de l\'hôpital:', userHospitalId);

            if (!userHospitalId) {
                console.error('Aucun hôpital associé à l\'utilisateur');
                setError('Aucun hôpital associé à votre compte');
                return;
            }

            // Récupérer les informations de l'hôpital
            await fetchHospitalData(headers, userHospitalId);

            // Récupérer les médecins et secrétaires
            await fetchDoctors(headers, userHospitalId);
            await fetchSecretaries(headers, userHospitalId);

        } catch (error) {
            console.error('Erreur détaillée:', error);
            console.error('Status de l\'erreur:', error.response?.status);
            console.error('Données de l\'erreur:', error.response?.data);
            console.error('Headers de l\'erreur:', error.response?.headers);
            
            if (error.response?.status === 401) {
                console.error('Erreur d\'authentification - Token expiré ou invalide');
                setError('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('access_token');
                navigate('/login');
            } else if (error.response?.status === 403) {
                console.error('Erreur de permission - L\'utilisateur n\'a pas les droits nécessaires');
                setError('Vous n\'avez pas les permissions nécessaires pour accéder à ces données');
            } else if (error.response?.status === 404) {
                console.error('Erreur 404 - Ressource non trouvée');
                setError('Hôpital non trouvé');
            } else {
                console.error('Erreur inattendue:', error.message);
                setError('Erreur lors du chargement des données');
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const handleUserStatusChange = async (userId, newStatus) => {
        try {
            const token = localStorage.getItem('access_token');
            console.log('Token présent pour la modification:', !!token);
            
            if (!token) {
                setError('Non authentifié');
                navigate('/login');
                return;
            }

            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            console.log('Headers pour la modification:', headers);
            
            console.log('Tentative de modification du statut pour l\'utilisateur:', userId);
            const response = await axios.patch(`http://localhost:8000/api/users/${userId}/`, 
                { is_active: newStatus },
                { headers }
            );
            console.log('Réponse de la modification:', response);

            // Mettre à jour les listes
            setDoctors(doctors.map(doc => 
                doc.id === userId ? { ...doc, is_active: newStatus } : doc
            ));
            setSecretaries(secretaries.map(sec => 
                sec.id === userId ? { ...sec, is_active: newStatus } : sec
            ));
        } catch (error) {
            console.error('Erreur lors de la modification du statut:', error);
            console.error('Status de l\'erreur:', error.response?.status);
            console.error('Données de l\'erreur:', error.response?.data);
            
            if (error.response?.status === 401) {
                console.error('Erreur d\'authentification lors de la modification');
                setError('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('access_token');
                navigate('/login');
            } else {
                console.error('Erreur inattendue lors de la modification:', error.message);
                setError('Erreur lors de la modification du statut');
            }
        }
    };

    const handleDelete = async (id) => {
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

                await axios.delete(`http://localhost:8000/api/users/${id}/`, { headers });
                
                // Rafraîchir les données
                const userData = await fetchUserData(headers);
                if (userData.hospital) {
                    await fetchDoctors(headers, userData.hospital);
                    await fetchSecretaries(headers, userData.hospital);
                }
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

    const renderOverview = () => (
        <div>
            <h3>Vue d'ensemble</h3>
            <div>
                <h4>Informations de l'hôpital</h4>
                {hospital && (
                    <div>
                        <p>Nom: {hospital.name}</p>
                        <p>Email: {hospital.email}</p>
                        <p>Téléphone: {hospital.phone}</p>
                        <p>Adresse: {hospital.address}</p>
                    </div>
                )}
            </div>
            <div>
                <h4>Statistiques</h4>
                <p>Nombre de médecins: {doctors.length}</p>
                <p>Nombre de secrétaires: {secretaries.length}</p>
            </div>
        </div>
    );

    const renderDoctors = () => (
        <div>
            <h3>Médecins</h3>
            <button onClick={() => navigate('/hospital-admin/doctors/add')}>Ajouter un médecin</button>
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map(doctor => (
                        <tr key={doctor.id}>
                            <td>{doctor.first_name} {doctor.last_name}</td>
                            <td>{doctor.email}</td>
                            <td>{doctor.phone}</td>
                            <td>{doctor.is_active ? 'Actif' : 'Inactif'}</td>
                            <td>
                                <button onClick={() => navigate(`/hospital-admin/doctors/${doctor.id}`)}>Modifier</button>
                                <button onClick={() => handleUserStatusChange(doctor.id, !doctor.is_active)}>
                                    {doctor.is_active ? 'Désactiver' : 'Activer'}
                                </button>
                                <button onClick={() => handleDelete(doctor.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderSecretaries = () => (
        <div>
            <h3>Secrétaires</h3>
            <button onClick={() => navigate('/hospital-admin/secretaries/add')}>Ajouter un secrétaire</button>
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {secretaries.map(secretary => (
                        <tr key={secretary.id}>
                            <td>{secretary.first_name} {secretary.last_name}</td>
                            <td>{secretary.email}</td>
                            <td>{secretary.phone}</td>
                            <td>{secretary.is_active ? 'Actif' : 'Inactif'}</td>
                            <td>
                                <button onClick={() => navigate(`/hospital-admin/secretaries/${secretary.id}`)}>Modifier</button>
                                <button onClick={() => handleUserStatusChange(secretary.id, !secretary.is_active)}>
                                    {secretary.is_active ? 'Désactiver' : 'Activer'}
                                </button>
                                <button onClick={() => handleDelete(secretary.id)}>Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div>
            <h2>Tableau de bord - Admin Hôpital</h2>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            <div>
                <button onClick={() => setActiveTab('overview')}>Vue d'ensemble</button>
                <button onClick={() => setActiveTab('doctors')}>Médecins</button>
                <button onClick={() => setActiveTab('secretaries')}>Secrétaires</button>
            </div>

            <div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'doctors' && renderDoctors()}
                {activeTab === 'secretaries' && renderSecretaries()}
            </div>
        </div>
    );
};

export default HospitalAdminDashboard; 