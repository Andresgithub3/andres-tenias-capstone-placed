import { supabase } from "../api/client/supabase";

export const dashboardService = {
  /**
   * Get all dashboard metrics
   */
  async getDashboardStats() {
    try {
      // Get all stats in parallel
      const [
        { data: openJobs, error: jobsError },
        { data: activeContractors, error: contractorsError },
        { data: interviewsThisWeek, error: interviewsError },
        { data: permanentPlacements, error: placementsError }
      ] = await Promise.all([
        // Total Open Jobs
        supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        
        // Active Contractors (all placed for now)
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'placed'),
        
        // Interviews This Week
        supabase
          .from('interviews')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'scheduled')
          .gte('scheduled_date', new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString())
          .lt('scheduled_date', new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7)).toISOString()),
        
        // Permanent Placements This Month
        supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'placed')
          .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      // Check for errors
      if (jobsError) throw jobsError;
      if (contractorsError) throw contractorsError;
      if (interviewsError) throw interviewsError;
      if (placementsError) throw placementsError;

      return {
        totalOpenJobs: openJobs || 0,
        activeContractors: activeContractors || 0,
        interviewsThisWeek: interviewsThisWeek || 0,
        permanentPlacementsThisMonth: permanentPlacements || 0
      };
    } catch (error) {
      throw new Error("Failed to fetch dashboard stats: " + error.message);
    }
  },

  /**
   * Get recent activities
   */
  async getRecentActivities() {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error("Failed to fetch recent activities: " + error.message);
    }
  },

  /**
   * Get today's upcoming interviews
   */
  async getTodaysInterviews() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          application:applications(
            candidate:candidates(
              first_name,
              last_name
            ),
            job:jobs(
              title,
              company:companies(
                name
              )
            )
          )
        `)
        .eq('status', 'scheduled')
        .gte('scheduled_date', startOfDay)
        .lt('scheduled_date', endOfDay)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Format the data for easier use
      const formattedInterviews = (data || []).map(interview => ({
        ...interview,
        candidate_name: `${interview.application.candidate.first_name} ${interview.application.candidate.last_name}`,
        job_title: interview.application.job.title,
        company_name: interview.application.job.company.name
      }));

      return formattedInterviews;
    } catch (error) {
      throw new Error("Failed to fetch today's interviews: " + error.message);
    }
  }
};