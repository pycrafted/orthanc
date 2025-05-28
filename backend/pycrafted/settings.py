# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # En production, spécifiez les origines autorisées
CORS_ALLOW_CREDENTIALS = True

# JWT settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# Suppression des configurations OHIF Viewer
# OHIF_VIEWER_URL = 'http://localhost:3000'
# OHIF_VIEWER_CONFIG = {
#     'servers': {
#         'dicomWeb': [
#             {
#                 'name': 'DCMJS',
#                 'wadoUriRoot': 'http://localhost:8000/wado',
#                 'qidoRoot': 'http://localhost:8000/qido',
#                 'wadoRoot': 'http://localhost:8000/wado',
#                 'qidoSupportsIncludeField': True,
#                 'imageRendering': 'wadouri',
#                 'thumbnailRendering': 'wadouri',
#                 'requestOptions': {
#                     'requestFromBrowser': True,
#                 },
#             },
#         ],
#     },
# } 