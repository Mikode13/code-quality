import { useEffect, useState } from 'react';

export function useCounter() {
	const [count] = useState(0);

	useEffect(() => {
		count.toString();
	}, [count]);

	return count;
}
