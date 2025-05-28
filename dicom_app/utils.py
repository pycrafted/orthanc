import os
import pydicom
from datetime import datetime
import requests
from django.conf import settings

def extract_dicom_metadata(file_path):
    """Extrait les métadonnées d'un fichier DICOM."""
    try:
        ds = pydicom.dcmread(file_path)
        
        # Extraire les métadonnées de base
        metadata = {
            'study_instance_uid': str(ds.StudyInstanceUID),
            'series_instance_uid': str(ds.SeriesInstanceUID),
            'sop_instance_uid': str(ds.SOPInstanceUID),
            'modality': str(ds.Modality),
            'study_date': ds.StudyDate,
            'study_description': str(ds.StudyDescription) if hasattr(ds, 'StudyDescription') else '',
            'series_description': str(ds.SeriesDescription) if hasattr(ds, 'SeriesDescription') else '',
            'series_number': int(ds.SeriesNumber) if hasattr(ds, 'SeriesNumber') else 0,
            'instance_number': int(ds.InstanceNumber) if hasattr(ds, 'InstanceNumber') else 0,
            'study_id': str(ds.StudyID) if hasattr(ds, 'StudyID') else '',
            'accession_number': str(ds.AccessionNumber) if hasattr(ds, 'AccessionNumber') else '',
            'number_of_instances': 1  # Par défaut, on suppose une seule instance
        }
        
        return metadata
    except Exception as e:
        raise Exception(f"Erreur lors de l'extraction des métadonnées DICOM: {str(e)}")

def get_orthanc_instances():
    """Récupère la liste des instances depuis Orthanc."""
    try:
        response = requests.get('http://localhost:8042/instances')
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Erreur lors de la récupération des instances: {response.text}")
    except Exception as e:
        raise Exception(f"Erreur lors de la communication avec Orthanc: {str(e)}")

def get_orthanc_studies():
    """Récupère la liste des études depuis Orthanc."""
    try:
        response = requests.get('http://localhost:8042/studies')
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Erreur lors de la récupération des études: {response.text}")
    except Exception as e:
        raise Exception(f"Erreur lors de la communication avec Orthanc: {str(e)}")

def get_orthanc_series():
    """Récupère la liste des séries depuis Orthanc."""
    try:
        response = requests.get('http://localhost:8042/series')
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Erreur lors de la récupération des séries: {response.text}")
    except Exception as e:
        raise Exception(f"Erreur lors de la communication avec Orthanc: {str(e)}") 