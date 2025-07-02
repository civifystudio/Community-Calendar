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
  color: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'orange' | 'pink' | 'teal';
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

export async function getEventById(id: number) {
    const supabase = createClient();
    const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  
    if (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }
    return data;
}

export async function isAdminUser(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return false;
    }
    
    const { data: admin, error } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', user.email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows returned
        console.error('Error checking admin status:', error);
        return false;
    }

    return !!admin;
  } catch (error) {
    console.error("Error in isAdminUser:", error);
    return false;
  }
}


export async function addEvent(event: Omit<CalendarEvent, 'id' | 'link'>): Promise<CalendarEvent | null> {
    const supabase = createClient();
    
    // 1. Insert the event without a link to get the new ID
    const { data: newEvent, error: insertError } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();

    if (insertError) {
        console.error('Error adding event:', insertError);
        throw new Error('Failed to add event. You may not have administrative privileges.');
    }

    if (!newEvent) {
        throw new Error('Failed to retrieve new event after creation.');
    }

    // 2. Update the event with the generated link
    const link = `/event/${newEvent.id}`;
    const { data: updatedEvent, error: updateError } = await supabase
        .from('events')
        .update({ link })
        .eq('id', newEvent.id)
        .select()
        .single();
    
    if (updateError) {
        console.error('Error updating event with link:', updateError);
        // Event was created but link failed. Still revalidate.
        revalidatePath('/');
        revalidatePath(`/event/${newEvent.id}`);
        throw new Error('Event created, but failed to set shareable link.');
    }
    
    revalidatePath('/');
    revalidatePath(`/event/${newEvent.id}`);
    return updatedEvent;
}

export async function updateEvent(event: CalendarEvent) {
  const supabase = createClient();
  
  if (!event.id) {
      throw new Error("Event ID is required for update.");
  }

  const { id, ...updateData } = event;
  const link = `/event/${id}`;

  const { error } = await supabase.from('events').update({...updateData, link }).eq('id', id);
  
    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event. You may not have administrative privileges.');
    }

  revalidatePath('/');
  revalidatePath(`/event/${id}`);
}

export async function deleteEvent(id: number) {
  const supabase = createClient();
  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw new Error('Failed to delete event. You may not have administrative privileges.');
  }

  revalidatePath('/');
  revalidatePath(`/event/${id}`);
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    revalidatePath('/');
    revalidatePath('/login');
}
