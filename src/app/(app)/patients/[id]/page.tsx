
"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PatientDetailPagePlaceholder() {
  // This is a drastically simplified version for debugging Turbopack errors.
  // The original complex component has been temporarily replaced.
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <h1 className="text-2xl font-bold mb-4">Patient Detail Page (Simplified)</h1>
      <p className="text-muted-foreground mb-6">
        This page is temporarily simplified to help diagnose a Turbopack error.
      </p>
      <Button variant="outline" asChild>
        <Link href="/patients">
          <span>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Pacientes
          </span>
        </Link>
      </Button>
    </div>
  );
}
