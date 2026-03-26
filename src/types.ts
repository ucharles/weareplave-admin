// 기존 weareplave 프로젝트의 ICard 타입과 동일
export interface PhotocardItem {
  uuid: string;
  member?: string | string[];
  image: string;
  alias?: string;
  backImage?: string;
}

export interface PhotocardGroup {
  info: string;
  infoName: string;
  items: PhotocardItem[];
}

export interface ICard {
  type?: string;
  theme: {
    en: string;
    ko: string;
    uuid: string;
  };
  name: string;
  photocards: PhotocardGroup[];
}

export interface Member {
  uuid: string;
  en: string;
  ko: string;
}

export interface Theme {
  uuid: string;
  en: string;
  ko: string;
  alias?: string;
}

export interface CardListData {
  cards: ICard[];
  members: Member[];
  themes: Theme[];
  updatedAt: string;
}

// Worker env bindings
export interface Env {
  CARDLIST_KV: KVNamespace;
  ADMIN_TOKEN: string;
  REVALIDATE_URL: string;
  REVALIDATE_SECRET: string;
}
