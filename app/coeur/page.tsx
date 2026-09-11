import type { Metadata } from "next";
import HeartCanvas from "@/components/HeartCanvas";

export const metadata: Metadata = {
  title: "Cœur",
  description: "Empreinte haptique simultanée et question du cœur, clôture du rituel SILENT.",
};

export default function Page() {
  return <HeartCanvas />;
}
