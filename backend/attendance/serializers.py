from rest_framework import serializers
from .models import Employee, AttendanceRecord
from django.utils import timezone


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name', 'email']


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = [
            'id', 'employee_id', 'employee_name', 'date',
            'check_in_time', 'check_out_time', 'break_in_time', 'break_out_time',
            'status', 'break_duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceActionSerializer(serializers.Serializer):
    employeeId = serializers.CharField()
    employeeName = serializers.CharField()
    action = serializers.ChoiceField(choices=['checkin', 'breakin', 'breakout', 'checkout'])
    timestamp = serializers.DateTimeField()

