export const mapTicketFromApi = (t) => ({
  id: t.id,
  userEmail: t.user_email,      // ✅ convert snake_case -> camelCase
  category: t.category,
  title: t.title,
  description: t.description,
  status: t.status,
  remark: t.remark || "",
  createdAt: t.created_at,
  updatedAt: t.updated_at,
});
