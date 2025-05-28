from rest_framework import permissions
from medical.models import PatientDoctor

class IsDicomStudyParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Le patient peut voir ses propres études
        if request.user.role == 'PATIENT':
            return obj.patient == request.user
        
        # Le médecin peut voir les études de ses patients
        if request.user.role == 'DOCTOR':
            return PatientDoctor.objects.filter(
                patient=obj.patient,
                doctor=request.user
            ).exists()
        
        # Les secrétaires n'ont pas accès aux images DICOM
        return False

class CanUploadDicom(permissions.BasePermission):
    def has_permission(self, request, view):
        # Seuls les médecins peuvent uploader des images DICOM
        return request.user.role == 'DOCTOR'

class CanDeleteDicom(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Seuls les médecins peuvent supprimer les images
        if request.user.role != 'DOCTOR':
            return False
            
        # Le médecin peut supprimer s'il est le créateur de l'étude
        if hasattr(obj, 'doctor') and obj.doctor == request.user:
            return True
            
        # Le médecin peut supprimer s'il est lié au patient
        if hasattr(obj, 'patient'):
            return PatientDoctor.objects.filter(
                patient=obj.patient,
                doctor=request.user
            ).exists()
            
        return False 