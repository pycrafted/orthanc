from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Redirection vers OHIF Viewer
    path('ohif/', RedirectView.as_view(url='http://localhost:3000'), name='ohif_viewer'),
] 