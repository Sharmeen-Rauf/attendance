from django.db import models
from datetime import datetime, time
from django.utils import timezone
from django.conf import settings


class Employee(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employees'

    def __str__(self):
        return self.name


class AttendanceRecord(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    employee_id = models.CharField(max_length=100, db_index=True)
    employee_name = models.CharField(max_length=200)
    date = models.DateField(db_index=True)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    break_in_time = models.DateTimeField(null=True, blank=True)
    break_out_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('on_time', 'On Time'),
            ('grace', 'Grace Period'),
            ('late', 'Late'),
        ],
        default='on_time'
    )
    break_duration = models.IntegerField(null=True, blank=True)  # in seconds
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance_records'
        indexes = [
            models.Index(fields=['employee_id', 'date']),
            models.Index(fields=['date', 'status']),
        ]

    def calculate_status(self):
        """Calculate attendance status based on check-in time"""
        if not self.check_in_time:
            return 'on_time'
        
        check_in = timezone.localtime(self.check_in_time)
        office_time = time.fromisoformat(settings.OFFICE_START_TIME)
        office_datetime = datetime.combine(check_in.date(), office_time)
        office_datetime = timezone.make_aware(office_datetime)
        
        grace_end = office_datetime + timezone.timedelta(minutes=settings.GRACE_PERIOD_MINUTES)
        
        if check_in <= office_datetime:
            return 'on_time'
        elif check_in <= grace_end:
            return 'grace'
        else:
            return 'late'

    def calculate_break_duration(self):
        """Calculate break duration in seconds"""
        if self.break_in_time and self.break_out_time:
            delta = self.break_out_time - self.break_in_time
            return int(delta.total_seconds())
        return None

    def save(self, *args, **kwargs):
        # Calculate status
        if self.check_in_time:
            self.status = self.calculate_status()
        
        # Calculate break duration
        if self.break_in_time and self.break_out_time:
            self.break_duration = self.calculate_break_duration()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee_name} - {self.date}"

