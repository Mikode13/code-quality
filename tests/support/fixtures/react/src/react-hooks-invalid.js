import { useEffect, useState } from 'react';

export function useConditionalState(flag) {
	if (flag) {
		useState(0);
	}

	return null;
}

export function useStaleEffect(value) {
	useEffect(() => {
		if (value === '') {
			return;
		}
	}, []);

	return value;
}
