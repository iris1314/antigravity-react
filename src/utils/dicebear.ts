// 需求：預先載入 100 張不同素材的關主圖片
const SEEDS = Array.from({ length: 100 }, (_, i) => `arcade-boss-${i + 1}`);

export const getBossImageUrl = (seed: string) => `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;

export const preloadBossImages = () => {
  SEEDS.forEach(seed => {
    const img = new Image();
    img.src = getBossImageUrl(seed);
  });
};

export const getRandomBossSeed = () => {
  const randomIndex = Math.floor(Math.random() * SEEDS.length);
  return SEEDS[randomIndex];
};
