import { redirect } from "next/navigation";

/** Landing page → Practice (main typing experience) */
export default function HomePage() {
  redirect("/practice");
}
