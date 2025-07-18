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

    // Check if the logged-in user's email matches the admin email from env
    // ADMIN_EMAIL must be set in your .env.local file.
    return user.email === process.env.ADMIN_EMAIL;
  } catch (error) {
    console.error("Error in isAdminUser:", error);
    return false;
  }
}


export async function addEvent(event: Omit<CalendarEvent, 'id'>) {
  const supabase = createClient();
  const isAdmin = await isAdminUser();
  if (!isAdmin) {
      throw new Error('You must be an admin to add events.');
  }
  
  const { error } = await supabase.from('events').insert([event]);
  
  if (error) {
    console.error('Error adding event:', error);
    throw new Error('Failed to add event.');
  }

  revalidatePath('/');
}

export async function updateEvent(event: CalendarEvent) {
  const supabase = createClient();
  const isAdmin = await isAdminUser();
  if (!isAdmin) {
      throw new Error('You must be an admin to update events.');
  }
  
  if (!event.id) {
      throw new Error("Event ID is required for update.");
  }

  const { id, ...updateData } = event;

  const { error } = await supabase.from('events').update(updateData).eq('id', id);
  
  if (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event.');
  }

  revalidatePath('/');
}

export async function deleteEvent(id: number) {
  const supabase = createClient();
  const isAdmin = await isAdminUser();
  if (!isAdmin) {
      throw new Error('You must be an admin to delete events.');
  }

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event.');
  }

  revalidatePath('/');
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
    revalidatePath('/login');
}
