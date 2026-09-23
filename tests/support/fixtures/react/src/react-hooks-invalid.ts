import { useEffect, useState } from 'react';

export function useConditionalState(flag: boolean) {
	if (flag) {
		useState(0);
	}

	return null;
}

export function useStaleEffect(value: string) {
	useEffect(() => {
		if (value === '') {
			return;
		}
	}, []);

	return value;
}
