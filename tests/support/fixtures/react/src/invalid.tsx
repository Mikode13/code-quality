import { useState } from 'react';

interface AvatarProps {
	enabled: boolean;
}

const labels = ['Save'];

export function Avatar({ enabled }: AvatarProps) {
	if (enabled) {
		useState(0);
	}

	return (
		<>
			{labels.map(label => (
				<span>{label}</span>
			))}
			<img src="/avatar.png" />
		</>
	);
}
