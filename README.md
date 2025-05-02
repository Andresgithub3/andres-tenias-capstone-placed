# Placed: Technical Recruiting Intelligence Platform

## Overview

Placed is a focused platform that helps technical recruiters evaluate candidates more effectively through an intuitive interface. The application combines skill assessment tools, technical interview preparation, and basic analytics to streamline the technical recruiting process.

### Problem Space

Technical recruiters face numerous challenges in today's competitive market: accurately assessing technical skills they may not personally possess, efficiently managing candidate pipelines, and making informed hiring decisions. Current solutions are fragmented, requiring recruiters to use multiple tools for different aspects of their workflow, which creates inefficiencies and data silos. Placed addresses these pain points by providing an integrated platform that combines candidate evaluation tools with effective assessment management for more streamlined recruiting.

### User Profile

The primary users of Placed will be technical recruiters and hiring managers who need to:
- Evaluate technical candidates efficiently and accurately
- Plan recruiting strategies based on market trends and company needs
- Track candidate interactions and recruitment performance
- Improve their understanding of technical roles and requirements

Users will access the application throughout their workday, primarily from desktop computers in an office environment with occasional mobile use when on the go. The application will be built as a responsive web app with a mobile-first approach.

**Recruiter Users:** Will have access to all system features, including candidate management, assessment creation, analytics, and predictions.

**Hiring Manager Users:** Will have a simplified view focused on reviewing matched candidates for their specific requirements. They will see comprehensive candidate profiles that include candidate name, credentials, assessment results, and other relevant information that clearly demonstrates why a candidate matches their requirements.

### Features

1. **User Authentication and Profile Management**
   - Secure login with OAuth integration (Google, LinkedIn)
   - Role-based access control (recruiters, hiring managers, admins)
   - Customizable user profiles with technical specialization areas

2. **Skill Assessment Builder**
   - Create custom assessment templates based on technical roles
   - Question bank organized by technology, difficulty, and question type
   - Option to share assessments with candidates through secure links

3. **Candidate Database**
   - CRUD operations for managing candidate profiles
   - Advanced filtering and search capabilities
   - Skills tagging and verification system
   - Notes and interaction history tracking

4. **Interview Preparation Tool**
   - Question generator based on job requirements and candidate profile
   - Interview structure templates
   - Collaborative interview feedback collection

5. **Analytics Dashboard**
   - Recruiting performance metrics (time-to-fill, conversion rates, source efficiency)
   - Interactive data visualizations
   - Custom report generation

6. **Talent Pipeline Predictor**
   - Historical data analysis to forecast hiring needs
   - Skills gap identification based on company growth plans
   - Market trends visualization for technical roles
   - Customizable alerts for emerging skill demands

7. **Knowledge Base**
   - Technical role descriptions and common requirements
   - Technology relationship mapping
   - Learning resources for recruiters to understand technical concepts

## Implementation

### Tech Stack

**Frontend:**
- React for UI components and rendering
- Vite for fast development and bundling
- React Router for client-side routing
- React Hook Form for form handling and validation
- Tailwind CSS for responsive, mobile-first design and custom component development
- Chart.js for data visualization (simpler learning curve than D3.js)
- React Context API and hooks for state management (useState, useEffect, useContext)

**Backend:**
- Node.js as the runtime environment
- Express.js for API routing and middleware
- Knex.js for database query building and migrations
- MySQL for relational database storage
- JWT for authentication and session management
- Bcrypt for password hashing
- Jest for testing

**Development Tools:**
- Git for version control
- ESLint and Prettier for code quality
- Jest and React Testing Library for end-to-end testing
- Docker for containerization (optional, for future deployment)
- GitHub Actions for CI/CD (optional, for future deployment)

### APIs

1. **External APIs (Mocked for MVP):**
   - Mock LinkedIn API for profile integration and OAuth
   - Mock Google OAuth for authentication
   - Simulated job market data for trend analysis
   - Mock GitHub API for technical role insights (optional)

2. **Internal API Endpoints:**
   - User authentication and management endpoints
   - Candidate profile CRUD endpoints
   - Assessment creation and management endpoints
   - Analytics data endpoints
   - Prediction and trend analysis endpoints

### Sitemap

1. **Authentication Pages**
   - Login / Registration
   - Password Reset

2. **Dashboard**
   - Overview with key metrics and recent activity
   - Quick access to main features

3. **Candidate Management**
   - Candidate List/Search
   - Candidate Profile View
   - Add/Edit Candidate Form

4. **Assessment Tools**
   - Assessment List
   - Create/Edit Assessment

5. **Interview Preparation**
   - Question Generator
   - Interview Guides
   - Feedback Collection

6. **Analytics**
   - Performance Metrics
   - Pipeline Visualization
   - Basic Reports

7. **Settings**
   - User Profile
   - Application Settings
   - Team Management (for admin users)

8. **Knowledge Base**
   - Technical Role Library
   - Technology Relationship Maps
   - Learning Resources

### Mockups

[Note: I have also included a pdf with various mockups. These could change slightly as the project develops.]

1. Dashboard View (Desktop)
2. Candidate Profile Page
3. Assessment Builder Interface
4. Forms used (Add Candidates, Add Interview, Add Job)
5. Hiring Manager Dashboard View 

### Data

**Core Data Entities and Relationships:**

1. **Users**
   - user_id (PK)
   - name
   - email
   - password_hash
   - role
   - created_at
   - updated_at

2. **Candidates**
   - candidate_id (PK)
   - first_name
   - last_name
   - email
   - phone
   - current_role
   - years_experience
   - created_at
   - updated_at
   - created_by (FK to Users)

3. **Skills**
   - skill_id (PK)
   - name
   - category
   - description

4. **CandidateSkills** (Junction table)
   - candidate_skill_id (PK)
   - candidate_id (FK to Candidates)
   - skill_id (FK to Skills)
   - proficiency_level
   - verified (boolean)
   - verification_method

5. **Assessments**
   - assessment_id (PK)
   - title
   - description
   - created_by (FK to Users)
   - created_at
   - updated_at

6. **Questions**
   - question_id (PK)
   - assessment_id (FK to Assessments)
   - question_text
   - question_type
   - difficulty_level
   - skill_id (FK to Skills)

7. **Interactions**
   - interaction_id (PK)
   - candidate_id (FK to Candidates)
   - user_id (FK to Users)
   - interaction_type
   - notes
   - date
   - interaction_date

8. **JobRequirements**
   - job_requirement_id (PK)
   - title
   - client
   - required_skills (JSON or relationship to Skills)
   - created_date
   - user_id (FK)
      - Name (if Manager) 
   
### Endpoints

**Authentication Endpoints:**

1. `POST /api/auth/register`
   - Parameters: `{ name, email, password, role }`
   - Response: `{ user_id, name, email, role, token }`

2. `POST /api/auth/login`
   - Parameters: `{ email, password }`
   - Response: `{ user_id, name, email, role, token }`

3. `POST /api/auth/logout`
   - Parameters: None (uses JWT from headers)
   - Response: `{ success: true }`

**Candidate Endpoints:**

1. `GET /api/candidates`
   - Parameters: Optional filters `{ skill_ids, experience_level, search_term }`
   - Response: Array of candidate objects

2. `GET /api/candidates/:id`
   - Parameters: candidate_id in URL
   - Response: Detailed candidate object with skills and interactions

3. `POST /api/candidates`
   - Parameters: Candidate object
   - Response: Created candidate object

4. `PUT /api/candidates/:id`
   - Parameters: candidate_id in URL, updated candidate data
   - Response: Updated candidate object

5. `DELETE /api/candidates/:id`
   - Parameters: candidate_id in URL
   - Response: `{ success: true }`

**Assessment Endpoints:**

1. `GET /api/assessments`
   - Parameters: Optional filters
   - Response: Array of assessment objects

2. `POST /api/assessments`
   - Parameters: Assessment object with questions
   - Response: Created assessment object

3. `GET /api/assessments/:id/questions`
   - Parameters: assessment_id in URL
   - Response: Array of questions for the assessment

**Analytics Endpoints:**

1. `GET /api/analytics/performance`
   - Parameters: Date range
   - Response: Basic performance metrics object

2. `GET /api/analytics/pipeline`
   - Parameters: Optional filters
   - Response: Pipeline status data

## Roadmap

### Week 1 (25 hours)
- Project setup and initial configuration (3 hours)
  - Initialize Git repository
  - Set up React with Vite
  - Configure Express backend
  - Set up MySQL database and Knex
- Authentication system implementation (10 hours)
  - User registration and login functionality
  - JWT implementation
  - Protected routes setup
- Database design and initial migrations (7 hours)
  - Create database schema
  - Set up migrations for core tables
  - Seed with initial test data
- Basic UI components and layout (5 hours)
  - Navigation structure
  - Responsive layout foundation
  - Theme and style setup

### Week 2 (25 hours)
- Candidate management module (10 hours)
  - Candidate listing and filtering
  - Candidate detail view
  - Add/edit candidate form
- Skills system implementation (8 hours)
  - Skills database structure
  - Skill tagging functionality
  - Skill verification system
- Assessment builder foundations (7 hours)
  - Assessment templates
  - Question management
  - Basic assessment creation flow

### Week 3 (25 hours)
- Interview preparation tools (10 hours)
  - Question generator implementation
  - Interview guide templates
  - Feedback collection system
- Analytics dashboard implementation (15 hours)
  - Data aggregation logic
  - Chart.js implementation for key visualizations:
    - Candidates screened/interviewed/hired metrics
    - Pipeline status visualization
  - Basic reporting functionality
  - Performance metrics calculations

### Week 4 (25 hours)
- Knowledge base implementation (5 hours)
  - Technical role library
  - Technology relationship mapping
  - Learning resources section
- Integration of all components (5 hours)
  - Connect frontend and backend systems
  - Ensure data flow between modules
- Different user role views implementation (5 hours)
  - Recruiter comprehensive view
  - Hiring manager candidate match view
- End-to-end testing implementation (6 hours)
  - Jest and React Testing Library setup
  - Critical user flow testing
  - Bug identification and resolution
- Documentation and final polish (4 hours)
  - Code documentation
  - User guide
  - Final UI adjustments and polish

---

## Future Implementations

- **Predictive Analytics**: Add trend analysis, hiring forecasts, and skills gap prediction.
- **AI-Powered Recommendations**: Implement machine learning to provide intelligent candidate suggestions based on job requirements.
- **Candidate Portal**: Create a separate interface for candidates to submit information, take assessments, and track their application status.
- **Calendar Integration**: Add Google Calendar and Outlook integration for scheduling interviews and follow-ups.
- **Communication Module**: Implement templated email and messaging functionality directly within the platform.
- **Advanced Analytics**: Develop more sophisticated data analysis and reporting tools.
- **Mobile Application**: Develop a dedicated mobile app for on-the-go recruiting activities.
- **Integration Ecosystem**: Build connectors for popular ATS systems, LinkedIn Recruiter, and other recruiting tools.
- **Collaborative Hiring**: Implement team-based workflows for collaborative hiring decisions.
