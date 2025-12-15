from django.urls import path
from . import views

urlpatterns = [
    path('time', views.get_server_time, name='server-time'),
    path('employees', views.get_employees, name='employees'),
    path('attendance/today/<str:employee_id>', views.get_today_status, name='today-status'),
    path('attendance/export', views.export_attendance, name='export-attendance'),
    path('attendance', views.get_attendance, name='get-attendance'),
    path('attendance/submit', views.submit_attendance, name='submit-attendance'),
]

