
-- Check if admin user exists and create if needed
DO $$
DECLARE
    admin_user_id UUID;
    admin_exists BOOLEAN := FALSE;
BEGIN
    -- Check if admin user exists in auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'admin@arabinsights.com'
    ) INTO admin_exists;
    
    -- If admin doesn't exist, create it
    IF NOT admin_exists THEN
        -- Insert admin user
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@arabinsights.com',
            crypt('password', gen_salt('bf')),
            NOW(),
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Admin User"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
        
        -- Create admin profile
        INSERT INTO profiles (id, full_name, role)
        VALUES (admin_user_id, 'Admin User', 'admin')
        ON CONFLICT (id) DO UPDATE SET
            full_name = 'Admin User',
            role = 'admin';
            
        RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;
