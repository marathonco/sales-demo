export default function () {
  return {
    options: {
      appointmentLength: 30,
      disabledWeekdays: [0,6],
      dayRange: 120,
      reminderTime: '1 day before',
      startTime: '09:00',
      endTime: '17:00',
      disabledDays: []
    }
  }
}
