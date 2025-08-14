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

export const organizationService = {
  /**
   * Get current user's organization details
   */
  async getCurrentOrganization() {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch organization: " + error.message);
    }
  },

  /**
   * Get all members of current user's organization
   */
  async getOrganizationMembers() {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("organization_members")
        .select(
          `
          *,
          user:profiles(id, email, created_at)
        `
        )
        .eq("organization_id", organizationId)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch organization members: " + error.message);
    }
  },

  /**
   * Create an invitation for someone to join the organization
   */
  async createInvitation(email) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const organizationId = await getUserOrganization();

      // FIXED: Check if the EMAIL being invited is already a member
      // Get all users with this email first
      const { data: existingUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingUsers) {
        // Check if this user is already a member of the organization
        const { data: existingMember } = await supabase
          .from("organization_members")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("user_id", existingUsers.id)
          .maybeSingle();

        if (existingMember) {
          throw new Error("User is already a member of this organization");
        }
      }

      // Check if invitation already exists and is not used
      const { data: existingInvitation } = await supabase
        .from("organization_invitations")
        .select("id, used_at")
        .eq("organization_id", organizationId)
        .eq("email", email)
        .is("used_at", null)
        .maybeSingle();

      if (existingInvitation) {
        throw new Error("Invitation already sent to this email");
      }

      const { data, error } = await supabase
        .from("organization_invitations")
        .insert({
          organization_id: organizationId,
          email: email,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to create invitation: " + error.message);
    }
  },

  /**
   * Get all pending invitations for current organization
   */
  async getPendingInvitations() {
    try {
      const organizationId = await getUserOrganization();

      const { data, error } = await supabase
        .from("organization_invitations")
        .select(
          `
          *,
          created_by_user:profiles!organization_invitations_created_by_fkey(email)
        `
        )
        .eq("organization_id", organizationId)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch pending invitations: " + error.message);
    }
  },

  /**
   * Accept an invitation (join organization)
   */
  async acceptInvitation(invitationCode) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("invitation_code", invitationCode)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        throw new Error("Invalid or expired invitation");
      }

      // Check if user's email matches invitation
      if (user.email !== invitation.email) {
        throw new Error("Invitation email does not match your account email");
      }

      // Add user to organization
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: invitation.organization_id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      // Mark invitation as used
      const { error: updateError } = await supabase
        .from("organization_invitations")
        .update({
          used_at: new Date().toISOString(),
          used_by: user.id,
        })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      return invitation;
    } catch (error) {
      throw new Error("Failed to accept invitation: " + error.message);
    }
  },

  /**
   * Cancel/delete an invitation
   */
  async cancelInvitation(invitationId) {
    try {
      const organizationId = await getUserOrganization();

      const { error } = await supabase
        .from("organization_invitations")
        .delete()
        .eq("id", invitationId)
        .eq("organization_id", organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error("Failed to cancel invitation: " + error.message);
    }
  },

  /**
   * Remove a member from the organization
   */
  async removeMember(userId) {
    try {
      const organizationId = await getUserOrganization();

      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("organization_id", organizationId)
        .eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error("Failed to remove member: " + error.message);
    }
  },

  /**
   * Get invitation by code (for accepting invitations)
   */
  async getInvitationByCode(invitationCode) {
    try {
      const { data, error } = await supabase
        .from("organization_invitations")
        .select(
          `
          *,
          organization:organizations(name)
        `
        )
        .eq("invitation_code", invitationCode)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch invitation: " + error.message);
    }
  },
};
