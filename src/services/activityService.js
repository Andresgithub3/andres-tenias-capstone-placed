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

export const activityService = {
  /**
   * Get activities for a specific entity
   */
  async getActivitiesForEntity(entityType, entityId) {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .eq("organization_id", organizationId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch activities: " + error.message);
    }
  },

  /**
   * Create a new activity
   */
  async createActivity(activityData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("activities")
        .insert({
          ...activityData,
          user_id: user.id,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to create activity: " + error.message);
    }
  },

  /**
   * Update an activity
   */
  async updateActivity(id, activityData) {
    try {
      const { data, error } = await supabase
        .from("activities")
        .update(activityData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to update activity: " + error.message);
    }
  },

  /**
   * Delete an activity
   */
  async deleteActivity(id) {
    try {
      const { error } = await supabase.from("activities").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error("Failed to delete activity: " + error.message);
    }
  },

  async getByEntity(entityType, entityId) {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .eq("organization_id", organizationId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch activities: " + error.message);
    }
  },
};
