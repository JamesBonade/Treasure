/** Score how closely a freehand trace follows guide strokes (path + direction). */

export type TraceGuidePoint = {
	x: number;
	y: number;
	/** Global stroke order across the whole target (letter/word). */
	strokeIndex: number;
	/** 0–1 distance along that stroke. */
	t: number;
};

export type TraceDrawPoint = {
	x: number;
	y: number;
};

export type TraceScoreResult = {
	/** 0–1 combined quality. */
	overall: number;
	/** Staying near the guide path. */
	accuracy: number;
	/** Moving forward along strokes (not backwards). */
	direction: number;
	/** Visiting strokes roughly in the taught order. */
	order: number;
	/** 1–3 stars for kids. */
	stars: 1 | 2 | 3;
	label: string;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const nearestGuide = (
	point: TraceDrawPoint,
	guide: TraceGuidePoint[],
	maxDist: number
): { index: number; dist: number } | null => {
	let bestIndex = -1;
	let bestDist = Infinity;
	const maxDistSq = maxDist * maxDist;

	for (let i = 0; i < guide.length; i += 1) {
		const g = guide[i];
		const dx = g.x - point.x;
		const dy = g.y - point.y;
		const distSq = dx * dx + dy * dy;
		if (distSq < bestDist) {
			bestDist = distSq;
			bestIndex = i;
		}
	}

	if (bestIndex < 0 || bestDist > maxDistSq) return null;
	return { index: bestIndex, dist: Math.sqrt(bestDist) };
};

const starsFromOverall = (overall: number): 1 | 2 | 3 => {
	if (overall >= 0.82) return 3;
	if (overall >= 0.6) return 2;
	return 1;
};

const labelFromStars = (stars: 1 | 2 | 3): string => {
	if (stars === 3) return 'Amazing tracing!';
	if (stars === 2) return 'Great try — nice path!';
	return 'Good effort — keep practising!';
};

/**
 * Compare the child's drawn points to ordered guide samples.
 * Forgiving for ages 3–5, but rewards correct direction and stroke order.
 */
export const scoreTracePath = (
	drawPoints: TraceDrawPoint[],
	guidePoints: TraceGuidePoint[],
	hitRadius: number
): TraceScoreResult => {
	if (drawPoints.length < 2 || guidePoints.length === 0) {
		return {
			overall: 0.35,
			accuracy: 0.35,
			direction: 0.35,
			order: 0.35,
			stars: 1,
			label: labelFromStars(1)
		};
	}

	const matchRadius = hitRadius * 1.6;
	const matches: { strokeIndex: number; t: number; dist: number }[] = [];

	for (const point of drawPoints) {
		const nearest = nearestGuide(point, guidePoints, matchRadius);
		if (!nearest) continue;
		const g = guidePoints[nearest.index];
		matches.push({ strokeIndex: g.strokeIndex, t: g.t, dist: nearest.dist });
	}

	if (matches.length < 2) {
		return {
			overall: 0.4,
			accuracy: 0.4,
			direction: 0.4,
			order: 0.4,
			stars: 1,
			label: labelFromStars(1)
		};
	}

	// Accuracy: closer to the path is better
	let accuracySum = 0;
	for (const match of matches) {
		accuracySum += 1 - clamp01(match.dist / matchRadius);
	}
	const accuracy = accuracySum / matches.length;

	// Direction: along the same stroke, t should mostly increase
	let forward = 0;
	let directionChecks = 0;
	for (let i = 1; i < matches.length; i += 1) {
		const prev = matches[i - 1];
		const curr = matches[i];
		if (curr.strokeIndex !== prev.strokeIndex) continue;
		directionChecks += 1;
		const delta = curr.t - prev.t;
		if (delta >= -0.02) forward += 1;
	}
	const direction = directionChecks > 0 ? forward / directionChecks : 0.55;

	// Order: stroke index should mostly stay the same or move to the next stroke
	const strokeCount = guidePoints.reduce((max, g) => Math.max(max, g.strokeIndex), 0) + 1;
	let orderGood = 0;
	let orderChecks = 0;
	let expectedStroke = matches[0]?.strokeIndex ?? 0;
	for (let i = 1; i < matches.length; i += 1) {
		const prev = matches[i - 1];
		const curr = matches[i];
		orderChecks += 1;
		if (curr.strokeIndex === prev.strokeIndex) {
			orderGood += 1;
			continue;
		}
		// Allow advancing to the next unfinished stroke (small skips for multi-letter)
		if (curr.strokeIndex >= expectedStroke && curr.strokeIndex <= expectedStroke + 1) {
			orderGood += 1;
			expectedStroke = curr.strokeIndex;
			continue;
		}
		if (curr.strokeIndex === prev.strokeIndex + 1) {
			orderGood += 1;
			expectedStroke = curr.strokeIndex;
		}
	}
	const order =
		orderChecks > 0
			? orderGood / orderChecks
			: strokeCount <= 1
				? 0.85
				: 0.5;

	const overall = clamp01(accuracy * 0.45 + direction * 0.35 + order * 0.2);
	const stars = starsFromOverall(overall);

	return {
		overall,
		accuracy,
		direction,
		order,
		stars,
		label: labelFromStars(stars)
	};
};
