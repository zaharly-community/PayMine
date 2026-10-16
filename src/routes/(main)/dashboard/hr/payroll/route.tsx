import { createFileRoute } from "@tanstack/react-router";
import { PayrollPage } from "../-components/hr-pages";

export const Route = createFileRoute("/(main)/dashboard/hr/payroll")({ component: PayrollPage });
