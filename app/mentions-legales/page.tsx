import { MentionsView } from "@/components/proto/MentionsView";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Mentions légales et confidentialité",
  "Mentions légales et politique de confidentialité du portfolio de Clara Bernadou.",
);

export default function MentionsLegalesPage() {
  return <MentionsView v={{}} />;
}
