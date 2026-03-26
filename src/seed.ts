import type { Member, Theme, CardType } from "./types";

// 기존 weareplave 프로젝트의 멤버/테마 데이터
export const MEMBERS: Member[] = [
  { uuid: "9eea0f5e-47bc-459e-b7cb-b049b9915ea5", en: "YEJUN", ko: "예준" },
  { uuid: "517ee4b2-e057-4295-a835-469204aa7404", en: "NOAH", ko: "노아" },
  { uuid: "2159fe6c-3b26-4a86-8667-e7e00f45f98e", en: "BAMBY", ko: "밤비" },
  { uuid: "6f74ff88-bc43-4c22-9c5c-ec6e838a7e3e", en: "EUNHO", ko: "은호" },
  { uuid: "9ef1ce93-ad51-4bdf-99de-69da25446f64", en: "HAMIN", ko: "하민" },
];

export const THEMES: Theme[] = [
  { uuid: "fd8a2c38-938c-4c1d-8288-aea6f48643ae", en: "Wait For You", ko: "기다릴게", alias: "WFY" },
  { uuid: "21a62508-0562-466f-b56a-07e67380d063", en: "Why?", ko: "왜요 왜요 왜?", alias: "Why?" },
  { uuid: "9b01318b-4871-4c5c-8f9f-b10c1772f7d5", en: "The 6th Summer", ko: "여섯 번째 여름", alias: "T6S" },
  { uuid: "9448572c-b617-4df5-ab50-55578309ba64", en: "PLAVE × ANIPLUS", ko: "PLAVE × ANIPLUS" },
  { uuid: "fc895e48-19d9-44a6-96bb-0ac360b2c75a", en: "WAY 4 LUV", ko: "WAY 4 LUV", alias: "W4L" },
  { uuid: "fd6bfcdd-3d2f-47b1-87e5-032e07422f84", en: "PLAVE × ANIMATE", ko: "PLAVE × ANIMATE" },
  { uuid: "d42f2112-fd18-4588-bea2-53d3e58b64fd", en: "Season Greeting", ko: "시즌 그리팅" },
  { uuid: "cb4db5b2-6350-445c-abe5-3bdf6c704216", en: "Hello, Asterum!", ko: "Hello, Asterum!" },
  { uuid: "145fc4ea-560e-4af2-ba87-499fd35ddae3", en: "PLAVE × MEDIHEAL", ko: "PLAVE × MEDIHEAL" },
  { uuid: "80f402bc-d798-4127-9672-9d25a881319c", en: "Membership 1st Kit", ko: "멤버십 1기 키트" },
  { uuid: "87683bc3-be92-4519-8add-e5b9eeeea378", en: "Happy Birthday", ko: "생일 축하해" },
  { uuid: "7c2f90a1-3397-42ee-8aab-1bb011514b4b", en: "WEVERSE CON", ko: "위버스콘" },
  { uuid: "72bae7ee-e433-4119-9d57-f92b1f08bebb", en: "Magazine NJHM", ko: "매거진 NJHM" },
  { uuid: "fe4bb521-c9bb-437d-912c-57b9b6d1fd23", en: "Hello, Asterum! Encore", ko: "Hello, Asterum! Encore" },
  { uuid: "4dcc0282-1803-4e7b-8863-6e3fda01e753", en: "Pump Up The Volume!", ko: "Pump Up The Volume!", alias: "PUTV" },
  { uuid: "f2450681-c3f7-4c71-bea6-a78944627be7", en: "PLAVE × PEPERO", ko: "PLAVE × PEPERO" },
  { uuid: "b937d8d2-0897-42c7-a588-d6f1e2f9a743", en: "Asterum 4/33 Cafe", ko: "아스테룸 4/33 카페" },
  { uuid: "46ee8bdb-abd3-4d3b-b0dd-10f879aba0c3", en: "Team PLAVE", ko: "Team PLAVE" },
  { uuid: "545c51b0-5459-4c39-9711-e470be9e840a", en: "Caligo Pt.1", ko: "Caligo Pt.1", alias: "CPT1" },
  { uuid: "4008d8c6-2780-45e6-a40c-10922de20657", en: "Happy PLAVE Day", ko: "해피 플레이브 데이" },
  { uuid: "0278fe88-9140-4560-a0ff-cd9c6314623c", en: "Membership 2nd Kit", ko: "멤버십 2기 키트" },
  { uuid: "95731963-2225-4142-949e-0d6bd470cfb9", en: "Kakurenbo", ko: "Kakurenbo" },
  { uuid: "58440531-a35c-42df-9feb-2a485f350962", en: "Dash - Quantum Leap", ko: "Dash - Quantum Leap" },
  { uuid: "abaff552-7ca5-47c0-8e36-d64231a2eee8", en: "PLBBUU", ko: "PLBBUU" },
  { uuid: "d2f7c881-230b-4985-aea4-912aadc338fa", en: "Dash - Quantum Leap Encore", ko: "Dash - Quantum Leap Encore" },
  { uuid: "71fffd77-23e2-4ac6-bbf5-e0f1ca35988f", en: "GS25", ko: "GS25" },
];

export const CARD_TYPES: CardType[] = [
  { value: "album", label: "앨범" },
  { value: "concert", label: "콘서트" },
  { value: "collaboration", label: "콜라보" },
  { value: "officialMerch", label: "공식 MD" },
  { value: "membership", label: "멤버십" },
];
