import { supabase } from "../api/client/supabase";

// Add this helper function
const getUserOrganization = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: member, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error("User not member of any organization");
  return member.organization_id;
};

export const companyService = {
  /**
   * Get all companies with counts for list view
   */
  async getAll(searchTerm = "") {
    try {
      const organizationId = await getUserOrganization();
      
      let query = supabase
        .from("companies")
        .select(
          `
          *,
          contact_count:company_contacts(count),
          job_count:jobs(count)
        `
        )
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform the count data
      return data.map((company) => ({
        ...company,
        contact_count: company.contact_count[0]?.count || 0,
        job_count: company.job_count[0]?.count || 0,
      }));
    } catch (error) {
      throw new Error("Failed to fetch companies: " + error.message);
    }
  },

  /**
   * Get company by ID with related data
   */
  async getById(id) {
    try {
      const organizationId = await getUserOrganization();
      
      const { data, error } = await supabase
        .from("companies")
        .select(
          `
          *,
          contacts:company_contacts(*),
          jobs(*)
        `
        )
        .eq("id", id)
        .eq("organization_id", organizationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch company: " + error.message);
    }
  },

  /**
   * Create a new company
   */
  async create(companyData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("companies")
        .insert({
          ...companyData,
          user_id: user.id,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to create company: " + error.message);
    }
  },

  /**
   * Get companies for dropdown (simplified data)
   */
  async getForDropdown() {
    try {
      const organizationId = await getUserOrganization();
      
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        "Failed to fetch companies for dropdown: " + error.message
      );
    }
  },

  /**
   * Get recent activity for a company
   */
  async getRecentActivity(companyId, limit = 3) {
    try {
      const organizationId = await getUserOrganization();
      
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("entity_type", "company")
        .eq("entity_id", companyId)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch recent activity: " + error.message);
    }
  },

  // Keep update and delete unchanged (they don't need organization filtering)
  async update(id, companyData) {
    try {
      const { data, error } = await supabase
        .from("companies")
        .update(companyData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to update company: " + error.message);
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase.from("companies").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error("Failed to delete company: " + error.message);
    }
  },
};
