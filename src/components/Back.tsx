import { Link } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";
const Back = () => {
  return (
    <Link to="/home" className="text-blue-400">
      <IoReturnUpBackOutline size={27} />
    </Link>
  );
};

export default Back;
