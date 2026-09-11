import type { Metadata } from "next";
import Souvenirs from "@/components/Souvenirs";

export const metadata: Metadata = {
  title: "Souvenirs",
  description: "Une photo ou une vidéo courte par étape du rituel SILENT, assemblées en montage récapitulatif.",
};

export default function Page() {
  return <Souvenirs />;
}
