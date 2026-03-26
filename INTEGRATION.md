# weareplave Next.js 프로젝트 연동 가이드

## 1. 환경 변수 추가 (.env)

```
CARDLIST_API_URL=https://cardlist-admin.YOUR_SUBDOMAIN.workers.dev/api/public/cardlist
REVALIDATE_SECRET=changeme
```

## 2. 카드 데이터 fetch 함수 추가

`src/lib/cardlist.ts` 파일 생성:

```ts
import type { ICard } from "@/types";

interface CardListResponse {
  cards: ICard[];
  members: { uuid: string; en: string; ko: string }[];
  themes: { uuid: string; en: string; ko: string; alias?: string }[];
  updatedAt: string;
}

export async function getCardList(): Promise<ICard[]> {
  const res = await fetch(process.env.CARDLIST_API_URL!, {
    next: { revalidate: 60 }, // 60초마다 ISR
  });

  if (!res.ok) {
    // fallback: 기존 하드코딩 데이터 사용
    const { cardList } = await import("@/data/cardlist");
    return cardList;
  }

  const data: CardListResponse = await res.json();
  return data.cards;
}
```

## 3. On-demand Revalidation 엔드포인트 추가

`src/app/api/revalidate/route.ts` 파일 생성:

```ts
import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidatePath("/");
  return Response.json({ revalidated: true, now: Date.now() });
}
```

## 4. 페이지에서 사용

기존 `cardList` import를 `getCardList()` 호출로 교체:

```tsx
// 변경 전
import { cardList } from "@/data/cardlist";

// 변경 후
import { getCardList } from "@/lib/cardlist";

export default async function Page() {
  const cardList = await getCardList();
  // ...
}
```

## 셋업 순서

1. `wrangler kv:namespace create CARDLIST_KV` 로 KV 네임스페이스 생성
2. `wrangler.toml`에 생성된 ID 입력
3. `wrangler.toml`의 `ADMIN_TOKEN`, `REVALIDATE_SECRET` 변경
4. `npm install && npm run deploy`
5. 어드민에서 기존 카드 데이터 입력 (또는 seed 스크립트 실행)
6. Next.js 프로젝트에 환경 변수 추가 후 배포
