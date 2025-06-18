import { useNavigate } from 'react-router-dom';
import StatusBadge from '../Common/StatusBadge';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const AgreementTable = () => {
  const navigate = useNavigate();
  const agreements = [
    {
      id: 1,
      title: "Intellect CBS AMC",
      party: "Sonali Bank",
      status: "Active",
      department: "BD",
      startDate: "02 Mar 2025",
      endDate: "01 Mar 2028"
    },
    {
      id: 2,
      title: "Consultancy Service Agreement",
      party: "ABC Law Firm",
      status: "Expired",
      department: "Finance",
      startDate: "23 Feb 2022",
      endDate: "22 Feb 2025"
    },
    {
      id: 3,
      title: "Space Rental Agreement",
      party: "Alecith Tower",
      status: "Active",
      department: "Admin",
      startDate: "19-Apr-2025",
      endDate: "18-Apr-2028"
    }
  ];

  const handleView = (id) => {
    navigate(`/agreements/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete agreement ${id}?`)) {
      console.log(`Deleting agreement with ID: ${id}`);
      // In a real application, you would make an API call here to delete the agreement.
      // Then, you would update the 'agreements' state to reflect the deletion.
    }
  };

  return (
    <div className="agreement-table">
      <div className="table-header">
        <span>Title</span>
        <span>Party</span>
        <span>Status</span>
        <span>Department</span>
        <span>Start Date</span>
        <span>End Date</span>
        <span>Actions</span>
      </div>
      
      {agreements.map((agreement) => (
        <div className="table-row" key={agreement.id}>
          <span>{agreement.title}</span>
          <span>{agreement.party}</span>
          <span><StatusBadge status={agreement.status} /></span>
          <span>{agreement.department}</span>
          <span>{agreement.startDate}</span>
          <span>{agreement.endDate}</span>
          <span className="actions">
            <button onClick={() => handleView(agreement.id)} title="View"><FaEye /></button>
            <button title="Edit"><FaEdit /></button>
            <button onClick={() => handleDelete(agreement.id)} title="Delete" style={{color: '#e74c3c'}}><FaTrash /></button>
          </span>
        </div>
      ))}
    </div>
  );
};

export default AgreementTable;