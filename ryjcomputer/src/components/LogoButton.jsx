import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";

export default function LogoButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="flex items-center gap-2"
    >
      <img
        src={Logo}
        alt="R Y J COMPUTER"
        className="h-20 w-auto sm:h-20 md:h-20 lg:h-20 object-contain"
      />
    </button>
  );
}
