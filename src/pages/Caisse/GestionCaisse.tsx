import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions, caissesSelectors } from "../../store/fees/caisseSlice";
import { RootState, AppDispatch } from "../../store/store";
import {
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  useTheme,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit as EditIcon,
 
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,

} from "@mui/icons-material";
import useAuth from "../../hooks/useAuth";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { StyledButton } from "../Style";
import {  actions as actionsUser } from "../../store/user/slice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Table from "../../components/UI/Table";
import FilterBar, { FilterConfig } from "../../components/UI/FilterBar";
import { Caisse, Transaction } from "../../store/fees/Types";
import { EntityModal, FieldConfig } from "../../components/UI/Modal";
import CustomDelete from "../../components/UI/Delete";
import { format, getYear, getMonth } from "date-fns";
import { fr } from "date-fns/locale";
import CustomButton from "../../components/UI/Button";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Participant {
  userId?: number;
  username: string;
  lastName?: string;
  role: "Rh" | "Syndic";
}

interface UserOption {
  id: string;
  username: string;
  lastName: string;
  role: string;
}

interface TransactionFormData {
  amount: string;
  description: string;
  Photo: (string | File)[];
}

const GestionCaisse: React.FC = () => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  // State management
  const {
    error: caissesError,
    total,
    Ttotal,
    transactions,

  } = useSelector((state: RootState) => state.fees);
  const {
    entities: users,
    loading: usersLoading,
  } = useSelector((state: RootState) => state.users);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [intendedModalAction, setIntendedModalAction] = useState<
    "create" | "edit" | null
  >(null);
  const [currentCaisse, setCurrentCaisse] = useState<Caisse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openTransactionsDialog, setOpenTransactionsDialog] = useState(false);
  const [selectedCaisseId, setSelectedCaisseId] = useState<number | null>(null);
  const [, setOpenTransactionConfirmDialog] =
    useState(false);
  const [, setPendingTransaction] =
    useState<TransactionFormData | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [, setAmountError] = useState<string | null>(null);

  // Form state
  const [formValues, setFormValues] = useState({
    name: "",
    balance: "",
    minBalance: "",
    role: "Rh" as "Rh" | "Syndic",
    participants: [] as UserOption[],
  });

  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState<string>("name");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");

  // Transaction table state
  const [Tpage, TsetPage] = useState(0);
  const [TrowsPerPage, TsetRowsPerPage] = useState(5);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<boolean>(false);

  // Filter state for caisses
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    searchQuery: string;
    name?: string;
  }>({
    page: 0,
    limit: 5,
    searchQuery: "",
    name: "",
  });

  // Filter state for transactions
  const [Tfilters, TsetFilters] = useState<{
    page: number;
    limit: number;
    searchQuery: string;
    annee?: number;
    mois?: number;
  }>({
    page: 1, // One-based for API
    limit: 5,
    searchQuery: "",
  });

  // Formik for Transaction Modal
  const transactionFormik = useFormik<TransactionFormData>({
    initialValues: {
      amount: "",
      description: "",
      Photo: [],
    },
    validationSchema: Yup.object({
      amount: Yup.string()
        .matches(/^\d*\.?\d*$/, t("Please enter a valid number"))
        .required(t("The amount is required"))
        .test("is-positive", t("The amount must be positive."), (value) =>
          value ? parseFloat(value) > 0 : false
        ),
      description: Yup.string().required(t("Description is required")),
      Photo: Yup.array()
        .min(1, t("At least one photo is required"))
        .required(t("Photos are required")),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!auth?.accessToken || selectedCaisseId === null || !auth?.user?.id) {
        toast.error("Erreur : informations d'authentification manquantes");
        return;
      }

      const amount = parseFloat(values.amount);
      const selectedCaisse = caisses.find((c) => c.id === selectedCaisseId);
      if (!selectedCaisse) {
        toast.error(t("Cash register not found"));
        return;
      }

      if (amount > selectedCaisse.balance) {
        setAmountError(t("The amount cannot exceed the current balance"));
        return;
      }

      setPendingTransaction(values);
      setOpenTransactionConfirmDialog(true);
    },
  });

  // Data
  const caisses = useSelector(caissesSelectors.selectAll);
  const availableUsers = useMemo(
    () =>
      Object.values(users)
        .filter(
          (user): user is NonNullable<typeof user> =>
            !!user &&
            (user.role === formValues.role || user.id === auth?.user?.id)
        )
        .map((user) => ({
          id: String(user.id),
          username: user.username,
          lastName: user.lastName || "",
        })),
    [users, auth?.user?.id, formValues.role]
  );

  // Fetch functions
  const fetchMoreUsers = useCallback(() => {
    if (!usersLoading && auth?.accessToken && availableUsers.length === 0) {
      dispatch(
        actionsUser.fetchUsersByRoleRequest({
          role: formValues.role,
          authToken: auth.accessToken,
        })
      );
    }
  }, [
    dispatch,
    usersLoading,
    auth?.accessToken,
    availableUsers.length,
    formValues.role,
  ]);

  useEffect(() => {
    fetchMoreUsers();
  }, [fetchMoreUsers, formValues.role, availableUsers.length]);

  useEffect(() => {
    dispatch(
      actions.fetchCaissesRequest({
        page: page + 1,
        limit: rowsPerPage,
        search: filters.searchQuery,
        name: filters.name,
        pageSize: rowsPerPage,
        authToken: auth.accessToken,
      })
    );
  }, [
    page,
    rowsPerPage,
    filters.searchQuery,
    filters.name,
    dispatch,
    auth.accessToken,
  ]);

  // Fetch transactions when dialog opens or filters change
  useEffect(() => {
    if (
      openTransactionsDialog &&
      selectedCaisseId !== null &&
      auth?.accessToken
    ) {
      dispatch(
        actions.fetchTransactionsRequest({
          caisseId: selectedCaisseId,
          token: auth.accessToken,
          Tpage: Tfilters.page,
          Tlimit: Tfilters.limit,
          annee: yearFilter !== "all" ? parseInt(yearFilter) : undefined,
          mois: monthFilter !== "all" ? parseInt(monthFilter) : undefined,
          TpageSize: TrowsPerPage,
        })
      );
    }
  }, [
    openTransactionsDialog,
    selectedCaisseId,
    dispatch,
    auth?.accessToken,
    Tfilters.page,
    Tfilters.limit,
    yearFilter,
    monthFilter,
    TrowsPerPage,
  ]);

  // Modal handlers
  const handleOpenModal = (action: "create" | "edit", caisse?: Caisse) => {
    setIntendedModalAction(action);
    if (action === "edit" && caisse) {
      setCurrentCaisse(caisse);
      const participants = parseParticipants(caisse.participants);
      setFormValues({
        name: caisse.name || "",
        balance: caisse.balance.toString(),
        minBalance: caisse.minBalance?.toString() || "",
        role: participants[0]?.role || "Rh",
        participants: participants.map((p) => ({
          id: String(p.userId),
          username: p.username,
          lastName: p.lastName || "",
          role: p.role,
        })),
      });
    } else {
      setCurrentCaisse(null);
      setFormValues({
        name: "",
        balance: "",
        minBalance: "",
        role: "Rh",
        participants: [],
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => {
      setIntendedModalAction(null);
      setCurrentCaisse(null);
    }, 300);
  };

  // Transaction dialog handlers
  const handleOpenTransactionsDialog = (caisseId: number) => {
    setSelectedCaisseId(caisseId);
    TsetPage(0);
    TsetRowsPerPage(5);
    setYearFilter("all");
    setMonthFilter("all");
    setUserFilter(false);
    TsetFilters({ page: 1, limit: 5, searchQuery: "" });
    setOpenTransactionsDialog(true);
  };

  const handleCloseTransactionsDialog = () => {
    setOpenTransactionsDialog(false);
    setSelectedCaisseId(null);
    setPhotoPreview([]);
    transactionFormik.resetForm();
  };

  // Form handlers
  const handleFormChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | { target: { name: string; value: any } }
    ) => {
      const { name, value } = e.target;
      setFormValues((prev) => {
        const newValue =
          name === "balance" || name === "minBalance" ? String(value) : value;
        console.log(`Field ${name} updated to:`, newValue);
        const newValues = { ...prev, [name]: newValue };
        console.log("Updated formValues:", newValues); // Debug log
        if (name === "role") {
          fetchMoreUsers();
        }
        return newValues;
      });
    },
    [fetchMoreUsers]
  );

  

  const handleCreateCaisse = useCallback(
    async (data: typeof formValues) => {
      setIsProcessing(true);
      try {
        const newCaisse = {
          name: data.name.trim(),
          balance: Number(data.balance) || 0,
          minBalance: Number(data.minBalance) || 0,
          participants: data.participants.map((p) => ({
            userId: Number(p.id),
            username: p.username,
            lastName: p.lastName,
            role: data.role,
          })),
          isDeleted: false,
        };
        if (newCaisse.balance < newCaisse.minBalance) {
          toast.error("Le solde ne peut pas être inférieur au solde minimum");
          setIsProcessing(false);
          return;
        }
        await dispatch(
          actions.createCaisseRequest({
            caisse: newCaisse,
            token: auth.accessToken!,
          })
        );
        toast.success(`Caisse "${newCaisse.name}" créée avec succès`);
        handleCloseModal();
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de la création de la caisse");
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, auth?.accessToken]
  );

  const handleUpdateCaisse = useCallback(
    async (data: typeof formValues) => {
      if (!currentCaisse || !auth?.accessToken || !auth?.user?.id) return;
      setIsProcessing(true);
      try {
        const newBalance = Number(data.balance) || 0;
        // console.log(newBalance);
        // console.log(currentCaisse);
        // if (
        //   newBalance < currentCaisse.minBalance ||
        //   Math.abs(newBalance - currentCaisse.balance) >
        //     currentCaisse.balance * 0.5
        // ) {
        //   if (
        //     !window.confirm(
        //       "Le solde modifié est significativement différent ou inférieur au solde minimum. Continuer ?"
        //     )
        //   ) {
        //     setIsProcessing(false);
        //     return;
        //   }
        // }

        const updatedCaisse = {
          id: currentCaisse.id,
          name: data.name.trim(),
          balance: newBalance,
          minBalance: Number(data.minBalance) || 0,
          participants: data.participants.map((p) => ({
            userId: Number(p.id),
            username: p.username,
            lastName: p.lastName,
            role: data.role,
          })),
          isDeleted: currentCaisse.isDeleted || false,
        };

        // Create a transaction if balance has changed
        const balanceChange = newBalance - currentCaisse.balance;
        if (balanceChange !== 0) {
          const transaction: Transaction = {
            amount: balanceChange,
            caisseId: currentCaisse.id,
            userId: auth.user.id,
            description: `Mise à jour du solde de la caisse ${data.name} de ${currentCaisse.balance} à ${newBalance} DT`,
            Photo: [],
          };
          await dispatch(
            actions.createTransactionRequest({
              transaction: transaction,
              token: auth.accessToken,
            })
          );
        }

        await dispatch(
          actions.updateCaisseRequest({
            caisse: updatedCaisse,
            token: auth.accessToken,
          })
        );
        toast.success(`Caisse "${updatedCaisse.name}" mise à jour avec succès`);
        handleCloseModal();
      } catch (err: any) {
        toast.error(
          err.message || "Erreur lors de la mise à jour de la caisse"
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, auth, currentCaisse]
  );

  

  
  // Table and filter handlers
  const handleSort = useCallback(
    (columnId: string) => {
      const isAsc = orderBy === columnId && orderDirection === "asc";
      setOrderBy(columnId);
      setOrderDirection(isAsc ? "desc" : "asc");
    },
    [orderBy, orderDirection]
  );

  const handleSearch = () => {
    if (auth.accessToken) {
      setPage(0);
      setFilters({ ...filters, page: 0 });
      dispatch(
        actions.fetchCaissesRequest({
          page: 1,
          limit: rowsPerPage,
          search: filters.searchQuery,
          name: filters.name,
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
      name: "",
    });
    setPage(0);
    dispatch(
      actions.fetchCaissesRequest({
        page: 1,
        limit: 5,
        search: "",
        name: "",
        pageSize: rowsPerPage,
        authToken: auth.accessToken,
      })
    );
  };

  const handleTransactionSearch = () => {
    if (selectedCaisseId !== null && auth?.accessToken) {
      TsetPage(0);
      TsetFilters({ ...Tfilters, page: 1 });
      dispatch(
        actions.fetchTransactionsRequest({
          caisseId: selectedCaisseId,
          token: auth.accessToken,
          Tpage: 1,
          Tlimit: TrowsPerPage,
          annee: yearFilter !== "all" ? parseInt(yearFilter) : undefined,
          mois: monthFilter !== "all" ? parseInt(monthFilter) : undefined,
          TpageSize: TrowsPerPage,
        })
      );
    }
  };

  // Pagination handlers
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
        actions.fetchCaissesRequest({
          page: 1,
          limit: newRowsPerPage,
          search: "",
          name: "",
          pageSize: newRowsPerPage,
          authToken: auth.accessToken,
        })
      );
    }
  };

  const handleTPageChange = (newPage: number) => {
    const maxPage = Math.ceil(Ttotal / TrowsPerPage) - 1;
    const validPage = Math.max(0, Math.min(newPage, maxPage));
    TsetPage(validPage);
    TsetFilters({ ...Tfilters, page: validPage + 1 }); // One-based for API
  };

  const handleTRowsPerPageChange = (newRowsPerPage: number) => {
    TsetRowsPerPage(newRowsPerPage);
    TsetPage(0);
    TsetFilters({ ...Tfilters, page: 1, limit: newRowsPerPage });
  };

  // Table configuration
  const columns = useMemo(
    () => [
      {
        id: "name",
        label: "name",
        sortable: true,
        width: "200px",
        render: (caisse: Caisse) => (
          <Typography fontWeight="medium">{caisse.name}</Typography>
        ),
      },
      {
        id: "balance",
        label: "Balance",
        sortable: true,
        width: "150px",
        render: (caisse: Caisse) => (
          <Chip
            label={`${caisse.balance} ${t("dt")}`}
            color={caisse.balance >= 0 ? "success" : "error"}
            avatar={
              <Avatar>
                <MoneyIcon fontSize="small" />
              </Avatar>
            }
            sx={{ width: "100%" }}
          />
        ),
      },
      {
        id: "minBalance",
        label: "Minimum Balance",
        sortable: true,
        width: "150px",
        render: (caisse: Caisse) => (
          <Chip
            label={`${caisse.minBalance} ${t("dt")}`}
            color="error"
            avatar={
              <Avatar>
                <MoneyIcon fontSize="small" />
              </Avatar>
            }
            sx={{ width: "100%" }}
          />
        ),
      },
      {
        id: "participants",
        label: "Participants",
        width: "250px",
        render: (caisse: Caisse) => {
          const participants = parseParticipants(caisse.participants);
          return participants.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {participants.map((p: Participant, index: number) => (
                <Tooltip key={index} title={`User ID: ${p.userId}`}>
                  <Chip label={p.username} size="small" variant="outlined" />
                </Tooltip>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucun participant
            </Typography>
          );
        },
      },
    ],
    [t]
  );

  const filtersConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "name",
        label: "name",
        type: "text",
        placeholder: "Enter name",
      },
    ],
    []
  );

  // Static years and months for transaction filters
  const years = useMemo(() => {
    const yearList = ["all"];
    for (let year = 2020; year <= 2030; year++) {
      yearList.push(year.toString());
    }
    return yearList;
  }, []);

  const months = useMemo(() => {
    const monthList = ["all"];
    for (let month = 1; month <= 12; month++) {
      monthList.push(month.toString());
    }
    return monthList;
  }, []);

  const filteredCaisses = useMemo(() => {
    return caisses.filter((caisse): caisse is Caisse => !caisse.isDeleted);
  }, [caisses]);

  // Filter transactions locally
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      let matchesYear = true;
      let matchesMonth = true;
      let matchesUser = true;

      if (yearFilter !== "all" && tx.createdAt) {
        matchesYear = getYear(new Date(tx.createdAt)).toString() === yearFilter;
      }

      if (monthFilter !== "all" && tx.createdAt) {
        matchesMonth =
          (getMonth(new Date(tx.createdAt)) + 1).toString() === monthFilter;
      }

      if (userFilter && auth?.user?.id) {
        matchesUser = tx.userId === auth.user.id;
      }

      return matchesYear && matchesMonth && matchesUser;
    });
  }, [transactions, yearFilter, monthFilter, userFilter, auth?.user?.id]);
  // Modal fields configuration
  const CaisseFields: FieldConfig[] = useMemo(
    () => [
      {
        label: "Name of the fund",
        name: "name",
        type: "text",
        value: formValues.name,
        required: true,
        rules: {
          required: "Le nom de la caisse est requis",
          minLength: {
            value: 3,
            message: "Le nom doit contenir au moins 3 caractères",
          },
        },
      },
      {
      label: "Balance",
      name: "balance",
      type: "number",
      value: formValues.balance,
      required: true,
      inputProps: { min: 0, step: 0.01 },
      rules: {
        required: "Le solde est requis",
        validate: {
          positive: (v: string) => {
            const value = parseFloat(v);
            return !isNaN(value) && value >= 0 && "Le solde doit être positif ou zéro";
          },
          minBalance: (v: string) => {
            const balance = parseFloat(v) && 0;
            const minBalance = parseFloat(formValues.minBalance) && 0;
            return balance >= minBalance && "Le solde ne peut pas être inférieur au solde minimum";
          },
        },
      },
    },
      {
        label: "Minimum Balance",
        name: "minBalance",
        type: "number",
        value: formValues.minBalance,
        required: true,
        inputProps: { min: 0, step: 0.01 },
        rules: {
          required: "Le solde minimum est requis",
          validate: {
            positive: (v: string) => {
              const value = parseFloat(v); // Parse minBalance correctly
              return value >= 0 || "Le solde minimum doit être positif ou zéro";
            },

            maxBalance: (v: string) => {
              console.log(
                "Validating minBalance:",
                v,
                "Balance:",
                formValues.balance
              );
              const minBalance = parseFloat(v);
              const balance = parseFloat(formValues.balance);
              if (isNaN(minBalance)) {
                return "Le solde minimum doit être valide";
              }
              if (isNaN(balance) || formValues.balance === "") {
                return "Veuillez entrer un solde valide avant de définir le solde minimum";
              }
              return (
                minBalance <= balance ||
                "Le solde minimum ne peut pas dépasser le solde"
              );
            },
          },
        },
      },
      {
        label: "Role of participants",
        name: "role",
        inputType: "radio",
        value: currentCaisse
          ? parseParticipants(currentCaisse.participants)[0]?.role || "Rh"
          : formValues.role,
        required: true,
        radioOptions: [
          { value: "Rh", label: "Rh" },
          { value: "Syndic", label: "Syndic" },
        ],
        rules: {
          required: "Le rôle des participants est requis",
        },
        disabled: intendedModalAction === "edit",
      },
      {
        label: "Participants",
        name: "participants",
        value: formValues.participants,
        required: true,
        inputType: "autocomplete",
        options: availableUsers,
        getOptionLabel: (option: UserOption) =>
          `${option.username} ${option.lastName}`.trim(),
        rules: {
          required: "Au moins un participant est requis",
          validate: {
            unique: (v: UserOption[]) =>
              new Set(v.map((p) => p.id)).size === v.length ||
            
              "Les participants doivent être uniques",
          },
        },
      },
    ],
    [formValues, availableUsers, currentCaisse,intendedModalAction]
  );

  // Helper functions
  const cleanPhotoUrl = (photo: string): string => {
    return photo.replace(/^"|"$/g, "").replace(/\\"/g, "");
  };

  const normalizePhoto = (photo: string | string[] | undefined): string[] => {
    if (!photo) return [];
    if (typeof photo === "string") {
      try {
        const parsed = photo.startsWith("[")
          ? JSON.parse(photo)
          : [cleanPhotoUrl(photo)];
        return Array.isArray(parsed)
          ? parsed.map(cleanPhotoUrl)
          : [cleanPhotoUrl(parsed)];
      } catch (e) {
        console.error("Failed to parse Photo:", photo, e);
        return [cleanPhotoUrl(photo)];
      }
    }
    return photo.map(cleanPhotoUrl);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Inconnu";
    return format(new Date(dateString), "PPpp", { locale: fr });
  };

  const getUserName = (userId?: number) => {
    if (!userId) return "Utilisateur inconnu";
    const user = users[userId];
    return user
      ? `${user.username} ${user.lastName || ""}`.trim() || user.username
      : "Admin";
  };

  // Cleanup photo previews
  useEffect(() => {
    return () => {
      photoPreview.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [photoPreview]);
  const transactionColumns = useMemo(
    () => [
      {
        id: "id",
        label: t("ID"),
        sortable: true,
        width: "80px",
        render: (tx: Transaction) => <Typography>{tx.id}</Typography>,
      },
      {
        id: "amount",
        label: t("Amount"),
        sortable: true,
        width: "150px",
        render: (tx: Transaction) => (
          <Chip
            label={`${tx.amount >= 0 ? "+" : ""}${tx.amount} ${t("dt")}`}
            color={tx.amount >= 0 ? "success" : "error"}
            avatar={
              <Avatar>
                <MoneyIcon fontSize="small" />
              </Avatar>
            }
            sx={{ width: "100%" }}
          />
        ),
      },
      {
        id: "userId",
        label: t("Author"),
        sortable: true,
        width: "150px",
        render: (tx: Transaction) => (
          <Typography>{getUserName(tx.userId)}</Typography>
        ),
      },
      {
        id: "createdAt",
        label: t("Date"),
        sortable: true,
        width: "200px",
        render: (tx: Transaction) => (
          <Typography>{formatDate(tx.createdAt)}</Typography>
        ),
      },
      {
        id: "description",
        label: t("Description"),
        width: "250px",
        render: (tx: Transaction) => (
          <Typography>{tx.description || "Aucune description"}</Typography>
        ),
      },
      {
        id: "Photo",
        label: t("Photo"),
        width: "200px",
        render: (tx: Transaction) => {
          const photoArray = normalizePhoto(tx.Photo);
          return photoArray.length > 0 ? (
            <Box display="flex" gap={1} flexWrap="wrap">
              {photoArray.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Transaction ${index}`}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                  onError={() => console.error("Failed to load image:", photo)}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("Aucune")}
            </Typography>
          );
        },
      },
    ],
    [t]
  );
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
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          <AccountBalanceIcon
            sx={{ verticalAlign: "middle", mr: 1, fontSize: "inherit" }}
          />
          {t("Cash Management")}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={3}>
        <StyledButton
          variant="contained"
          onClick={() => handleOpenModal("create")}
          startIcon={<MoneyIcon />}
        >
          {t("New Fund")}
        </StyledButton>
      </Box>

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
        placeholder={t("Search funds...")}
      />

      <Table
        columns={columns}
        data={filteredCaisses}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        orderBy={orderBy}
        orderDirection={orderDirection}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSort={handleSort}
        renderActions={(caisse) => (
          <>
            <Tooltip title="Voir les transactions">
              <IconButton
                color="info"
                onClick={() => handleOpenTransactionsDialog(caisse.id)}
                sx={{ mr: 1 }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Modifier">
              <IconButton
                color="primary"
                onClick={() => handleOpenModal("edit", caisse)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <CustomDelete
              entity={caisse}
              authToken={auth.accessToken}
              deleteAction={actions.updateCaisseRequest}
              entityName={caisse.name}
              payloadKey="caisse"
            />
          </>
        )}
        noDataMessage={
          filters.searchQuery || filters.name
            ? t("No caisse match your search")
            : t("No caisses available")
        }
      />

      <EntityModal
        open={openModal}
        title={
          intendedModalAction === "create"
            ? t("Create Caisse")
            : t("Edit Caisse")
        }
        onSubmit={
          intendedModalAction === "create"
            ? handleCreateCaisse
            : handleUpdateCaisse
        }
        entity={formValues}
        fields={CaisseFields}
        onChange={handleFormChange}
        entityType={t("Caisse")}
        onClose={handleCloseModal}
        isLoading={isProcessing}
      />

      <Dialog
        open={openTransactionsDialog}
        onClose={handleCloseTransactionsDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t("Transactions for")}{" "}
          {caisses.find((c) => c.id === selectedCaisseId)?.name}
        </DialogTitle>
        <DialogContent>
          {caissesError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {t("Error")}: {caissesError}
            </Typography>
          )}
          <Box display="flex" alignItems="end" mb={3} mt={1}>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="year-filter-label">{t("Year")}</InputLabel>
                <Select
                  labelId="year-filter-label"
                  value={yearFilter}
                  label={t("Year")}
                  displayEmpty
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year === "all" ? t("All") : year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="month-filter-label">{t("Month")}</InputLabel>
                <Select
                  labelId="month-filter-label"
                  value={monthFilter}
                  label={t("Month")}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month === "all"
                        ? t("All")
                        : format(new Date(2023, parseInt(month) - 1), "MMMM", {
                            locale: fr,
                          })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTransactionSearch}
                disabled={selectedCaisseId === null || !auth?.accessToken}
              >
                {t("Search")}
              </Button>
            </Box>
          </Box>

          <Table
            columns={transactionColumns}
            data={filteredTransactions}
            total={Ttotal}
            page={Tpage}
            rowsPerPage={TrowsPerPage}
            orderBy="createdAt"
            orderDirection="desc"
            onPageChange={handleTPageChange}
            onRowsPerPageChange={handleTRowsPerPageChange}
            onSort={(columnId) => {
              // Implement sorting for transactions if needed
              console.log("Sort by", columnId);
            }}
            noDataMessage={
              yearFilter !== "all" || monthFilter !== "all"
                ? t("No transactions match your search")
                : t("No transactions available")
            }
          />
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleCloseTransactionsDialog}>
            {t("Close")}
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

function parseParticipants(
  participants: Participant[] | string | undefined
): Participant[] {
  if (!participants) return [];
  if (typeof participants === "string") {
    try {
      return JSON.parse(participants) || [];
    } catch (e) {
      console.error("Failed to parse participants:", participants, e);
      return [];
    }
  }
  return participants;
}

export default GestionCaisse;
