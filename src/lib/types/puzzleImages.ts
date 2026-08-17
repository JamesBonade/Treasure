export type PuzzleFacetOption = {
	id: string;
	label: string;
	/** Short label for chips / composed prompts */
	word: string;
	plural?: string;
	src: string;
};

export type PuzzleChoiceCard = {
	id: string;
	label: string;
	isCorrect: boolean;
	/** Full facet combination represented by this choice */
	modules: {
		number: string | null;
		object: string | null;
		colour: string | null;
		shape: string | null;
	};
};
