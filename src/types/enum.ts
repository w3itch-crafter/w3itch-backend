export enum GamesListSortBy {
  RATING = 'rating',
  TIME = 'updatedAt',
  ID = 'id',
  CREATION_TIME = 'createdAt',
}

export enum ProjectClassification {
  GAMES = 'GAMES',
  GAME_ASSETS = 'GAME_ASSETS',
  GAME_MODS = 'GAME_MODS',
  PHYSICAL_GAMES = 'PHYSICAL_GAMES',
  ALBUMS_AND_SOUNDTRACKS = 'ALBUMS_AND_SOUNDTRACKS',
  TOOLS = 'TOOLS',
  COMICS = 'COMICS',
  BOOKS = 'BOOKS',
  OTHER = 'OTHER',
}

export enum GameEngine {
  // 'auto' should be rejected. It is only used on the front-end
  RM2K3E = 'rm2k3e',
  MINETEST = 'mt',
  HTML = 'html',
  DOWNLOADABLE = 'downloadable',
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
