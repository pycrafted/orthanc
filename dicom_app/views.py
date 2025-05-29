from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import tempfile
import requests
from django.conf import settings
from .models import DicomStudy, DicomSeries, DicomInstance
from .serializers import DicomStudySerializer, DicomSeriesSerializer, DicomInstanceSerializer
from .permissions import IsDicomStudyParticipant, CanUploadDicom, CanDeleteDicom
from .utils import extract_dicom_metadata

# Create your views here.

class DicomStudyViewSet(viewsets.ModelViewSet):
    queryset = DicomStudy.objects.all()
    serializer_class = DicomStudySerializer
    permission_classes = [IsAuthenticated, IsDicomStudyParticipant, CanDeleteDicom]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return DicomStudy.objects.filter(patient=user)
        elif user.role == 'DOCTOR':
            return DicomStudy.objects.filter(doctor=user)
        # Les secrétaires n'ont pas accès aux études DICOM
        return DicomStudy.objects.none()

    @action(detail=True, methods=['get'])
    def viewer_url(self, request, pk=None):
        study = self.get_object()
        
        # Configuration de l'OHIF Viewer
        ohif_viewer_url = settings.OHIF_VIEWER_URL  # Par exemple: 'http://localhost:3000/viewer'
        
        # Paramètres pour l'étude DICOM
        study_params = {
            'studyInstanceUID': study.study_instance_uid,
            'wadoURL': f"{settings.DICOM_WEB_URL}/wado",  # URL du serveur DICOM Web
            'qidoURL': f"{settings.DICOM_WEB_URL}/qido",  # URL pour les requêtes QIDO
            'wadoURL': f"{settings.DICOM_WEB_URL}/wado",  # URL pour les requêtes WADO
        }
        
        # Construction de l'URL complète
        viewer_url = f"{ohif_viewer_url}?studyInstanceUID={study_params['studyInstanceUID']}"
        viewer_url += f"&wadoURL={study_params['wadoURL']}"
        viewer_url += f"&qidoURL={study_params['qidoURL']}"
        
        return Response({
            'viewer_url': viewer_url,
            'study_instance_uid': study.study_instance_uid,
            'study_description': study.study_description,
            'study_date': study.study_date
        })

    @action(detail=False, methods=['post'])
    def upload_dicom(self, request):
        print("=== Début de l'upload DICOM (UIDs minimaux) ===")
        print(f"Utilisateur: {request.user}")
        print(f"Rôle: {request.user.role}")

        if not CanUploadDicom().has_permission(request, self):
            print("Permission refusée pour l'upload")
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        dicom_file = request.FILES.get('file')
        patient_id = request.POST.get('patient')

        print(f"Fichier reçu: {dicom_file.name if dicom_file else 'None'}")
        print(f"ID du patient: {patient_id}")

        if not dicom_file:
            print("Erreur: Aucun fichier fourni")
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not patient_id:
            print("Erreur: ID du patient manquant")
            return Response(
                {'error': 'Patient ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        import uuid
        from datetime import date
        try:
            # Sauvegarder temporairement le fichier
            print("Sauvegarde temporaire du fichier...")
            temp_file = tempfile.NamedTemporaryFile(delete=False)
            for chunk in dicom_file.chunks():
                temp_file.write(chunk)
            temp_file.close()
            print(f"Fichier temporaire créé: {temp_file.name}")

            # Fonction utilitaire locale pour extraire les UIDs minimaux
            def extract_minimal_dicom_uids(file_path):
                try:
                    import pydicom
                    ds = pydicom.dcmread(file_path, stop_before_pixels=True)
                    study_uid = getattr(ds, 'StudyInstanceUID', None)
                    series_uid = getattr(ds, 'SeriesInstanceUID', None)
                    sop_uid = getattr(ds, 'SOPInstanceUID', None)
                    return {
                        'study_instance_uid': str(study_uid) if study_uid else None,
                        'series_instance_uid': str(series_uid) if series_uid else None,
                        'sop_instance_uid': str(sop_uid) if sop_uid else None,
                    }
                except Exception as e:
                    print(f"Impossible d'extraire les UIDs DICOM: {e}")
                    return {
                        'study_instance_uid': None,
                        'series_instance_uid': None,
                        'sop_instance_uid': None,
                    }

            # Extraire les UIDs minimaux
            uids = extract_minimal_dicom_uids(temp_file.name)
            print(f"UIDs extraits: {uids}")

            # Générer des identifiants si absents
            study_instance_uid = uids['study_instance_uid'] or str(uuid.uuid4())
            series_instance_uid = uids['series_instance_uid'] or str(uuid.uuid4())
            sop_instance_uid = uids['sop_instance_uid'] or str(uuid.uuid4())

            # Créer l'étude DICOM (ou la retrouver si déjà existante pour ce patient et ce fichier)
            study, created = DicomStudy.objects.get_or_create(
                study_instance_uid=study_instance_uid,
                defaults={
                    'patient_id': patient_id,
                    'doctor': request.user,
                    'study_date': date.today(),
                    'study_description': 'Étude DICOM (UIDs minimaux)',
                    'study_id': study_instance_uid,
                    'accession_number': ''
                }
            )
            print(f"Étude {'créée' if created else 'récupérée'}: {study}")

            # Créer la série DICOM
            series, created = DicomSeries.objects.get_or_create(
                study=study,
                series_instance_uid=series_instance_uid,
                defaults={
                    'series_number': 1,
                    'series_description': 'Série (UIDs minimaux)',
                    'modality': 'OT',  # "Other"
                    'number_of_instances': 1
                }
            )
            print(f"Série {'créée' if created else 'récupérée'}: {series}")

            # Envoyer le fichier à Orthanc (optionnel, peut être commenté si non utilisé)
            try:
                print("Envoi du fichier à Orthanc...")
                orthanc_url = 'http://localhost:8042/instances'
                with open(temp_file.name, 'rb') as f:
                    response = requests.post(orthanc_url, data=f)
                    print(f"Réponse Orthanc: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"Erreur lors de l'envoi à Orthanc (ignorée): {e}")

            # Créer l'instance DICOM
            instance = DicomInstance.objects.create(
                series=series,
                sop_instance_uid=sop_instance_uid,
                instance_number=1,
                file_path=temp_file.name,  # Chemin local temporaire
                file_size=dicom_file.size
            )
            print(f"Instance créée: {instance}")

            # Retourner les données de l'étude avec les séries
            serializer = self.get_serializer(study)
            print("=== Upload DICOM terminé avec succès (UIDs minimaux) ===")
            return Response({
                'message': 'DICOM file uploaded successfully (minimal UIDs)',
                'study': serializer.data
            })

        except Exception as e:
            print(f"=== Erreur lors de l'upload DICOM: {str(e)} ===")
            if 'temp_file' in locals():
                print("Nettoyage du fichier temporaire après erreur...")
                os.unlink(temp_file.name)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        print("=== Début de la suppression de l'étude DICOM ===")
        try:
            # Récupérer l'étude
            study = self.get_object()
            print(f"Étude à supprimer: {study}")
            print(f"UID de l'étude: {study.study_instance_uid}")
            print(f"Patient: {study.patient}")
            print(f"Médecin: {study.doctor}")
            print(f"Utilisateur actuel: {request.user}")
            
            # Vérifier les permissions
            if not CanDeleteDicom().has_object_permission(request, self, study):
                print("Permission refusée pour la suppression")
                return Response(
                    {'error': 'Vous n\'avez pas la permission de supprimer cette étude DICOM'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Vérifier si l'étude existe dans Orthanc
            print("Vérification de l'existence de l'étude dans Orthanc...")
            check_url = f'http://localhost:8042/studies/{study.study_instance_uid}'
            check_response = requests.get(check_url)
            
            if check_response.status_code == 404:
                print("L'étude n'existe pas dans Orthanc, suppression uniquement de la base de données")
                study.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            # Supprimer l'étude d'Orthanc
            print("Suppression de l'étude d'Orthanc...")
            orthanc_url = f'http://localhost:8042/studies/{study.study_instance_uid}'
            print(f"URL Orthanc: {orthanc_url}")
            
            response = requests.delete(orthanc_url)
            print(f"Réponse Orthanc: {response.status_code} - {response.text}")
            
            if response.status_code == 200:
                print("Suppression de l'étude de la base de données...")
                study.delete()
                print("=== Suppression de l'étude DICOM terminée avec succès ===")
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            # Gestion des erreurs spécifiques d'Orthanc
            if response.status_code == 404:
                print("L'étude n'existe pas dans Orthanc, suppression uniquement de la base de données")
                study.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            elif response.status_code == 403:
                print("Permission refusée par Orthanc")
                return Response(
                    {'error': 'Permission refusée par le serveur DICOM'},
                    status=status.HTTP_403_FORBIDDEN
                )
            else:
                print(f"Erreur Orthanc: {response.text}")
                return Response(
                    {'error': f'Erreur lors de la suppression de l\'étude: {response.text}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            print(f"=== Erreur lors de la suppression de l'étude DICOM: {str(e)} ===")
            return Response(
                {'error': f'Une erreur est survenue lors de la suppression: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DicomSeriesViewSet(viewsets.ModelViewSet):
    queryset = DicomSeries.objects.all()
    serializer_class = DicomSeriesSerializer
    permission_classes = [IsAuthenticated, IsDicomStudyParticipant]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return DicomSeries.objects.filter(study__patient=user)
        elif user.role == 'DOCTOR':
            return DicomSeries.objects.filter(study__doctor=user)
        # Les secrétaires n'ont pas accès aux séries DICOM
        return DicomSeries.objects.none()

class DicomInstanceViewSet(viewsets.ModelViewSet):
    queryset = DicomInstance.objects.all()
    serializer_class = DicomInstanceSerializer
    permission_classes = [IsAuthenticated, IsDicomStudyParticipant, CanDeleteDicom]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return DicomInstance.objects.filter(series__study__patient=user)
        elif user.role == 'DOCTOR':
            return DicomInstance.objects.filter(series__study__doctor=user)
        # Les secrétaires n'ont pas accès aux instances DICOM
        return DicomInstance.objects.none()

    def destroy(self, request, *args, **kwargs):
        print("=== Début de la suppression DICOM ===")
        instance = self.get_object()
        print(f"Instance à supprimer: {instance}")
        print(f"UID de l'instance: {instance.sop_instance_uid}")
        
        try:
            # Supprimer l'instance d'Orthanc
            print("Suppression de l'instance d'Orthanc...")
            orthanc_url = f'http://localhost:8042/instances/{instance.sop_instance_uid}'
            print(f"URL Orthanc: {orthanc_url}")
            
            response = requests.delete(orthanc_url)
            print(f"Réponse Orthanc: {response.status_code} - {response.text}")
            
            if response.status_code == 200:
                print("Suppression de l'instance de la base de données...")
                instance.delete()
                print("=== Suppression DICOM terminée avec succès ===")
                return Response(status=status.HTTP_204_NO_CONTENT)
                
            print(f"Erreur Orthanc: {response.text}")
            return Response(
                {'error': 'Failed to delete instance from Orthanc'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            print(f"=== Erreur lors de la suppression DICOM: {str(e)} ===")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
