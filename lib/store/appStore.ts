import { create } from 'zustand';
import { format, startOfWeek, addDays, isAfter, isSameDay, differenceInDays, parseISO } from 'date-fns';

// Types
export interface DailyHabit {
  date: string;
  weight_kg: number | null;
  water_ml: number;
  steps: number | null;
  meal_adherence: boolean | null;
}

export interface CheckIn {
  date: string;
  challenges_faced: string;
  habits_summary: DailyHabit;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_check_in_date: string | null;
}

export interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  duration_weeks: number;
}

export interface MealOption {
  id: string;
  challenge_week: number;
  challenge_day: number; // 1-7 within the week
  meal_type: 'lunch' | 'dinner';
  option_a_name: string;
  option_a_description: string;
  option_a_image_url: string;
  option_b_name: string;
  option_b_description: string;
  option_b_image_url: string;
}

export interface MealSelection {
  id?: string;
  user_id?: string;
  challenge_week: number;
  selections: Record<string, 'A' | 'B'>; // key: "day_mealtype" (e.g., "1_lunch", "3_dinner")
  delivery_preference: 'home' | 'pickup' | null;
  locked: boolean;
  locked_at?: string;
}

export interface BreakfastPhoto {
  date: string;
  storage_path: string;
  uploaded_at: string;
  notes?: string;
}

interface AppState {
  // Daily habits - keyed by date (YYYY-MM-DD)
  habits: Record<string, DailyHabit>;

  // Check-ins - keyed by date
  checkIns: Record<string, CheckIn>;

  // Streak info
  streak: Streak;

  // Weekly exercise - keyed by week start date
  weeklyExercise: Record<string, boolean>;

  // Meal options - loaded from Supabase per challenge week
  mealOptions: MealOption[];

  // Meal selections - keyed by challenge week (1-4)
  mealSelections: Record<number, MealSelection>;

  // Weight history for chart
  weightHistory: { date: string; weight: number }[];

  // Cohort/Challenge info
  cohort: Cohort | null;

  // Day navigation - for viewing/editing past days
  selectedDate: string | null; // null = today, string = 'YYYY-MM-DD'

  // Breakfast photos - keyed by date (YYYY-MM-DD)
  breakfastPhotos: Record<string, BreakfastPhoto>;

  // Actions
  getTodayHabits: () => DailyHabit;
  setSelectedDate: (date: string | null) => void;
  getSelectedDateHabits: () => DailyHabit;
  getSelectedDayNumber: () => number;
  isViewingToday: () => boolean;
  hasCheckedInForSelectedDate: () => boolean;
  updateWeight: (weight: number, date?: string) => void;
  updateWater: (amount: number, date?: string) => void;
  addWater: (ml: number, date?: string) => void;
  updateSteps: (steps: number, date?: string) => void;
  updateMealAdherence: (adhered: boolean, date?: string) => void;
  submitCheckIn: (challenges: string, date?: string) => boolean;
  canCheckIn: () => boolean;
  hasCheckedInToday: () => boolean;
  updateWeeklyExercise: (completed: boolean, weekStart?: string) => void;
  getWeeklyExercise: () => boolean;

  // Meal selection actions
  setMealOptions: (options: MealOption[]) => void;
  setMealSelection: (weekNumber: number, selection: MealSelection) => void;
  selectMeal: (challengeWeek: number, challengeDay: number, mealType: string, option: 'A' | 'B') => void;
  setDeliveryPreference: (challengeWeek: number, preference: 'home' | 'pickup') => void;
  lockMealSelections: (challengeWeek: number) => void;
  getMealSelection: (challengeWeek: number) => MealSelection | null;
  getWeekStartDate: (date?: Date) => string;

  // Challenge status getters
  getChallengeStatus: () => 'not_enrolled' | 'pending' | 'active' | 'ended';
  getChallengeDay: () => number;
  getChallengeDaysRemaining: () => number;

  // Breakfast photo actions
  setBreakfastPhoto: (date: string, photo: BreakfastPhoto | null) => void;
  getBreakfastPhoto: (date: string) => BreakfastPhoto | null;
}

const getDateKey = (date: Date = new Date()) => format(date, 'yyyy-MM-dd');

const getWeekStart = (date: Date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return format(start, 'yyyy-MM-dd');
};

export const useAppStore = create<AppState>((set, get) => ({
  habits: {},
  checkIns: {},
  streak: {
    current_streak: 0,
    longest_streak: 0,
    last_check_in_date: null,
  },
  weeklyExercise: {},
  mealOptions: [],
  mealSelections: {},
  weightHistory: [],
  cohort: null,
  selectedDate: null, // null = viewing today
  breakfastPhotos: {},

  getTodayHabits: () => {
    const today = getDateKey();
    const habits = get().habits[today];
    return habits || {
      date: today,
      weight_kg: null,
      water_ml: 0,
      steps: null,
      meal_adherence: null,
    };
  },

  updateWeight: (weight: number, date?: string) => {
    const targetDate = date || getDateKey();
    set((state) => {
      const currentHabits = state.habits[targetDate] || {
        date: targetDate,
        weight_kg: null,
        water_ml: 0,
        steps: null,
        meal_adherence: null,
      };

      // Update weight history
      const existingIndex = state.weightHistory.findIndex(w => w.date === targetDate);
      const newHistory = [...state.weightHistory];
      if (existingIndex >= 0) {
        newHistory[existingIndex] = { date: targetDate, weight };
      } else {
        newHistory.push({ date: targetDate, weight });
        newHistory.sort((a, b) => a.date.localeCompare(b.date));
      }

      return {
        habits: {
          ...state.habits,
          [targetDate]: { ...currentHabits, weight_kg: weight },
        },
        weightHistory: newHistory,
      };
    });
  },

  updateWater: (amount: number) => {
    const today = getDateKey();
    set((state) => {
      const currentHabits = state.habits[today] || {
        date: today,
        weight_kg: null,
        water_ml: 0,
        steps: null,
        meal_adherence: null,
      };
      return {
        habits: {
          ...state.habits,
          [today]: { ...currentHabits, water_ml: amount },
        },
      };
    });
  },

  addWater: (ml: number) => {
    const today = getDateKey();
    set((state) => {
      const currentHabits = state.habits[today] || {
        date: today,
        weight_kg: null,
        water_ml: 0,
        steps: null,
        meal_adherence: null,
      };
      return {
        habits: {
          ...state.habits,
          [today]: { ...currentHabits, water_ml: currentHabits.water_ml + ml },
        },
      };
    });
  },

  updateSteps: (steps: number, date?: string) => {
    const targetDate = date || getDateKey();
    set((state) => {
      const currentHabits = state.habits[targetDate] || {
        date: targetDate,
        weight_kg: null,
        water_ml: 0,
        steps: null,
        meal_adherence: null,
      };
      return {
        habits: {
          ...state.habits,
          [targetDate]: { ...currentHabits, steps },
        },
      };
    });
  },

  updateMealAdherence: (adhered: boolean, date?: string) => {
    const targetDate = date || getDateKey();
    set((state) => {
      const currentHabits = state.habits[targetDate] || {
        date: targetDate,
        weight_kg: null,
        water_ml: 0,
        steps: null,
        meal_adherence: null,
      };
      return {
        habits: {
          ...state.habits,
          [targetDate]: { ...currentHabits, meal_adherence: adhered },
        },
      };
    });
  },

  canCheckIn: () => {
    const habits = get().getTodayHabits();
    const today = getDateKey();
    const alreadyCheckedIn = !!get().checkIns[today];

    // Check if required habits are logged (water removed from MVP)
    const allHabitsLogged =
      habits.weight_kg !== null &&
      habits.steps !== null &&
      habits.steps > 0 &&
      habits.meal_adherence !== null;

    return allHabitsLogged && !alreadyCheckedIn;
  },

  hasCheckedInToday: () => {
    const today = getDateKey();
    return !!get().checkIns[today];
  },

  submitCheckIn: (challenges: string, date?: string) => {
    const targetDate = date || getDateKey();
    const habits = date ? get().habits[date] : get().getTodayHabits();

    // For past dates, check if habits exist and aren't already checked in
    if (date) {
      if (!habits || get().checkIns[date]) {
        return false;
      }
    } else {
      // For today, use the canCheckIn logic
      if (!get().canCheckIn()) {
        return false;
      }
    }

    set((state) => {
      // Only update streak if checking in for today
      const isToday = !date || date === getDateKey();
      let streakUpdate = {};

      if (isToday) {
        const lastDate = state.streak.last_check_in_date;
        let newStreak = 1;

        if (lastDate) {
          const lastCheckIn = new Date(lastDate);
          const todayDate = new Date(targetDate);
          const yesterday = addDays(todayDate, -1);

          if (isSameDay(lastCheckIn, yesterday)) {
            // Consecutive day - increment streak
            newStreak = state.streak.current_streak + 1;
          }
        }

        const newLongest = Math.max(state.streak.longest_streak, newStreak);

        streakUpdate = {
          streak: {
            current_streak: newStreak,
            longest_streak: newLongest,
            last_check_in_date: targetDate,
          },
        };
      }

      return {
        checkIns: {
          ...state.checkIns,
          [targetDate]: {
            date: targetDate,
            challenges_faced: challenges,
            habits_summary: habits,
          },
        },
        ...streakUpdate,
      };
    });

    return true;
  },

  updateWeeklyExercise: (completed: boolean, weekStart?: string) => {
    const targetWeekStart = weekStart || getWeekStart();
    set((state) => ({
      weeklyExercise: {
        ...state.weeklyExercise,
        [targetWeekStart]: completed,
      },
    }));
  },

  getWeeklyExercise: () => {
    const weekStart = getWeekStart();
    return get().weeklyExercise[weekStart] || false;
  },

  // Meal selection methods
  setMealOptions: (options: MealOption[]) => {
    set({ mealOptions: options });
  },

  setMealSelection: (weekNumber: number, selection: MealSelection) => {
    set((state) => ({
      mealSelections: {
        ...state.mealSelections,
        [weekNumber]: selection,
      },
    }));
  },

  selectMeal: (challengeWeek: number, challengeDay: number, mealType: string, option: 'A' | 'B') => {
    const key = `${challengeDay}_${mealType}`;

    set((state) => {
      const currentSelection = state.mealSelections[challengeWeek] || {
        challenge_week: challengeWeek as 1 | 2 | 3 | 4,
        selections: {},
        delivery_preference: null,
        locked: false,
      };

      if (currentSelection.locked) {
        return state; // Can't modify locked selections
      }

      return {
        mealSelections: {
          ...state.mealSelections,
          [challengeWeek]: {
            ...currentSelection,
            selections: {
              ...currentSelection.selections,
              [key]: option,
            },
          },
        },
      };
    });
  },

  setDeliveryPreference: (challengeWeek: number, preference: 'home' | 'pickup') => {
    set((state) => {
      const currentSelection = state.mealSelections[challengeWeek] || {
        challenge_week: challengeWeek as 1 | 2 | 3 | 4,
        selections: {},
        delivery_preference: null,
        locked: false,
      };

      if (currentSelection.locked) {
        return state; // Can't modify locked selections
      }

      return {
        mealSelections: {
          ...state.mealSelections,
          [challengeWeek]: {
            ...currentSelection,
            delivery_preference: preference,
          },
        },
      };
    });
  },

  lockMealSelections: (challengeWeek: number) => {
    set((state) => {
      const currentSelection = state.mealSelections[challengeWeek];
      if (!currentSelection) return state;

      return {
        mealSelections: {
          ...state.mealSelections,
          [challengeWeek]: {
            ...currentSelection,
            locked: true,
            locked_at: new Date().toISOString(),
          },
        },
      };
    });
  },

  getMealSelection: (challengeWeek: number) => {
    return get().mealSelections[challengeWeek] || null;
  },

  getWeekStartDate: (date?: Date) => getWeekStart(date),

  // Day navigation methods
  setSelectedDate: (date: string | null) => {
    set({ selectedDate: date });
  },

  getSelectedDateHabits: () => {
    const { selectedDate, habits } = get();
    const dateKey = selectedDate || getDateKey();
    const habit = habits[dateKey];
    return habit || {
      date: dateKey,
      weight_kg: null,
      water_ml: 0,
      steps: null,
      meal_adherence: null,
    };
  },

  getSelectedDayNumber: () => {
    const { cohort, selectedDate } = get();
    if (!cohort) return 0;

    const targetDate = selectedDate ? new Date(selectedDate) : new Date();
    const startDate = parseISO(cohort.start_date);
    const totalDays = (cohort.duration_weeks || 3) * 7;

    const day = differenceInDays(targetDate, startDate) + 1;
    return Math.max(1, Math.min(day, totalDays));
  },

  isViewingToday: () => {
    const { selectedDate } = get();
    return selectedDate === null || selectedDate === getDateKey();
  },

  hasCheckedInForSelectedDate: () => {
    const { selectedDate, checkIns } = get();
    const dateKey = selectedDate || getDateKey();
    return !!checkIns[dateKey];
  },

  // Challenge status getters
  getChallengeStatus: () => {
    const { cohort } = get();

    if (!cohort) return 'not_enrolled';

    const today = new Date();
    const startDate = parseISO(cohort.start_date);
    const endDate = parseISO(cohort.end_date);

    if (isAfter(startDate, today)) {
      return 'pending';
    }

    if (isAfter(today, endDate)) {
      return 'ended';
    }

    return 'active';
  },

  getChallengeDay: () => {
    const { cohort } = get();
    if (!cohort) return 0;

    const today = new Date();
    const startDate = parseISO(cohort.start_date);
    const totalDays = (cohort.duration_weeks || 3) * 7;

    const day = differenceInDays(today, startDate) + 1;
    return Math.max(1, Math.min(day, totalDays));
  },

  getChallengeDaysRemaining: () => {
    const { cohort } = get();
    const challengeDay = get().getChallengeDay();
    if (challengeDay === 0 || !cohort) return 0;

    const totalDays = (cohort.duration_weeks || 3) * 7;
    const remaining = totalDays - challengeDay;
    return Math.max(0, remaining);
  },

  // Breakfast photo actions
  setBreakfastPhoto: (date: string, photo: BreakfastPhoto | null) => {
    set((state) => {
      if (photo === null) {
        // Remove photo for this date
        const { [date]: _, ...rest } = state.breakfastPhotos;
        return { breakfastPhotos: rest };
      }
      return {
        breakfastPhotos: {
          ...state.breakfastPhotos,
          [date]: photo,
        },
      };
    });
  },

  getBreakfastPhoto: (date: string) => {
    return get().breakfastPhotos[date] || null;
  },
}));
