from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Hospital, PatientDoctor, Appointment, MedicalRecord, MedicalHistory, Treatment, Examination
from .serializers import (
    HospitalSerializer, UserSerializer, PatientDoctorSerializer,
    AppointmentSerializer, MedicalRecordSerializer, MedicalHistorySerializer,
    TreatmentSerializer, ExaminationSerializer
)
from .permissions import (
    IsSuperAdmin, IsHospitalAdmin, IsDoctor, IsSecretary,
    IsPatient, IsSameHospital, IsPatientDoctor, IsAppointmentParticipant,
    IsMedicalRecordParticipant
)
from django_filters.rest_framework import DjangoFilterBackend

User = get_user_model()

class HospitalViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour la gestion des hôpitaux.
    Les super admins peuvent accéder à tous les hôpitaux.
    Les administrateurs d'hôpital peuvent accéder à leur propre hôpital.
    """
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsSuperAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPER_ADMIN':
            return Hospital.objects.all()
        elif user.role == 'HOSPITAL_ADMIN':
            return Hospital.objects.filter(id=user.hospital.id)
        return Hospital.objects.none()

    def get_object(self):
        obj = super().get_object()
        if self.request.user.role == 'HOSPITAL_ADMIN' and obj.id != self.request.user.hospital.id:
            raise PermissionError("Vous n'avez pas la permission d'accéder à cet hôpital")
        return obj

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour la gestion des utilisateurs.
    Les permissions varient selon le rôle de l'utilisateur connecté.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"User role: {user.role}")
        print(f"User hospital: {user.hospital}")
        
        queryset = None
        if user.role == 'SUPER_ADMIN':
            queryset = User.objects.all()
        elif user.role == 'HOSPITAL_ADMIN':
            queryset = User.objects.filter(hospital=user.hospital)
            print(f"Filtering users for hospital {user.hospital.id}")
            print(f"Found {queryset.count()} users")
        elif user.role == 'DOCTOR':
            queryset = User.objects.filter(
                Q(role='PATIENT', doctors__doctor=user) |
                Q(id=user.id)
            )
        elif user.role == 'SECRETARY':
            queryset = User.objects.filter(
                Q(role='PATIENT') |
                Q(role='DOCTOR', hospital=user.hospital) |
                Q(id=user.id)
            )
        else:
            queryset = User.objects.filter(id=user.id)

        # Appliquer les filtres de requête
        role = self.request.query_params.get('role', None)
        hospital = self.request.query_params.get('hospital', None)
        
        if role:
            print(f"Filtering by role: {role}")
            queryset = queryset.filter(role=role)
        if hospital:
            print(f"Filtering by hospital: {hospital}")
            queryset = queryset.filter(hospital=hospital)
            
        print(f"Final queryset count: {queryset.count()}")
        return queryset

    def get_permissions(self):
        if self.action in ['create']:
            if self.request.user.role == 'SUPER_ADMIN':
                return [IsAuthenticated(), IsSuperAdmin()]
            elif self.request.user.role == 'HOSPITAL_ADMIN':
                return [IsAuthenticated(), IsHospitalAdmin()]
            elif self.request.user.role == 'SECRETARY':
                return [IsAuthenticated(), IsSecretary()]
        return super().get_permissions()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'HOSPITAL_ADMIN':
            serializer.save(hospital=user.hospital)
        else:
            serializer.save()

    @swagger_auto_schema(
        operation_description="Liste des utilisateurs selon le rôle de l'utilisateur connecté",
        responses={
            200: UserSerializer(many=True),
            403: "Permission refusée"
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Création d'un nouvel utilisateur",
        request_body=UserSerializer,
        responses={
            201: UserSerializer,
            400: "Données invalides",
            403: "Permission refusée"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class PatientDoctorViewSet(viewsets.ModelViewSet):
    queryset = PatientDoctor.objects.all()
    serializer_class = PatientDoctorSerializer
    permission_classes = [IsAuthenticated, IsPatientDoctor]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'DOCTOR':
            return PatientDoctor.objects.filter(doctor=user)
        elif user.role == 'PATIENT':
            return PatientDoctor.objects.filter(patient=user)
        return PatientDoctor.objects.none()

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAppointmentParticipant]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'DOCTOR':
            return Appointment.objects.filter(doctor=user)
        elif user.role == 'PATIENT':
            return Appointment.objects.filter(patient=user)
        elif user.role == 'SECRETARY':
            return Appointment.objects.filter(doctor__hospital=user.hospital)
        return Appointment.objects.none()

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        if request.user.role != 'SECRETARY':
            return Response(
                {'detail': 'Seuls les secrétaires peuvent confirmer les rendez-vous.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointment.status = 'CONFIRMED'
        appointment.save()
        
        # Créer la relation patient-médecin si elle n'existe pas
        PatientDoctor.objects.get_or_create(
            patient=appointment.patient,
            doctor=appointment.doctor
        )
        
        return Response({'status': 'appointment confirmed'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        if request.user.role not in ['SECRETARY', 'DOCTOR', 'PATIENT']:
            return Response(
                {'detail': 'Vous n\'avez pas la permission d\'annuler ce rendez-vous.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointment.status = 'CANCELLED'
        appointment.save()
        return Response({'status': 'appointment cancelled'})

class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour la gestion des dossiers médicaux.
    Les permissions varient selon le rôle de l'utilisateur connecté.
    """
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated, IsMedicalRecordParticipant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['patient', 'doctor', 'record_date', 'is_active']
    search_fields = ['chief_complaint', 'diagnosis', 'treatment_plan', 'notes']
    ordering_fields = ['record_date', 'created_at', 'updated_at']
    ordering = ['-record_date']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return MedicalRecord.objects.filter(patient=user)
        elif user.role == 'DOCTOR':
            return MedicalRecord.objects.filter(doctor=user)
        # Les secrétaires n'ont pas accès aux dossiers médicaux
        return MedicalRecord.objects.none()

    def perform_create(self, serializer):
        medical_record = serializer.save()
        # Créer la relation patient-médecin si elle n'existe pas
        PatientDoctor.objects.get_or_create(
            patient=medical_record.patient,
            doctor=medical_record.doctor
        )

    @swagger_auto_schema(
        operation_description="Liste des dossiers médicaux selon le rôle de l'utilisateur connecté",
        responses={
            200: MedicalRecordSerializer(many=True),
            403: "Permission refusée"
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Création d'un nouveau dossier médical",
        request_body=MedicalRecordSerializer,
        responses={
            201: MedicalRecordSerializer,
            400: "Données invalides",
            403: "Permission refusée"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class MedicalHistoryViewSet(viewsets.ModelViewSet):
    queryset = MedicalHistory.objects.all()
    serializer_class = MedicalHistorySerializer
    permission_classes = [IsAuthenticated, IsMedicalRecordParticipant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['medical_record', 'condition', 'is_active']
    search_fields = ['condition', 'description']
    ordering_fields = ['start_date', 'created_at', 'updated_at']
    ordering = ['-start_date']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return MedicalHistory.objects.filter(medical_record__patient=user)
        elif user.role == 'DOCTOR':
            return MedicalHistory.objects.filter(medical_record__doctor=user)
        # Les secrétaires n'ont pas accès aux antécédents médicaux
        return MedicalHistory.objects.none()

class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.all()
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated, IsMedicalRecordParticipant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['medical_record', 'medication', 'is_active']
    search_fields = ['medication', 'dosage', 'frequency', 'notes']
    ordering_fields = ['start_date', 'created_at', 'updated_at']
    ordering = ['-start_date']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return Treatment.objects.filter(medical_record__patient=user)
        elif user.role == 'DOCTOR':
            return Treatment.objects.filter(medical_record__doctor=user)
        # Les secrétaires n'ont pas accès aux traitements
        return Treatment.objects.none()

class ExaminationViewSet(viewsets.ModelViewSet):
    queryset = Examination.objects.all()
    serializer_class = ExaminationSerializer
    permission_classes = [IsAuthenticated, IsMedicalRecordParticipant]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['medical_record', 'exam_type', 'is_active']
    search_fields = ['exam_type', 'result', 'notes']
    ordering_fields = ['exam_date', 'created_at', 'updated_at']
    ordering = ['-exam_date']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return Examination.objects.filter(medical_record__patient=user)
        elif user.role == 'DOCTOR':
            return Examination.objects.filter(medical_record__doctor=user)
        # Les secrétaires n'ont pas accès aux examens
        return Examination.objects.none()
