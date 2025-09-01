# Supabase Email Configuration

To ensure users see our custom confirmation page after clicking the email link, you need to update the Supabase email templates.

## Steps to Configure:

1. **Go to Supabase Dashboard**
   - Navigate to your project in Supabase
   - Go to Authentication → Email Templates

2. **Update Confirmation Email Template**
   - Select "Confirm signup" template
   - Update the confirmation URL to:
   ```
   https://scatterbrainai.com/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```

3. **Update Magic Link Template** (if using magic links)
   - Select "Magic Link" template
   - Update the URL to:
   ```
   https://scatterbrainai.com/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink
   ```

4. **Update Reset Password Template**
   - Select "Reset Password" template
   - Update the URL to:
   ```
   https://scatterbrainai.com/auth/reset-password?token_hash={{ .TokenHash }}&type=recovery
   ```

## Local Development

For local development, use:
```
http://localhost:3000/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## Important Notes:

- The `{{ .TokenHash }}` and `{{ .Type }}` are Supabase template variables
- Make sure to keep the exact syntax with dots and spaces
- Update both the production URL (scatterbrainai.com) and staging URLs if you have them
- Test the email flow after making changes