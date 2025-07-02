
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
  external_link?: string | null;
  link?: string;
  color: string;
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
    if (!user) {
        return false;
    }

    const { data, error } = await supabase.rpc('is_admin');

    if (error) {
        console.error('Error checking admin status via RPC:', error);
        return false;
    }

    return data === true;
  } catch (error) {
    console.error("Error in isAdminUser:", error);
    return false;
  }
}

export async function saveEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const supabase = createClient();
    const isAdmin = await isAdminUser();
    if (!isAdmin) {
        throw new Error('You must have administrative privileges to save an event.');
    }

    const eventId = event.id;
    
    // Sanitize the object to only include columns that exist in the DB for insert/update.
    const payload = {
        date: event.date,
        title: event.title,
        details: event.details,
        start_hour: event.start_hour,
        end_hour: event.end_hour,
        external_link: event.external_link || null,
        color: event.color || 'blue',
    };

    // Server-side validation
    if (!payload.title || !payload.details || !payload.date || payload.start_hour === undefined || payload.end_hour === undefined) {
        throw new Error("Missing required event data. Title, details, date, and times are required.");
    }
    
    if (eventId) {
        // Update
        const { data, error } = await supabase
            .from('events')
            .update(payload)
            .eq('id', eventId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating event:', error);
            throw new Error(`Failed to update event. Database error: ${error.message}`);
        }
        revalidatePath('/');
        revalidatePath(`/event/${eventId}`);
        return data;
    } else {
        // Add
        const { data: newEvent, error: insertError } = await supabase
            .from('events')
            .insert([payload])
            .select()
            .single();

        if (insertError) {
            console.error('Error adding event:', insertError);
            throw new Error(`Failed to add event. Database error: ${insertError.message}`);
        }
        
        const link = `/event/${newEvent.id}`;
        const { data: updatedEvent, error: updateError } = await supabase
            .from('events')
            .update({ link })
            .eq('id', newEvent.id)
            .select()
            .single();
        
        if (updateError) {
            console.error('Error updating event with link:', updateError);
        }

        revalidatePath('/');
        revalidatePath(`/event/${newEvent.id}`);
        return updatedEvent || newEvent;
    }
}


export async function deleteEvent(id: number) {
  const supabase = createClient();
  const isAdmin = await isAdminUser();
  if (!isAdmin) {
      throw new Error('You must have administrative privileges to delete an event.');
  }

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw new Error(`Failed to delete event. Database error: ${error.message}`);
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
