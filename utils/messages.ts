export interface MessageMin {
  id: string;
  title: string;
  description: string;
}

export interface SavedMessage extends MessageMin {
  favorite?: boolean;
}

const builtinMessages: SavedMessage[] = [
  {
    id: "1",
    title: "SOS",
    description: "SOS",
    favorite: false,
  },
  {
    id: "2",
    title: "Meuh",
    description: "",
    favorite: true,
  },
  {
    id: "3",
    title: "Lire un livre",
    description: "Terminer le roman en cours",
    favorite: false,
  },
] as const;

export default builtinMessages;
