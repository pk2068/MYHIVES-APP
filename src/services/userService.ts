import { User } from '../database/models-obsolete/User.js';
import { User as UserInterface } from '../types/models.js';
import { UserCreationAttributes } from '../database/models-obsolete/User.js'; // <-- IMPORTANT: Import UserCreationAttributes


export class UserService {
  public static async findUserByEmail(email: string): Promise<UserInterface | null> {
    const user = await User.findOne({ where: { email } });
    return user ? user.toJSON() : null;
  }

  public static async findUserById(id: string): Promise<UserInterface | null> {
    const user = await User.findByPk(id);
    return user ? user.toJSON() : null;
  }

  public static async createUser(userData: UserCreationAttributes): Promise<UserInterface> {
    const newUser = await User.create(userData);
    return newUser.toJSON();
  }

  public static async findOrCreateOAuthUser(
    email: string,
    providerId: string,
    provider: 'google' | 'linkedin',
    username?: string
  ): Promise<UserInterface> {
    let user = await User.findOne({
      where: { email },
    });

    if (user) {
      // Update provider ID if not already set
      if (provider === 'google' && !user.googleId) {
        user.googleId = providerId;
        await user.save();
      } else if (provider === 'linkedin' && !user.linkedinId) {
        user.linkedinId = providerId;
        await user.save();
      }
      return user.toJSON();
    } else {
      // Create new user
      const newUser = await User.create({
        email,
        username: username || email.split('@')[0], // Basic username from email if not provided
        googleId: provider === 'google' ? providerId : null,
        linkedinId: provider === 'linkedin' ? providerId : null,
      });
      return newUser.toJSON();
    }
  }
}