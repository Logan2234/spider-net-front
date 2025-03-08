import COOKIE_KEYS from '$lib/constants/cookieKeys';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
    const theme = cookies.get(COOKIE_KEYS.theme);
    return { darkModeOn: theme === 'dark' };
};
