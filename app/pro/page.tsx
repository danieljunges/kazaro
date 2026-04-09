import { redirect } from "next/navigation";

/** Plano Pro desativado por enquanto; mantém URLs antigas funcionando. */
export default function ProPage() {
  redirect("/para-profissionais");
}
