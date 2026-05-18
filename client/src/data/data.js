export const player = {
  name: 'J. Carter',
  username: 'Julien Dubois',
  email: 'coach@performance.pro',
}

export const dashboardStats = {
  totalSessions: 124,
  sessionsChange: '+12 this month',
  avgShootingPct: 68.4,
  peakShooting: 82,
  eliteTier: 'Top 5%',
  minutesTrained: 3420,
  shootingTrend: [
    { label: 'S1', value: 62 },
    { label: 'S2', value: 68 },
    { label: 'S3', value: 75 },
    { label: 'S4', value: 71 },
    { label: 'S5', value: 78 },
    { label: 'S6', value: 65 },
    { label: 'S7', value: 82 },
  ],
  recentLogs: [
    {
      date: 'Oct 24, 2023',
      title: 'Morning Drill Routine',
      duration: 45,
      accuracy: 78.5,
    },
    {
      date: 'Oct 22, 2023',
      title: 'Conditioning & Free Throws',
      duration: 62,
      accuracy: 62.0,
    },
    {
      date: 'Oct 20, 2023',
      title: 'High Intensity Jumpers',
      duration: 30,
      accuracy: 70.2,
    },
  ],
}

export const workoutSummaries = {
  totalSessions: 24,
  avgAccuracy: 68.4,
  totalMinutes: 1240,
  topStreak: '5 Days',
}

export const sessions = [
  {
    id: 1,
    date: 'Oct 24, 2023',
    day: 'TUESDAY MORNING',
    duration: 45,
    attempted: 150,
    made: 108,
    fgPct: 72,
    notes: 'Focused on off-dribble pullups and elbow jumpers...',
  },
  {
    id: 2,
    date: 'Oct 22, 2023',
    day: 'SUNDAY AFTERNOON',
    duration: 60,
    attempted: 200,
    made: 130,
    fgPct: 65,
    notes: 'High intensity cardio with shooting. Legs felt heavy...',
  },
  {
    id: 3,
    date: 'Oct 20, 2023',
    day: 'SATURDAY SESSION',
    duration: 30,
    attempted: 100,
    made: 78,
    fgPct: 78,
    notes: 'Spot up threes from the corner. Pure stroke today.',
  },
  {
    id: 4,
    date: 'Oct 19, 2023',
    day: 'THURSDAY EVENING',
    duration: 55,
    attempted: 180,
    made: 110,
    fgPct: 61,
    notes: 'Free throw clinic. 50/50 from the line. Still working...',
  },
  {
    id: 5,
    date: 'Oct 17, 2023',
    day: 'TUESDAY MORNING',
    duration: 40,
    attempted: 120,
    made: 82,
    fgPct: 68,
    notes: 'Mid-range catch and shoot. Release point felt higher.',
  },
]

export const sessionDetail = {
  id: 4,
  date: 'Oct 24, 2023',
  duration: '45m 12s',
  overallAccuracy: 82.4,
  made: 145,
  attempted: 176,
  trainingNotes:
    'Focused on high-intensity catch-and-shoot drills from the corner and wings. Shooting mechanics stayed consistent despite fatigue in the final 10 minutes. Leg drive was excellent during the 3-point phase. Next session should prioritize off-the-dribble pull-ups to simulate late-clock scenarios.',
  hotZoneImprovement: '+4.2% improvement from last session',
}
