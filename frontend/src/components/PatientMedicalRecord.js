import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        color: '#2c3e50',
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px',
        marginBottom: '30px'
    },
    section: {
        marginBottom: '40px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
        color: '#2c3e50',
        fontSize: '1.5rem',
        marginBottom: '20px'
    },
    patientInfo: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    infoItem: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
    },
    infoLabel: {
        color: '#6c757d',
        fontSize: '0.9rem',
        marginBottom: '5px'
    },
    infoValue: {
        color: '#2c3e50',
        fontSize: '1.1rem'
    },
    tabContainer: {
        marginTop: '20px'
    },
    tabButtons: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
    },
    tabButton: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#e9ecef',
        color: '#495057'
    },
    activeTabButton: {
        backgroundColor: '#3498db',
        color: 'white'
    },
    tableContainer: {
        overflowX: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        borderRadius: '8px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white'
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        padding: '12px',
        textAlign: 'left',
        borderBottom: '2px solid #dee2e6',
        color: '#495057'
    },
    tableRow: {
        borderBottom: '1px solid #dee2e6'
    },
    tableCell: {
        padding: '12px',
        color: '#212529'
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
    },
    primaryButton: {
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    secondaryButton: {
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    form: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '600px'
    },
    formGroup: {
        marginBottom: '15px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#495057'
    },
    input: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1rem'
    },
    textarea: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        minHeight: '100px',
        fontSize: '1rem'
    }
};

const PatientMedicalRecord = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [dicomStudies, setDicomStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('records');
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [showAddDicom, setShowAddDicom] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newRecord, setNewRecord] = useState({
        chief_complaint: '',
        diagnosis: '',
        treatment_plan: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, [patientId]);

    const fetchData = async () => {
        try {
            console.log('Début de fetchData pour le patient:', patientId);
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('Pas de token trouvé');
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            // Récupérer les informations du patient
            console.log('Récupération des informations du patient...');
            const patientResponse = await axios.get(`http://localhost:8000/api/users/${patientId}/`, { headers });
            console.log('Informations patient reçues:', patientResponse.data);
            setPatient(patientResponse.data);

            // Récupérer les dossiers médicaux
            console.log('Récupération des dossiers médicaux...');
            const recordsResponse = await axios.get(`http://localhost:8000/api/medical-records/?patient=${patientId}`, { headers });
            console.log('Dossiers médicaux reçus:', recordsResponse.data);
            setMedicalRecords(recordsResponse.data.results || []);

            // Récupérer les études DICOM
            try {
                console.log('Récupération des études DICOM pour le patient:', patientId);
                const dicomResponse = await axios.get('http://localhost:8000/api/dicom/studies/', {
                    headers,
                    params: { patient: patientId }
                });
                console.log('Réponse complète des études DICOM:', dicomResponse);
                console.log('Données des études DICOM:', dicomResponse.data);
                setDicomStudies(dicomResponse.data.results || []);
            } catch (error) {
                console.error('Erreur détaillée lors de la récupération des études DICOM:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    headers: error.response?.headers
                });
                setDicomStudies([]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Erreur détaillée lors du chargement des données:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            setError('Une erreur est survenue lors du chargement des données');
            setLoading(false);
        }
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            await axios.post(
                'http://localhost:8000/api/medical-records/',
                {
                    ...newRecord,
                    patient: patientId,
                    doctor: localStorage.getItem('user_id'),
                    record_date: new Date().toISOString().split('T')[0]
                },
                { headers }
            );

            setNewRecord({
                chief_complaint: '',
                diagnosis: '',
                treatment_plan: '',
                notes: ''
            });
            setShowAddRecord(false);
            fetchData();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du dossier:', error);
            setError('Une erreur est survenue lors de l\'ajout du dossier médical');
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUploadDicom = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Veuillez sélectionner un fichier DICOM');
            return;
        }
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('patient', patientId);
            await axios.post('http://localhost:8000/api/dicom/studies/upload_dicom/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSelectedFile(null);
            setShowAddDicom(false);
            await fetchData();
        } catch (error) {
            setError('Erreur lors de l\'upload DICOM');
        }
    };

    const handleViewDicom = (studyId) => {
        console.log('Tentative de visualisation de l\'étude DICOM:', studyId);
        try {
            console.log('Recherche de l\'étude dans les données:', dicomStudies);
            const study = dicomStudies.find(study => study.id === studyId);
            console.log('Étude trouvée:', study);
            
            if (study?.study_instance_uid) {
                console.log('Redirection vers l\'OHIF viewer avec l\'étude:', study.study_instance_uid);
                const viewerUrl = `http://localhost:8042/ohif/viewer?StudyInstanceUIDs=${study.study_instance_uid}`;
                console.log('URL du viewer:', viewerUrl);
                window.open(viewerUrl, '_blank');
            } else {
                console.error('Pas d\'StudyInstanceUID trouvé pour l\'étude:', studyId);
                setError('Impossible de trouver les informations de l\'étude DICOM');
            }
        } catch (error) {
            console.error('Erreur détaillée lors de la visualisation DICOM:', {
                message: error.message,
                studyId,
                dicomStudies
            });
            setError('Une erreur est survenue lors de l\'ouverture de l\'image DICOM');
        }
    };

    const handleDeleteDicom = async (studyId) => {
        try {
            console.log('Début de la suppression DICOM pour l\'étude:', studyId);
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('Pas de token trouvé');
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            // Récupérer l'étude DICOM
            console.log('Recherche de l\'étude dans les données:', dicomStudies);
            const study = dicomStudies.find(s => s.id === studyId);
            if (!study) {
                console.error('Étude non trouvée dans les données:', { studyId, dicomStudies });
                setError('Étude DICOM non trouvée');
                return;
            }

            console.log('Étude trouvée:', study);

            // Supprimer l'étude DICOM directement
            try {
                const deleteResponse = await axios.delete(
                    `http://localhost:8000/api/dicom/studies/${studyId}/`,
                    { headers }
                );
                console.log('Réponse de la suppression:', deleteResponse);
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'étude:', {
                    studyId,
                    error: error.response?.data || error.message
                });
                throw error;
            }

            // Rafraîchir les données
            console.log('Rafraîchissement des données après suppression...');
            await fetchData();
            console.log('Données rafraîchies avec succès');
        } catch (error) {
            console.error('Erreur détaillée lors de la suppression:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
                config: error.config
            });
            setError('Une erreur est survenue lors de la suppression de l\'image DICOM');
        }
    };

    if (loading) return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.2rem',
            color: '#666'
        }}>
            Chargement...
        </div>
    );

    if (error) return (
        <div style={{
            color: '#dc3545',
            padding: '20px',
            textAlign: 'center',
            fontSize: '1.1rem'
        }}>
            {error}
        </div>
    );

    if (!patient) return null;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Dossier médical de {patient.first_name} {patient.last_name}</h1>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Informations personnelles</h2>
                <div style={styles.patientInfo}>
                    <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Nom complet</div>
                        <div style={styles.infoValue}>{patient.first_name} {patient.last_name}</div>
                    </div>
                    <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Email</div>
                        <div style={styles.infoValue}>{patient.email}</div>
                    </div>
                    <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Téléphone</div>
                        <div style={styles.infoValue}>{patient.phone}</div>
                    </div>
                    <div style={styles.infoItem}>
                        <div style={styles.infoLabel}>Date de naissance</div>
                        <div style={styles.infoValue}>{new Date(patient.date_of_birth).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            <div style={styles.section}>
                <div style={styles.tabContainer}>
                    <div style={styles.tabButtons}>
                        <button
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'records' ? styles.activeTabButton : {})
                            }}
                            onClick={() => setActiveTab('records')}
                        >
                            Dossiers médicaux
                        </button>
                        <button
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'dicom' ? styles.activeTabButton : {})
                            }}
                            onClick={() => setActiveTab('dicom')}
                        >
                            Images DICOM
                        </button>
                    </div>

                    {activeTab === 'records' && (
                        <>
                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={() => setShowAddRecord(true)}
                                    style={styles.primaryButton}
                                >
                                    Nouvelle consultation
                                </button>
                            </div>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>Date</th>
                                            <th style={styles.tableHeader}>Motif</th>
                                            <th style={styles.tableHeader}>Diagnostic</th>
                                            <th style={styles.tableHeader}>Plan de traitement</th>
                                            <th style={styles.tableHeader}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicalRecords.map(record => (
                                            <tr key={record.id} style={styles.tableRow}>
                                                <td style={styles.tableCell}>
                                                    {new Date(record.record_date).toLocaleDateString()}
                                                </td>
                                                <td style={styles.tableCell}>{record.chief_complaint}</td>
                                                <td style={styles.tableCell}>{record.diagnosis}</td>
                                                <td style={styles.tableCell}>{record.treatment_plan}</td>
                                                <td style={styles.tableCell}>
                                                    <button
                                                        onClick={() => navigate(`/medical-records/${record.id}`)}
                                                        style={styles.secondaryButton}
                                                    >
                                                        Voir détails
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'dicom' && (
                        <>
                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={() => setShowAddDicom(true)}
                                    style={styles.primaryButton}
                                >
                                    Ajouter une image DICOM
                                </button>
                            </div>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>Date d'étude</th>
                                            <th style={styles.tableHeader}>Description</th>
                                            <th style={styles.tableHeader}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dicomStudies.map(study => (
                                            <tr key={study.id} style={styles.tableRow}>
                                                <td style={styles.tableCell}>
                                                    {new Date(study.study_date).toLocaleDateString()}
                                                </td>
                                                <td style={styles.tableCell}>{study.study_description}</td>
                                                <td style={styles.tableCell}>
                                                    <div style={styles.buttonGroup}>
                                                        <button
                                                            onClick={() => handleViewDicom(study.id)}
                                                            style={styles.secondaryButton}
                                                        >
                                                            Voir l'image
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDicom(study.id)}
                                                            style={{...styles.secondaryButton, backgroundColor: '#dc3545'}}
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showAddRecord && (
                <div style={styles.modal}>
                    <div style={styles.form}>
                        <h2 style={styles.sectionTitle}>Nouvelle consultation</h2>
                        <form onSubmit={handleAddRecord}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Motif de consultation</label>
                                <textarea
                                    style={styles.textarea}
                                    value={newRecord.chief_complaint}
                                    onChange={(e) => setNewRecord({...newRecord, chief_complaint: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Diagnostic</label>
                                <textarea
                                    style={styles.textarea}
                                    value={newRecord.diagnosis}
                                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Plan de traitement</label>
                                <textarea
                                    style={styles.textarea}
                                    value={newRecord.treatment_plan}
                                    onChange={(e) => setNewRecord({...newRecord, treatment_plan: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Notes</label>
                                <textarea
                                    style={styles.textarea}
                                    value={newRecord.notes}
                                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                                />
                            </div>
                            <div style={styles.buttonGroup}>
                                <button type="submit" style={styles.primaryButton}>
                                    Enregistrer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddRecord(false)}
                                    style={{...styles.secondaryButton, backgroundColor: '#6c757d'}}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAddDicom && (
                <div style={styles.modal}>
                    <div style={styles.form}>
                        <h2 style={styles.sectionTitle}>Ajouter une image DICOM</h2>
                        <form onSubmit={handleUploadDicom}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Fichier DICOM</label>
                                <input
                                    type="file"
                                    accept=".dcm"
                                    onChange={handleFileChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.buttonGroup}>
                                <button type="submit" style={styles.primaryButton}>
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddDicom(false)}
                                    style={{...styles.secondaryButton, backgroundColor: '#6c757d'}}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientMedicalRecord;