import { supabase } from "../api/client/supabase";

export const companyContactService = {
  /**
   * Get all contacts for a company
   */
  async getByCompany(companyId) {
    try {
      const { data, error } = await supabase
        .from("company_contacts")
        .select("*")
        .eq("company_id", companyId)
        .order("is_primary", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch company contacts: " + error.message);
    }
  },

  /**
   * Get contact by ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from("company_contacts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch contact: " + error.message);
    }
  },

  /**
   * Create a new contact
   */
  async create(contactData) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // If this contact is being set as primary, unset other primary contacts
      if (contactData.is_primary) {
        await this.unsetPrimaryContacts(contactData.company_id);
      }

      const { data, error } = await supabase
        .from("company_contacts")
        .insert({
          ...contactData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to create contact: " + error.message);
    }
  },

  /**
   * Update a contact
   */
  async update(id, contactData) {
    try {
      // If this contact is being set as primary, unset other primary contacts
      if (contactData.is_primary) {
        const contact = await this.getById(id);
        await this.unsetPrimaryContacts(contact.company_id, id);
      }

      const { data, error } = await supabase
        .from("company_contacts")
        .update(contactData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to update contact: " + error.message);
    }
  },

  /**
   * Delete a contact
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from("company_contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error("Failed to delete contact: " + error.message);
    }
  },

  /**
   * Unset primary flag for all contacts of a company (except excluded ID)
   */
  async unsetPrimaryContacts(companyId, excludeId = null) {
    try {
      let query = supabase
        .from("company_contacts")
        .update({ is_primary: false })
        .eq("company_id", companyId)
        .eq("is_primary", true);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { error } = await query;
      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error("Failed to unset primary contacts: " + error.message);
    }
  },

  /**
   * Get contacts for dropdown (name and title)
   */
  async getForDropdown(companyId) {
    try {
      const { data, error } = await supabase
        .from("company_contacts")
        .select("id, name, title")
        .eq("company_id", companyId)
        .order("is_primary", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(
        "Failed to fetch contacts for dropdown: " + error.message
      );
    }
  },

  /**
   * Get primary contact for a company
   */
  async getPrimaryContact(companyId) {
    try {
      const { data, error } = await supabase
        .from("company_contacts")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_primary", true)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
      return data || null;
    } catch (error) {
      throw new Error("Failed to fetch primary contact: " + error.message);
    }
  },
};
