from rest_framework import serializers
from .models import DicomStudy, DicomSeries, DicomInstance
from medical.serializers import UserSerializer

class DicomInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DicomInstance
        fields = [
            'id', 'sop_instance_uid', 'instance_number', 'file_path',
            'file_size', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class DicomSeriesSerializer(serializers.ModelSerializer):
    instances = DicomInstanceSerializer(many=True, read_only=True)
    instance_count = serializers.IntegerField(source='instances.count', read_only=True)

    class Meta:
        model = DicomSeries
        fields = [
            'id', 'series_instance_uid', 'series_number', 'series_description',
            'modality', 'number_of_instances', 'is_active', 'instances',
            'instance_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class DicomStudySerializer(serializers.ModelSerializer):
    patient_details = UserSerializer(source='patient', read_only=True)
    doctor_details = UserSerializer(source='doctor', read_only=True)
    series = DicomSeriesSerializer(many=True, read_only=True)
    series_count = serializers.IntegerField(source='series.count', read_only=True)

    class Meta:
        model = DicomStudy
        fields = [
            'id', 'patient', 'patient_details', 'doctor', 'doctor_details',
            'study_instance_uid', 'study_date', 'study_description', 'study_id',
            'accession_number', 'is_active', 'series', 'series_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at'] 