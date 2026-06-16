import { writable } from 'svelte/store';

export type Toast = {
	id: number;
	message: string;
	type: 'success' | 'error' | 'info';
};

export const toasts = writable<Toast[]>([]);

export function pushToast(message: string, type: Toast['type'] = 'info') {
	const id = Date.now();
	toasts.update((items) => [...items, { id, message, type }]);
	window.setTimeout(() => {
		toasts.update((items) => items.filter((toast) => toast.id !== id));
	}, 4200);
}
