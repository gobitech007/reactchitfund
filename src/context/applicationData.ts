// ✅ useUserData.ts
import { useState, useEffect } from 'react';
import { AuthService } from '../services';

export function useUserData() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    AuthService.getCurrentUserData().then((data) => {
        console.log(data, "application data");
        setUser(data);
    });
  }, []);
  return user;
}
