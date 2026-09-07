import type { User } from './model.js';

const loadUser = (): Promise<User> => Promise.resolve({ id: 'user-1' });

export const loadUserId = async (): Promise<string> => {
	const user = await loadUser();

	return user.id;
};
