from rest_framework import permissions
from medical.models import PatientDoctor

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'SUPER_ADMIN'

class IsHospitalAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'HOSPITAL_ADMIN'

class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'DOCTOR'

class IsSecretary(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'SECRETARY'

class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'PATIENT'

class IsSameHospital(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.hospital:
            return False
        return obj.hospital == request.user.hospital

class IsPatientDoctor(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'DOCTOR':
            return obj.patient in request.user.patients.all()
        elif request.user.role == 'PATIENT':
            return obj.patient == request.user
        return False

class IsAppointmentParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'DOCTOR':
            return obj.doctor == request.user
        elif request.user.role == 'PATIENT':
            return obj.patient == request.user
        elif request.user.role == 'SECRETARY':
            return obj.doctor.hospital == request.user.hospital
        return False

class IsMedicalRecordParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Le patient peut voir son propre dossier
        if request.user.role == 'PATIENT':
            return obj.patient == request.user
        
        # Le médecin peut voir les dossiers de ses patients
        if request.user.role == 'DOCTOR':
            return PatientDoctor.objects.filter(
                patient=obj.patient,
                doctor=request.user
            ).exists()
        
        # Les secrétaires n'ont pas accès aux dossiers médicaux
        return False

class CanEditMedicalRecord(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Seuls les médecins liés au patient peuvent modifier le dossier
        if request.user.role == 'DOCTOR':
            return PatientDoctor.objects.filter(
                patient=obj.patient,
                doctor=request.user
            ).exists()
        
        return False 