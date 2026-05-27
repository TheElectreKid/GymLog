import React, { createContext, useContext, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  colors: typeof lightColors
}

const lightColors = {
  background: '#ffffff',
  backgroundSecondary: '#f5f5f5',
  text: '#000000',
  textSecondary: '#888888',
  border: '#e0e0e0',
  card: '#ffffff',
  button: '#000000',
  buttonText: '#ffffff',
}

const darkColors = {
  background: '#121212',
  backgroundSecondary: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#aaaaaa',
  border: '#333333',
  card: '#1e1e1e',
  button: '#ffffff',
  buttonText: '#000000',
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: lightColors,
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light')

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const colors = theme === 'light' ? lightColors : darkColors

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)