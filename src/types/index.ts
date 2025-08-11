export interface Show {
  id: number;
  name: string;
  summary: string | null;
  image: {
    medium: string;
    original: string;
  } | null;
  genres: string[];
  language: string;
  status: string;
  premiered: string | null;
  ended: string | null;
  rating: {
    average: number | null;
  };
  network: {
    id: number;
    name: string;
    country: {
      name: string;
      code: string;
    };
  } | null;
  externals: {
    tvdb: number | null;
    thetvdb: number | null;
    imdb: string | null;
  };
  _links: {
    self: {
      href: string;
    };
  };
}

export interface Episode {
  id: number;
  url: string;
  name: string;
  season: number;
  number: number;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number | null;
  rating: {
    average: number | null;
  };
  image: {
    medium: string;
    original: string;
  } | null;
  summary: string | null;
  _links: {
    self: {
      href: string;
    };
  };
}

export interface SearchResult {
  score: number;
  show: Show;
}

export interface TrackedShow {
  id: number;
  show: Show;
  addedAt: string;
  watchedEpisodes: number[];
  currentSeason: number;
  currentEpisode: number;
  lastWatched: string | null;
  isCompleted: boolean;
  totalEpisodes?: number; // cached total episode count
  totalEpisodesUpdatedAt?: string; // ISO timestamp when totalEpisodes was refreshed
}

export interface LocalStorageData {
  trackedShows: TrackedShow[];
  lastUpdated: string;
}

export interface ScheduleItem {
  id: number;
  url: string;
  name: string;
  season: number | null;
  number: number | null;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number | null;
  rating: {
    average: number | null;
  };
  image: {
    medium: string;
    original: string;
  } | null;
  summary: string | null;
  show: Show;
  _links: {
    self: {
      href: string;
    };
  };
}
