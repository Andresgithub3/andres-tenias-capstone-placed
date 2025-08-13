import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { companyService } from "../../../services/companyService";

const CompaniesList = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async (search = "") => {
    try {
      setLoading(true);
      const data = await companyService.getAll(search);
      setCompanies(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadCompanies(searchTerm);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleMenuOpen = (event, company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompany(null);
  };

  const handleView = () => {
    navigate(`/companies/${selectedCompany.id}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/companies/${selectedCompany.id}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCompany.name}? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await companyService.delete(selectedCompany.id);
        await loadCompanies(searchTerm); // Refresh list
        setError("");
      } catch (err) {
        setError(err.message);
      }
    }
    handleMenuClose();
  };

  const getLocationString = (company) => {
    const parts = [company.city, company.state, company.country].filter(
      Boolean
    );
    return parts.join(", ") || "No location";
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Companies</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/companies/new")}
        >
          Add Company
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search companies by name, location, or industry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={handleSearch} variant="outlined" size="small">
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Companies Table */}
      {companies.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <BusinessIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No companies found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm
              ? "Try adjusting your search terms or create a new company."
              : "Get started by adding your first company."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/companies/new")}
          >
            Add First Company
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="center">Contacts</TableCell>
                <TableCell align="center">Active Jobs</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => (
                <TableRow
                  key={company.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/companies/${company.id}`)}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {company.name}
                      </Typography>
                      {company.website && (
                        <Typography variant="caption" color="text.secondary">
                          {company.website.replace(/^https?:\/\//, "")}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {company.industry ? (
                      <Chip
                        label={company.industry}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not specified
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.size ? (
                      <Chip
                        label={company.size}
                        size="small"
                        color={getSizeChipColor(company.size)}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unknown
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getLocationString(company)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={company.contact_count}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={company.job_count}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(company.created_at), "MMM d, yyyy")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, company);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
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

export default CompaniesList;
