import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tjghhjyotidphtmikixy.supabase.co'
const SUPABASE_KEY = 'sb_publishable_82Nlx4BTjOkLSYTv04KIZg_gg7TzWUJ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const syncWorkoutToSupabase = async (workout: any) => {
  try {
    const { error } = await supabase.from('workouts').upsert(workout)
    if (error) console.warn('Supabase sync failed:', error.message)
  } catch (e) {
    console.warn('Supabase unavailable, working offline')
  }
}

export const syncWeightToSupabase = async (exerciseId: string, weight: number) => {
  try {
    const { error } = await supabase
      .from('user_weights')
      .upsert({ exercise_id: exerciseId, weight_kg: weight, updated_at: new Date().toISOString() })
    if (error) console.warn('Supabase weight sync failed:', error.message)
  } catch (e) {
    console.warn('Supabase unavailable, working offline')
  }
}
