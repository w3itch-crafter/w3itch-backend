export enum GamesListSortBy {
  RATING = 'rating',
  TIME = 'updatedAt',
}

export enum ProjectClassification {
  GAMES = 'GAMES',
}

export enum GameEngine {
  RM2K3E = 'rm2k3e',
  MINETEST = 'mt',
  DEFAULT = 'default',
}

export enum PaymentMode {
  FREE = 'FREE',
  PAID = 'PAID',
  DISABLE_PAYMENTS = 'DISABLE_PAYMENTS',
}

export enum GameFileCharset {
  UTF8 = 'UTF8',
  GBK = 'GBK',
  SHIFT_JIS = 'SHIFT_JIS',
}

export enum ReleaseStatus {
  RELEASED = 'RELEASED',
  IN_DEVELOPMENT = 'IN_DEVELOPMENT',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  PROTOTYPE = 'PROTOTYPE',
}

export enum Genre {
  NO_GENRE = 'NO_GENRE',
  ACTION = 'ACTION',
  ADVENTURE = 'ADVENTURE',
  CARD_GAME = 'CARD_GAME',
  EDUCATIONAL = 'EDUCATIONAL',
  FIGHTING = 'FIGHTING',
  INTERACTIVE_FICTION = 'INTERACTIVE_FICTION',
  PLATFORMER = 'PLATFORMER',
  PUZZLE = 'PUZZLE',
  RACING = 'RACING',
  RHYTHM = 'RHYTHM',
  ROLE_PLAYING = 'ROLE_PLAYING',
  SHOOTER = 'SHOOTER',
  SIMULATION = 'SIMULATION',
  SPORTS = 'SPORTS',
  STRATEGY = 'STRATEGY',
  SURVIVAL = 'SURVIVAL',
  VISUAL_NOVEL = 'VISUAL_NOVEL',
  OTHER = 'OTHER',
}

export enum Community {
  DISQUS = 'DISQUS',
  DISABLED = 'DISABLED',
}
