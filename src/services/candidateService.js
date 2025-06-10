import { supabase } from "../api/client/supabase";

export const candidateService = {
  /**
   * Get all candidates for the current user
   */
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      // Add filters if needed
      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error("Failed to fetch candidates: " + error.message);
    }
  },

  /**
   * Get a single candidate by ID with related data
   */
  async getById(id) {
    try {
      // First, get the candidate basic info
      const { data: candidate, error: candidateError } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .single();

      if (candidateError) throw candidateError;

      // Then get documents separately
      const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("*")
        .eq("entity_type", "candidate")
        .eq("entity_id", id)
        .order("created_at", { ascending: false });

      if (documentsError) throw documentsError;

      // Get applications with job info
      const { data: applications, error: applicationsError } = await supabase
        .from("applications")
        .select(
          `
          *,
          job:jobs(
            id,
            title,
            company:companies(
              id,
              name
            )
          )
        `
        )
        .eq("candidate_id", id)
        .order("created_at", { ascending: false });

      if (applicationsError) throw applicationsError;

      // Combine all data
      return {
        ...candidate,
        documents: documents || [],
        applications: applications || [],
      };
    } catch (error) {
      throw new Error("Failed to fetch candidate: " + error.message);
    }
  },

  /**
   * Create a new candidate
   */
  async create(candidateData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("candidates")
        .insert({
          ...candidateData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to create candidate: " + error.message);
    }
  },

  /**
   * Update a candidate
   */
  async update(id, candidateData) {
    try {
      const { data, error } = await supabase
        .from("candidates")
        .update(candidateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to update candidate: " + error.message);
    }
  },

  /**
   * Delete a candidate
   */
  async delete(id) {
    try {
      const { error } = await supabase.from("candidates").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error("Failed to delete candidate: " + error.message);
    }
  },
};
