import { supabase } from "../api/client/supabase";
import { activityService } from "./activityService";

export const interviewService = {
  /**
   * Check if an application is eligible for interview scheduling
   */
  async canScheduleInterview(applicationId) {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("status")
        .eq("id", applicationId)
        .single();

      if (error) throw error;
      
      return data?.status === "submitted-to-client";
    } catch (error) {
      throw new Error("Failed to check interview eligibility: " + error.message);
    }
  },

  /**
   * Get eligible applications for interview scheduling
   * Can filter by candidate or job
   */
  async getEligibleApplications(candidateId = null, jobId = null) {
    try {
      let query = supabase
        .from("applications")
        .select(`
          *,
          candidate:candidates(id, first_name, last_name),
          job:jobs(id, title, company:companies(id, name))
        `)
        .eq("status", "submitted-to-client")
        .order("created_at", { ascending: false });

      if (candidateId) {
        query = query.eq("candidate_id", candidateId);
      }
      
      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch eligible applications: " + error.message);
    }
  },

  /**
   * Get company contacts for interviewer selection
   */
  async getCompanyContacts(jobId) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          company_id,
          company:companies(
            company_contacts(
              id,
              first_name,
              last_name,
              email,
              title,
              is_primary
            )
          )
        `)
        .eq("id", jobId)
        .single();

      if (error) throw error;
      
      return data?.company?.company_contacts || [];
    } catch (error) {
      throw new Error("Failed to fetch company contacts: " + error.message);
    }
  },

  /**
   * Schedule a new interview
   */
  async scheduleInterview(interviewData) {
    try {
      // First check if the application is eligible
      const canSchedule = await this.canScheduleInterview(interviewData.application_id);
      if (!canSchedule) {
        throw new Error("Candidate must be submitted to client before scheduling interviews");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create the interview record
      const { data: interview, error: interviewError } = await supabase
        .from("interviews")
        .insert({
          ...interviewData,
          user_id: user.id,
          status: "scheduled"
        })
        .select(`
          *,
          application:applications(
            candidate:candidates(id, first_name, last_name),
            job:jobs(id, title, company:companies(id, name))
          )
        `)
        .single();

      if (interviewError) throw interviewError;

      // Create an activity record
      await this.createInterviewActivity(interview);

      return interview;
    } catch (error) {
      throw new Error("Failed to schedule interview: " + error.message);
    }
  },

  /**
   * Create an activity record for an interview
   */
  async createInterviewActivity(interviewData) {
    try {
      const activityData = {
        entity_type: "candidate",
        entity_id: interviewData.application.candidate.id,
        type: "interview",
        subject: `Interview Scheduled - ${interviewData.application.job.title}`,
        description: `${interviewData.interview_type} interview scheduled for ${new Date(interviewData.scheduled_date).toLocaleDateString()}`,
        scheduled_date: interviewData.scheduled_date,
        status: "scheduled"
      };

      return await activityService.createActivity(activityData);
    } catch (error) {
      throw new Error("Failed to create interview activity: " + error.message);
    }
  },

  /**
   * Get interview by ID with related data
   */
  async getInterviewById(id) {
    try {
      const { data, error } = await supabase
        .from("interviews")
        .select(`
          *,
          application:applications(
            candidate:candidates(id, first_name, last_name, email),
            job:jobs(id, title, company:companies(id, name))
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error("Failed to fetch interview: " + error.message);
    }
  },

  /**
   * Get today's interviews for dashboard
   */
  async getTodaysInterviews() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from("interviews")
        .select(`
          *,
          application:applications(
            candidate:candidates(id, first_name, last_name),
            job:jobs(id, title, company:companies(id, name))
          )
        `)
        .gte("scheduled_date", startOfDay)
        .lte("scheduled_date", endOfDay)
        .eq("status", "scheduled")
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch today's interviews: " + error.message);
    }
  },

  /**
   * Complete an interview with feedback
   */
  async completeInterview(interviewId, completionData) {
    try {
      const { data, error } = await supabase
        .from("interviews")
        .update({
          ...completionData,
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", interviewId)
        .select(`
          *,
          application:applications(
            candidate:candidates(id, first_name, last_name),
            job:jobs(id, title)
          )
        `)
        .single();

      if (error) throw error;

      // Update the activity record
      await this.updateInterviewActivity(data, "completed");

      return data;
    } catch (error) {
      throw new Error("Failed to complete interview: " + error.message);
    }
  },

  /**
   * Update the activity record when interview status changes
   */
  async updateInterviewActivity(interviewData, newStatus) {
    try {
      // This is a simplified version - you might want to find the specific activity
      // and update it rather than creating a new one
      const activityData = {
        entity_type: "candidate",
        entity_id: interviewData.application.candidate.id,
        type: "interview",
        subject: `Interview ${newStatus} - ${interviewData.application.job.title}`,
        description: `Interview ${newStatus} on ${new Date(interviewData.scheduled_date).toLocaleDateString()}`,
        scheduled_date: new Date().toISOString(),
        status: newStatus
      };

      return await activityService.createActivity(activityData);
    } catch (error) {
      throw new Error("Failed to update interview activity: " + error.message);
    }
  }
};
