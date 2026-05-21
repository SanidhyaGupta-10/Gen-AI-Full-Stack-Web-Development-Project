// ─── Auth Types ─────────────────────────────────────────────

export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface RegisterParams {
    name: string;
    email: string;
    password: string;
}

export interface LoginParams {
    email: string;
    password: string;
}

export interface AuthResponse {
    token?: string;
    user?: User;
    message?: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    login: (params: LoginParams) => Promise<AuthResponse>;
    register: (params: RegisterParams) => Promise<AuthResponse>;
}
