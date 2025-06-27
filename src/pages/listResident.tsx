import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Avatar, IconButton, Box, useTheme } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import { User } from "../types/interface/User";
import { useTranslation } from "react-i18next";
import Preloader from "../components/UI/Preloader";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { actions, usersSelectors } from "../store/user/slice";
import HeaderBar from "../components/UI/HeaderBar";
import FilterBar, { FilterConfig } from "../components/UI/FilterBar";
import Table from "../components/UI/Table";
import maleAvatar from "../assets/avatar_female.jpg";
import femaleAvatar from "../assets/avatar_male.jpg";

const ListResidents: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const { auth } = useAuth();
  const [, setOpen] = useState(false);
  const [, setEditUser] = useState<User | null>(null);
  const [, setOpenNewUserModal] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { total, loading } = useSelector(
    (state: RootState) => state.users
  );
  const users = useSelector(usersSelectors.selectAll);

  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    searchQuery: string;
    role?: string;
  }>({
    page: 0,
    limit: 5,
    searchQuery: "",
    role: "Resident",
  });

    // Filter configuration for role
  const filtersConfig: FilterConfig[] = [];

  const loadUsers = useCallback(() => {
    if (auth.accessToken) {
      dispatch(
        actions.fetchUsersRequest({
          page: filters.page + 1,
          limit: filters.limit,
          search: filters.searchQuery,
          role: "Resident",
          pageSize: rowsPerPage,
          authToken: auth.accessToken,
        })
      );
    }
  }, [dispatch, filters.searchQuery,filters.page, filters.limit, rowsPerPage, auth.accessToken]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = () => {
    if (auth.accessToken) {
      setPage(0);
      setFilters({ ...filters, page: 0 });
      dispatch(
        actions.fetchUsersRequest({
          page: 1,
          limit: filters.limit,
          search: filters.searchQuery,
          role: "Resident",
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
      role: "Resident",
    });
    setPage(0);
    if (auth.accessToken) {
      dispatch(
        actions.fetchUsersRequest({
          page: 1,
          limit: 5,
          search: "",
          role: "Resident",
          pageSize: rowsPerPage,
          authToken: auth.accessToken,
        })
      );
    }
  };

  const confirmDelete = (user: User) => {
    Swal.fire({
      title: t("Are you sure?"),
      text: t(`Do you really want to delete ${user.username}?`),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Yes, delete"),
      cancelButtonText: t("Cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(
          actions.deleteUserRequest({
            user,
            authToken: auth.accessToken,
          })
        );
      }
    });
  };

  const handleOpenEditModal = (user: User) => {
    setEditUser(user);
    setOpen(true);
  };

  const handleOpenNewUserModal = () => {
    setOpenNewUserModal(true);
  };

   const filteredUsers = useMemo(() => {
    let result = users.filter(
      (user): user is User => user !== null && user !== undefined
    );

    return result.sort((a, b) => {
      const usernameA = a.username || "";
      const lastNameA = a.lastName || "";
      const usernameB = b.username || "";
      const lastNameB = b.lastName || "";
      const nameA = `${usernameA} ${lastNameA}`.toLowerCase();
      const nameB = `${usernameB} ${lastNameB}`.toLowerCase();
      return orderDirection === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }, [users, orderDirection]);

  const columns = useMemo(
    () => [
      {
        id: "avatar",
        label: "Avatar",
        width: "80px",
        render: (user: User) => (
          <Avatar
            src={user.Gender === "male" ? femaleAvatar : maleAvatar}
            sx={{
              width: 40,
              height: 40,
              border: `2px solid ${
                user.Gender === "male" ? "#1976d2" : "#e91e63"
              }`,
            }}
          />
        ),
      },
      {
        id: "name",
        label: "Name",
        render: (user: User) => `${user.username} ${user.lastName}`,
        sortable: true,
        width: "200px",
      },
      {
        id: "email",
        label: "Email",
        render: (user: User) => user.email,
        width: "300px",
      },
    ],
    []
  );

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setFilters({ ...filters, page: newPage });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setFilters({ ...filters, page: 0, limit: newRowsPerPage });
    if (auth.accessToken) {
      dispatch(
        actions.fetchUsersRequest({
          page: 1,
          limit: newRowsPerPage,
          search: filters.searchQuery,
          role: "Resident",
          pageSize: newRowsPerPage,
          authToken: auth.accessToken,
        })
      );
    }
  };

  return (
    <>
      {loading && !users.length ? (
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
            title="List of Users"
            buttonLabel="Add a User"
            buttonIcon={<Add />}
            onButtonClick={handleOpenNewUserModal}
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
            placeholder="Search users..."
          />

          <Table
            columns={columns}
            data={filteredUsers}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            orderBy={orderBy}
            orderDirection={orderDirection}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSort={handleSort}
            renderActions={(user) => (
              <>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenEditModal(user)}
                >
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => confirmDelete(user)}>
                  <Delete />
                </IconButton>
              </>
            )}
            noDataMessage={
              filters.searchQuery
                ? t("No users match your search")
                : t("No users available")
            }
          />

          {/* <UserModal
            open={open || openNewUserModal}
            onClose={
              openNewUserModal ? handleCloseNewUserModal : handleCloseEditModal
            }
            onSubmit={openNewUserModal ? handleCreateUser : handleUpdateUser}
            user={editUser || newUser}
            onChange={openNewUserModal ? handleNewUserChange : handleEditChange}
            title={openNewUserModal ? t("Create User") : t("Edit User")}
            isNewUser={openNewUserModal}
          /> */}
        </Box>
      )}
    </>
  );
};

export default ListResidents;
