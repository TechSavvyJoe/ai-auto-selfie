import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create singleton client
let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Database types
export interface Dealership {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  dealership_id?: string;
  role: 'admin' | 'manager' | 'salesperson';
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  dealership_id?: string;
  original_url: string;
  edited_url?: string;
  caption?: string;
  filters: any;
  customer_name?: string;
  customer_email?: string;
  car_info?: any;
  created_at: string;
  updated_at: string;
}

export interface Preset {
  id: string;
  user_id: string;
  dealership_id?: string;
  name: string;
  settings: any;
  is_shared: boolean;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  theme: 'light' | 'dark';
  auto_enhance: boolean;
  default_filters: any;
  updated_at: string;
}

class SupabaseService {
  public client: SupabaseClient | null = null;

  constructor() {
    this.client = getSupabaseClient();
  }

  // Auth methods
  async signUp(email: string, password: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    if (!this.client) throw new Error('Supabase not configured');
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    if (!this.client) return null;
    const { data: { user } } = await this.client.auth.getUser();
    return user;
  }

  async getUserProfile(userId?: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const uid = userId || (await this.getCurrentUser())?.id;
    if (!uid) return null;
    
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*, dealerships(*)')
      .eq('id', uid)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Dealership methods
  async createDealership(dealership: Omit<Dealership, 'id' | 'created_at' | 'updated_at'>) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('dealerships')
      .insert(dealership)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateDealership(id: string, updates: Partial<Dealership>) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('dealerships')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getDealerships() {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('dealerships')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  }

  async deleteDealership(id: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { error } = await this.client
      .from('dealerships')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // User management methods
  async createUser(email: string, password: string, profile: Partial<UserProfile>) {
    if (!this.client) throw new Error('Supabase not configured');
    
    // Create auth user
    const { data: authData, error: authError } = await this.client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: profile.full_name }
    });
    
    if (authError) throw authError;
    
    // Update profile with additional info
    if (authData.user) {
      const { error: profileError } = await this.client
        .from('user_profiles')
        .update({
          dealership_id: profile.dealership_id,
          role: profile.role || 'salesperson',
          phone: profile.phone
        })
        .eq('id', authData.user.id);
      
      if (profileError) throw profileError;
    }
    
    return authData.user;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getUserProfiles(dealershipId?: string) {
    if (!this.client) throw new Error('Supabase not configured');
    let query = this.client
      .from('user_profiles')
      .select('*, dealerships(name)');
    
    if (dealershipId) {
      query = query.eq('dealership_id', dealershipId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async deleteUser(userId: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { error } = await this.client.auth.admin.deleteUser(userId);
    if (error) throw error;
  }

  // Photo methods
  async savePhoto(photo: Omit<Photo, 'id' | 'created_at' | 'updated_at'>) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('photos')
      .insert(photo)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updatePhoto(id: string, updates: Partial<Photo>) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('photos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getPhotos(userId: string, limit = 50) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  async deletePhoto(id: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { error } = await this.client
      .from('photos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Preset methods
  async savePreset(preset: Omit<Preset, 'id' | 'created_at'>) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('presets')
      .insert(preset)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getPresets(userId: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('presets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async deletePreset(id: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { error } = await this.client
      .from('presets')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // Settings methods
  async getUserSettings(userId: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data;
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client
      .from('user_settings')
      .upsert({ user_id: userId, ...settings })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Storage methods for images
  async uploadImage(file: Blob, path: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client.storage
      .from('photos')
      .upload(path, file);
    if (error) throw error;
    return data;
  }

  async getImageUrl(path: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data } = this.client.storage
      .from('photos')
      .getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteImage(path: string) {
    if (!this.client) throw new Error('Supabase not configured');
    const { error } = await this.client.storage
      .from('photos')
      .remove([path]);
    if (error) throw error;
  }
}

// Singleton instance
let supabaseService: SupabaseService | null = null;

export const getSupabaseService = () => {
  if (!supabaseService) {
    supabaseService = new SupabaseService();
  }
  return supabaseService;
};
