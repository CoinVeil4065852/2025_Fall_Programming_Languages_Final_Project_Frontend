import api from './index';

type Credentials = { username: string; password: string };

export async function login(creds: Credentials) {
  return api.login(creds);
}

export async function register(data: {
  username: string;
  password: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
}) {
  return api.register(data);
}

export async function getProfile(token: string) {
  return api.getProfile(token);
}
