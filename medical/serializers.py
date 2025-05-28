from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Hospital, PatientDoctor, Appointment, Examination, Treatment, MedicalHistory, MedicalRecord

User = get_user_model()

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'address', 'phone', 'email', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'role_display', 'hospital', 'hospital_name', 'phone', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', 'mediconnect')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PatientDoctorSerializer(serializers.ModelSerializer):
    patient_details = UserSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)

    class Meta:
        model = PatientDoctor
        fields = ['id', 'patient', 'patient_details', 'doctor', 'doctor_details', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = UserSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_details', 'doctor', 'doctor_details',
            'date', 'status', 'status_display', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ExaminationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Examination
        fields = [
            'id', 'medical_record', 'exam_type', 'result',
            'exam_date', 'notes', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treatment
        fields = [
            'id', 'medical_record', 'medication', 'dosage',
            'frequency', 'start_date', 'end_date', 'notes',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = [
            'id', 'medical_record', 'condition', 'description',
            'start_date', 'end_date', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_details = UserSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)
    medical_histories = MedicalHistorySerializer(many=True, read_only=True)
    treatments = TreatmentSerializer(many=True, read_only=True)
    examinations = ExaminationSerializer(many=True, read_only=True)
    history_count = serializers.IntegerField(source='medical_histories.count', read_only=True)
    treatment_count = serializers.IntegerField(source='treatments.count', read_only=True)
    examination_count = serializers.IntegerField(source='examinations.count', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient', 'patient_details', 'doctor', 'doctor_details',
            'record_date', 'chief_complaint', 'diagnosis', 'treatment_plan',
            'notes', 'is_active', 'medical_histories', 'treatments',
            'examinations', 'history_count', 'treatment_count',
            'examination_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at'] 