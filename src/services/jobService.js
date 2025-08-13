import { supabase } from "../api/client/supabase";

//helper function
const getUserOrganization = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: member, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error("User not member of any organization");
  return member.organization_id;
};

export const jobService = {
  async getAll(filters = {}) {
    try {
      const organizationId = await getUserOrganization(); // This line needs the 'await'

      let query = supabase
        .from("jobs")
        .select(`*, company:companies(id, name)`)
        .eq("organization_id", organizationId)
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
        .select(`*, company:companies(id, name, city, state) `)
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

      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("jobs")
        .insert({
          ...jobData,
          user_id: user.id,
          organization_id: organizationId,
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
