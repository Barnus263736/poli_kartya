// ===== KÁRTYÁK LISTÁJA =====
// Új kártya hozzáadása: tegyél be egy sort ide, a képet pedig az img/ mappába.
// chance = esély százalékban egy csomag nyitásakor (az összegnek kb. 100-nak kell lennie).
// A "Common / Rare / Epic" kártyák helyőrzők: írd át a nevüket és tedd be a képüket!

const RARITIES = {
  secret:    { label: "SECRET",    sell: 1000, order: 0 },
  mythic:    { label: "MYTHIC",    sell: 300,  order: 1 },
  legendary: { label: "LEGENDARY", sell: 100,  order: 2 },
  epic:      { label: "EPIC",      sell: 40,   order: 3 },
  rare:      { label: "RARE",      sell: 20,   order: 4 },
  common:    { label: "COMMON",    sell: 10,   order: 5 },
};

const CARDS = [
  // --- SECRET ---
  { id: "smash-janos", name: "Smash Janos", rarity: "secret", chance: 0.05, img: "img/smash-janos.png", emoji: "💀" },

  // --- MYTHIC ---
  { id: "lakxjrncpreceldodk", name: "lakxjrncpreceldodk", rarity: "mythic", chance: 0.1, img: "img/lakxjrncpreceldodk.png", emoji: "🦃" },
  { id: "deadly-cookie", name: "Deadly Cookie", rarity: "mythic", chance: 0.1, img: "img/deadly-cookie.png", emoji: "🍪" },
  { id: "perec", name: "Perec", rarity: "mythic", chance: 0.2, img: "img/perec.png", emoji: "🥨" },
  { id: "geri-a-kalandor", name: "Geri a Kalandor", rarity: "mythic", chance: 0.2, img: "img/geri-a-kalandor.png", emoji: "🏜️" },
  { id: "mav", name: "MÁV", rarity: "mythic", chance: 0.3, img: "img/mav.png", emoji: "🚆" },
  { id: "bob", name: "BOB", rarity: "mythic", chance: 0.5, img: "img/bob.png", emoji: "🟥" },
  { id: "chuck-norris", name: "Chuck Norris", rarity: "mythic", chance: 0.8, img: "img/chuck-norris.png", emoji: "🤠" },
  { id: "bread", name: "Bread", rarity: "mythic", chance: 1, img: "img/bread.png", emoji: "🍞" },

  // --- LEGENDARY ---
  { id: "sas-jonas", name: "Sas Jónás", rarity: "legendary", chance: 1.1, img: "img/sas-jonas.png", emoji: "🦅" },
  { id: "moai", name: "Moai", rarity: "legendary", chance: 2, img: "img/moai.png", emoji: "🗿" },
  { id: "kazity", name: "Kazity", rarity: "legendary", chance: 2.6, img: "img/kazity.png", emoji: "😁" },
  { id: "kazika-a-pulyka", name: "Kazika a pulyka", rarity: "legendary", chance: 3, img: "img/kazika-a-pulyka.png", emoji: "🦃" },
  { id: "green-kocmoc", name: "Green Kocmoc", rarity: "legendary", chance: 3, img: "img/green-kocmoc.png", emoji: "🟢", tag: "LIMITED" },
  { id: "dermo", name: "Dermo", rarity: "legendary", chance: 3.5, img: "img/dermo.png", emoji: "⏳" },
  { id: "speedster69", name: "Speedster69", rarity: "legendary", chance: 4, img: "img/speedster69.png", emoji: "⚡" },
  { id: "feri", name: "Feri", rarity: "legendary", chance: 4.7, img: "img/feri.png", emoji: "👆" },
  { id: "cheesy-cheese", name: "Cheesy Cheese", rarity: "legendary", chance: 4.5, img: "img/cheesy-cheese.png", emoji: "🧀" },
  { id: "oszi", name: "Oszi", rarity: "legendary", chance: 5, img: "img/oszi.png", emoji: "🌈" },

  // --- HELYŐRZŐK (írd át őket!) ---
  { id: "epic-1", name: "Epic kártya 1", rarity: "epic", chance: 10, img: "img/epic-1.png", emoji: "💜" },
  { id: "epic-2", name: "Epic kártya 2", rarity: "epic", chance: 10, img: "img/epic-2.png", emoji: "🔮" },
  { id: "rare-1", name: "Rare kártya 1", rarity: "rare", chance: 11.67, img: "img/rare-1.png", emoji: "💙" },
  { id: "rare-2", name: "Rare kártya 2", rarity: "rare", chance: 11.68, img: "img/rare-2.png", emoji: "🌀" },
  { id: "common-1", name: "Common kártya 1", rarity: "common", chance: 10, img: "img/common-1.png", emoji: "⚪" },
  { id: "common-2", name: "Common kártya 2", rarity: "common", chance: 10, img: "img/common-2.png", emoji: "🔘" },
];