from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DicomStudyViewSet, DicomSeriesViewSet, DicomInstanceViewSet
from .dicom_web import WADOView, QIDOView

router = DefaultRouter()
router.register(r'studies', DicomStudyViewSet)
router.register(r'series', DicomSeriesViewSet)
router.register(r'instances', DicomInstanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('wado/', WADOView.as_view(), name='wado'),
    path('qido/', QIDOView.as_view(), name='qido'),
] 