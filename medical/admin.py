from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import Hospital, User, PatientDoctor, Appointment

@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'email', 'phone')
    ordering = ('name',)

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.role == 'HOSPITAL_ADMIN'

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if request.user.role == 'HOSPITAL_ADMIN':
            return obj and obj == request.user.hospital
        return False

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'hospital', 'is_active')
    list_filter = ('role', 'is_active', 'hospital')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Informations personnelles'), {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        (_('Rôle et hôpital'), {'fields': ('role', 'hospital')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Dates importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'first_name', 'last_name', 'email', 'phone', 'role', 'hospital'),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.role == 'HOSPITAL_ADMIN':
            return qs.filter(hospital=request.user.hospital)
        return qs.none()

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.role == 'HOSPITAL_ADMIN'

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if request.user.role == 'HOSPITAL_ADMIN':
            return obj and obj.hospital == request.user.hospital
        return False

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        if request.user.role == 'HOSPITAL_ADMIN':
            return obj and obj.hospital == request.user.hospital
        return False

    def has_add_permission(self, request):
        return request.user.is_superuser or request.user.role == 'HOSPITAL_ADMIN'

@admin.register(PatientDoctor)
class PatientDoctorAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('patient__username', 'patient__email', 'doctor__username', 'doctor__email')
    ordering = ('-created_at',)

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.role == 'HOSPITAL_ADMIN'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.role == 'HOSPITAL_ADMIN':
            return qs.filter(doctor__hospital=request.user.hospital)
        return qs.none()

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'date', 'status', 'created_at')
    list_filter = ('status', 'date', 'created_at')
    search_fields = ('patient__username', 'patient__email', 'doctor__username', 'doctor__email')
    ordering = ('-date',)

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser or request.user.role == 'HOSPITAL_ADMIN'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if request.user.role == 'HOSPITAL_ADMIN':
            return qs.filter(doctor__hospital=request.user.hospital)
        return qs.none()

# Enregistrer le modèle User personnalisé
admin.site.register(User, CustomUserAdmin)
