import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

export interface Project {
  id?: string;
  name: string;
  type: 'video' | 'image';
  thumbnail?: string;
  data: any;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION = 'projects';

export const createProject = async (project: Omit<Project, 'id'>) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...project };
};

export const getUserProjects = async (userId: string) => {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project));
};

export const getProject = async (id: string) => {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Project;
};

export const updateProject = async (id: string, data: Partial<Project>) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteProject = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};
