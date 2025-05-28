from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class Hospital(models.Model):
    name = models.CharField(_('Nom'), max_length=255)
    address = models.TextField(_('Adresse'))
    phone = models.CharField(_('Téléphone'), max_length=20)
    email = models.EmailField(_('Email'))
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Hôpital')
        verbose_name_plural = _('Hôpitaux')
        ordering = ['name']

    def __str__(self):
        return self.name

class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', _('Super Admin')
        HOSPITAL_ADMIN = 'HOSPITAL_ADMIN', _('Admin Hôpital')
        DOCTOR = 'DOCTOR', _('Médecin')
        SECRETARY = 'SECRETARY', _('Secrétaire')
        PATIENT = 'PATIENT', _('Patient')

    role = models.CharField(
        _('Rôle'),
        max_length=20,
        choices=Role.choices,
        default=Role.PATIENT
    )
    hospital = models.ForeignKey(
        Hospital,
        verbose_name=_('Hôpital'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    phone = models.CharField(_('Téléphone'), max_length=20, blank=True)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Utilisateur')
        verbose_name_plural = _('Utilisateurs')
        ordering = ['username']

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    def save(self, *args, **kwargs):
        if not self.password:
            self.set_password('mediconnect')
        super().save(*args, **kwargs)

class PatientDoctor(models.Model):
    patient = models.ForeignKey(
        User,
        verbose_name=_('Patient'),
        on_delete=models.CASCADE,
        related_name='doctors'
    )
    doctor = models.ForeignKey(
        User,
        verbose_name=_('Médecin'),
        on_delete=models.CASCADE,
        related_name='patients'
    )
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Relation Patient-Médecin')
        verbose_name_plural = _('Relations Patient-Médecin')
        unique_together = ['patient', 'doctor']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient} - {self.doctor}"

class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('En attente')
        CONFIRMED = 'CONFIRMED', _('Confirmé')
        CANCELLED = 'CANCELLED', _('Annulé')

    patient = models.ForeignKey(
        User,
        verbose_name=_('Patient'),
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    doctor = models.ForeignKey(
        User,
        verbose_name=_('Médecin'),
        on_delete=models.CASCADE,
        related_name='doctor_appointments'
    )
    date = models.DateTimeField(_('Date et heure'))
    status = models.CharField(
        _('Statut'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    notes = models.TextField(_('Notes'), blank=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Rendez-vous')
        verbose_name_plural = _('Rendez-vous')
        ordering = ['-date']

    def __str__(self):
        return f"{self.patient} - {self.doctor} - {self.date}"

class MedicalRecord(models.Model):
    patient = models.ForeignKey(
        User,
        verbose_name=_('Patient'),
        on_delete=models.CASCADE,
        related_name='medical_records'
    )
    doctor = models.ForeignKey(
        User,
        verbose_name=_('Médecin'),
        on_delete=models.CASCADE,
        related_name='doctor_records'
    )
    record_date = models.DateField(_('Date du dossier'))
    chief_complaint = models.TextField(_('Motif de consultation'))
    diagnosis = models.TextField(_('Diagnostic'))
    treatment_plan = models.TextField(_('Plan de traitement'))
    notes = models.TextField(_('Notes'), blank=True)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Dossier médical')
        verbose_name_plural = _('Dossiers médicaux')
        ordering = ['-record_date']

    def __str__(self):
        return f"Dossier de {self.patient} - {self.record_date}"

class MedicalHistory(models.Model):
    medical_record = models.ForeignKey(
        MedicalRecord,
        verbose_name=_('Dossier médical'),
        on_delete=models.CASCADE,
        related_name='medical_histories'
    )
    condition = models.CharField(_('Condition'), max_length=255)
    description = models.TextField(_('Description'))
    start_date = models.DateField(_('Date de début'))
    end_date = models.DateField(_('Date de fin'), null=True, blank=True)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Antécédent médical')
        verbose_name_plural = _('Antécédents médicaux')
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.condition} - {self.medical_record.patient}"

class Treatment(models.Model):
    medical_record = models.ForeignKey(
        MedicalRecord,
        verbose_name=_('Dossier médical'),
        on_delete=models.CASCADE,
        related_name='treatments'
    )
    medication = models.CharField(_('Médicament'), max_length=255)
    dosage = models.CharField(_('Dosage'), max_length=255)
    frequency = models.CharField(_('Fréquence'), max_length=255)
    start_date = models.DateField(_('Date de début'))
    end_date = models.DateField(_('Date de fin'), null=True, blank=True)
    notes = models.TextField(_('Notes'), blank=True)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Traitement')
        verbose_name_plural = _('Traitements')
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.medication} - {self.medical_record.patient}"

class Examination(models.Model):
    medical_record = models.ForeignKey(
        MedicalRecord,
        verbose_name=_('Dossier médical'),
        on_delete=models.CASCADE,
        related_name='examinations'
    )
    exam_type = models.CharField(_('Type d\'examen'), max_length=255)
    result = models.TextField(_('Résultat'))
    exam_date = models.DateField(_('Date de l\'examen'))
    notes = models.TextField(_('Notes'), blank=True)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Examen')
        verbose_name_plural = _('Examens')
        ordering = ['-exam_date']

    def __str__(self):
        return f"{self.exam_type} - {self.medical_record.patient}"
