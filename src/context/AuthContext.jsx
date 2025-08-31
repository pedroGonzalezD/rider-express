import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { getSession, signIn, signOut } from '../services/authService';
import { getUser } from '../services/userService'; 
import { useLoader } from './LoaderContext';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const {showLoader, hideLoader} = useLoader()

  useEffect(() => {
    let mounted = true;
    showLoader()
    getSession().then( async ({user}) =>{
      if(mounted){
        setUser(user)
        if(user){
          const userProfile = await getUser(user.uid);
          setUserRole(userProfile.user?.role)
        }else {
          setUserRole(null)
        }
        hideLoader()
      }
    })
    return () => mounted = false
  }, [])

  const handleSignIn = async ({email, password, t}) => {
    showLoader()
    const result = await signIn({ email, password, t });
    if (result.user){
      const userProfile = await getUser(result.user.uid);
      setUser(result.user);
      setUserRole(userProfile.user?.role)
    } 
    hideLoader()
    return result;
  };

  const logout = async (t) => {
    showLoader()
    const result = await signOut(t);
    if (result.success){
      setUser(null)
      setUserRole(null);
    } 
    hideLoader()
    return result;
  };


  const value = useMemo(() =>{
   return { user,  signIn: handleSignIn, logout, setUser, userRole }
  }, [user, userRole])


return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export const useAuth = () => useContext(AuthContext);