import { createFileRoute } from "@tanstack/react-router";
import { ProgramsPage } from "../-components/hr-pages";

export const Route = createFileRoute("/(main)/dashboard/hr/programs")({ component: ProgramsPage });
