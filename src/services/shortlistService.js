import { supabase } from "../api/client/supabase";

// Helper function to get user's organization
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

export const shortlistService = {
  /**
   * Get all shortlists for the current organization
   */
  async getAll() {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("shortlists")
        .select(
          `
          *,
          created_by_user:profiles!shortlists_created_by_fkey(email),
          candidate_count:shortlist_candidates(count)
        `
        )
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Transform the count data
      return (
        data?.map((shortlist) => ({
          ...shortlist,
          candidate_count: shortlist.candidate_count[0]?.count || 0,
        })) || []
      );
    } catch (error) {
      throw new Error("Failed to fetch shortlists: " + error.message);
    }
  },

  /**
   * Get a specific shortlist with candidate details
   */
  async getById(shortlistId) {
    try {
      const organizationId = await getUserOrganization();

      // Get shortlist details
      const { data: shortlist, error: shortlistError } = await supabase
        .from("shortlists")
        .select(
          `
          *,
          created_by_user:profiles!shortlists_created_by_fkey(email)
        `
        )
        .eq("id", shortlistId)
        .eq("organization_id", organizationId)
        .single();

      if (shortlistError) throw shortlistError;

      // Get candidates in shortlist
      const { data: candidates, error: candidatesError } = await supabase
        .from("shortlist_candidates")
        .select(
          `
          *,
          candidate:candidates(*),
          added_by_user:profiles!shortlist_candidates_added_by_fkey(email)
        `
        )
        .eq("shortlist_id", shortlistId)
        .order("added_at", { ascending: false });

      if (candidatesError) throw candidatesError;

      return {
        ...shortlist,
        candidates: candidates || [],
      };
    } catch (error) {
      throw new Error("Failed to fetch shortlist: " + error.message);
    }
  },

  /**
   * Create a new shortlist
   */
  async create(shortlistData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("shortlists")
        .insert({
          ...shortlistData,
          organization_id: organizationId,
          created_by: user.id,
        })
        .select(
          `
          *,
          created_by_user:profiles!shortlists_created_by_fkey(email)
        `
        )
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to create shortlist: " + error.message);
    }
  },

  /**
   * Update shortlist metadata
   */
  async update(shortlistId, shortlistData) {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("shortlists")
        .update(shortlistData)
        .eq("id", shortlistId)
        .eq("organization_id", organizationId)
        .select(
          `
          *,
          created_by_user:profiles!shortlists_created_by_fkey(email)
        `
        )
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to update shortlist: " + error.message);
    }
  },

  /**
   * Delete a shortlist
   */
  async delete(shortlistId) {
    try {
      const organizationId = await getUserOrganization();

      const { error } = await supabase
        .from("shortlists")
        .delete()
        .eq("id", shortlistId)
        .eq("organization_id", organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error("Failed to delete shortlist: " + error.message);
    }
  },

  /**
   * Add candidate(s) to a shortlist
   */
  async addCandidates(shortlistId, candidateIds, notes = null) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Prepare candidate records for insertion
      const candidateRecords = candidateIds.map((candidateId) => ({
        shortlist_id: shortlistId,
        candidate_id: candidateId,
        added_by: user.id,
        notes: notes,
      }));

      const { data, error } = await supabase
        .from("shortlist_candidates")
        .insert(candidateRecords).select(`
          *,
          candidate:candidates(id, first_name, last_name, email),
          added_by_user:profiles!shortlist_candidates_added_by_fkey(email)
        `);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(
        "Failed to add candidates to shortlist: " + error.message
      );
    }
  },

  /**
   * Remove a candidate from a shortlist
   */
  async removeCandidate(shortlistId, candidateId) {
    try {
      const { error } = await supabase
        .from("shortlist_candidates")
        .delete()
        .eq("shortlist_id", shortlistId)
        .eq("candidate_id", candidateId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(
        "Failed to remove candidate from shortlist: " + error.message
      );
    }
  },

  /**
   * Update notes for a candidate in a shortlist
   */
  async updateCandidateNotes(shortlistId, candidateId, notes) {
    try {
      const { data, error } = await supabase
        .from("shortlist_candidates")
        .update({ notes })
        .eq("shortlist_id", shortlistId)
        .eq("candidate_id", candidateId)
        .select(
          `
          *,
          candidate:candidates(id, first_name, last_name, email)
        `
        )
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to update candidate notes: " + error.message);
    }
  },

  /**
   * Get all shortlists that contain a specific candidate
   */
  async getShortlistsForCandidate(candidateId) {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("shortlist_candidates")
        .select(
          `
          shortlist:shortlists!inner(*)
        `
        )
        .eq("candidate_id", candidateId)
        .eq("shortlist.organization_id", organizationId);

      if (error) throw error;
      return data?.map((item) => item.shortlist) || [];
    } catch (error) {
      throw new Error(
        "Failed to fetch shortlists for candidate: " + error.message
      );
    }
  },

  /**
   * Get shortlist options for dropdowns (id, name only)
   */
  async getForDropdown() {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("shortlists")
        .select("id, name")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(
        "Failed to fetch shortlists for dropdown: " + error.message
      );
    }
  },

  /**
   * Duplicate a shortlist
   */
  async duplicate(shortlistId, newName) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const organizationId = await getUserOrganization();

      // Get original shortlist
      const original = await this.getById(shortlistId);

      // Create new shortlist
      const { data: newShortlist, error: createError } = await supabase
        .from("shortlists")
        .insert({
          name: newName,
          description: original.description,
          organization_id: organizationId,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy candidates if any exist
      if (original.candidates && original.candidates.length > 0) {
        const candidateRecords = original.candidates.map((item) => ({
          shortlist_id: newShortlist.id,
          candidate_id: item.candidate_id,
          added_by: user.id,
          notes: item.notes,
        }));

        const { error: candidatesError } = await supabase
          .from("shortlist_candidates")
          .insert(candidateRecords);

        if (candidatesError) throw candidatesError;
      }

      return newShortlist;
    } catch (error) {
      throw new Error("Failed to duplicate shortlist: " + error.message);
    }
  },
};
