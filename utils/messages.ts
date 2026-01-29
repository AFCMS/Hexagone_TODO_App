export interface MessageMin {
  id: string;
  title: string;
  description: string;
}

export interface SavedMessage extends MessageMin {
  favorite?: boolean;
}
