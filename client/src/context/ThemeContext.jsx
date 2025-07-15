import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Theme Context for Haven Word Church
 * Manages light/dark mode, UI preferences, and theme-related state
 */

// Theme constants
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

const STORAGE_KEY = 'haven-word-church-theme';

// Initial theme state
const initialState = {
  theme: THEMES.LIGHT,
  systemPreference: false, // Follow system preference
  fontSize: 'medium', // small, medium, large
  reducedMotion: false, // For accessibility
  highContrast: false, // For accessibility
  sidebarCollapsed: false, // For admin/member dashboard
  loading: true
};

// Theme action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_SYSTEM_PREFERENCE: 'SET_SYSTEM_PREFERENCE',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  SET_REDUCED_MOTION: 'SET_REDUCED_MOTION',
  SET_HIGH_CONTRAST: 'SET_HIGH_CONTRAST',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  RESTORE_PREFERENCES: 'RESTORE_PREFERENCES'
};

/**
 * Theme reducer function
 * @param {Object} state - Current theme state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New theme state
 */
function themeReducer(state, action) {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
        systemPreference: false
      };

    case THEME_ACTIONS.TOGGLE_THEME:
      return {
        ...state,
        theme: state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT,
        systemPreference: false
      };

    case THEME_ACTIONS.SET_SYSTEM_PREFERENCE:
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? THEMES.DARK 
        : THEMES.LIGHT;
      return {
        ...state,
        theme: action.payload ? systemTheme : state.theme,
        systemPreference: action.payload
      };

    case THEME_ACTIONS.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload
      };

    case THEME_ACTIONS.SET_REDUCED_MOTION:
      return {
        ...state,
        reducedMotion: action.payload
      };

    case THEME_ACTIONS.SET_HIGH_CONTRAST:
      return {
        ...state,
        highContrast: action.payload
      };

    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };

    case THEME_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case THEME_ACTIONS.RESTORE_PREFERENCES:
      return {
        ...state,
        ...action.payload,
        loading: false
      };

    default:
      return state;
  }
}

// Create Theme Context
const ThemeContext = createContext();

/**
 * Custom hook to use theme context
 * @returns {Object} Theme context value
 * @throws {Error} If used outside of ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Theme Provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Theme provider wrapper
 */
export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  /**
   * Save preferences to localStorage
   * @param {Object} preferences - Theme preferences to save
   */
  const savePreferences = (preferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  };

  /**
   * Load preferences from localStorage
   * @returns {Object|null} Saved preferences or null
   */
  const loadPreferences = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
      return null;
    }
  };

  /**
   * Set theme manually
   * @param {string} theme - Theme to set (light/dark)
   */
  const setTheme = (theme) => {
    if (Object.values(THEMES).includes(theme)) {
      dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
    }
  };

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    // Always disable systemPreference when toggling manually
    const newTheme = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    console.log('Toggling theme. New theme:', newTheme);
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME });
    // Also update localStorage immediately to prevent stuck state
    savePreferences({
      ...state,
      theme: newTheme,
      systemPreference: false
    });
  };

  /**
   * Set system preference following
   * @param {boolean} followSystem - Whether to follow system preference
   */
  const setSystemPreference = (followSystem) => {
    dispatch({ type: THEME_ACTIONS.SET_SYSTEM_PREFERENCE, payload: followSystem });
  };

  /**
   * Set font size preference
   * @param {string} size - Font size (small, medium, large)
   */
  const setFontSize = (size) => {
    const validSizes = ['small', 'medium', 'large'];
    if (validSizes.includes(size)) {
      dispatch({ type: THEME_ACTIONS.SET_FONT_SIZE, payload: size });
    }
  };

  /**
   * Set reduced motion preference (accessibility)
   * @param {boolean} reduced - Whether to reduce motion
   */
  const setReducedMotion = (reduced) => {
    dispatch({ type: THEME_ACTIONS.SET_REDUCED_MOTION, payload: reduced });
  };

  /**
   * Set high contrast preference (accessibility)
   * @param {boolean} highContrast - Whether to use high contrast
   */
  const setHighContrast = (highContrast) => {
    dispatch({ type: THEME_ACTIONS.SET_HIGH_CONTRAST, payload: highContrast });
  };

  /**
   * Toggle sidebar collapsed state
   */
  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR });
  };

  // Effect to handle system theme changes
  useEffect(() => {
    if (state.systemPreference) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        const systemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
        dispatch({ type: THEME_ACTIONS.SET_THEME, payload: systemTheme });
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.systemPreference]);

  // Effect to apply theme to document
  useEffect(() => {
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    if (!root) return;
    // Apply theme as data-theme attribute for CSS compatibility
    console.log('Setting data-theme attribute to:', state.theme);
    root.setAttribute('data-theme', state.theme);
    // Optionally, keep the class for other uses
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    root.classList.add(state.theme);
    // Apply font size
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    const fontSizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    };
    root.classList.add(fontSizeClass[state.fontSize]);
    // Apply accessibility preferences
    if (state.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    if (state.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [state.theme, state.fontSize, state.reducedMotion, state.highContrast]);

  // Effect to save preferences when state changes
  useEffect(() => {
    if (!state.loading) {
      const preferences = {
        theme: state.theme,
        systemPreference: state.systemPreference,
        fontSize: state.fontSize,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        sidebarCollapsed: state.sidebarCollapsed
      };
      savePreferences(preferences);
    }
  }, [state, state.loading]);

  // Effect to load preferences on mount
  useEffect(() => {
    const loadInitialPreferences = () => {
      const saved = loadPreferences();
      
      if (saved) {
        // Restore saved preferences
        dispatch({ type: THEME_ACTIONS.RESTORE_PREFERENCES, payload: saved });
      } else {
        // Check system preference for first-time users
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = prefersDark ? THEMES.DARK : THEMES.LIGHT;
        
        dispatch({ 
          type: THEME_ACTIONS.RESTORE_PREFERENCES, 
          payload: { ...initialState, theme: systemTheme, loading: false }
        });
      }
    };

    loadInitialPreferences();
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    
    // Constants
    THEMES,
    
    // Actions
    setTheme,
    toggleTheme,
    setSystemPreference,
    setFontSize,
    setReducedMotion,
    setHighContrast,
    toggleSidebar,
    
    // Utilities
    isDark: state.theme === THEMES.DARK,
    isLight: state.theme === THEMES.LIGHT
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node
};

export default ThemeContext;