import React, { useState, useEffect, useMemo } from "react";
import {
  IconButton,
  Box,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import { Edit,  Add } from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import { Building } from "../types/interface/Building";
import Preloader from "../components/UI/Preloader";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { actions, buildingsSelectors } from "../store/building/slice";
import HeaderBar from "../components/UI/HeaderBar";
import FilterBar from "../components/UI/FilterBar";
import Table from "../components/UI/Table";
import { t } from "i18next";
import { EntityModal, FieldConfig } from "../components/UI/Modal";
import { useForm } from "react-hook-form";
import CustomDelete from "../components/UI/Delete";

const ListBuildings: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { total, loading } = useSelector(
    (state: RootState) => state.buildings
  );
  const buildings = useSelector(buildingsSelectors.selectAll);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const [editBuilding, setEditBuilding] = useState<Building | null>(null);
  const [openNewBuildingModal, setOpenNewBuildingModal] = useState(false);
  const [orderBy, setOrderBy] = useState<string>("name");

  const [intendedModalAction, setIntendedModalAction] = useState<
    "create" | "edit" | null
  >(null);

  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    searchQuery: string;
    address?: string;
    numberOfFloors?: number;
  }>({
    page: 0,
    limit: 5,
    searchQuery: "",
    address: "",
    numberOfFloors: undefined,
  });

  const [newBuilding, setNewBuilding] = useState<Omit<Building, "id">>({
    name: "",
    address: "",
    numberOfFloors: undefined,
    city: "",
    country: "",
    constructionYear: undefined,
    owner: "",
  });

  const {
    formState: { errors },
  } = useForm<Building | Omit<Building, "id">>({
    mode: "onChange",
  });

  useEffect(() => {
    dispatch(
      actions.fetchBuildingsRequest({
        page: filters.page + 1,
        limit: filters.limit,
        search: "",
        address: "",
        numberOfFloors: undefined,
        pageSize: rowsPerPage,
        authToken: auth.accessToken,
      })
    );
  }, [page, rowsPerPage, dispatch,auth.accessToken,filters.limit,filters.page]);

  const handleOpenEditModal = (building: Building) => {
    setEditBuilding(building);
    setIntendedModalAction("edit");
    setOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>
  ) => {
    if (editBuilding) {
      setEditBuilding({ ...editBuilding, [e.target.name]: e.target.value });
    }
  };

  const handleOpenNewBuildingModal = () => {
    setOpenNewBuildingModal(true);
    setIntendedModalAction("create");
  };
  const handleCloseModal = () => {
    setOpen(false);
    setOpenNewBuildingModal(false);
    setTimeout(() => {
      setIntendedModalAction(null);
      setEditBuilding(null);
    }, 300);
  };

  const handleNewBuildingChange = (
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>
  ) => {
    setNewBuilding({ ...newBuilding, [e.target.name]: e.target.value });
  };

  const handleUpdateBuilding = (data: Building) => {
    if (editBuilding) {
      dispatch(
        actions.updateBuildingRequest({
          building: data,
          authToken: auth.accessToken,
        })
      );
      handleCloseModal();
    }
  };

  const handleCreateBuilding = (data: Omit<Building, "id">) => {
    dispatch(
      actions.createBuildingRequest({
        building: data,
        authToken: auth.accessToken,
      })
    );
    handleCloseModal();
  };

  const filtersConfig = [
    {
      key: "address",
      label: t("address"),
      type: "text" as const,
      placeholder: "Filter by address",
    },
    {
      key: "number Of Floors",
      label: t("number Of Floors"),
      type: "number" as const,
      min: 0,
      max: 100,
      placeholder: "Filter by floors",
    },
  ];

  const handleSearch = () => {
    if (auth.accessToken) {
      setPage(0);
      setFilters({ ...filters, page: 0 });
      dispatch(
        actions.fetchBuildingsRequest({
          page: 1,
          limit: filters.limit,
          search: filters.searchQuery,
          address: filters.address,
          numberOfFloors: filters.numberOfFloors,
          pageSize: rowsPerPage,
          authToken: auth.accessToken,
        })
      );
    }
  };

  const handleReset = () => {
    setFilters({
      page: 0,
      limit: 5,
      searchQuery: "",
      address: "",
      numberOfFloors: undefined,
    });
    setPage(0);
    dispatch(
      actions.fetchBuildingsRequest({
        page: 1,
        limit: 5,
        search: "",
        address: "",
        numberOfFloors: undefined,
        pageSize: rowsPerPage,
        authToken: auth.accessToken,
      })
    );
  };

  const columns = useMemo(
    () => [
      {
        id: "name",
        label: "Name",
        render: (building: Building) => `${building.name}`,
        sortable: true,
      },
      {
        id: "address",
        label: "Address",
        render: (building: Building) => building.address,
      },
      {
        id: "Number Of Floors",
        label: "Number Of Floors",
        render: (building: Building) => building.numberOfFloors,
      },
      {
        id: "ity",
        label: "City",
        render: (building: Building) => `${building.city}`,
        sortable: true,
      },
      {
        id: "country",
        label: "Country",
        render: (building: Building) => building.country,
      },
      {
        id: "construction Year",
        label: "Construction Year",
        render: (building: Building) => building.constructionYear,
      },
      {
        id: "owner",
        label: "Owner",
        render: (building: Building) => building.owner,
      },
    ],
    []
  );

  const filteredBuildings = useMemo(() => {
    return buildings.filter(
      (building): building is Building => !building.isDeleted
    );
  }, [buildings, orderDirection, page, rowsPerPage, total,orderDirection,page,rowsPerPage,total]);
  const handlePageChange = (newPage: number) => {
    const maxPage = Math.ceil(total / rowsPerPage) - 1;
    const validPage = Math.max(0, Math.min(newPage, maxPage));
    setPage(validPage);
    setFilters({ ...filters, page: validPage });
  };
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setFilters({ ...filters, page: 0, limit: newRowsPerPage });
    if (auth.accessToken) {
      dispatch(
        actions.fetchBuildingsRequest({
          page: 1,
          limit: 5,
          search: "",
          address: "",
          numberOfFloors: undefined,
          pageSize: rowsPerPage,
          authToken: auth.accessToken,
        })
      );
    }
  };

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const buildingFields: FieldConfig[] = [
    {
      label: t("Name"),
      name: "name",
      type: "text",
      value: openNewBuildingModal ? newBuilding.name : editBuilding?.name || "",
      required: true,
    },
    {
      label: t("Address"),
      name: "address",
      type: "text",
      value: openNewBuildingModal
        ? newBuilding.address
        : editBuilding?.address || "",
      required: true,
    },
    {
      label: t("Number of Floors"),
      name: "numberOfFloors",
      type: "number",
      value: openNewBuildingModal
        ? newBuilding.numberOfFloors || 0
        : editBuilding?.numberOfFloors || 0,
      required: true,
      inputProps: { min: 1 },
    },
    {
      label: t("City"),
      name: "city",
      type: "text",
      value: openNewBuildingModal ? newBuilding.city : editBuilding?.city || "",
      required: true,
    },
    {
      label: t("Country"),
      name: "country",
      type: "text",
      value: openNewBuildingModal
        ? newBuilding.country
        : editBuilding?.country || "",
      required: true,
    },
    {
      label: t("Construction Year"),
      name: "constructionYear",
      type: "number",
      value: openNewBuildingModal
        ? newBuilding.constructionYear || ""
        : editBuilding?.constructionYear || "",
      rules: {
        required: t("construction Year is required"),
        min: { value: 2000, message: t("Invalid construction Year format") },
        max: new Date().getFullYear(),
      },
    },
    {
      label: t("Owner"),
      name: "owner",
      type: "text",
      value: openNewBuildingModal
        ? newBuilding.owner
        : editBuilding?.owner || "",
      required: true,
    },
  ];

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 3,
            height: "100%",
            backgroundColor: theme.palette.grey.A100,
          }}
        >
          <HeaderBar
            title={t("List of Buildings")}
            buttonLabel={t("Add a Building")}
            buttonIcon={<Add />}
            onButtonClick={handleOpenNewBuildingModal}
          />
          <FilterBar
            searchQuery={filters.searchQuery}
            onSearchQueryChange={(value) =>
              setFilters({ ...filters, searchQuery: value })
            }
            filters={filters}
            onFilterChange={(key, value) =>
              setFilters({ ...filters, [key]: value })
            }
            filtersConfig={filtersConfig}
            onSearch={handleSearch}
            onReset={handleReset}
            placeholder="Search buildings..."
          />

          <Table
            columns={columns}
            data={filteredBuildings}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            orderBy={orderBy}
            orderDirection={orderDirection}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSort={handleSort}
            renderActions={(building) => (
              <>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenEditModal(building)}
                >
                  <Edit />
                </IconButton>
                <CustomDelete
                  entity={building}
                  authToken={auth.accessToken}
                  deleteAction={actions.updateBuildingRequest}
                  entityName={building.name}
                  payloadKey="building"
                />
              </>
            )}
            noDataMessage={
              filters.searchQuery || filters.address || filters.numberOfFloors
                ? t("No buildings match your search")
                : t("No buildings available")
            }
          />

          <EntityModal
            open={open || openNewBuildingModal}
            title={
              intendedModalAction === "create"
                ? t("Create")
                : t("Edit")
            }
            onSubmit={
              openNewBuildingModal ? handleCreateBuilding : handleUpdateBuilding
            }
            entity={openNewBuildingModal ? newBuilding : editBuilding}
            fields={buildingFields}
            onChange={
              openNewBuildingModal ? handleNewBuildingChange : handleEditChange
            }
            entityType={t("Building")}
            onClose={handleCloseModal}
          />
        </Box>
      )}
    </>
  );
};

export default ListBuildings;
