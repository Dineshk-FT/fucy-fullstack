import { useSelector } from "react-redux";
import { darkTheme, lightTheme } from "./constant";


export default function ColorTheme(){
    const { isDark } = useSelector(state=>state?.currentId)
    return isDark ? darkTheme : lightTheme
 }