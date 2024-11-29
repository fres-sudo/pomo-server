export type Stats = {
  totalTasksToday: number;
  totalTasksYesterday: number;
  totalTasksAll: number;

  completedTasksOfTheWeek: number[];
  uncompletedTasksOfTheWeek: number[];

  completionPercentage: number;
};
