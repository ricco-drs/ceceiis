import React from "react";
import { electionLists as fallbackLists } from "@/mock/data";
import ListaClient from "./ListaClient";

export async function generateStaticParams() {
  return fallbackLists.map((list) => ({
    id: list.id,
  }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListaClient id={id} />;
}
