import { useId } from 'react';

export function LabelledInput() {
	const id = useId();

	return (
		<>
			<label htmlFor={id}>Name</label>
			<input id={id} />
		</>
	);
}
