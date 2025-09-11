import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import apiClient from "../services/api";

const AuthContext = createContext();

// Auth reducer to manage authentication state
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app initialization
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          // Verify token is still valid by getting current user info
          const currentUser = await apiClient.getCurrentUser();
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              token,
              user: currentUser,
            },
          });
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await apiClient.login(email, password, rememberMe);

      if (response.success) {
        // Check if email is confirmed
        if (response.user && response.user.emailConfirmed === false) {
          dispatch({
            type: "LOGIN_FAILURE",
            payload:
              "Votre email n'est pas encore vérifié. Veuillez vérifier votre boîte mail.",
          });
          return {
            success: false,
            message: "Email non vérifié",
            emailNotConfirmed: true,
            email: email,
          };
        }

        // Store token and user info
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            token: response.token,
            user: response.user,
          },
        });

        return { success: true };
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: response.message || "Échec de la connexion",
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage =
        error.message || "Une erreur est survenue lors de la connexion";
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  const googleLogin = async (idToken) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await apiClient.googleLogin(idToken);

      if (response.success) {
        // Store token and user info
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            token: response.token,
            user: response.user,
          },
        });

        return { success: true };
      } else {
        dispatch({
          type: "LOGIN_FAILURE",
          payload: response.message || "Échec de la connexion Google",
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage =
        error.message || "Une erreur est survenue lors de la connexion Google";
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const register = async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await apiClient.register(userData);
      dispatch({ type: "SET_LOADING", payload: false });

      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message,
          errors: response.errors,
        };
      }
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message:
          error.message || "Une erreur est survenue lors de l'inscription",
        errors: error.errors,
      };
    }
  };

  const changePassword = async (passwordData) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await apiClient.changePassword(passwordData);
      dispatch({ type: "SET_LOADING", payload: false });

      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message,
          errors: response.errors,
        };
      }
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message:
          error.message ||
          "Une erreur est survenue lors du changement de mot de passe",
        errors: error.errors,
      };
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
    // Also update localStorage
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const verifyEmail = async (email, token) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await apiClient.verifyEmail(email, token);
      dispatch({ type: "SET_LOADING", payload: false });

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return {
          success: false,
          message: response.message || "Échec de la vérification de l'email",
        };
      }
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message:
          error.message || "Une erreur est survenue lors de la vérification",
      };
    }
  };

  const resendVerification = async (email) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await apiClient.resendVerification(email);
      dispatch({ type: "SET_LOADING", payload: false });

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return {
          success: false,
          message:
            response.message || "Échec de l'envoi de l'email de vérification",
        };
      }
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message:
          error.message || "Une erreur est survenue lors de l'envoi de l'email",
      };
    }
  };

  const requestPasswordReset = async (email) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await apiClient.requestPasswordReset(email);
      dispatch({ type: "SET_LOADING", payload: false });

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return {
          success: false,
          message:
            response.message || "Échec de l'envoi du code de vérification",
        };
      }
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message:
          error.message || "Une erreur est survenue lors de l'envoi du code",
      };
    }
  };

  const resetPasswordDirect = async (
    email,
    code,
    newPassword,
    confirmPassword
  ) => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const response = await apiClient.resetPasswordDirect(
        email,
        code,
        newPassword,
        confirmPassword
      );
      dispatch({ type: "SET_LOADING", payload: false });

      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return {
          success: false,
          message:
            response.message || "Échec de la réinitialisation du mot de passe",
        };
      }
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      return {
        success: false,
        message:
          error.message ||
          "Une erreur est survenue lors de la réinitialisation",
      };
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const hasRole = (role) => {
    return state.user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some((role) => state.user?.roles?.includes(role)) || false;
  };

  const isAdmin = () => {
    return hasRole("Administrator");
  };

  const isManager = () => {
    return hasRole("Manager");
  };

  const value = {
    ...state,
    login,
    googleLogin,
    logout,
    register,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPasswordDirect,
    changePassword,
    updateUser,
    clearError,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
