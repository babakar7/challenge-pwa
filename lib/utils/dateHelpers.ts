import { addDays, differenceInDays, differenceInHours, isBefore, parseISO, format, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Challenge Week Information
 */
export interface ChallengeWeekInfo {
  weekNumber: number;
  weekStartDay: number;  // 1, 8, 15, 22, etc.
  weekEndDay: number;    // 7, 14, 21, 28, etc.
  deadline: Date;        // 3 days before week starts
  isDeadlinePassed: boolean;
  daysUntilDeadline: number;
  hoursUntilDeadline: number;
  isLessThan24Hours: boolean;
}

/**
 * Get challenge week number from challenge day
 * @param challengeDay - The current challenge day (1-based)
 * @param totalWeeks - Optional total weeks in the challenge (default 3)
 */
export function getChallengeWeek(challengeDay: number, totalWeeks: number = 3): number {
  const week = Math.ceil(challengeDay / 7);
  return Math.min(week, totalWeeks);
}

/**
 * Get the deadline for meal selection for a challenge week
 * Deadline is 3 days before the week starts, at 11:59 PM
 */
export function getChallengeWeekDeadline(
  cohortStartDate: string,
  weekNumber: number
): Date {
  const start = parseISO(cohortStartDate);
  const weekStartDay = (weekNumber - 1) * 7 + 1;
  const weekStartDate = addDays(start, weekStartDay - 1);
  const deadline = addDays(weekStartDate, -3); // 3 days before
  // Set to end of day (11:59 PM)
  deadline.setHours(23, 59, 59, 999);
  return deadline;
}

/**
 * Get the start date for a challenge week
 */
export function getChallengeWeekStartDate(
  cohortStartDate: string,
  weekNumber: number
): Date {
  const start = parseISO(cohortStartDate);
  const weekStartDay = (weekNumber - 1) * 7; // 0, 7, 14, 21, etc. days after start
  return addDays(start, weekStartDay);
}

/**
 * Get info about the next week that needs meal selection
 * Returns null if all deadlines have passed or challenge is over
 * @param totalWeeks - Total weeks in the challenge (default 3)
 */
export function getNextSelectionWeek(
  cohortStartDate: string,
  currentChallengeDay: number,
  totalWeeks: number = 3
): ChallengeWeekInfo | null {
  const now = new Date();

  // If challenge hasn't started yet (day 0 or negative), check week 1
  const startDay = currentChallengeDay <= 0 ? 0 : currentChallengeDay;
  const currentWeek = startDay <= 0 ? 1 : getChallengeWeek(startDay, totalWeeks);

  // Check each week from current onwards
  for (let week = currentWeek; week <= totalWeeks; week++) {
    const deadline = getChallengeWeekDeadline(cohortStartDate, week);
    const hoursUntil = differenceInHours(deadline, now);
    const daysUntil = differenceInDays(deadline, now);
    const isDeadlinePassed = isBefore(deadline, now);

    // Return info about this week if deadline hasn't passed
    // or if it just passed (for blocking purposes)
    return {
      weekNumber: week,
      weekStartDay: (week - 1) * 7 + 1,
      weekEndDay: week * 7,
      deadline,
      isDeadlinePassed,
      daysUntilDeadline: Math.max(0, daysUntil),
      hoursUntilDeadline: Math.max(0, hoursUntil),
      isLessThan24Hours: hoursUntil > 0 && hoursUntil < 24,
    };
  }

  return null; // All weeks' deadlines passed
}

/**
 * Get all weeks that need meal selection based on current challenge day
 * Before challenge starts: only week 1
 * During challenge: current week and future weeks
 * @param totalWeeks - Total weeks in the challenge (default 3)
 */
export function getWeeksNeedingSelection(currentChallengeDay: number, totalWeeks: number = 3): number[] {
  if (currentChallengeDay <= 0) {
    // Before challenge starts, only week 1 needs selection
    return [1];
  }

  const currentWeek = getChallengeWeek(currentChallengeDay, totalWeeks);
  const weeks: number[] = [];

  for (let w = currentWeek; w <= totalWeeks; w++) {
    weeks.push(w);
  }

  return weeks;
}

/**
 * Format deadline for display
 */
export function formatDeadline(deadline: Date): string {
  return format(deadline, "EEEE d MMM 'à' HH:mm", { locale: fr });
}

/**
 * Get countdown string for deadline
 */
export function getDeadlineCountdown(deadline: Date): string {
  const now = new Date();
  const hoursUntil = differenceInHours(deadline, now);

  if (hoursUntil < 0) {
    return 'Délai dépassé';
  }

  if (hoursUntil < 1) {
    return 'Moins d\'1 heure';
  }

  if (hoursUntil < 24) {
    return `${hoursUntil} heure${hoursUntil === 1 ? '' : 's'} restante${hoursUntil === 1 ? '' : 's'}`;
  }

  const daysUntil = Math.floor(hoursUntil / 24);
  const remainingHours = hoursUntil % 24;

  if (daysUntil === 1) {
    return `1 jour, ${remainingHours} heures restantes`;
  }

  return `${daysUntil} jours restants`;
}

/**
 * Check if we're currently before the challenge starts
 */
export function isBeforeChallengeStart(cohortStartDate: string): boolean {
  const start = parseISO(cohortStartDate);
  const now = new Date();
  return isBefore(now, start);
}

/**
 * Get challenge day from cohort start date
 * Returns 0 or negative if challenge hasn't started
 * Returns > 28 if challenge has ended
 */
export function calculateChallengeDay(cohortStartDate: string): number {
  const start = parseISO(cohortStartDate);
  const now = new Date();
  return differenceInDays(now, start) + 1;
}

const WEEKDAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

/**
 * Get the actual weekday name for a challenge day
 * Takes into account that challenges can start on any day of the week
 *
 * @param cohortStartDate - The start date of the cohort (ISO string)
 * @param weekNumber - The week number (1, 2, 3, etc.)
 * @param dayOfWeek - The day within the week (1-7)
 * @returns The weekday name (e.g., "Saturday", "Sunday", etc.)
 */
export function getWeekdayNameForChallengeDay(
  cohortStartDate: string,
  weekNumber: number,
  dayOfWeek: number
): string {
  const start = parseISO(cohortStartDate);
  // Calculate the offset from the challenge start
  // weekNumber 1, dayOfWeek 1 = day 0 offset
  // weekNumber 1, dayOfWeek 2 = day 1 offset
  // weekNumber 2, dayOfWeek 1 = day 7 offset
  const dayOffset = (weekNumber - 1) * 7 + (dayOfWeek - 1);
  const targetDate = addDays(start, dayOffset);
  return WEEKDAY_NAMES[getDay(targetDate)];
}

/**
 * Get the actual date for a challenge day
 *
 * @param cohortStartDate - The start date of the cohort (ISO string)
 * @param weekNumber - The week number (1, 2, 3, etc.)
 * @param dayOfWeek - The day within the week (1-7)
 * @returns The date
 */
export function getDateForChallengeDay(
  cohortStartDate: string,
  weekNumber: number,
  dayOfWeek: number
): Date {
  const start = parseISO(cohortStartDate);
  const dayOffset = (weekNumber - 1) * 7 + (dayOfWeek - 1);
  return addDays(start, dayOffset);
}
