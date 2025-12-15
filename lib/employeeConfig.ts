// Employee-specific configuration
export interface EmployeeConfig {
  id: string;
  name: string;
  officeStartTime: string; // Format: "HH:mm" (24-hour)
  officeEndTime: string; // Format: "HH:mm" (24-hour)
  requiredHours: number; // Total hours required per day
  flexibleStart: boolean; // If true, can start anytime but must complete required hours
  gracePeriodMinutes: number;
  maxBreakDurationMinutes: number; // Total break time allowed
  namazBreakMinutes: number; // 30 minutes for namaz
  lunchBreakMinutes: number; // 60 minutes for lunch
}

export const EMPLOYEE_CONFIGS: Record<string, EmployeeConfig> = {
  'MUH001': {
    id: 'MUH001',
    name: 'Muhammad Umar',
    officeStartTime: '09:00', // Flexible - can start anytime
    officeEndTime: '17:00', // Will be calculated based on check-in + 8 hours
    requiredHours: 8,
    flexibleStart: true,
    gracePeriodMinutes: 10,
    maxBreakDurationMinutes: 90, // 30 min namaz + 60 min lunch
    namazBreakMinutes: 30,
    lunchBreakMinutes: 60,
  },
  'MUH002': {
    id: 'MUH002',
    name: 'Muhammad Hassan',
    officeStartTime: '13:00', // 1 PM
    officeEndTime: '21:00', // 9 PM
    requiredHours: 8,
    flexibleStart: false,
    gracePeriodMinutes: 10,
    maxBreakDurationMinutes: 90,
    namazBreakMinutes: 30,
    lunchBreakMinutes: 60,
  },
  'MUH003': {
    id: 'MUH003',
    name: 'Muhammad Hamdan',
    officeStartTime: '17:00', // 5 PM
    officeEndTime: '01:00', // 1 AM (next day)
    requiredHours: 8,
    flexibleStart: false,
    gracePeriodMinutes: 10,
    maxBreakDurationMinutes: 90,
    namazBreakMinutes: 30,
    lunchBreakMinutes: 60,
  },
  'SHA001': {
    id: 'SHA001',
    name: 'Sharmeen Rauf',
    officeStartTime: '09:00', // Flexible - can start anytime
    officeEndTime: '17:00', // Will be calculated based on check-in + 8 hours
    requiredHours: 8,
    flexibleStart: true,
    gracePeriodMinutes: 10,
    maxBreakDurationMinutes: 90,
    namazBreakMinutes: 30,
    lunchBreakMinutes: 60,
  },
  'RAB001': {
    id: 'RAB001',
    name: 'Rabia',
    officeStartTime: '13:00', // 1 PM
    officeEndTime: '21:00', // 9 PM
    requiredHours: 8,
    flexibleStart: false,
    gracePeriodMinutes: 10,
    maxBreakDurationMinutes: 90,
    namazBreakMinutes: 30,
    lunchBreakMinutes: 60,
  },
};

export function getEmployeeConfig(employeeId: string): EmployeeConfig | null {
  return EMPLOYEE_CONFIGS[employeeId] || null;
}

export function calculateStatus(checkInTime: Date, config: EmployeeConfig): string {
  const checkIn = new Date(checkInTime);
  
  // For flexible start employees, always on time
  if (config.flexibleStart) {
    return 'on_time';
  }
  
  const [hours, minutes] = config.officeStartTime.split(':').map(Number);
  const officeTime = new Date(checkIn);
  officeTime.setHours(hours, minutes, 0, 0);
  
  // Handle next day for Hamdan (5 PM to 1 AM)
  if (config.officeStartTime >= '17:00' && checkIn.getHours() < 12) {
    officeTime.setDate(officeTime.getDate() - 1);
  }
  
  const graceEnd = new Date(officeTime);
  graceEnd.setMinutes(graceEnd.getMinutes() + config.gracePeriodMinutes);
  
  if (checkIn <= officeTime) {
    return 'on_time';
  } else if (checkIn <= graceEnd) {
    return 'grace';
  } else {
    return 'late';
  }
}

export function calculateExpectedCheckout(checkInTime: Date, config: EmployeeConfig): Date {
  const checkIn = new Date(checkInTime);
  const expectedCheckout = new Date(checkIn);
  
  // Add required hours + break time
  const totalMinutes = (config.requiredHours * 60) + config.maxBreakDurationMinutes;
  expectedCheckout.setMinutes(expectedCheckout.getMinutes() + totalMinutes);
  
  return expectedCheckout;
}

