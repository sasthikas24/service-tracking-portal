// src/utils/storage.js

const USERS_KEY = "users";
const SESSION_KEY = "session";
const TICKETS_KEY = "tickets";

/* -------------------- USERS (Register/Login) -------------------- */

export const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
};

export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = ({ email, password, role }) => {
  const users = getUsers();

  const exists = users.some(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
  );

  if (exists) {
    return { ok: false, message: "User already registered. Please login." };
  }

  users.push({
    email,
    password,
    role,
    createdAt: new Date().toISOString(),
  });

  saveUsers(users);
  return { ok: true, message: "Registration successful. Please login." };
};

export const loginUser = ({ email, password, role }) => {
  const users = getUsers();

  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
  );

  if (!user) {
    return { ok: false, message: "You are not registered. Please register first." };
  }

  if (user.password !== password) {
    return { ok: false, message: "Invalid password." };
  }

  setSession({ email: user.email, role: user.role });
  return { ok: true };
};

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

/* -------------------- TICKETS -------------------- */

export const getTickets = () => {
  try {
    return JSON.parse(localStorage.getItem(TICKETS_KEY)) || [];
  } catch {
    return [];
  }
};

export const saveTickets = (tickets) => {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
};

export const addTicket = (ticket) => {
  const tickets = getTickets();
  tickets.push(ticket);
  saveTickets(tickets);
};

export const getTicketById = (id) => {
  const tickets = getTickets();
  return tickets.find((t) => t.id === id) || null;
};

export const updateTicket = (id, updates) => {
  const tickets = getTickets();
  const index = tickets.findIndex((t) => t.id === id);

  if (index === -1) return null;

  tickets[index] = {
    ...tickets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveTickets(tickets);
  return tickets[index];
};

export const generateTicketId = () => {
  const year = new Date().getFullYear();
  const tickets = getTickets();

  let id = "";
  let isUnique = false;

  while (!isUnique) {
    const random = Math.floor(1000 + Math.random() * 9000);
    id = `TKT-${year}-${random}`;
    isUnique = !tickets.some((t) => t.id === id);
  }

  return id;
};
