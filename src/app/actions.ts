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
  link?: string;
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
    
    // Check if the user's email is in the admin_emails table
    const { data: admin, error } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', user.email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows returned, which is not an error here
        console.error('Error checking admin status:', error);
        return false;
    }

    return !!admin;
  } catch (error) {
    console.error("Error in isAdminUser:", error);
    return false;
  }
}


export async function addEvent(event: Omit<CalendarEvent, 'id'>) {
  const supabase = createClient();
  const { error } = await supabase.from('events').insert([{ ...event, link: event.link || null }]);
  
    if (error) {
      console.error('Error adding event:', error);
      throw new Error('Failed to add event. You may not have administrative privileges.');
    }

  revalidatePath('/');
}

export async function updateEvent(event: CalendarEvent) {
  const supabase = createClient();
  
  if (!event.id) {
      throw new Error("Event ID is required for update.");
  }

  const { id, ...updateData } = event;

  const { error } = await supabase.from('events').update({...updateData, link: updateData.link || null}).eq('id', id);
  
    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event. You may not have administrative privileges.');
    }

  revalidatePath('/');
}

export async function deleteEvent(id: number) {
  const supabase = createClient();
  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event. You may not have administrative privileges.');
  }

  revalidatePath('/');
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
    revalidatePath('/login');
}
