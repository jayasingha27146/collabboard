import { useEffect, useState } from "react";
import { safeRead, safeWrite } from "../utils/storage.js";

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => safeRead(key, initialValue));

  useEffect(() => {
    safeWrite(key, value);
  }, [key, value]);

  return [value, setValue];
}
