-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's thoughts
  DELETE FROM thoughts WHERE user_id = auth.uid();
  
  -- Delete user's exports
  DELETE FROM exports WHERE user_id = auth.uid();
  
  -- Delete user's profile
  DELETE FROM profiles WHERE id = auth.uid();
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;