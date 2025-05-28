from django.db import models
from django.utils.translation import gettext_lazy as _
from medical.models import User

class DicomStudy(models.Model):
    patient = models.ForeignKey(
        User,
        verbose_name=_('Patient'),
        on_delete=models.CASCADE,
        related_name='dicom_studies'
    )
    doctor = models.ForeignKey(
        User,
        verbose_name=_('Médecin'),
        on_delete=models.CASCADE,
        related_name='doctor_studies'
    )
    study_instance_uid = models.CharField(_('UID de l\'étude'), max_length=255, unique=True)
    study_date = models.DateField(_('Date de l\'étude'))
    study_description = models.CharField(_('Description'), max_length=255)
    study_id = models.CharField(_('ID de l\'étude'), max_length=255)
    accession_number = models.CharField(_('Numéro d\'accès'), max_length=255, blank=True)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Étude DICOM')
        verbose_name_plural = _('Études DICOM')
        ordering = ['-study_date']
        unique_together = ['patient', 'study_instance_uid']

    def __str__(self):
        return f"{self.study_description} - {self.patient} ({self.study_date})"

class DicomSeries(models.Model):
    study = models.ForeignKey(
        DicomStudy,
        verbose_name=_('Étude'),
        on_delete=models.CASCADE,
        related_name='series'
    )
    series_instance_uid = models.CharField(_('UID de la série'), max_length=255, unique=True)
    series_number = models.IntegerField(_('Numéro de série'))
    series_description = models.CharField(_('Description'), max_length=255)
    modality = models.CharField(_('Modalité'), max_length=255)
    number_of_instances = models.IntegerField(_('Nombre d\'instances'), default=0)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Série DICOM')
        verbose_name_plural = _('Séries DICOM')
        ordering = ['series_number']
        unique_together = ['study', 'series_instance_uid']

    def __str__(self):
        return f"{self.series_description} - {self.modality} ({self.series_number})"

class DicomInstance(models.Model):
    series = models.ForeignKey(
        DicomSeries,
        verbose_name=_('Série'),
        on_delete=models.CASCADE,
        related_name='instances'
    )
    sop_instance_uid = models.CharField(_('UID de l\'instance'), max_length=255, unique=True)
    instance_number = models.IntegerField(_('Numéro d\'instance'))
    file_path = models.CharField(_('Chemin du fichier'), max_length=512)
    file_size = models.BigIntegerField(_('Taille du fichier'), default=0)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(_('Créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Mis à jour le'), auto_now=True)

    class Meta:
        verbose_name = _('Instance DICOM')
        verbose_name_plural = _('Instances DICOM')
        ordering = ['instance_number']
        unique_together = ['series', 'sop_instance_uid']

    def __str__(self):
        return f"Instance {self.instance_number} - {self.series}"

    def get_storage_path(self):
        """Retourne le chemin de stockage pour l'instance DICOM"""
        return f"patients/{self.series.study.patient.id}/studies/{self.series.study.study_instance_uid}/series/{self.series.series_instance_uid}/{self.sop_instance_uid}.dcm"
