import { supabaseServer } from '../lib/supabase/server';
import { UserRole } from '../types/auth.types';

export async function getAllUsers() {
  const { data, error } = await supabaseServer
    .from('users')
    .select('id, email, phone, full_name, role, is_verified, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);
  return data ?? [];
}

export async function updateUserRole(userId: string, role: UserRole) {
  const { error } = await supabaseServer
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) throw new Error(`Failed to update role: ${error.message}`);
}

export async function deleteUser(userId: string) {
  const { error } = await supabaseServer
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw new Error(`Failed to delete user: ${error.message}`);
}
