/**
 * 기존 cardlist.ts 데이터를 어드민 API로 마이그레이션하는 스크립트
 *
 * 사용법:
 * 1. weareplave 프로젝트에서 cardList를 JSON으로 export
 *    - 브라우저 콘솔에서 JSON.stringify(cardList) 복사
 *    - 또는 Node 스크립트로 추출
 * 2. cards.json 파일로 저장
 * 3. 아래 스크립트 실행:
 *    ADMIN_URL=https://cardlist-admin.xxx.workers.dev ADMIN_TOKEN=xxx npx tsx scripts/seed.ts
 */

const API_URL = process.env.ADMIN_URL ?? "http://localhost:8787";
const TOKEN = process.env.ADMIN_TOKEN ?? "changeme";

async function seed() {
  const fs = await import("fs");
  const cardsJson = fs.readFileSync("scripts/cards.json", "utf-8");
  const cards = JSON.parse(cardsJson);

  console.log(`${cards.length}개 카드를 업로드합니다...`);

  for (let i = 0; i < cards.length; i++) {
    const res = await fetch(`${API_URL}/api/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(cards[i]),
    });

    if (!res.ok) {
      console.error(`[${i}] 실패: ${res.status} ${await res.text()}`);
    } else {
      console.log(`[${i}] ${cards[i].name} ✓`);
    }
  }

  console.log("완료!");
}

seed().catch(console.error);
