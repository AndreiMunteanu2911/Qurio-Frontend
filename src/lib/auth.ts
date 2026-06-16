import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	type User
} from 'firebase/auth';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { firebaseAuth } from './firebase';

export const user = writable<User | null>(null);
export const authReady = writable(false);

let initialized = false;

export function initAuth() {
	if (!browser || initialized) return;
	initialized = true;

	onAuthStateChanged(firebaseAuth, (currentUser) => {
		user.set(currentUser);
		authReady.set(true);
	});
}

export async function login(email: string, password: string) {
	return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signup(email: string, password: string) {
	return createUserWithEmailAndPassword(firebaseAuth, email, password);
}

export async function logout() {
	await signOut(firebaseAuth);
}

export async function getIdToken() {
	const currentUser = firebaseAuth.currentUser;
	if (!currentUser) throw new Error('Please sign in to continue.');
	return currentUser.getIdToken();
}
