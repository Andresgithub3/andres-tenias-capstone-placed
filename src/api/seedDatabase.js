// src/utils/seedDatabase.js
import { supabase } from '../api/client/supabase';

/**
 * Seed database with test data
 * Run this after signing in to populate your database with sample data
 */
export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // 1. Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be signed in to seed the database');
    }

    console.log(`Seeding data for user: ${user.email}`);

    // 2. Create Companies
    console.log('Creating companies...');
    const companies = await createCompanies(user.id);

    // 3. Create Company Contacts
    console.log('Creating company contacts...');
    const contacts = await createCompanyContacts(user.id, companies);

    // 4. Create Jobs
    console.log('Creating jobs...');
    const jobs = await createJobs(user.id, companies);

    // 5. Create Candidates
    console.log('Creating candidates...');
    const candidates = await createCandidates(user.id);

    // 6. Create Applications
    console.log('Creating applications...');
    const applications = await createApplications(user.id, candidates, jobs);

    // 7. Create Interviews
    console.log('Creating interviews...');
    const interviews = await createInterviews(user.id, applications);

    // 8. Create Activities
    console.log('Creating activities...');
    await createActivities(user.id, companies, candidates, applications);

    // 9. Create Company Notes
    console.log('Creating company notes...');
    await createCompanyNotes(user.id, companies);

    console.log('✅ Database seeded successfully!');

    // Return summary
    return {
      companies: companies.length,
      contacts: contacts.length,
      jobs: jobs.length,
      candidates: candidates.length,
      applications: applications.length,
      interviews: interviews.length
    };

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Helper function to handle errors
async function handleSupabaseOperation(operation, errorMessage) {
  const { data, error } = await operation;
  if (error) {
    console.error(errorMessage, error);
    throw error;
  }
  return data;
}

// Create Companies
async function createCompanies(userId) {
  const companiesData = [
    {
      user_id: userId,
      name: 'TechCorp Solutions',
      industry: 'Technology',
      size: '51-200',
      website: 'https://techcorp.example.com',
      linkedin_url: 'https://linkedin.com/company/techcorp',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      description: 'Leading software development company specializing in cloud solutions'
    },
    {
      user_id: userId,
      name: 'Global Finance Inc',
      industry: 'Finance',
      size: '201-500',
      website: 'https://globalfinance.example.com',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      description: 'Investment banking and financial services'
    },
    {
      user_id: userId,
      name: 'StartupHub',
      industry: 'Technology',
      size: '11-50',
      website: 'https://startuphub.example.com',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      description: 'Early-stage startup focusing on AI solutions'
    }
  ];

  return handleSupabaseOperation(
    supabase.from('companies').insert(companiesData).select(),
    'Failed to create companies:'
  );
}

// Create Company Contacts
async function createCompanyContacts(userId, companies) {
  const contactsData = [];
  
  companies.forEach((company, index) => {
    // Add 2-3 contacts per company
    contactsData.push({
      user_id: userId,
      company_id: company.id,
      name: `${company.name} HR Manager`,
      title: 'HR Manager',
      email: `hr@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-555-010${index}-1000`,
      is_primary: true,
      department: 'Human Resources'
    });

    contactsData.push({
      user_id: userId,
      company_id: company.id,
      name: `${company.name} Hiring Manager`,
      title: 'Engineering Manager',
      email: `hiring@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+1-555-010${index}-2000`,
      is_primary: false,
      department: 'Engineering'
    });
  });

  return handleSupabaseOperation(
    supabase.from('company_contacts').insert(contactsData).select(),
    'Failed to create contacts:'
  );
}

// Create Jobs
async function createJobs(userId, companies) {
  const jobsData = [
    {
      user_id: userId,
      company_id: companies[0].id,
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced Full Stack Developer to join our team.',
      requirements: 'Minimum 5 years experience with React and Node.js',
      salary_min: 120000,
      salary_max: 160000,
      employment_type: 'full-time',
      work_location: 'hybrid',
      experience_level: 'senior',
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
      status: 'active',
      priority: 'high',
      positions_available: 2,
      location_city: companies[0].city,
      location_state: companies[0].state
    },
    {
      user_id: userId,
      company_id: companies[0].id,
      title: 'DevOps Engineer',
      description: 'Seeking a DevOps engineer to improve our deployment pipelines.',
      requirements: 'Experience with Kubernetes and CI/CD',
      salary_min: 110000,
      salary_max: 150000,
      employment_type: 'full-time',
      work_location: 'remote',
      experience_level: 'mid',
      skills: ['Kubernetes', 'Docker', 'Jenkins', 'Terraform'],
      status: 'active',
      priority: 'medium'
    },
    {
      user_id: userId,
      company_id: companies[1].id,
      title: 'Financial Analyst',
      description: 'Join our finance team as a Financial Analyst.',
      requirements: 'CPA certification preferred',
      salary_min: 80000,
      salary_max: 110000,
      employment_type: 'full-time',
      work_location: 'on-site',
      experience_level: 'mid',
      skills: ['Excel', 'Financial Modeling', 'SQL'],
      status: 'active',
      priority: 'medium',
      location_city: companies[1].city,
      location_state: companies[1].state
    },
    {
      user_id: userId,
      company_id: companies[2].id,
      title: 'Machine Learning Engineer',
      description: 'Exciting opportunity to work on cutting-edge AI projects.',
      requirements: 'PhD or equivalent experience in ML',
      salary_min: 140000,
      salary_max: 200000,
      employment_type: 'full-time',
      work_location: 'hybrid',
      experience_level: 'senior',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning'],
      status: 'active',
      priority: 'urgent'
    }
  ];

  return handleSupabaseOperation(
    supabase.from('jobs').insert(jobsData).select(),
    'Failed to create jobs:'
  );
}

// Create Candidates
async function createCandidates(userId) {
  const candidatesData = [
    {
      user_id: userId,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0101',
      linkedin_url: 'https://linkedin.com/in/johndoe',
      current_title: 'Senior Developer',
      current_company: 'Previous Tech Co',
      years_experience: 6,
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
      location_city: 'San Francisco',
      location_state: 'CA',
      remote_work_preference: 'hybrid',
      salary_expectation_min: 130000,
      salary_expectation_max: 150000,
      source: 'linkedin',
      status: 'active',
      rating: 5
    },
    {
      user_id: userId,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-0102',
      current_title: 'DevOps Lead',
      current_company: 'Cloud Systems Inc',
      years_experience: 8,
      skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Python'],
      location_city: 'Austin',
      location_state: 'TX',
      remote_work_preference: 'remote-only',
      salary_expectation_min: 120000,
      salary_expectation_max: 140000,
      source: 'referral',
      status: 'active',
      rating: 4
    },
    {
      user_id: userId,
      first_name: 'Michael',
      last_name: 'Johnson',
      email: 'michael.j@email.com',
      phone: '+1-555-0103',
      current_title: 'Full Stack Developer',
      current_company: 'Startup XYZ',
      years_experience: 4,
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      location_city: 'New York',
      location_state: 'NY',
      remote_work_preference: 'flexible',
      salary_expectation_min: 100000,
      salary_expectation_max: 120000,
      source: 'job-board',
      status: 'active',
      rating: 4
    },
    {
      user_id: userId,
      first_name: 'Sarah',
      last_name: 'Williams',
      email: 'sarah.w@email.com',
      phone: '+1-555-0104',
      current_title: 'ML Engineer',
      current_company: 'AI Research Lab',
      years_experience: 5,
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
      location_city: 'Boston',
      location_state: 'MA',
      remote_work_preference: 'hybrid',
      salary_expectation_min: 150000,
      salary_expectation_max: 180000,
      source: 'linkedin',
      status: 'active',
      rating: 5
    },
    {
      user_id: userId,
      first_name: 'Robert',
      last_name: 'Brown',
      email: 'robert.b@email.com',
      phone: '+1-555-0105',
      current_title: 'Financial Analyst',
      current_company: 'Investment Group',
      years_experience: 3,
      skills: ['Excel', 'Financial Modeling', 'SQL', 'Python'],
      location_city: 'New York',
      location_state: 'NY',
      remote_work_preference: 'on-site-only',
      salary_expectation_min: 85000,
      salary_expectation_max: 100000,
      source: 'company-website',
      status: 'active',
      rating: 3
    }
  ];

  return handleSupabaseOperation(
    supabase.from('candidates').insert(candidatesData).select(),
    'Failed to create candidates:'
  );
}

// Create Applications
async function createApplications(userId, candidates, jobs) {
  const applicationsData = [
    {
      user_id: userId,
      candidate_id: candidates[0].id, // John Doe
      job_id: jobs[0].id, // Senior Full Stack Developer
      status: 'interview',
      applied_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      submitted_to_client_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Strong candidate, excellent React skills'
    },
    {
      user_id: userId,
      candidate_id: candidates[1].id, // Jane Smith
      job_id: jobs[1].id, // DevOps Engineer
      status: 'submitted-to-client',
      applied_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_to_client_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Perfect match for DevOps role'
    },
    {
      user_id: userId,
      candidate_id: candidates[2].id, // Michael Johnson
      job_id: jobs[0].id, // Senior Full Stack Developer
      status: 'screened',
      applied_date: new Date().toISOString(),
      notes: 'Good potential, needs assessment'
    },
    {
      user_id: userId,
      candidate_id: candidates[3].id, // Sarah Williams
      job_id: jobs[3].id, // Machine Learning Engineer
      status: 'placed',
      applied_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      submitted_to_client_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      interview_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      placed_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      offered_salary: 175000,
      notes: 'Excellent hire, started last week'
    },
    {
      user_id: userId,
      candidate_id: candidates[4].id, // Robert Brown
      job_id: jobs[2].id, // Financial Analyst
      status: 'associated',
      applied_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Reviewing qualifications'
    }
  ];

  return handleSupabaseOperation(
    supabase.from('applications').insert(applicationsData).select(),
    'Failed to create applications:'
  );
}

// Create Interviews
async function createInterviews(userId, applications) {
  const interviewsData = [];

  // Create interviews for applications in 'interview' status
  const interviewApplication = applications.find(app => app.status === 'interview');
  if (interviewApplication) {
    interviewsData.push({
      user_id: userId,
      application_id: interviewApplication.id,
      interview_type: 'phone-screen',
      scheduled_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 30,
      location: 'Phone',
      interviewer_name: 'HR Manager',
      interviewer_email: 'hr@techcorp.com',
      status: 'completed',
      rating: 4,
      feedback: 'Good communication skills, proceeded to technical interview',
      next_steps: 'Technical interview with team lead'
    });

    interviewsData.push({
      user_id: userId,
      application_id: interviewApplication.id,
      interview_type: 'technical',
      scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      duration_minutes: 60,
      location: 'https://zoom.us/j/123456789',
      interviewer_name: 'Tech Lead',
      interviewer_email: 'techlead@techcorp.com',
      status: 'scheduled',
      notes: 'Focus on system design and React architecture'
    });
  }

  // Create completed interview for placed candidate
  const placedApplication = applications.find(app => app.status === 'placed');
  if (placedApplication) {
    interviewsData.push({
      user_id: userId,
      application_id: placedApplication.id,
      interview_type: 'final',
      scheduled_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 90,
      location: 'On-site',
      interviewer_name: 'CTO',
      interviewer_email: 'cto@startuphub.com',
      status: 'completed',
      rating: 5,
      feedback: 'Exceptional candidate, strong technical skills and culture fit',
      next_steps: 'Offer extended'
    });
  }

  if (interviewsData.length > 0) {
    return handleSupabaseOperation(
      supabase.from('interviews').insert(interviewsData).select(),
      'Failed to create interviews:'
    );
  }
  
  return [];
}

// Create Activities
async function createActivities(userId, companies, candidates, applications) {
  const activitiesData = [
    {
      user_id: userId,
      entity_type: 'company',
      entity_id: companies[0].id,
      activity_type: 'meeting',
      subject: 'Quarterly hiring review',
      description: 'Discussed Q1 hiring needs and budget',
      scheduled_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completed: true
    },
    {
      user_id: userId,
      entity_type: 'candidate',
      entity_id: candidates[0].id,
      activity_type: 'call',
      subject: 'Initial screening call',
      description: 'Discussed background and career goals',
      scheduled_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: true
    },
    {
      user_id: userId,
      entity_type: 'candidate',
      entity_id: candidates[1].id,
      activity_type: 'follow-up',
      subject: 'Check on application status',
      description: 'Follow up on DevOps position interest',
      scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      is_important: true
    },
    {
      user_id: userId,
      entity_type: 'company',
      entity_id: companies[1].id,
      activity_type: 'email',
      subject: 'New job requirements',
      description: 'Received updated requirements for Financial Analyst position',
      completed: true
    },
    {
      user_id: userId,
      entity_type: 'application',
      entity_id: applications[0].id,
      activity_type: 'reference-check',
      subject: 'Reference check for John Doe',
      description: 'Need to contact previous employer',
      scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false
    }
  ];

  return handleSupabaseOperation(
    supabase.from('activities').insert(activitiesData).select(),
    'Failed to create activities:'
  );
}

// Create Company Notes
async function createCompanyNotes(userId, companies) {
  const notesData = [
    {
      user_id: userId,
      company_id: companies[0].id,
      category: 'requirement',
      title: 'Tech stack preferences',
      content: 'Prefers candidates with React 18+ experience. Team uses TypeScript exclusively.',
      is_pinned: true
    },
    {
      user_id: userId,
      company_id: companies[0].id,
      category: 'general',
      title: 'Interview process',
      content: '1. Phone screen (30 min)\n2. Technical interview (1 hour)\n3. Team culture fit (45 min)\n4. Final with CTO',
      is_pinned: true
    },
    {
      user_id: userId,
      company_id: companies[1].id,
      category: 'contract',
      title: 'Contract terms',
      content: 'Standard terms: 20% placement fee, 90-day guarantee, payment net 30'
    },
    {
      user_id: userId,
      company_id: companies[2].id,
      category: 'feedback',
      title: 'Recent placement feedback',
      content: 'Very happy with ML engineer placement. Looking for more senior talent.'
    }
  ];

  return handleSupabaseOperation(
    supabase.from('company_notes').insert(notesData).select(),
    'Failed to create notes:'
  );
}

// Test Database Relationships
export async function testDatabaseRelationships() {
  try {
    console.log('🧪 Testing database relationships...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be signed in to test relationships');
    }

    // Test 1: Can we get jobs with company info?
    const { data: jobsWithCompanies, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        company:companies(name, industry)
      `)
      .limit(5);

    if (jobError) throw jobError;
    console.log('✅ Jobs with companies:', jobsWithCompanies.length);

    // Test 2: Can we get applications with candidate and job info?
    const { data: applicationsWithDetails, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        candidate:candidates(first_name, last_name, email),
        job:jobs(title, company_id)
      `)
      .limit(5);

    if (appError) throw appError;
    console.log('✅ Applications with details:', applicationsWithDetails.length);

    // Test 3: Can we get interviews with full application details?
    const { data: interviewsWithDetails, error: intError } = await supabase
      .from('interviews')
      .select(`
        *,
        application:applications(
          candidate:candidates(first_name, last_name),
          job:jobs(title)
        )
      `)
      .limit(5);

    if (intError) throw intError;
    console.log('✅ Interviews with details:', interviewsWithDetails.length);

    // Test 4: Test the statistics function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_user_statistics', { p_user_id: user.id });

    if (statsError) throw statsError;
    console.log('✅ User statistics:', stats);

    console.log('✅ All relationship tests passed!');

  } catch (error) {
    console.error('❌ Relationship test failed:', error);
    throw error;
  }
}

// Clean up function to remove all test data
export async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test data...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be signed in to cleanup data');
    }

    // Delete in reverse order of dependencies
    await supabase.from('company_notes').delete().eq('user_id', user.id);
    await supabase.from('activities').delete().eq('user_id', user.id);
    await supabase.from('documents').delete().eq('user_id', user.id);
    await supabase.from('interviews').delete().eq('user_id', user.id);
    await supabase.from('applications').delete().eq('user_id', user.id);
    await supabase.from('candidates').delete().eq('user_id', user.id);
    await supabase.from('jobs').delete().eq('user_id', user.id);
    await supabase.from('company_contacts').delete().eq('user_id', user.id);
    await supabase.from('companies').delete().eq('user_id', user.id);

    console.log('✅ Test data cleaned up successfully');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}