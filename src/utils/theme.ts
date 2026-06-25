
export type Theme = 'light' | 'dark'

const THEME_KEY = 'picx-theme'

export const getTheme = (): Theme => {
    return 'dark'
}

export const setTheme = (theme: Theme) => {
    localStorage.setItem(THEME_KEY, theme)
    if (theme === 'dark') {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

export const toggleTheme = (): Theme => {
    return 'dark'
}

export const initTheme = () => {
    document.documentElement.classList.add('dark')
}
