import { useParams } from "react-router-dom";
export default function CompanyDetail() {
  const { ticker } = useParams();
  return <div className="p-6">Company: {ticker}</div>;
}
