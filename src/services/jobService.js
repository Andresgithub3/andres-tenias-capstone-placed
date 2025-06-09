import { supabase } from "../api/client/supabase";

export const jobService = {
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from("jobs")
        .select(`*, company:companies(id, name)`)
        .order("created_at", { ascending: false });

      // Add filters if needed
      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error("Failed to fetch jobs: " + error.message);
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
                    *,
                    company:companies(id, name, location_city, location_state)
                `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error("Failed to fetch job: " + error.message);
    }
  },

  async createJob(jobData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("jobs")
        .insert({
          ...jobData,
          user_id: user.id,
        })
        .select(`*, company:companies(id, name)`)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error("Failed to create job: " + error.message);
    }
  },

  async updateJob(id, jobData) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error("Failed to update job: " + error.message);
    }
  },

  async getActiveJobs() {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
                    *,
                    company:companies(id, name)
                `
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      throw new Error("Failed to fetch active jobs: " + error.message);
    }
  },

  async getCompaniesForDropdown() {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch companies: " + error.message);
    }
  },
};
