export interface ConjugationItem {
  pronoun: string;
  conjugation: string;
}

export interface ConjugationChallenge {
  verb: string;
  translation: string;
  tense: string;
  mood: string;
  items: ConjugationItem[];
}

export type FrenchTense = 
  | 'Présent' 
  | 'Imparfait' 
  | 'Passé Composé' 
  | 'Futur Simple' 
  | 'Conditionnel Présent' 
  | 'Subjonctif Présent';

export const ALL_TENSES: FrenchTense[] = [
  'Présent',
  'Passé Composé',
  'Imparfait',
  'Futur Simple',
  'Conditionnel Présent',
  'Subjonctif Présent'
];
