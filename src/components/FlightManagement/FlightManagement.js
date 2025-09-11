import React, { useState, useEffect } from "react";
import {
  DataTable,
  Modal,
  Form,
  StatusBadge,
  ConfirmationModal,
} from "../Shared";
import apiClient from "../../services/api";
import "./FlightManagement.css";

const FlightManagement = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    zone: "",
    aircraft: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  // Flight form fields configuration
  const flightFormFields = [
    {
      name: "flightNumber",
      label: "Numéro de Vol",
      type: "text",
      required: true,
      placeholder: "Ex: TU123",
    },
    {
      name: "flightDate",
      label: "Date de Vol",
      type: "date",
      required: true,
    },
    {
      name: "departureTime",
      label: "Heure de Départ",
      type: "time",
      required: true,
    },
    {
      name: "arrivalTime",
      label: "Heure d'Arrivée",
      type: "time",
      required: true,
    },
    {
      name: "aircraft",
      label: "Type d'Avion",
      type: "select",
      required: true,
      options: [
        { value: "A320", label: "Airbus A320" },
        { value: "A330", label: "Airbus A330" },
        { value: "B737", label: "Boeing 737" },
        { value: "ATR72", label: "ATR 72" },
      ],
    },
    {
      name: "origin",
      label: "Origine",
      type: "text",
      required: true,
      placeholder: "Ex: Tunis",
    },
    {
      name: "destination",
      label: "Destination",
      type: "text",
      required: true,
      placeholder: "Ex: Paris",
    },
    {
      name: "zone",
      label: "Zone",
      type: "select",
      required: true,
      options: [
        { value: "Domestique", label: "Domestique" },
        { value: "Maghreb", label: "Maghreb" },
        { value: "Europe", label: "Europe" },
        { value: "Afrique", label: "Afrique" },
        { value: "Moyen-Orient", label: "Moyen-Orient" },
      ],
    },
    {
      name: "estimatedPassengers",
      label: "Passagers Estimés",
      type: "number",
      required: true,
      min: 1,
      max: 500,
    },
    {
      name: "actualPassengers",
      label: "Passagers Réels",
      type: "number",
      min: 0,
      max: 500,
    },
    {
      name: "season",
      label: "Saison",
      type: "select",
      required: true,
      options: [
        { value: "Hiver", label: "Hiver" },
        { value: "Été", label: "Été" },
      ],
    },
  ];

  // Form validation schema
  const validationSchema = {
    flightNumber: {
      required: true,
      pattern: "^[A-Z]{2}[0-9]{1,4}$",
      patternMessage: "Format invalide (ex: TU123)",
    },
    flightDate: { required: true },
    departureTime: { required: true },
    arrivalTime: { required: true },
    aircraft: { required: true },
    origin: { required: true, minLength: 2 },
    destination: { required: true, minLength: 2 },
    zone: { required: true },
    estimatedPassengers: { required: true },
    season: { required: true },
  };

  // Table columns configuration
  const columns = [
    {
      key: "flightNumber",
      title: "Vol",
      sortable: true,
      render: (value, row) => (
        <div className="flight-number">
          <strong>{value}</strong>
          <small className="flight-route">
            {row.origin} → {row.destination}
          </small>
        </div>
      ),
    },
    {
      key: "flightDate",
      title: "Date",
      type: "date",
      sortable: true,
    },
    {
      key: "departureTime",
      title: "Départ",
      render: (value) => value?.slice(0, 5),
    },
    {
      key: "arrivalTime",
      title: "Arrivée",
      render: (value) => value?.slice(0, 5),
    },
    {
      key: "aircraft",
      title: "Avion",
      sortable: true,
    },
    {
      key: "zone",
      title: "Zone",
      sortable: true,
      render: (value) => (
        <StatusBadge status={value} type="info" size="small" />
      ),
    },
    {
      key: "estimatedPassengers",
      title: "Passagers",
      align: "center",
      render: (value, row) => (
        <div className="passenger-info">
          <div>Est: {value}</div>
          {row.actualPassengers !== null && (
            <div className="actual-passengers">
              Réel: {row.actualPassengers}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "season",
      title: "Saison",
      render: (value) => (
        <StatusBadge
          status={value}
          type={value === "Été" ? "warning" : "info"}
          size="small"
        />
      ),
    },
  ];

  // Load flights
  const loadFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading flights with filters:", filters);
      const response = await apiClient.getVols(filters);
      console.log("API response:", response);

      // Handle different response structures
      let flightsData = [];
      if (response && response.data) {
        flightsData = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
      } else if (Array.isArray(response)) {
        flightsData = response;
      }

      console.log("Setting flights data:", flightsData);
      setFlights(flightsData);
    } catch (err) {
      console.error("Error loading flights:", err);
      setError(err.message || "Erreur lors du chargement des vols");

      // Only use mock data if server is completely unreachable
      if (err.status === 0 || err.message?.includes("contacter le serveur")) {
        console.warn("Server unreachable, using empty flight list");
        setFlights([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load flights on component mount and filter changes
  useEffect(() => {
    loadFlights();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle create/edit flight
  const handleSaveFlight = async (flightData) => {
    try {
      // Calculate duration if departure and arrival times are provided
      const processedData = { ...flightData };

      // Ensure all required fields are present and properly formatted
      if (
        !processedData.flightNumber ||
        !processedData.flightDate ||
        !processedData.departureTime ||
        !processedData.arrivalTime ||
        !processedData.aircraft ||
        !processedData.origin ||
        !processedData.destination ||
        !processedData.zone ||
        !processedData.season
      ) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      // Format time fields to ensure they have seconds
      if (
        processedData.departureTime &&
        !processedData.departureTime.includes(":00", 5)
      ) {
        processedData.departureTime = processedData.departureTime + ":00";
      }
      if (
        processedData.arrivalTime &&
        !processedData.arrivalTime.includes(":00", 5)
      ) {
        processedData.arrivalTime = processedData.arrivalTime + ":00";
      }

      // Calculate duration
      if (processedData.departureTime && processedData.arrivalTime) {
        const departure = new Date(`2000-01-01T${processedData.departureTime}`);
        const arrival = new Date(`2000-01-01T${processedData.arrivalTime}`);

        // Handle overnight flights
        if (arrival < departure) {
          arrival.setDate(arrival.getDate() + 1);
        }

        const durationMs = arrival.getTime() - departure.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );

        processedData.duration = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:00`;
      }

      // Ensure numeric fields are properly converted
      if (processedData.estimatedPassengers) {
        processedData.estimatedPassengers = parseInt(
          processedData.estimatedPassengers,
          10
        );
      }
      if (
        processedData.actualPassengers &&
        processedData.actualPassengers !== ""
      ) {
        processedData.actualPassengers = parseInt(
          processedData.actualPassengers,
          10
        );
      } else {
        // Set to null if empty
        processedData.actualPassengers = null;
      }

      // Ensure flightDate is in correct format (YYYY-MM-DD)
      if (processedData.flightDate) {
        const date = new Date(processedData.flightDate);
        processedData.flightDate = date.toISOString().split("T")[0];
      }

      // Capitalize first letter of origin and destination
      if (processedData.origin) {
        processedData.origin =
          processedData.origin.charAt(0).toUpperCase() +
          processedData.origin.slice(1).toLowerCase();
      }
      if (processedData.destination) {
        processedData.destination =
          processedData.destination.charAt(0).toUpperCase() +
          processedData.destination.slice(1).toLowerCase();
      }

      console.log("Processed flight data:", processedData);

      let result;
      if (editingFlight) {
        result = await apiClient.updateVol(editingFlight.id, processedData);
        console.log("Flight updated successfully:", result);
      } else {
        result = await apiClient.createVol(processedData);
        console.log("Flight created successfully:", result);
      }

      setShowModal(false);
      setEditingFlight(null);

      // Force refresh the flights list
      console.log("Refreshing flights list...");
      await loadFlights();
    } catch (err) {
      console.error("Error saving flight:", err);

      // Provide more detailed error message
      let errorMessage = "Erreur lors de l'enregistrement du vol";

      if (err.errors) {
        const errorDetails = [];
        Object.keys(err.errors).forEach((field) => {
          if (Array.isArray(err.errors[field])) {
            errorDetails.push(`${field}: ${err.errors[field].join(", ")}`);
          } else {
            errorDetails.push(`${field}: ${err.errors[field]}`);
          }
        });
        errorMessage += ": " + errorDetails.join("; ");
      } else if (err.message) {
        errorMessage = err.message;
      }

      throw new Error(errorMessage);
    }
  };

  // Handle delete flight
  const handleDeleteFlight = async () => {
    try {
      await apiClient.deleteVol(flightToDelete.id);
      setShowDeleteModal(false);
      setFlightToDelete(null);
      await loadFlights();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression du vol");
    }
  };

  // Handle edit click
  const handleEdit = (flight) => {
    setEditingFlight(flight);
    setShowModal(true);
  };

  // Handle delete click
  const handleDelete = (flight) => {
    setFlightToDelete(flight);
    setShowDeleteModal(true);
  };

  // Handle view flight details
  const handleView = (flight) => {
    // Navigate to flight details page or show details modal
    console.log("View flight:", flight);
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      zone: "",
      aircraft: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Table actions
  const tableActions = [
    {
      label: "Nouveau Vol",
      icon: "✈️",
      onClick: () => {
        setEditingFlight(null);
        setShowModal(true);
      },
      className: "btn-primary",
    },
    {
      label: "Actualiser",
      icon: "🔄",
      onClick: loadFlights,
      className: "btn-secondary",
    },
  ];

  if (error) {
    return (
      <div className="flight-management error-state">
        <div className="error-message">
          <h3>❌ Erreur</h3>
          <p>{error}</p>
          <button onClick={loadFlights} className="btn btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-management">
      <div className="page-header">
        <div className="header-content">
          <h1>🛫 Gestion des Vols</h1>
          <p>Gestion complète des vols programmés et de leurs informations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Numéro de vol, origine, destination..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Zone</label>
            <select
              value={filters.zone}
              onChange={(e) => handleFilterChange("zone", e.target.value)}
              className="form-control"
            >
              <option value="">Toutes les zones</option>
              <option value="Domestique">Domestique</option>
              <option value="Maghreb">Maghreb</option>
              <option value="Europe">Europe</option>
              <option value="Afrique">Afrique</option>
              <option value="Moyen-Orient">Moyen-Orient</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Avion</label>
            <select
              value={filters.aircraft}
              onChange={(e) => handleFilterChange("aircraft", e.target.value)}
              className="form-control"
            >
              <option value="">Tous les avions</option>
              <option value="A320">Airbus A320</option>
              <option value="A330">Airbus A330</option>
              <option value="B737">Boeing 737</option>
              <option value="ATR72">ATR 72</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Date de début</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-group">
            <label>Date de fin</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="form-control"
            />
          </div>
          <div className="filter-actions">
            <button onClick={resetFilters} className="btn btn-secondary btn-sm">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={flights}
        columns={columns}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actions={tableActions}
        emptyMessage="Aucun vol trouvé"
        className="flights-table"
      />

      {/* Flight Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFlight(null);
        }}
        title={editingFlight ? "Modifier le Vol" : "Nouveau Vol"}
        size="large"
      >
        <Form
          fields={flightFormFields}
          initialValues={editingFlight || {}}
          validationSchema={validationSchema}
          onSubmit={handleSaveFlight}
          onCancel={() => {
            setShowModal(false);
            setEditingFlight(null);
          }}
          submitText={editingFlight ? "Mettre à jour" : "Créer"}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteFlight}
        title="Supprimer le Vol"
        message={
          flightToDelete
            ? `Êtes-vous sûr de vouloir supprimer le vol ${flightToDelete.flightNumber} ?`
            : ""
        }
        confirmText="Supprimer"
        type="danger"
      />
    </div>
  );
};

export default FlightManagement;
