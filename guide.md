Cahier des charges – Backend Django REST pour gestion hospitalière avec DICOM
Objectif général
Développer une application backend complète avec Django 4+ et Django REST Framework pour gérer un système hospitalier moderne intégrant une gestion avancée des images médicales DICOM, avec un contrôle strict des accès selon les rôles.

1. Gestion des utilisateurs et authentification
Rôles disponibles
Super Admin

Admin Hôpital

Médecin

Secrétaire

Patient

Création et attribution des comptes
Mot de passe par défaut :

À la création, le système attribue automatiquement à tout compte un mot de passe par défaut : mediconnect.

Ce mot de passe est obligatoire.

Seul le propriétaire du compte peut modifier ce mot de passe après connexion.

Aucun autre utilisateur (y compris Super Admin ou Admin Hôpital) ne peut modifier le mot de passe d'un autre utilisateur.

Règles de création et de périmètre d'action
Seul un Super Admin peut créer un compte Admin Hôpital.

Un compte Admin Hôpital est toujours rattaché à un seul hôpital lors de sa création (le système doit forcer cette liaison).

Un Admin Hôpital peut créer des comptes Médecin et Secrétaire, qui sont automatiquement rattachés à l'hôpital de l'Admin, sans besoin de spécifier l'hôpital lors de la création.

Plusieurs Admins Hôpital peuvent exister pour un même hôpital. Chaque Admin Hôpital peut gérer tous les comptes Médecins et Secrétaires liés à cet hôpital, même s'ils n'ont pas été créés par lui.

Un Secrétaire peut créer des comptes Patient.

Un utilisateur ne peut gérer que les comptes liés à son périmètre d'hôpital (ex : un Admin Hôpital ne peut pas gérer les comptes d'un autre hôpital).

2. Gestion des patients et associations
Association patient – médecin
Lors de la création du compte Patient par un Secrétaire, le patient doit obligatoirement être associé à un ou plusieurs médecins de l'hôpital du Secrétaire.

Un patient est toujours rattaché à un ou plusieurs médecins, jamais directement à un hôpital.

Un patient peut être lié à plusieurs médecins appartenant à plusieurs hôpitaux différents.

Prise et validation des rendez-vous
Un patient peut faire une demande de rendez-vous auprès d'un médecin de n'importe quel hôpital.

Tant que la demande de rendez-vous n'est pas validée par un secrétaire du médecin concerné, aucun lien entre le patient et ce médecin n'existe.

Une fois validé, la liaison patient–médecin est créée automatiquement, donnant au médecin l'accès au dossier médical et aux images DICOM du patient.

3. Droits et responsabilités par rôle
Super Admin
Crée, modifie, désactive, supprime des hôpitaux.

Crée, modifie, désactive, supprime des Admins Hôpital.

Admin Hôpital
Rattaché à un hôpital unique.

Crée, modifie, désactive, supprime les Médecins et Secrétaires de son hôpital (pas besoin de spécifier l'hôpital, il est attribué automatiquement).

Peut gérer tous les comptes Médecins et Secrétaires de son hôpital, qu'il les ait créés ou non.

Médecin
Rattaché automatiquement à l'hôpital de l'Admin Hôpital qui l'a créé.

Accède uniquement aux dossiers médicaux et images DICOM des patients avec lesquels il est lié.

Peut :

Consulter, modifier et enrichir les dossiers médicaux de ses patients (consultations, antécédents, traitements, etc.).

Uploader, organiser et supprimer des images DICOM pour ses patients.

Supprimer des informations médicales dans les dossiers de ses patients.

Secrétaire
Rattaché automatiquement à l'hôpital de l'Admin Hôpital qui l'a créé.

Crée les comptes Patients, en associant obligatoirement chaque patient à un ou plusieurs médecins de son hôpital.

Valide ou annule les rendez-vous pris par les patients auprès des médecins de son hôpital.

Peut aussi valider les rendez-vous demandés par un patient auprès d'un médecin d'un autre hôpital, créant ainsi un lien patient–médecin.

Patient
Créé uniquement par un Secrétaire, associé obligatoirement à un ou plusieurs médecins à la création.

Peut prendre rendez-vous auprès de n'importe quel médecin.

Accède en lecture seule à son dossier médical complet et à ses images DICOM via OHIF Viewer.

Ne peut ni modifier ni supprimer ses données médicales ou images.

4. Gestion avancée des images DICOM
Modèles :

DicomStudy (étude DICOM liée à un patient et un médecin)

DicomSeries (série appartenant à une étude)

Stockage :

Utilisation de stockage distribué (MinIO, S3 ou équivalent)

Organisation des fichiers : /patients/{patientId}/studies/{studyId}/series/{seriesId}/

Gestion des métadonnées : extraction et indexation.

Système de cache pour images fréquemment accédées.

Respect strict des droits d'accès :

Un patient ne peut accéder qu'à ses propres images.

Seuls les médecins liés au patient peuvent accéder/modifier ces images.

Intégration OHIF Viewer pour visualisation avancée (multi-fenêtres, 3D, export, impression, partage, historique).

Gestion des sessions temporaires avec limitation du nombre simultané.

Interface API pour upload drag & drop, liste, recherche, pagination, téléchargement de rapports.

5. Contraintes techniques
Django 4+ et Django REST Framework.

Base PostgreSQL.

Endpoints RESTful bien documentés (OpenAPI/Swagger).

Gestion des migrations et seeds (création super admin si absent).

Gestion des fichiers volumineux (upload DICOM, streaming).

Configuration pour stockage distribué (MinIO/S3).

Tests unitaires et d'intégration sur fonctionnalités critiques.

Documentation technique complète, monitoring, logs, scalabilité.

# Guide d'Utilisation de l'Application Médicale

## 1. Installation

### Prérequis
- Python 3.8+
- PostgreSQL
- Node.js 14+
- Docker et Docker Compose
- MinIO (pour le stockage des images DICOM)
- OHIF Viewer (pour la visualisation des images DICOM)

### Installation du Backend
1. Cloner le repository
2. Créer un environnement virtuel Python
3. Installer les dépendances Python
4. Configurer les variables d'environnement
5. Appliquer les migrations
6. Lancer le serveur

### Installation du Frontend
1. Naviguer vers le dossier frontend
2. Installer les dépendances Node.js
3. Lancer l'application React

### Installation de MinIO
1. Lancer MinIO avec Docker Compose
2. Configurer les variables d'environnement MinIO

### Installation de l'OHIF Viewer
1. Cloner le repository OHIF Viewer
2. Installer les dépendances
3. Configurer l'URL du serveur DICOM Web
4. Lancer l'OHIF Viewer

## 2. Configuration

### Variables d'Environnement
```env
# Django settings
DEBUG=True
SECRET_KEY=votre_secret_key

# Database settings
DB_NAME=medical_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# MinIO settings
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=medical-images
MINIO_SECURE=False

# OHIF Viewer settings
OHIF_VIEWER_URL=http://localhost:3000/viewer
DICOM_WEB_URL=http://localhost:8000/api/dicom
```

## 3. Fonctionnalités

### Gestion des Patients
- Création de dossiers patients
- Gestion des informations personnelles
- Historique des consultations
- Gestion des rendez-vous

### Gestion des Rendez-vous
- Planification des rendez-vous
- Notifications automatiques
- Gestion des disponibilités
- Rappels automatiques

### Gestion des Dossiers Médicaux
- Création et mise à jour des dossiers
- Historique des consultations
- Prescriptions médicales
- Suivi des traitements

### Gestion des Images DICOM
- Upload des images DICOM
- Stockage sécurisé dans MinIO
- Visualisation via OHIF Viewer
- Gestion des métadonnées DICOM

## 4. API Endpoints

### Patients
- `GET /api/patients/` : Liste des patients
- `POST /api/patients/` : Création d'un patient
- `GET /api/patients/{id}/` : Détails d'un patient
- `PUT /api/patients/{id}/` : Mise à jour d'un patient
- `DELETE /api/patients/{id}/` : Suppression d'un patient

### Rendez-vous
- `GET /api/appointments/` : Liste des rendez-vous
- `POST /api/appointments/` : Création d'un rendez-vous
- `GET /api/appointments/{id}/` : Détails d'un rendez-vous
- `PUT /api/appointments/{id}/` : Mise à jour d'un rendez-vous
- `DELETE /api/appointments/{id}/` : Suppression d'un rendez-vous

### Dossiers Médicaux
- `GET /api/medical-records/` : Liste des dossiers
- `POST /api/medical-records/` : Création d'un dossier
- `GET /api/medical-records/{id}/` : Détails d'un dossier
- `PUT /api/medical-records/{id}/` : Mise à jour d'un dossier
- `DELETE /api/medical-records/{id}/` : Suppression d'un dossier

### Images DICOM
- `GET /api/dicom/studies/` : Liste des études DICOM
- `POST /api/dicom/studies/upload_dicom/` : Upload d'une image DICOM
- `GET /api/dicom/studies/{id}/viewer_url/` : URL de l'OHIF Viewer pour une étude
- `GET /api/dicom/wado/` : Endpoint WADO pour les images
- `GET /api/dicom/qido/` : Endpoint QIDO pour les métadonnées

## 5. Visualisation des Images DICOM

### Configuration de l'OHIF Viewer
1. Lancer l'OHIF Viewer sur le port 3000
2. Configurer l'URL du serveur DICOM Web dans les paramètres
3. Vérifier la connexion avec le serveur

### Utilisation
1. Accéder à la liste des études DICOM dans l'application
2. Cliquer sur "Visualiser" pour une étude
3. L'OHIF Viewer s'ouvre dans un nouvel onglet avec l'étude sélectionnée
4. Utiliser les outils de l'OHIF Viewer pour :
   - Visualiser les images
   - Ajuster la fenêtre
   - Mesurer les distances
   - Ajouter des annotations
   - Exporter les images

## 6. Sécurité

### Authentification
- JWT pour l'authentification API
- Sessions sécurisées
- Gestion des tokens

### Autorisations
- Rôles utilisateurs (Patient, Médecin, Secrétaire)
- Permissions basées sur les rôles
- Vérification des accès aux données

### Protection des Données
- Chiffrement des données sensibles
- Stockage sécurisé des images DICOM
- URLs présignées pour l'accès aux fichiers

## 7. Maintenance

### Sauvegarde
- Sauvegarde régulière de la base de données
- Sauvegarde des images DICOM
- Procédure de restauration

### Monitoring
- Logs d'application
- Monitoring des performances
- Alertes système

### Mise à Jour
- Procédure de mise à jour du backend
- Procédure de mise à jour du frontend
- Procédure de mise à jour de l'OHIF Viewer

## 8. Dépannage

### Problèmes Courants
- Erreurs de connexion à la base de données
- Problèmes d'accès à MinIO
- Erreurs de visualisation DICOM
- Problèmes d'authentification

### Solutions
- Vérification des configurations
- Redémarrage des services
- Nettoyage du cache
- Réinitialisation des tokens

## 9. Support

### Contact
- Support technique
- Assistance utilisateur
- Rapports de bugs

### Documentation
- Documentation technique
- Guide utilisateur
- API documentation

