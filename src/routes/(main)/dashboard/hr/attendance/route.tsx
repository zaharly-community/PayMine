import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "../-components/hr-pages";

export const Route = createFileRoute("/(main)/dashboard/hr/attendance")({ component: AttendancePage });
