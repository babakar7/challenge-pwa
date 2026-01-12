import { supabase } from './client';
import { useAppStore, DailyHabit, CheckIn, Streak, MealOption, MealSelection } from '@/lib/store/appStore';
import { format } from 'date-fns';
import { logger } from '@/lib/utils/logger';

const getDateKey = (date: Date = new Date()) => format(date, 'yyyy-MM-dd');

/**
 * Data Sync Layer
 * Bridges between Zustand (local UI state) and Supabase (persistence)
 * Uses optimistic updates: update Zustand immediately, then sync to Supabase
 */
class DataSync {
  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  getUserId() {
    return this.userId;
  }

  /**
   * Load user data from Supabase into Zustand store
   */
  async loadUserData(userId: string): Promise<void> {
    this.userId = userId;
    logger.log('loadUserData: Loading data for user:', userId);

    try {
      // Fetch all user data in parallel
      const [profileResult, habitsResult, checkInsResult, streakResult, exerciseResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*, cohorts(*)')
          .eq('id', userId)
          .single(),
        supabase
          .from('daily_habits')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(30),
        supabase
          .from('check_ins')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(30),
        supabase
          .from('streaks')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('weekly_exercise')
          .select('*')
          .eq('user_id', userId)
          .order('week_start_date', { ascending: false })
          .limit(8),
      ]);

      logger.log('loadUserData: Results -', {
        profile: profileResult.data ? 'found' : 'not found',
        profileError: profileResult.error?.message,
        cohort: profileResult.data?.cohorts ? 'found' : 'not found',
        habits: habitsResult.data?.length ?? 0,
        habitsError: habitsResult.error?.message,
        checkIns: checkInsResult.data?.length ?? 0,
        checkInsError: checkInsResult.error?.message,
        streak: streakResult.data ? 'found' : 'not found',
        streakError: streakResult.error?.message,
        exercise: exerciseResult.data?.length ?? 0,
        exerciseError: exerciseResult.error?.message,
      });

      // Transform and load into store
      const store = useAppStore.getState();

      // Load cohort
      if (profileResult.data?.cohorts) {
        useAppStore.setState({ cohort: profileResult.data.cohorts as any });
        logger.log('loadUserData: Cohort loaded:', profileResult.data.cohorts);
      } else {
        useAppStore.setState({ cohort: null });
        logger.log('loadUserData: No cohort assigned');
      }

      // Load habits
      if (habitsResult.data) {
        const habits: Record<string, DailyHabit> = {};
        const weightHistory: { date: string; weight: number }[] = [];

        habitsResult.data.forEach((h) => {
          habits[h.date] = {
            date: h.date,
            weight_kg: h.weight_kg,
            water_ml: h.water_ml || 0,
            steps: h.steps,
            meal_adherence: h.meal_adherence,
          };
          if (h.weight_kg) {
            weightHistory.push({ date: h.date, weight: h.weight_kg });
          }
        });

        weightHistory.sort((a, b) => a.date.localeCompare(b.date));

        useAppStore.setState({ habits, weightHistory });
      }

      // Load check-ins
      if (checkInsResult.data) {
        const checkIns: Record<string, CheckIn> = {};
        checkInsResult.data.forEach((c) => {
          checkIns[c.date] = {
            date: c.date,
            challenges_faced: c.challenges_faced || '',
            habits_summary: c.habits_summary as unknown as DailyHabit,
          };
        });
        useAppStore.setState({ checkIns });
      }

      // Load streak
      if (streakResult.data) {
        useAppStore.setState({
          streak: {
            current_streak: streakResult.data.current_streak || 0,
            longest_streak: streakResult.data.longest_streak || 0,
            last_check_in_date: streakResult.data.last_check_in_date,
          },
        });
      }

      // Load weekly exercise
      if (exerciseResult.data) {
        const weeklyExercise: Record<string, boolean> = {};
        exerciseResult.data.forEach((e) => {
          weeklyExercise[e.week_start_date] = e.completed_3x || false;
        });
        useAppStore.setState({ weeklyExercise });
      }

      // Load meal selections for all weeks
      await this.loadAllMealSelections();
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  }

  /**
   * Clear local data when user logs out
   */
  clearUserData() {
    this.userId = null;
    useAppStore.setState({
      habits: {},
      checkIns: {},
      streak: {
        current_streak: 0,
        longest_streak: 0,
        last_check_in_date: null,
      },
      weeklyExercise: {},
      mealSelections: {},
      weightHistory: [],
      cohort: null,
    });
  }

  /**
   * Update weight with optimistic update
   */
  async updateWeight(weight: number, date?: string): Promise<void> {
    const targetDate = date || getDateKey();

    // Optimistic update - always update local state
    useAppStore.getState().updateWeight(weight, date);

    // Skip Supabase sync if no user
    if (!this.userId) return;

    // Background sync to Supabase
    try {
      const { error } = await supabase.from('daily_habits').upsert(
        {
          user_id: this.userId,
          date: targetDate,
          weight_kg: weight,
          weight_logged_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,date',
        }
      );
      if (error) {
        logger.error('Error syncing weight:', error);
      } else {
        logger.log('updateWeight: Successfully synced to Supabase');
      }
    } catch (error) {
      logger.error('Error syncing weight:', error);
    }
  }

  /**
   * Update steps with optimistic update
   */
  async updateSteps(steps: number, date?: string): Promise<void> {
    const targetDate = date || getDateKey();

    // Optimistic update - always update local state
    useAppStore.getState().updateSteps(steps, date);

    // Skip Supabase sync if no user
    if (!this.userId) return;

    // Background sync
    try {
      const { error } = await supabase.from('daily_habits').upsert(
        {
          user_id: this.userId,
          date: targetDate,
          steps: steps,
          steps_logged_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,date',
        }
      );
      if (error) {
        logger.error('Error syncing steps:', error);
      } else {
        logger.log('updateSteps: Successfully synced to Supabase');
      }
    } catch (error) {
      logger.error('Error syncing steps:', error);
    }
  }

  /**
   * Update meal adherence with optimistic update
   */
  async updateMealAdherence(adhered: boolean, date?: string): Promise<void> {
    const targetDate = date || getDateKey();

    // Optimistic update - always update local state
    useAppStore.getState().updateMealAdherence(adhered, date);

    // Skip Supabase sync if no user
    if (!this.userId) return;

    // Background sync
    try {
      const { error } = await supabase.from('daily_habits').upsert(
        {
          user_id: this.userId,
          date: targetDate,
          meal_adherence: adhered,
          meal_logged_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,date',
        }
      );
      if (error) {
        logger.error('Error syncing meal adherence:', error);
      } else {
        logger.log('updateMealAdherence: Successfully synced to Supabase');
      }
    } catch (error) {
      logger.error('Error syncing meal adherence:', error);
    }
  }

  /**
   * Update weekly exercise with optimistic update
   */
  async updateWeeklyExercise(completed: boolean, weekStart?: string): Promise<void> {
    const targetWeekStart = weekStart || useAppStore.getState().getWeekStartDate();

    // Optimistic update - always update local state
    useAppStore.getState().updateWeeklyExercise(completed, weekStart);

    // Skip Supabase sync if no user
    if (!this.userId) return;

    // Background sync
    try {
      await supabase.from('weekly_exercise').upsert(
        {
          user_id: this.userId,
          week_start_date: targetWeekStart,
          completed_3x: completed,
        },
        {
          onConflict: 'user_id,week_start_date',
        }
      );
    } catch (error) {
      logger.error('Error syncing weekly exercise:', error);
    }
  }

  /**
   * Submit check-in with optimistic update
   */
  async submitCheckIn(challenges: string, date?: string): Promise<boolean> {
    const store = useAppStore.getState();

    // Optimistic update - always update local state
    const success = store.submitCheckIn(challenges, date);
    if (!success) return false;

    // Skip Supabase sync if no user
    if (!this.userId) {
      logger.log('submitCheckIn: No userId, skipping Supabase sync');
      return true;
    }

    const targetDate = date || getDateKey();
    const habits = date ? store.habits[date] : store.getTodayHabits();

    logger.log('submitCheckIn: Syncing to Supabase for date:', targetDate);

    // Background sync check-in - use upsert to handle re-submissions
    try {
      const { data, error } = await supabase.from('check_ins').upsert(
        {
          user_id: this.userId,
          date: targetDate,
          challenges_faced: challenges,
          habits_summary: habits as unknown as Record<string, unknown>,
        },
        {
          onConflict: 'user_id,date',
        }
      );

      if (error) {
        logger.error('Error syncing check-in:', error);
      } else {
        logger.log('submitCheckIn: Successfully synced to Supabase');
        // Streak is updated automatically by database trigger
      }
    } catch (error) {
      logger.error('Error syncing check-in:', error);
    }

    return true;
  }

  // ==========================================
  // MEAL SELECTION METHODS
  // ==========================================

  /**
   * Load meal options for a challenge week from Supabase
   */
  async loadMealOptions(challengeWeek: number): Promise<MealOption[]> {
    try {
      const { data, error } = await supabase
        .from('meal_options')
        .select('*')
        .eq('challenge_week', challengeWeek)
        .order('challenge_day', { ascending: true })
        .order('meal_type', { ascending: true });

      if (error) {
        logger.error('Error loading meal options:', error);
        return [];
      }

      // Transform to MealOption type
      const options: MealOption[] = (data || []).map((row) => ({
        id: row.id,
        challenge_week: row.challenge_week,
        challenge_day: row.challenge_day,
        meal_type: row.meal_type,
        option_a_name: row.option_a_name,
        option_a_description: row.option_a_description || '',
        option_a_image_url: row.option_a_image_url || '',
        option_b_name: row.option_b_name,
        option_b_description: row.option_b_description || '',
        option_b_image_url: row.option_b_image_url || '',
      }));

      // Store in Zustand
      useAppStore.getState().setMealOptions(options);

      logger.log(`loadMealOptions: Loaded ${options.length} options for week ${challengeWeek}`);
      return options;
    } catch (error) {
      logger.error('Error loading meal options:', error);
      return [];
    }
  }

  /**
   * Load user's meal selection for a challenge week
   */
  async loadMealSelection(challengeWeek: number): Promise<MealSelection | null> {
    if (!this.userId) return null;

    try {
      const { data, error } = await supabase
        .from('meal_selections')
        .select('*')
        .eq('user_id', this.userId)
        .eq('challenge_week', challengeWeek)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error loading meal selection:', error);
        return null;
      }

      if (!data) {
        // No selection exists yet for this week
        return null;
      }

      const selection: MealSelection = {
        id: data.id,
        user_id: data.user_id,
        challenge_week: data.challenge_week,
        selections: data.selections || {},
        delivery_preference: data.delivery_preference,
        locked: data.locked || false,
        locked_at: data.locked_at,
      };

      // Store in Zustand
      useAppStore.getState().setMealSelection(challengeWeek, selection);

      logger.log(`loadMealSelection: Loaded selection for week ${challengeWeek}`, selection);
      return selection;
    } catch (error) {
      logger.error('Error loading meal selection:', error);
      return null;
    }
  }

  /**
   * Load all meal selections for the user
   */
  async loadAllMealSelections(): Promise<void> {
    if (!this.userId) return;

    try {
      const { data, error } = await supabase
        .from('meal_selections')
        .select('*')
        .eq('user_id', this.userId);

      if (error) {
        logger.error('Error loading all meal selections:', error);
        return;
      }

      // Store each selection in Zustand
      (data || []).forEach((row) => {
        const selection: MealSelection = {
          id: row.id,
          user_id: row.user_id,
          challenge_week: row.challenge_week,
          selections: row.selections || {},
          delivery_preference: row.delivery_preference,
          locked: row.locked || false,
          locked_at: row.locked_at,
        };
        useAppStore.getState().setMealSelection(row.challenge_week, selection);
      });

      logger.log(`loadAllMealSelections: Loaded ${data?.length || 0} selections`);
    } catch (error) {
      logger.error('Error loading all meal selections:', error);
    }
  }

  /**
   * Select a meal option (optimistic update)
   */
  async selectMeal(
    challengeWeek: number,
    challengeDay: number,
    mealType: string,
    option: 'A' | 'B'
  ): Promise<void> {
    const key = `${challengeDay}_${mealType}`;

    // Optimistic update
    useAppStore.getState().selectMeal(challengeWeek, challengeDay, mealType, option);

    if (!this.userId) return;

    try {
      // Get current selections (also get week_start_date in case we need it)
      const { data: existing } = await supabase
        .from('meal_selections')
        .select('id, selections, week_start_date')
        .eq('user_id', this.userId)
        .eq('challenge_week', challengeWeek)
        .single();

      const newSelections = {
        ...(existing?.selections || {}),
        [key]: option,
      };

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('meal_selections')
          .update({ selections: newSelections, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (updateError) {
          logger.error('Error updating meal selection:', updateError);
          return;
        }
      } else {
        // Need to create new record - calculate week_start_date
        const cohort = useAppStore.getState().cohort;
        if (!cohort?.start_date) {
          logger.error('No cohort start date available for new record');
          return;
        }

        // Calculate week_start_date: cohort start + (week - 1) * 7 days
        const cohortStart = new Date(cohort.start_date);
        const weekStartDate = new Date(cohortStart);
        weekStartDate.setDate(cohortStart.getDate() + (challengeWeek - 1) * 7);
        const weekStartDateStr = weekStartDate.toISOString().split('T')[0];

        // Create new record with week_start_date
        const { error: insertError } = await supabase.from('meal_selections').insert({
          user_id: this.userId,
          challenge_week: challengeWeek,
          week_start_date: weekStartDateStr,
          selections: newSelections,
          locked: false,
        });

        if (insertError) {
          logger.error('Error inserting meal selection:', insertError);
          return;
        }
      }

      logger.log(`selectMeal: Saved ${key} = ${option} for week ${challengeWeek}`);
    } catch (error) {
      logger.error('Error saving meal selection:', error);
    }
  }

  /**
   * Set delivery preference (optimistic update)
   */
  async setDeliveryPreference(
    challengeWeek: number,
    preference: 'home' | 'pickup'
  ): Promise<void> {
    // Optimistic update
    useAppStore.getState().setDeliveryPreference(challengeWeek, preference);

    if (!this.userId) return;

    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('meal_selections')
        .select('id')
        .eq('user_id', this.userId)
        .eq('challenge_week', challengeWeek)
        .single();

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('meal_selections')
          .update({ delivery_preference: preference, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (updateError) {
          logger.error('Error updating delivery preference:', updateError);
          return;
        }
      } else {
        // Need to create new record - calculate week_start_date
        const cohort = useAppStore.getState().cohort;
        if (!cohort?.start_date) {
          logger.error('No cohort start date available for new record');
          return;
        }

        // Calculate week_start_date: cohort start + (week - 1) * 7 days
        const cohortStart = new Date(cohort.start_date);
        const weekStartDate = new Date(cohortStart);
        weekStartDate.setDate(cohortStart.getDate() + (challengeWeek - 1) * 7);
        const weekStartDateStr = weekStartDate.toISOString().split('T')[0];

        // Create new record with week_start_date
        const { error: insertError } = await supabase.from('meal_selections').insert({
          user_id: this.userId,
          challenge_week: challengeWeek,
          week_start_date: weekStartDateStr,
          selections: {},
          delivery_preference: preference,
          locked: false,
        });

        if (insertError) {
          logger.error('Error inserting delivery preference:', insertError);
          return;
        }
      }

      logger.log(`setDeliveryPreference: Set ${preference} for week ${challengeWeek}`);
    } catch (error) {
      logger.error('Error saving delivery preference:', error);
    }
  }

  /**
   * Lock meal selections for a week
   */
  async lockMealSelections(challengeWeek: number): Promise<boolean> {
    if (!this.userId) return false;

    try {
      // Check if record exists and has all selections
      const { data: existing, error: fetchError } = await supabase
        .from('meal_selections')
        .select('id, selections, delivery_preference')
        .eq('user_id', this.userId)
        .eq('challenge_week', challengeWeek)
        .single();

      if (fetchError || !existing) {
        logger.error('Cannot lock: No selection record found');
        return false;
      }

      // Validate all 14 meals are selected (7 days x 2 meals)
      const selections = existing.selections || {};
      logger.log('lockMealSelections: DB selections:', JSON.stringify(selections));
      logger.log('lockMealSelections: Selection count:', Object.keys(selections).length);

      const requiredKeys = [];
      for (let day = 1; day <= 7; day++) {
        const challengeDay = (challengeWeek - 1) * 7 + day;
        requiredKeys.push(`${challengeDay}_lunch`, `${challengeDay}_dinner`);
      }
      logger.log('lockMealSelections: Required keys:', requiredKeys);

      const missingSelections = requiredKeys.filter((key) => !selections[key]);
      if (missingSelections.length > 0) {
        logger.error('Cannot lock: Missing selections:', missingSelections);
        logger.error('DB has these keys:', Object.keys(selections));
        return false;
      }

      // Validate delivery preference is set
      if (!existing.delivery_preference) {
        logger.error('Cannot lock: Delivery preference not set');
        return false;
      }

      // Lock the selections
      const { error: updateError } = await supabase
        .from('meal_selections')
        .update({
          locked: true,
          locked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        logger.error('Error locking selections:', updateError);
        return false;
      }

      // Update local state
      useAppStore.getState().lockMealSelections(challengeWeek);

      logger.log(`lockMealSelections: Locked week ${challengeWeek}`);
      return true;
    } catch (error) {
      logger.error('Error locking meal selections:', error);
      return false;
    }
  }

  /**
   * Check if user has completed (locked) meal selection for a week
   */
  async hasCompletedMealSelection(challengeWeek: number): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { data, error } = await supabase
        .from('meal_selections')
        .select('locked')
        .eq('user_id', this.userId)
        .eq('challenge_week', challengeWeek)
        .single();

      if (error || !data) return false;
      return data.locked === true;
    } catch (error) {
      logger.error('Error checking meal selection completion:', error);
      return false;
    }
  }

  /**
   * Delete all user data from the database (Apple App Store requirement)
   * Deletes data from all tables in the correct order respecting foreign keys
   */
  async deleteAccountData(): Promise<boolean> {
    if (!this.userId) {
      logger.error('deleteAccountData: No user ID available');
      return false;
    }

    const userId = this.userId;
    logger.log('deleteAccountData: Starting deletion for user:', userId);

    try {
      // Delete in order respecting foreign key constraints
      // 1. Delete notification_logs
      const { error: notifError } = await supabase
        .from('notification_logs')
        .delete()
        .eq('user_id', userId);
      if (notifError) logger.error('Error deleting notification_logs:', notifError);

      // 2. Delete check_ins
      const { error: checkInsError } = await supabase
        .from('check_ins')
        .delete()
        .eq('user_id', userId);
      if (checkInsError) logger.error('Error deleting check_ins:', checkInsError);

      // 3. Delete daily_habits
      const { error: habitsError } = await supabase
        .from('daily_habits')
        .delete()
        .eq('user_id', userId);
      if (habitsError) logger.error('Error deleting daily_habits:', habitsError);

      // 4. Delete meal_selections
      const { error: mealsError } = await supabase
        .from('meal_selections')
        .delete()
        .eq('user_id', userId);
      if (mealsError) logger.error('Error deleting meal_selections:', mealsError);

      // 5. Delete streaks
      const { error: streaksError } = await supabase
        .from('streaks')
        .delete()
        .eq('user_id', userId);
      if (streaksError) logger.error('Error deleting streaks:', streaksError);

      // 6. Delete weekly_exercise
      const { error: exerciseError } = await supabase
        .from('weekly_exercise')
        .delete()
        .eq('user_id', userId);
      if (exerciseError) logger.error('Error deleting weekly_exercise:', exerciseError);

      // 7. Clear profile data (keep the row but clear personal info)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: null,
          push_token: null,
          cohort_id: null,
        })
        .eq('id', userId);
      if (profileError) logger.error('Error clearing profile:', profileError);

      // Clear local data
      this.clearUserData();

      logger.log('deleteAccountData: Successfully deleted all user data');
      return true;
    } catch (error) {
      logger.error('deleteAccountData: Error deleting account data:', error);
      return false;
    }
  }
}

// Singleton instance
export const dataSync = new DataSync();
