'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

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

async function verifyAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        throw new Error('Unauthorized. Only the admin can perform this action.');
    }
    return user;
}


export async function addEvent(event: Omit<CalendarEvent, 'id'>) {
  await verifyAdmin();
  const supabase = createClient();
  const { error } = await supabase.from('events').insert([event]);
  
  if (error) {
    console.error('Error adding event:', error);
    throw new Error('Failed to add event.');
  }

  revalidatePath('/');
}

export async function updateEvent(event: CalendarEvent) {
  await verifyAdmin();
  const supabase = createClient();
  
  if (!event.id) {
      throw new Error("Event ID is required for update.");
  }

  // Create a new object without the id for the update payload
  const { id, ...updateData } = event;

  const { error } = await supabase.from('events').update(updateData).eq('id', id);
  
  if (error) {
    console.error('Error updating event:', error);
    throw new Error('Failed to update event.');
  }

  revalidatePath('/');
}

export async function deleteEvent(id: number) {
  await verifyAdmin();
  const supabase = createClient();
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
