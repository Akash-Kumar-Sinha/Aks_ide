import { Link } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";

interface BackProps {
  size?: number;
}

const Back: React.FC<BackProps> = ({ size = 27 }) => {
  return (
    <Link to="/" className="text-blue-400" aria-label="Go back">
      <IoReturnUpBackOutline size={size} />
    </Link>
  );
};

export default Back;