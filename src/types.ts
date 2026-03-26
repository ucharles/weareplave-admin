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

export interface CardType {
  value: string;
  label: string;
}

export interface CardListData {
  cards: ICard[];
  members: Member[];
  themes: Theme[];
  cardTypes: CardType[];
  updatedAt: string;
}

// Worker env bindings
export interface Env {
  CARDLIST_KV: KVNamespace;
  ADMIN_TOKEN: string;
  REVALIDATE_URL: string;
  REVALIDATE_SECRET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_S3_BUCKET: string;
  AWS_S3_REGION: string;
}
