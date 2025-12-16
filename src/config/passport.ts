import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Users } from '../database/models-ts/users.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/api/v1/auth/google-login/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile received:', profile);
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // Find user by Google ID or email
        let user = await Users.findOne({ where: { google_id: profile.id } });

        if (!user) {
          // Optional: Also check by email if you want to link existing accounts
          user = await Users.findOne({ where: { email: profile.emails?.[0].value } });

          if (user) {
            // Link existing account
            user.google_id = profile.id;
            await user.save();
          } else {
            // Create new user
            user = await Users.create({
              google_id: profile.id,
              email: profile.emails?.[0].value || '',
              username: profile.displayName,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
