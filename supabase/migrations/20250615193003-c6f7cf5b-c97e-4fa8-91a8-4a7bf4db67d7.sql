
-- Set role to 'admin' for abdullah9zaki@gmail.com
UPDATE profiles
SET role = 'admin', full_name = 'Abdullah Zaki'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'abdullah9zaki@gmail.com'
);
