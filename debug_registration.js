// Debug script to test Supabase registration
// Run with: node debug_registration.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testRegistration() {
  console.log('Testing user registration...');

  try {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testData = {
      name: 'Test User',
      phone: '+265999999999',
      role: 'farmer'
    };

    console.log('Attempting to register user:', {
      email: testEmail,
      data: testData
    });

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: testData,
        emailRedirectTo: `${SUPABASE_URL}/`,
      },
    });

    console.log('Registration response:', { data, error });

    if (error) {
      console.error('Registration failed:', error);
      return;
    }

    if (data.user) {
      console.log('User created successfully:', data.user.id);

      // Wait for profile creation
      console.log('Waiting for profile creation...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      console.log('Profile check result:', { profile, profileError });
    }

  } catch (err) {
    console.error('Test failed:', err);
  }
}

testRegistration();