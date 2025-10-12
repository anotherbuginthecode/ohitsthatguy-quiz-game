// API payload (uguale a ciò che salvi)
export type GameSetAPI = {
  rounds: any[]; // (usa i tuoi Round types)
  meta: { mode: "standard" | "classic"; totalTime: number };
};

// Storage = API + _sys
export type GameSetDoc = GameSetAPI & {
  _sys: {
    gameSig: string;
    roundSigs: string[];
    servedCount: number;
    lastServedAt: Date | null;
    createdAt: Date;
    version: number;
  };
};
