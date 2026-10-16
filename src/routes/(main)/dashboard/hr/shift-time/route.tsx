import { createFileRoute } from "@tanstack/react-router";
import { ShiftTimePage } from "../-components/hr-pages";

export const Route = createFileRoute("/(main)/dashboard/hr/shift-time")({ component: ShiftTimePage });
