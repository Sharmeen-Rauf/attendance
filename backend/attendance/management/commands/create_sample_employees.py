from django.core.management.base import BaseCommand
from attendance.models import Employee


class Command(BaseCommand):
    help = 'Create sample employees for testing'

    def handle(self, *args, **options):
        employees = [
            {'id': 'EMP001', 'name': 'John Doe'},
            {'id': 'EMP002', 'name': 'Jane Smith'},
            {'id': 'EMP003', 'name': 'Mike Johnson'},
            {'id': 'EMP004', 'name': 'Sarah Williams'},
            {'id': 'EMP005', 'name': 'David Brown'},
        ]
        
        for emp_data in employees:
            employee, created = Employee.objects.get_or_create(
                id=emp_data['id'],
                defaults={'name': emp_data['name']}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created employee: {employee.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Employee already exists: {employee.name}')
                )

