import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getCurrentUser, { deleteCurrentSession } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const savedUser = await AsyncStorage.getItem("user");
                if (savedUser) {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    setIsLoggedIn(true);
                } else {
                    const currentUser = await getCurrentUser();
                    if (currentUser) {
                        setUser(currentUser);
                        setIsLoggedIn(true);
                        await AsyncStorage.setItem("user", JSON.stringify(currentUser));
                    }
                }
            } catch (error) {
                console.error("Error restoring session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const logOut = async () => {
        try {
            await deleteCurrentSession();
            await AsyncStorage.removeItem("user");
            setIsLoggedIn(false);
            setUser(null);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                isLoading,
                logOut,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;