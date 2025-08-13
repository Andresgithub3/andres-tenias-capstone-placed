import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Language as WebsiteIcon,
  LinkedIn as LinkedInIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { companyService } from "../../../services/companyService";
import CompanyOverviewTab from "./CompaniesOverviewTab";
import CompanyJobsTab from "./CompanyJobsTab";
import CompanyDocumentsTab from "./CompanyDocumentsTab";
import CompanyActivityTab from "./CompanyActivityTab";

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    loadCompany();
  }, [id]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await companyService.getById(id);
      setCompany(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/companies/${id}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${company.name}? This action cannot be undone and will also delete all associated contacts and documents.`
    );

    if (confirmed) {
      try {
        await companyService.delete(id);
        navigate("/companies");
      } catch (err) {
        setError(err.message);
      }
    }
    handleMenuClose();
  };

  const handleCompanyChange = () => {
    // Refresh company data when child components make changes
    loadCompany();
  };

  const getLocationString = () => {
    if (!company) return "";
    const parts = [company.city, company.state, company.country].filter(
      Boolean
    );
    return parts.join(", ");
  };

  const getSizeChipColor = (size) => {
    switch (size) {
      case "1-10":
        return "default";
      case "11-50":
        return "primary";
      case "51-200":
        return "secondary";
      case "201-500":
        return "success";
      case "501-1000":
        return "warning";
      case "1000+":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !company) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/companies")}
          sx={{ mt: 2 }}
        >
          Back to Companies
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/companies")}
          sx={{ textDecoration: "none" }}
        >
          Companies
        </Link>
        <Typography variant="body2" color="text.primary">
          {company?.name || "Company Details"}
        </Typography>
      </Breadcrumbs>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Company Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {/* Company Name and Industry */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <BusinessIcon sx={{ fontSize: 32, color: "primary.main" }} />
              <Box>
                <Typography variant="h4" component="h1">
                  {company.name}
                </Typography>
                {company.industry && (
                  <Chip
                    label={company.industry}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Box>

            {/* Company Details Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              {/* Size */}
              {company.size && (
                <Chip
                  label={`${company.size} employees`}
                  color={getSizeChipColor(company.size)}
                  size="small"
                />
              )}

              {/* Location */}
              {getLocationString() && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {getLocationString()}
                  </Typography>
                </Box>
              )}

              {/* Website */}
              {company.website && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <WebsiteIcon fontSize="small" color="action" />
                  <Link
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ textDecoration: "none" }}
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </Link>
                </Box>
              )}

              {/* LinkedIn */}
              {company.linkedin_url && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LinkedInIcon fontSize="small" color="action" />
                  <Link
                    href={company.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ textDecoration: "none" }}
                  >
                    LinkedIn
                  </Link>
                </Box>
              )}
            </Box>

            {/* Description */}
            {company.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, maxWidth: "800px" }}
              >
                {company.description}
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Stats Row */}
        <Box
          sx={{
            display: "flex",
            gap: 4,
            mt: 3,
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="primary">
              {company.contacts?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contacts
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="success.main">
              {company.jobs?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Jobs Posted
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Overview" />
          <Tab label="Jobs" />
          <Tab label="Documents" />
          <Tab label="Activity" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 0 && (
            <CompanyOverviewTab
              company={company}
              onCompanyChange={handleCompanyChange}
            />
          )}
          {currentTab === 1 && (
            <CompanyJobsTab
              company={company}
              onCompanyChange={handleCompanyChange}
            />
          )}
          {currentTab === 2 && (
            <CompanyDocumentsTab
              company={company}
              onCompanyChange={handleCompanyChange}
            />
          )}
          {currentTab === 3 && (
            <CompanyActivityTab
              company={company}
              onCompanyChange={handleCompanyChange}
            />
          )}
        </Box>
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Company
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Company
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CompanyDetail;
