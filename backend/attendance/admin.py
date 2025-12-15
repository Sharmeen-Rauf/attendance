from django.contrib import admin
from .models import Employee, AttendanceRecord


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'created_at']
    search_fields = ['name', 'email', 'id']


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['employee_name', 'date', 'check_in_time', 'check_out_time', 'status', 'break_duration']
    list_filter = ['status', 'date']
    search_fields = ['employee_name', 'employee_id']
    date_hierarchy = 'date'

