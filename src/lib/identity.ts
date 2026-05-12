import { supabase } from '@/integrations/supabase/client';
import { forgetCachedPath } from '@/lib/constellation';

export async function signOut() {
  forgetCachedPath();
  await supabase.auth.signOut();
}