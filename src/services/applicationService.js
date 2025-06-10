import { supabase } from "../api/client/supabase";

export const applicationService = {
  async create(applicationData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("applications")
        .insert({
          ...applicationData,
          user_id: user.id,
          status: "associated",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to create application: " + error.message);
    }
  },

  async getForCandidate(candidateId) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
        *,
        job(id, title, status, companies(id, name))
      `
        )
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch applications: " + error.message);
    }
  },

  async checkExisting(candidateId, jobId) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", candidateId)
        .eq("job_id", jobId)
        .maybesSingle();

      if (error) throw error;
      return data ? true : false;
    } catch (error) {
      throw new Error("Failed to check existing application: " + error.message);
    }
  },

  async updateStatus(applicationId, status, additionalData = {}) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .update({
          status,
          ...additionalData,
        })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to update application status: " + error.message);
    }
  },
  async getForJob(jobId) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          candidate:candidates(
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `
        )
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch job applications: " + error.message);
    }
  },
};
