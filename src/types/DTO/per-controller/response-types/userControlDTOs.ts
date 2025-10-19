// incoming DTO for user registration (excluding fields like ID, timestamps, OAuth IDs)

export interface RegisterUserIncomingDTO {
  username: string;
  email: string;
  password: string; // Password is required for direct registration
}
// outgoing DTO for authentication response

export interface RegisterUserOutgoingDTO {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}
// DTO for user update (all fields optional)

export interface UpdateUserIncomingDTO {
  username?: string;
  email?: string;
  password?: string;
}

export type GetMeUserOutgoingDTO = Omit<RegisterUserOutgoingDTO, 'pass'>;

// DTO for user login
export type LoginUserOutgoingDTO = RegisterUserOutgoingDTO & {
  token: string;
};

export interface LoginUserIncomingDTO {
  email: string;
  password: string;
}
