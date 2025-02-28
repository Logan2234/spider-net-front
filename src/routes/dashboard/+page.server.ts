import { error } from '@sveltejs/kit';

export const load = async () => {
    const data = await fetch('https://localhost:4000/api/v1/stats', { method: 'GET' });

    if (data.ok) {
        return await data.json();
    }

    error(400, { message: (await data.json()).message || 'Failed to fetch data' });
};
