from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import requests

class WADOView(APIView):
    def get(self, request):
        try:
            # Récupérer les paramètres de la requête
            study_instance_uid = request.GET.get('studyUID')
            series_instance_uid = request.GET.get('seriesUID')
            object_instance_uid = request.GET.get('objectUID')
            
            if not all([study_instance_uid, series_instance_uid, object_instance_uid]):
                return Response(
                    {'error': 'Missing required parameters'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Construire l'URL Orthanc
            orthanc_url = f'http://localhost:8042/wado'
            params = {
                'studyUID': study_instance_uid,
                'seriesUID': series_instance_uid,
                'objectUID': object_instance_uid,
                'requestType': 'WADO',
                'contentType': 'application/dicom'
            }

            # Faire la requête à Orthanc
            response = requests.get(orthanc_url, params=params)
            
            if response.status_code == 200:
                return Response(
                    response.content,
                    content_type='application/dicom'
                )
            else:
                return Response(
                    {'error': f'Orthanc error: {response.text}'},
                    status=response.status_code
                )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class QIDOView(APIView):
    def get(self, request):
        try:
            # Récupérer les paramètres de la requête
            study_instance_uid = request.GET.get('StudyInstanceUID')
            
            if not study_instance_uid:
                return Response(
                    {'error': 'Missing StudyInstanceUID parameter'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Construire l'URL Orthanc
            orthanc_url = f'http://localhost:8042/dicom-web/qido'
            params = {
                'StudyInstanceUID': study_instance_uid
            }

            # Faire la requête à Orthanc
            response = requests.get(orthanc_url, params=params)
            
            if response.status_code == 200:
                return Response(response.json())
            else:
                return Response(
                    {'error': f'Orthanc error: {response.text}'},
                    status=response.status_code
                )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 