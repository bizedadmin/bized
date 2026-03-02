import { redirect } from "next/navigation";

export default function SettingsRootRedirect() {
    redirect("/settings/general");
}
