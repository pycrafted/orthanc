# Plan de Migration : Intégration Directe d'OHIF Viewer dans l'Application

## Objectif
Intégrer le viewer DICOM OHIF directement dans l'interface de l'application (React), sans redirection externe, pour une expérience utilisateur fluide et centralisée.

---

## Phase 1 : Préparation — Compte-rendu

### 1.1. Analyse de l'existant (résumé)

- **Composant principal identifié : `PatientMedicalRecord.js` (frontend/src/components/)**
  - Gère l'affichage des études DICOM d'un patient (`dicomStudies`)
  - Permet l'upload d'images DICOM
  - Action « Voir l'image » : ouvre actuellement une nouvelle fenêtre vers l'URL OHIF externe (`window.open(viewerUrl, '_blank')`)
  - Permet la suppression d'une étude DICOM
  - L'onglet « Images DICOM » liste, ajoute, visualise et supprime les études DICOM

- **Autres composants :**
  - Les dashboards (Doctor, Patient, Secretary, HospitalAdmin, SuperAdmin) ne gèrent pas directement l'affichage DICOM, mais redirigent vers le dossier médical du patient, qui contient la gestion DICOM.

### 1.2. Vérification Orthanc

- Le composant utilise l'URL `http://localhost:8042/ohif/viewer?StudyInstanceUIDs=...` pour ouvrir le viewer, ce qui suppose qu'OHIF est déjà déployé à côté d'Orthanc (port 8042).
- Il faudra vérifier la version d'Orthanc et la présence des plugins REST/WEB côté serveur (à faire manuellement ou via le backend si besoin).

### 1.3. Prochaine étape (Phase 1.2)

- Actuellement, l'intégration se fait par redirection externe (window.open).
- Objectif : Remplacer par une intégration directe dans l'UI React (OHIF comme package npm).

#### Propositions d'actions immédiates

1. Créer un composant React `DicomViewer` (vide pour l'instant, il accueillera OHIF).
2. Préparer l'intégration npm d'OHIF (prochaine étape technique).

---

*Ce compte-rendu sera complété au fil de la migration.*

## Phase 2 : Intégration Technique — Compte-rendu

### 2.1. Installation d'OHIF en tant que composant
- Les dépendances suivantes ont été installées dans le frontend :
  - `@ohif/viewer`
  - `cornerstone-core`
  - `cornerstone-math`
  - `cornerstone-tools`
  - `dicom-parser`
- L'installation a nécessité l'option `--legacy-peer-deps` à cause d'un conflit de version avec React 18.

### 2.2. Création du composant React `DicomViewer`
- Un composant `DicomViewer.js` a été créé dans `frontend/src/components/`.
- Ce composant affiche le viewer OHIF en interne via un `<iframe>`, en passant dynamiquement le `StudyInstanceUID` à l'URL OHIF.
- Si aucun UID n'est fourni, un message d'information s'affiche.

### 2.3. Intégration dans le workflow applicatif
- Le composant `PatientMedicalRecord.js` a été modifié :
  - La redirection externe (`window.open`) a été supprimée.
  - Un état local gère l'étude DICOM sélectionnée et l'affichage du viewer.
  - Lorsqu'un utilisateur clique sur "Voir l'image", le composant `DicomViewer` s'affiche dans un modal interne, offrant une expérience fluide et centralisée.

---

*Prochaine étape : tests, gestion de la sécurité/authentification, puis documentation et déploiement.*

## Phase 3 : Communication avec Orthanc
### 3.1. Authentification et Sécurité
- **S'assurer que les requêtes OHIF vers Orthanc passent par le backend (proxy ou API Gateway) si besoin**
- **Gérer les headers d'authentification (JWT, Basic Auth, etc.)**

### 3.2. Gestion des URLs d'études/séries
- **Mettre en place une fonction pour générer dynamiquement les URLs DICOM à partir de l'UI**
- **Vérifier la compatibilité des endpoints Orthanc avec OHIF**

---

## Phase 4 : Sécurité et Permissions
### 4.1. Contrôle d'accès
- **Limiter l'accès au viewer selon le rôle utilisateur (médecin, admin, etc.)**
- **Logger les accès et actions sur les images**

### 4.2. Anonymisation (optionnel)
- **Ajouter une option d'anonymisation avant affichage ou export**

---

## Phase 5 : Tests et Validation
### 5.1. Tests unitaires et d'intégration
- **Tester l'affichage d'études DICOM de différents types (CT, IRM, RX, etc.)**
- **Vérifier la navigation, zoom, outils d'annotation**

### 5.2. Tests utilisateurs
- **Recueillir les retours des utilisateurs finaux (médecins, secrétaires, etc.)**
- **Corriger les bugs et améliorer l'UX**

---

## Phase 6 : Documentation et Déploiement
### 6.1. Documentation
- **Documenter l'installation, la configuration et l'utilisation du viewer intégré**
- **Ajouter des captures d'écran et des exemples d'utilisation**

### 6.2. Déploiement
- **Déployer sur un environnement de test**
- **Valider la stabilité et la sécurité**
- **Déployer en production**

---

## Suivi et Validation
- **Valider chaque sous-phase avant de passer à la suivante**
- **Utiliser ce document comme checklist de migration**

---

**À chaque étape, tester et valider avant d'avancer.**

---

*Document à compléter au fil de la migration. N'hésite pas à ajouter des remarques ou des points spécifiques selon les besoins de ton application.* 