// src/utils/storage.js

const SESSION_KEY = "session";

/* -------------------- SESSION -------------------- */

export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export const setSession = (sessionData) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getToken = () => {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    return session?.token || null;
  } catch {
    return null;
  }
};

/* -------------------- UTILS -------------------- */


export const generateTicketId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${year}-${random}`;
};
