import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { IUsersAttributes, Users } from '../database/models-ts/users.js';

import { UserService } from '../services/user-service.js';
import { UserRetrievedDTO } from '../services/dto/user-service.dto.js';
import { UserRepository } from '../repositories/implementations/user-repository.js';

const userService = new UserService(new UserRepository());

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

        const currentUser: UserRetrievedDTO = await userService.handleGoogleUser({ id: profile.id, emails: profile.emails, displayName: profile.displayName });
        currentUser.username += '= logged in with Google';
        return done(null, currentUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  ) // end of strategy
);

export default passport;
