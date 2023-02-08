import { Tag } from "src/entity/tag";
import { withDataSource } from "src/service/data-source";

export async function initTags() {
  const repo = (await withDataSource()).getRepository(Tag);
  await repo.upsert(
    [
      {
        id: "shelter",
        name: "Unterkunft",
        icon: "house",
        adminOnly: true,
      },
      {
        id: "food",
        name: "Tafel / Essensausgabe",
        icon: "food",
        adminOnly: false,
      },
      {
        id: "male",
        name: "Nur für Männer",
        icon: "gender-male",
        adminOnly: false,
      },
      {
        id: "female",
        name: "Nur für Frauen",
        icon: "gender-female",
        adminOnly: false,
      },
      {
        id: "health-services",
        name: "Behandlung",
        icon: "heart-pulse",
        adminOnly: false,
      },
      {
        id: "clean",
        name: "Sauberkeit",
        icon: "bucket",
        adminOnly: false,
      },
      {
        id: "lockers",
        name: "Schließfächer",
        icon: "lock",
        adminOnly: false,
      },
      {
        id: "awarded",
        name: "Ausgezeichnet",
        icon: "award",
        adminOnly: true,
      },
      {
        id: "power",
        name: "Strom",
        icon: "lightning-charge",
        adminOnly: false,
      },
      {
        id: "drug-management",
        name: "Drogenentzug und -unterstützung",
        icon: "capsule-pill",
        adminOnly: false,
      },
      {
        id: "consulting",
        name: "Beratung",
        icon: "chat-left-text",
        adminOnly: false,
      },
      {
        id: "maintenance",
        name: "Im Aufbau / Renovierung",
        icon: "cone",
        adminOnly: false,
      },
      {
        id: "beverages",
        name: "Getränke",
        icon: "cup-straw",
        adminOnly: false,
      },
      {
        id: "hot-beverages",
        name: "Warme Getränke",
        icon: "cup-hot",
        adminOnly: false,
      },
      {
        id: "post-location",
        name: "Postannahmestelle",
        icon: "envelope-at",
        adminOnly: false,
      },
      {
        id: "danger",
        name: "Gefahr",
        icon: "exclamation-triangle",
        adminOnly: false,
      },
      {
        id: "unisex",
        name: "Unisex",
        icon: "gender-ambiguous",
        adminOnly: false,
      },
      {
        id: "internet",
        name: "Computer / Internet Zugang",
        icon: "laptop",
        adminOnly: false,
      },
      {
        id: "peaceful",
        name: "Friedlich",
        icon: "peace",
        adminOnly: false,
      },
      {
        id: "not-available",
        name: "Voll / Keine Personenannahme",
        icon: "person-slash",
        adminOnly: false,
      },
      {
        id: "cold",
        name: "Kalt",
        icon: "thermometer-snow",
        adminOnly: false,
      },
      {
        id: "hot",
        name: "Heiß",
        icon: "thermometer-sun",
        adminOnly: false,
      },
      {
        id: "language-english",
        name: "English",
        icon: "translate",
        adminOnly: false,
      },
      {
        id: "language-turkish",
        name: "Türkisch",
        icon: "translate",
        adminOnly: false,
      },
    ],
    ["id"],
  );
}
