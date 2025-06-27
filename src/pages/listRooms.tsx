import React, { useState, useEffect, useMemo } from "react";
import { IconButton, Box, useTheme, SelectChangeEvent } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { actions, meetingRoomsSelectors } from "../store/room/slice";
import useAuth from "../hooks/useAuth";
import { MeetingRoom } from "../types/interface/MeetingRoom";
import Table from "../components/UI/Table";
import { t } from "i18next";
import HeaderBar from "../components/UI/HeaderBar";
import FilterBar from "../components/UI/FilterBar";
import { EntityModal, FieldConfig } from "../components/UI/Modal";
import CustomDelete from "../components/UI/Delete";

const ListRooms: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, total } = useSelector(
    (state: RootState) => state.meetingRooms
  );
  const { auth } = useAuth();
  const theme = useTheme();
  const [intendedModalAction, setIntendedModalAction] = useState<
    "create" | "edit" | null
  >(null);
  const meetingRooms = useSelector(meetingRoomsSelectors.selectAll);
  const [openNewMeetingRoomModal, setOpenNewMeetingRoomModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [editMeetingRoom, setEditMeetingRoom] = useState<MeetingRoom | null>(
    null
  );
  const [orderBy, setOrderBy] = useState<string>("name");
  const [open, setOpen] = useState(false);

  const [newMeetingRoom, setNewMeetingRoom] = useState<Omit<MeetingRoom, "id">>(
    {
      name: "",
      capacity: undefined,
      location: "",
    }
  );
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    searchQuery: string;
    capacity: number;
  }>({
    page: 0,
    limit: 5,
    searchQuery: "",
    capacity: undefined,
  });
  useEffect(() => {
    dispatch(
      actions.fetchMeetingRoomsRequest({
        page: filters.page + 1,
        limit: filters.limit,
        search: "",
        capacity: undefined,
        pageSize: rowsPerPage,
        authToken: auth.accessToken,
      })
    );
  }, [page, rowsPerPage, dispatch]);

  const handleCloseModal = () => {
    setOpen(false);
    setOpenNewMeetingRoomModal(false);
    setTimeout(() => {
      setIntendedModalAction(null);
      setEditMeetingRoom(null);
    }, 300);
  };
  const handleOpenEditModal = (room: MeetingRoom) => {
    setEditMeetingRoom(room);
    setIntendedModalAction("edit");
    setOpen(true);
  };

  const handleOpenNewMeetingRoomModal = () => {
    setOpenNewMeetingRoomModal(true);
    setIntendedModalAction("create");
  };
  const filtersConfig = [
    {
      key: "capacity",
      label: t("Capacity"),
      type: "number" as const,
      placeholder: "Filter by capacity",
    },
  ];
  const handleSearch = () => {
    if (auth.accessToken) {
      setPage(0);
      setFilters({ ...filters, page: 0 });
      dispatch(
        actions.fetchMeetingRoomsRequest({
          page: filters.page + 1,
          limit: filters.limit,
          search: filters.searchQuery,
          capacity: filters.capacity,
          pageSize: rowsPerPage,
          authToken: auth.accessToken,
        })
      );
    }
  };
  useEffect(() => {
    dispatch(
      actions.fetchMeetingRoomsRequest({
        page: filters.page + 1,
        limit: filters.limit,
        search: "",
        capacity: undefined,
        pageSize: rowsPerPage,
        authToken: auth.accessToken,
      })
    );
  }, [page, rowsPerPage, dispatch]);
  const handleReset = () => {
    setFilters({
      page: 0,
      limit: 5,
      searchQuery: "",
      capacity: undefined,
    });
    setPage(0);
    dispatch(
      actions.fetchMeetingRoomsRequest({
        page: filters.page + 1,
        limit: filters.limit,
        search: "",
        capacity: undefined,
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
        render: (meetingRoom: MeetingRoom) => `${meetingRoom.name}`,
        sortable: true,
      },
      {
        id: "capacity",
        label: t("Capacity"),
        render: (meetingRoom: MeetingRoom) => meetingRoom.capacity,
      },
      {
        id: "location",
        label: t("Location"),
        render: (meetingRoom: MeetingRoom) => meetingRoom.location,
      },
    ],
    []
  );
  const filteredMeetingRooms = useMemo(() => {
    return meetingRooms.filter(
      (meetingRoom): meetingRoom is MeetingRoom =>
        !meetingRoom.isDeleted 
    );

    // const startIndex = page * rowsPerPage;
    // const endIndex = startIndex + rowsPerPage;
    // return result.slice(startIndex, endIndex);
  }, [meetingRooms, orderDirection, page, rowsPerPage, total]);
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
        actions.fetchMeetingRoomsRequest({
          page: filters.page + 1,
          limit: filters.limit,
          search: "",
          capacity: undefined,
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

  const handleCreateMeetingRoom = (data: Omit<MeetingRoom, "id">) => {
    dispatch(
      actions.createMeetingRoomRequest({
        meetingRoom: data,
        authToken: auth.accessToken,
      })
    );
    handleCloseModal();
  };
  const handleUpdateMeetingRoom = (data: MeetingRoom) => {
    if (editMeetingRoom) {
      dispatch(
        actions.updateMeetingRoomRequest({
          meetingRoom: data,
          authToken: auth.accessToken,
        })
      );
      handleCloseModal();
    }
  };
  const handleNewMeetingRoomChange = (
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>
  ) => {
    setNewMeetingRoom({ ...newMeetingRoom, [e.target.name!]: e.target.value });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editMeetingRoom) {
      setEditMeetingRoom({
        ...editMeetingRoom,
        [e.target.name]: e.target.value,
      });
    }
  };
  const MeetingRoomFields: FieldConfig[] = [
    {
      label: t("Name"),
      name: "name",
      type: "text",
      value: openNewMeetingRoomModal
        ? newMeetingRoom.name
        : editMeetingRoom?.name || "",
      required: true,
    },
    {
      label: t("Capacity"),
      name: "capacity",
      type: "number",
      value: openNewMeetingRoomModal
        ? newMeetingRoom.capacity
        : editMeetingRoom?.capacity || "",
      required: true,
      rules: {
        required: t("capacity is required"),
        min: { value: 0, message: t("Invalid capacity format") },
      },
    },

    {
      label: t("Location"),
      name: "location",
      type: "text",
      value: openNewMeetingRoomModal
        ? newMeetingRoom.location
        : editMeetingRoom?.location || "",
      required: true,
    },
  ];
  return (
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
        title="List of Meeting Room"
        buttonLabel="Add a Meeting Room"
        buttonIcon={<Add />}
        onButtonClick={handleOpenNewMeetingRoomModal}
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
        placeholder={t("Search Meeting Room...")}
      />

      <Table
        columns={columns}
        data={filteredMeetingRooms}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        orderBy={orderBy}
        orderDirection={orderDirection}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSort={handleSort}
        renderActions={(room) => (
          <>
            <IconButton
              color="primary"
              onClick={() => handleOpenEditModal(room)}
            >
              <Edit />
            </IconButton>
            <CustomDelete
              entity={room}
              authToken={auth.accessToken}
              deleteAction={actions.updateMeetingRoomRequest}
              entityName={room.name}
              payloadKey="meetingRoom"
            />
          </>
        )}
        noDataMessage={
          filters.searchQuery || filters.capacity
            ? t("No buildings match your search")
            : t("No buildings available")
        }
      />

      <EntityModal
        open={open || openNewMeetingRoomModal}
        title={
          intendedModalAction === "create"
            ? t("Create")
            : t("Edit")
        }
        onSubmit={
          openNewMeetingRoomModal
            ? handleCreateMeetingRoom
            : handleUpdateMeetingRoom
        }
        entity={openNewMeetingRoomModal ? newMeetingRoom : editMeetingRoom}
        fields={MeetingRoomFields}
        onChange={
          openNewMeetingRoomModal
            ? handleNewMeetingRoomChange
            : handleEditChange
        }
        entityType={t("Meeting Room")}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

export default ListRooms;
