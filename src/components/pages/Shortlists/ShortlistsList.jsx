import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { shortlistService } from "../../../services/shortlistService";

const ShortlistsList = () => {
  const navigate = useNavigate();
  const [shortlists, setShortlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedShortlist, setSelectedShortlist] = useState(null);
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    loadShortlists();
  }, []);

  const loadShortlists = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await shortlistService.getAll();
      setShortlists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, shortlist) => {
    setAnchorEl(event.currentTarget);
    setSelectedShortlist(shortlist);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedShortlist(null);
  };

  const handleCreateShortlist = () => {
    navigate("/shortlists/new");
  };

  const handleViewShortlist = (shortlistId) => {
    navigate(`/shortlists/${shortlistId}`);
  };

  const handleEditShortlist = () => {
    if (selectedShortlist) {
      navigate(`/shortlists/${selectedShortlist.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDuplicateShortlist = async () => {
    if (!selectedShortlist) return;

    try {
      const newName = `${selectedShortlist.name} (Copy)`;
      await shortlistService.duplicate(selectedShortlist.id, newName);
      loadShortlists();
      handleMenuClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteShortlist = async () => {
    if (!selectedShortlist) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${selectedShortlist.name}"?`
      )
    ) {
      try {
        await shortlistService.delete(selectedShortlist.id);
        loadShortlists();
        handleMenuClose();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(field);
  };

  const sortedShortlists = [...shortlists].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "candidate_count") {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else if (sortBy === "created_at" || sortBy === "updated_at") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (sortDirection === "asc") {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Shortlists
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your saved candidate groups for quick access and bulk actions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateShortlist}
        >
          Create Shortlist
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <PeopleIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="h4">{shortlists.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Shortlists
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <PersonIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
              <Typography variant="h4">
                {shortlists.reduce(
                  (sum, list) => sum + list.candidate_count,
                  0
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Candidates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <CalendarIcon sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
              <Typography variant="h4">
                {
                  shortlists.filter((list) => {
                    const daysSinceUpdate =
                      (new Date() - new Date(list.updated_at)) /
                      (1000 * 60 * 60 * 24);
                    return daysSinceUpdate <= 7;
                  }).length
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated This Week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Shortlists Table */}
      {shortlists.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <PeopleIcon sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No shortlists yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first shortlist to start organizing candidates
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateShortlist}
          >
            Create Your First Shortlist
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "name"}
                    direction={sortBy === "name" ? sortDirection : "asc"}
                    onClick={() => handleSort("name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortBy === "candidate_count"}
                    direction={
                      sortBy === "candidate_count" ? sortDirection : "asc"
                    }
                    onClick={() => handleSort("candidate_count")}
                  >
                    Candidates
                  </TableSortLabel>
                </TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "created_at"}
                    direction={sortBy === "created_at" ? sortDirection : "asc"}
                    onClick={() => handleSort("created_at")}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "updated_at"}
                    direction={sortBy === "updated_at" ? sortDirection : "asc"}
                    onClick={() => handleSort("updated_at")}
                  >
                    Last Updated
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedShortlists.map((shortlist) => (
                <TableRow
                  key={shortlist.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleViewShortlist(shortlist.id)}
                >
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {shortlist.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {shortlist.description || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={shortlist.candidate_count}
                      size="small"
                      color={
                        shortlist.candidate_count > 0 ? "primary" : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {shortlist.created_by_user?.email || "Unknown"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(shortlist.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(shortlist.updated_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, shortlist);
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
        <MenuItem onClick={handleEditShortlist}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateShortlist}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteShortlist} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ShortlistsList;
