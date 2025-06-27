import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Avatar,
  IconButton,
  Box,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import { Edit,  Add } from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import { User } from "../types/interface/User";
import { useTranslation } from "react-i18next";
import Preloader from "../components/UI/Preloader";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { actions, usersSelectors } from "../store/user/slice";
import { UserRole } from "../types/enum/UserRole.enum";
import HeaderBar from "../components/UI/HeaderBar";
import FilterBar, { FilterConfig } from "../components/UI/FilterBar";
import Table from "../components/UI/Table";
import maleAvatar from "../assets/avatar_female.jpg";
import femaleAvatar from "../assets/avatar_male.jpg";
import { EntityModal, FieldConfig } from "../components/UI/Modal";
import { GenderType } from "../types/enum/Gender";
import { toast } from "react-toastify";
import CustomDelete from "../components/UI/Delete";

export const genderOptions = [
  { value: GenderType.Male, label: "Male" },
  { value: GenderType.Female, label: "Female" },
];

export const roleOptions = Object.values(UserRole).map((role) => ({
  value: role,
  label: role,
}));

const ListUsers: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [openNewUserModal, setOpenNewUserModal] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { total, loading, error } = useSelector(
    (state: RootState) => state.users
  );
  const users = useSelector(usersSelectors.selectAll);
  const [intendedModalAction, setIntendedModalAction] = useState<
    "create" | "edit" | null
  >(null);
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    searchQuery: string;
    role?: string;
    idsyndic: number;
  }>({
    page: 0,
    limit: 5,
    searchQuery: "",
    role: "",
    idsyndic: auth.role === UserRole.SYNDIC ? auth.user.id : undefined,
  });

  const [newUser, setNewUser] = useState<Omit<User, "id">>({
    username: "",
    lastName: "",
    email: "",
    role: auth.role === UserRole.SYNDIC ? UserRole.RESIDENT : "",
    password: "",
    currentPassword: "",
    Gender: "",
    idsyndic: auth.role ===UserRole.SYNDIC ? auth.user.id : undefined,
  });

  const roles = useMemo(
    () =>
      auth.role === UserRole.SYNDIC
        ? [{ value: UserRole.RESIDENT, label: "RESIDENT" }]
        : [
            { value: "", label: "All Roles" },
            ...Object.values(UserRole).map((role) => ({
              value: role,
              label: role,
            })),
          ],
    [auth.role]
  );

  const filtersConfig: FilterConfig[] = [
    {
      key: "role",
      label: "Role",
      type: "select" as const,
      options: roles,
    },
  ];

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
console.log(auth)
  const loadUsers = useCallback(() => {
    if (auth.accessToken) {
      dispatch(
        actions.fetchUsersRequest({
          page: filters.page + 1,
          limit: filters.limit,
          search: filters.searchQuery,
          role: auth.role === UserRole.SYNDIC ? UserRole.RESIDENT : filters.role,
          pageSize: rowsPerPage,
          authToken: auth.accessToken,
          idsyndic: auth.role === UserRole.SYNDIC ? auth.user.id : filters.idsyndic,
        })
      );
    }
  }, [dispatch, filters.page, filters.limit, filters.role, rowsPerPage, auth,filters.idsyndic,filters.searchQuery]);

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
          role: auth.role === UserRole.SYNDIC ? UserRole.RESIDENT : filters.role,
          pageSize: rowsPerPage,
          authToken: auth.accessToken,
          idsyndic: auth.role === UserRole.SYNDIC ? auth.user.id : filters.idsyndic,
        })
      );
    }
  };

  const handleReset = () => {
    setFilters({
      page: 0,
      limit: 5,
      searchQuery: "",
      role: auth.role === UserRole.SYNDIC ? UserRole.RESIDENT : "",
      idsyndic: auth.role === UserRole.SYNDIC ? auth.idsyndic : undefined,
    });
    setPage(0);
    if (auth.accessToken) {
      dispatch(
        actions.fetchUsersRequest({
          page: 1,
          limit: 5,
          search: "",
          role: auth.role === UserRole.SYNDIC ? UserRole.RESIDENT : "",
          pageSize: rowsPerPage,
          authToken: auth.accessToken,
          idsyndic: auth.role === UserRole.SYNDIC ? auth.user.id : filters.idsyndic,
        })
      );
    }
  };



  const handleOpenEditModal = (user: User) => {
    setEditUser(user);
    setIntendedModalAction("edit");
    setOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editUser) {
      setEditUser({ ...editUser, [e.target.name]: e.target.value });
    }
  };

  const handleOpenNewUserModal = () => {
    setOpenNewUserModal(true);
    setIntendedModalAction("create");
  };

  const handleNewUserChange = (
    e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>
  ) => {
    setNewUser({ ...newUser, [e.target.name!]: e.target.value });
  };

  const handleUpdateUser = (data: User) => {
    if (editUser) {
      dispatch(
        actions.updateUserRequest({
          user: data,
          authToken: auth.accessToken,
        })
      );
      handleCloseModal();
    }
  };

  const handleCreateUser = (data: Omit<User, "id">) => {
    dispatch(
      actions.createUserRequest({ user: data, authToken: auth.accessToken })
    );
    handleCloseModal();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user): user is User => user.isDeleted === false);
  }, [users]);

  const handlePageChange = (newPage: number) => {
    const maxPage = Math.ceil(total / rowsPerPage) - 1;
    const validPage = Math.max(0, Math.min(newPage, maxPage));
    setPage(validPage);
    setFilters({ ...filters, page: validPage });
  };

  const columns = useMemo(
    () => [
      {
        id: "avatar",
        label: "Avatar",
        width: "80px",
        render: (user: User) => (
          <Avatar
            src={user.Gender === GenderType.Male ? maleAvatar : femaleAvatar}
            sx={{
              width: 40,
              height: 40,
              border: `2px solid ${
                user.Gender === GenderType.Male ?  "#e91e63": "#1976d2"
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
      {
        id: "role",
        label: "Role",
        render: (user: User) => user.role,
        width: "150px",
      },
    ],
    []
  );

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
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
          role: auth.role === UserRole.SYNDIC ? UserRole.RESIDENT : filters.role,
          pageSize: newRowsPerPage,
          authToken: auth.accessToken,
          idsyndic: auth.role === UserRole.SYNDIC ? auth.idsyndic : undefined,
        })
      );
    }
  };

  const userFields: FieldConfig[] = useMemo(() => {
    const baseFields: FieldConfig[] = [
      {
        label: t("First name"),
        name: "username",
        type: "text",
        value: "",
        required: true,
        rules: {
          required: t("Username is required"),
          minLength: {
            value: 3,
            message: t("Username must be at least 3 characters"),
          },
        },
      },
      {
        label: t("Last name"),
        name: "lastName",
        type: "text",
        value: "",
        required: true,
        rules: {
          required: t("Last Name is required"),
          minLength: {
            value: 2,
            message: t("Last Name must be at least 2 characters"),
          },
        },
      },
      {
        label: t("Gender"),
        name: "Gender",
        inputType: "select",
        value: "",
        required: true,
        selectOptions: genderOptions,
        disabled: !!editUser,
        rules: {
          required: t("Gender is required"),
        },
      },
      {
        label: t("Email"),
        name: "email",
        type: "email",
        value: openNewUserModal ? newUser.email : editUser?.email || "",
        required: true,
        rules: {
          required: t("Email is required"),
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: t("Invalid email format"),
          },
        },
      },
    ];

    if (auth.role !== UserRole.SYNDIC || intendedModalAction === "edit") {
      baseFields.push({
        label: t("Role"),
        name: "role",
        inputType: "select",
        value: openNewUserModal ? newUser.role : editUser?.role || "",
        required: true,
        selectOptions: roleOptions,
        disabled: !!editUser,
        rules: {
          required: t("Role is required"),
        },
      });
    }

    return baseFields;
  }, [auth.role, intendedModalAction, editUser, newUser, t,openNewUserModal]);

  const handleCloseModal = () => {
    setOpen(false);
    setOpenNewUserModal(false);
    setTimeout(() => {
      setIntendedModalAction(null);
      setEditUser(null);
      setNewUser({
        username: "",
        lastName: "",
        email: "",
        role: auth.role === UserRole.SYNDIC ? UserRole.RESIDENT : "",
        password: "",
        currentPassword: "",
        Gender: "",
        idsyndic: auth.role === UserRole.SYNDIC ? auth.idsyndic : undefined,
      });
    }, 300);
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
            buttonLabel={auth.role === UserRole.SYNDIC ? "Add a RESIDENT" : "Add a User"}
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
            placeholder={t("Search users...")}
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
                <CustomDelete
                  entity={user}
                  authToken={auth.accessToken}
                  deleteAction={actions.updateUserRequest}
                  entityName={user.username}
                  payloadKey="user"
                />
              </>
            )}
            noDataMessage={
              filters.searchQuery || filters.role
                ? t("No users match your search")
                : t("No users available")
            }
          />

          <EntityModal
            open={open || openNewUserModal}
            title={
              intendedModalAction === "create"
                ? auth.role === UserRole.SYNDIC
                  ? t("Add RESIDENT")
                  : t("Create")
                : t("Edit")
            }
            onSubmit={openNewUserModal ? handleCreateUser : handleUpdateUser}
            entity={openNewUserModal ? newUser : editUser}
            fields={userFields}
            onChange={openNewUserModal ? handleNewUserChange : handleEditChange}
            entityType={t(auth.role === UserRole.SYNDIC ? "RESIDENT" : "User")}
            onClose={handleCloseModal}
          />
        </Box>
      )}
    </>
  );
};

export default ListUsers;