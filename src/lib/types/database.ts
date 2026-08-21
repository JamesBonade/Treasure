export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			clues: {
				Row: {
					action: string;
					answer: string;
					created_at: string;
					discover: string;
					hunt_id: string;
					id: string;
					n: number;
					place: string;
					puzzle: Json;
					trace_mode: string;
					type: string;
				};
				Insert: {
					action?: string;
					answer?: string;
					created_at?: string;
					discover?: string;
					hunt_id: string;
					id?: string;
					n: number;
					place?: string;
					puzzle?: Json;
					trace_mode?: string;
					type: string;
				};
				Update: {
					action?: string;
					answer?: string;
					created_at?: string;
					discover?: string;
					hunt_id?: string;
					id?: string;
					n?: number;
					place?: string;
					puzzle?: Json;
					trace_mode?: string;
					type?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'clues_hunt_id_fkey';
						columns: ['hunt_id'];
						isOneToOne: false;
						referencedRelation: 'hunts';
						referencedColumns: ['id'];
					}
				];
			};
			hunts: {
				Row: {
					age_band: string;
					created_at: string;
					id: string;
					owner_key: string;
					play_code: string;
					setting: string;
					status: string;
					title: string;
					updated_at: string;
				};
				Insert: {
					age_band?: string;
					created_at?: string;
					id?: string;
					owner_key: string;
					play_code: string;
					setting?: string;
					status?: string;
					title?: string;
					updated_at?: string;
				};
				Update: {
					age_band?: string;
					created_at?: string;
					id?: string;
					owner_key?: string;
					play_code?: string;
					setting?: string;
					status?: string;
					title?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			get_hunt_by_play_code: { Args: { p_code: string }; Returns: Json };
			get_my_hunt: {
				Args: { p_id: string; p_owner_key: string };
				Returns: Json;
			};
			list_my_hunts: { Args: { p_owner_key: string }; Returns: Json };
			upsert_hunt: {
				Args: {
					p_age_band: string;
					p_clues: Json;
					p_id: string;
					p_owner_key: string;
					p_play_code: string;
					p_setting: string;
					p_status: string;
					p_title: string;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};
