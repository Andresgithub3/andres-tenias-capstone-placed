import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { interviewService } from '../../services/interviewService';
import { applicationService } from '../../services/applicationService';

const ScheduleInterviewDialog = ({ 
  open, 
  onClose, 
  candidateId = null, 
  jobId = null,
  onInterviewScheduled 
}) => {
  const [loading, setLoading] = useState(false);
  const [eligibleApplications, setEligibleApplications] = useState([]);
  const [companyContacts, setCompanyContacts] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [error, setError] = useState('');

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      application_id: '',
      interview_type: 'virtual',
      scheduled_date: new Date(),
      duration_minutes: 60,
      location: '',
      interviewer_name: '',
      notes: ''
    }
  });

  const watchedApplicationId = watch('application_id');

  // Load eligible applications when dialog opens
  useEffect(() => {
    if (open) {
      loadEligibleApplications();
    }
  }, [open, candidateId, jobId]);

  // Load company contacts when application is selected
  useEffect(() => {
    if (watchedApplicationId && selectedApplication) {
      loadCompanyContacts(selectedApplication.job.id);
    }
  }, [watchedApplicationId, selectedApplication]);

  const loadEligibleApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const applications = await interviewService.getEligibleApplications(candidateId, jobId);
      
      if (applications.length === 0) {
        setError('Candidate must be submitted to client before scheduling interviews');
        return;
      }
      
      setEligibleApplications(applications);
      
      // If only one application, auto-select it
      if (applications.length === 1) {
        setSelectedApplication(applications[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyContacts = async (jobId) => {
    try {
      const contacts = await interviewService.getCompanyContacts(jobId);
      setCompanyContacts(contacts);
    } catch (err) {
      console.error('Failed to load company contacts:', err);
      setCompanyContacts([]);
    }
  };

  const handleApplicationChange = (applicationId) => {
    const application = eligibleApplications.find(app => app.id === applicationId);
    setSelectedApplication(application);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const interviewData = {
        ...data,
        scheduled_date: data.scheduled_date.toISOString(),
      };

      const result = await interviewService.scheduleInterview(interviewData);
      
      if (onInterviewScheduled) {
        onInterviewScheduled(result);
      }
      
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedApplication(null);
    setCompanyContacts([]);
    setError('');
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Interview</DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && eligibleApplications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" sx={{ mt: 1 }}>
              {/* Application Selection */}
              <Controller
                name="application_id"
                control={control}
                rules={{ required: 'Please select an application' }}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal" error={!!errors.application_id}>
                    <InputLabel>Select Application</InputLabel>
                    <Select
                      {...field}
                      label="Select Application"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        handleApplicationChange(e.target.value);
                      }}
                    >
                      {eligibleApplications.map((app) => (
                        <MenuItem key={app.id} value={app.id}>
                          {app.candidate.first_name} {app.candidate.last_name} - {app.job.title} 
                          ({app.job.company.name})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              {/* Interview Type */}
              <Controller
                name="interview_type"
                control={control}
                rules={{ required: 'Interview type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal" error={!!errors.interview_type}>
                    <InputLabel>Interview Type</InputLabel>
                    <Select {...field} label="Interview Type">
                      <MenuItem value="virtual">Virtual</MenuItem>
                      <MenuItem value="in-person">In-Person</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              {/* Date and Time */}
              <Controller
                name="scheduled_date"
                control={control}
                rules={{ required: 'Date and time are required' }}
                render={({ field }) => (
                  <DateTimePicker
                    label="Interview Date & Time"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        error={!!errors.scheduled_date}
                        helperText={errors.scheduled_date?.message}
                      />
                    )}
                  />
                )}
              />

              {/* Duration */}
              <Controller
                name="duration_minutes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="Duration (minutes)"
                    type="number"
                    InputProps={{ inputProps: { min: 15, step: 15 } }}
                  />
                )}
              />

              {/* Location */}
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="Location / Meeting Details"
                    placeholder="e.g., Office address or Zoom link"
                  />
                )}
              />

              {/* Interviewer Selection */}
              {companyContacts.length > 0 && (
                <Controller
                  name="interviewer_name"
                  control={control}
                  rules={{ required: 'Please select at least one interviewer' }}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      options={companyContacts}
                      getOptionLabel={(contact) => `${contact.first_name} ${contact.last_name}`}
                      value={field.value ? 
                        field.value.split(', ').map(name => 
                          companyContacts.find(c => `${c.first_name} ${c.last_name}` === name)
                        ).filter(Boolean) : []
                      }
                      onChange={(_, newValue) => {
                        const names = newValue.map(contact => `${contact.first_name} ${contact.last_name}`);
                        field.onChange(names.join(', '));
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={`${option.first_name} ${option.last_name}`}
                            {...getTagProps({ index })}
                            key={option.id}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          margin="normal"
                          label="Interviewers"
                          placeholder="Select company contacts"
                          error={!!errors.interviewer_name}
                          helperText={errors.interviewer_name?.message}
                        />
                      )}
                    />
                  )}
                />
              )}

              {/* Manual Interviewer Input (fallback) */}
              {companyContacts.length === 0 && (
                <Controller
                  name="interviewer_name"
                  control={control}
                  rules={{ required: 'Interviewer name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      margin="normal"
                      label="Interviewer Name"
                      placeholder="Enter interviewer name(s)"
                      error={!!errors.interviewer_name}
                      helperText={errors.interviewer_name?.message}
                    />
                  )}
                />
              )}

              {/* Notes */}
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="Notes"
                    multiline
                    rows={3}
                    placeholder="Additional notes about the interview"
                  />
                )}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={loading || eligibleApplications.length === 0}
          >
            {loading ? <CircularProgress size={20} /> : 'Schedule Interview'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ScheduleInterviewDialog;