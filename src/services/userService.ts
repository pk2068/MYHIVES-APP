// import { User } from '../database/models-obsolete/User.js';
import { users } from '../database/models-ts/users.js'; // Updated to use the new TypeScript model
import { usersAttributes } from '../database/models-ts/users.js'; // Importing the type for user creation attributes
//import { User as UserInterface } from '../types/models.js';
//import { UserCreationAttributes } from '../database/models-obsolete/User.js'; // <-- IMPORTANT: Import UserCreationAttributes


export class UserService {
  public static async findUserByEmail(email: string): Promise<usersAttributes | null> {
    const _user = await users.findOne({ where: { email : email } });
    return _user ? _user.toJSON() : null;
  }

  public static async findUserById(id: string): Promise<usersAttributes | null> {
    const _user = await users.findByPk(id);
    return _user ? _user.toJSON() : null;
  }

  public static async createUser(userData: usersAttributes): Promise<usersAttributes> {
    const newUser = await users.create(userData);
    return newUser.toJSON();
  }

  public static async findOrCreateOAuthUser(
    email: string,
    providerId: string,
    provider: 'google' | 'linkedin',
    username?: string
  ): Promise<usersAttributes> {
    let user = await users.findOne({
      where: { email },
    });

    if (user) {
      // Update provider ID if not already set
      if (provider === 'google' && !user.google_id) {
        user.google_id = providerId;
        await user.save();
      } else if (provider === 'linkedin' && !user.linkedin_id) {
        user.linkedin_id = providerId;
        await user.save();
      }
      return user.toJSON();
    } else {
      // Create new user
      const newUser = await users.create({
        email,
        username: username || email.split('@')[0], // Basic username from email if not provided
        google_id: provider === 'google' ? providerId : undefined,
        linkedin_id: provider === 'linkedin' ? providerId : undefined,
      });
      return newUser.toJSON();
    }
  }
}