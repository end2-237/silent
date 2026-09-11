import type { Metadata } from "next";
import Cards from "@/components/Cards";

export const metadata: Metadata = {
  title: "Cartes",
  description: "Les cinq signes de la main du rituel SILENT, en cartes à retournement 3D.",
};

export default function Page() {
  return <Cards />;
}
