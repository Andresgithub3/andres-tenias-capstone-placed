import { supabase } from "../api/client/supabase";

// Add the helper function
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

export const applicationService = {
  async create(applicationData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("applications")
        .insert({
          ...applicationData,
          user_id: user.id,
          organization_id: organizationId,
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
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("applications")
        .select(
          `
        *,
        job:jobs(id, title, status, company:companies(id, name))
      `
        )
        .eq("candidate_id", candidateId)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch applications: " + error.message);
    }
  },

  async checkExisting(candidateId, jobId) {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", candidateId)
        .eq("job_id", jobId)
        .eq("organization_id", organizationId)
        .maybeSingle();

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
      const organizationId = await getUserOrganization();

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
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch job applications: " + error.message);
    }
  },
};
