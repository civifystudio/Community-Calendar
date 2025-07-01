'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CalendarEvent {
  id?: number;
  date: string; // YYYY-MM-DD
  title: string;
  details: string;
  start_hour: number;
  end_hour: number;
  color: 'green' | 'blue' | 'purple' | 'yellow';
}

export async function getEvents() {
  const supabase = createClient();
  const { data, error } = await supabase.from('events').select('*');

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data;
}

export async function isAdminUser(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    // Check if the user's ID exists in the 'admins' table
    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    // PGRST116: single() found no rows, which is a valid case for non-admins.
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking admin status:', error.message);
      return false;
    }
    
    // If data is not null/undefined, the user is an admin.
    return !!data;
  } catch (error) {
    console.error("Error in isAdminUser:", error);
    return false;
  }
}


export async function addEvent(event: Omit<CalendarEvent, 'id'>) {
  const supabase = createClient();
  // RLS policies will handle authorization.
  const { error } = await supabase.from('events').insert([event]);
  
  if (error) {
    console.error('Error adding event:', error);
    throw new Error('Failed to add event. You might not have permission.');
  }

  revalidatePath('/');
}

export async function updateEvent(event: CalendarEvent) {
  const supabase = createClient();
  
  if (!event.id) {
      throw new Error("Event ID is required for update.");
  }

  const { id, ...updateData } = event;

  // RLS policies will handle authorization.
  const { error } = await supabase.from('events').update(updateData).eq('id', id);
  
  if (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event. You might not have permission.');
  }

  revalidatePath('/');
}

export async function deleteEvent(id: number) {
  const supabase = createClient();
  // RLS policies will handle authorization.
  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event. You might not have permission.');
  }

  revalidatePath('/');
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
    revalidatePath('/login');
}
