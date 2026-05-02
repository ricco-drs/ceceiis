import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import type { ActSummary, ListResult } from "@/mock/data";
import type { AdminList } from "@/types/admin";

const ELECTION_STATE_PATH = "election/state";
const ELECTION_CONFIG_PATH = "election/config";

export interface ElectionData {
  summary: ActSummary;
  results: ListResult[];
  updatedAt: Timestamp;
}

/**
 * Publishes the election results to Firestore.
 * This is NOT real-time in the sense of listeners, 
 * it's a one-time write that will be read by the main page.
 */
export const publishResults = async (summary: ActSummary, results: ListResult[]) => {
  try {
    const docRef = doc(db, ELECTION_STATE_PATH);
    await setDoc(docRef, {
      summary: {
        ...summary,
        lastUpdated: new Date().toISOString(),
      },
      results,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error al publicar resultados:", error);
    return false;
  }
};

/**
 * Saves the registered lists and candidates to Firestore.
 */
export const saveElectionLists = async (lists: AdminList[]) => {
  try {
    const docRef = doc(db, ELECTION_CONFIG_PATH);
    await setDoc(docRef, {
      lists,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error al guardar listas:", error);
    return false;
  }
};

/**
 * Fetches the registered lists from Firestore.
 */
export const fetchElectionLists = async (): Promise<AdminList[]> => {
  try {
    const docRef = doc(db, ELECTION_CONFIG_PATH);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().lists as AdminList[];
    }
    return [];
  } catch (error) {
    console.error("Error al obtener listas:", error);
    return [];
  }
};

/**
 * Fetches the current election data from Firestore.
 */
export const fetchElectionData = async (): Promise<ElectionData | null> => {
  try {
    const docRef = doc(db, ELECTION_STATE_PATH);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ElectionData;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener datos de la elección:", error);
    return null;
  }
};
