from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

router = DefaultRouter()
router.register(r'hospitals', views.HospitalViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'patient-doctors', views.PatientDoctorViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'medical-records', views.MedicalRecordViewSet)
router.register(r'medical-histories', views.MedicalHistoryViewSet)
router.register(r'treatments', views.TreatmentViewSet)
router.register(r'examinations', views.ExaminationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dicom/', include('dicom_app.urls')),  # Inclusion des URLs DICOM
] 