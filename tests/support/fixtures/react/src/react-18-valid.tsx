import { createContext, forwardRef, useContext, useId } from 'react';

const LabelContext = createContext('Name');

const Field = forwardRef<HTMLInputElement, { id: string }>(function Field({ id }, ref) {
	return <input id={id} ref={ref} />;
});

export function React18CompatibleField() {
	const id = useId();
	const label = useContext(LabelContext);

	return (
		<LabelContext.Provider value={label}>
			<label htmlFor={id}>{label}</label>
			<Field id={id} />
		</LabelContext.Provider>
	);
}
